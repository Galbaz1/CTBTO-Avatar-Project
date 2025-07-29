"""
CardGenerationQueue: Advanced async card generation with priority queuing
Part of Milestone 2 - Queue-Based Architecture for scalability

This implements the queue-based architecture from async-io-optimization-course.md
to handle high concurrency scenarios and prevent task starvation.
"""

import asyncio
import time
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import heapq

logger = logging.getLogger(__name__)

class CardPriority(Enum):
    """Card generation priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

@dataclass
class CardRequest:
    """Represents a card generation request"""
    session_id: str
    card_type: str
    user_message: str
    rag_data: Dict[str, Any]
    backend: Any  # RosaBackend instance
    priority: CardPriority = CardPriority.NORMAL
    created_at: float = field(default_factory=time.time)
    request_id: str = field(default_factory=lambda: f"card_{int(time.time() * 1000)}")
    
    def __lt__(self, other):
        """Priority comparison for heapq (higher priority = lower number)"""
        return self.priority.value > other.priority.value

class CardGenerationQueue:
    """
    Advanced async card generation queue with priority handling and worker pools.
    
    Features:
    - Priority-based processing
    - Configurable worker concurrency 
    - Task timeout and cleanup
    - Session-based task tracking
    - Back-pressure control
    - Metrics and monitoring
    """
    
    def __init__(self, max_workers: int = 2, queue_size: int = 100, task_timeout: float = 30.0):
        self.max_workers = max_workers
        self.queue_size = queue_size 
        self.task_timeout = task_timeout
        
        # Priority queue for requests
        self._queue: List[CardRequest] = []
        self._queue_lock = asyncio.Lock()
        
        # Worker management
        self._workers: List[asyncio.Task] = []
        self._running = False
        
        # Session tracking
        self._active_tasks: Dict[str, List[asyncio.Task]] = {}
        self._completed_tasks: Dict[str, int] = {}
        self._failed_tasks: Dict[str, int] = {}
        
        # Metrics
        self._total_processed = 0
        self._total_errors = 0
        self._average_duration = 0.0
        
    async def start(self):
        """Start the queue processing with configured workers"""
        if self._running:
            logger.warning("CardGenerationQueue already running")
            return
            
        self._running = True
        logger.info(f"🚀 Starting CardGenerationQueue with {self.max_workers} workers")
        
        # Start worker tasks
        for i in range(self.max_workers):
            worker = asyncio.create_task(self._process_queue_worker(f"worker-{i}"))
            self._workers.append(worker)
            
        logger.info(f"✅ CardGenerationQueue started with {len(self._workers)} workers")
    
    async def stop(self):
        """Stop the queue processing and cleanup workers"""
        if not self._running:
            return
            
        logger.info("🛑 Stopping CardGenerationQueue...")
        self._running = False
        
        # Cancel all workers
        for worker in self._workers:
            worker.cancel()
            
        # Wait for workers to finish
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
        
        # Cancel active tasks
        for session_tasks in self._active_tasks.values():
            for task in session_tasks:
                if not task.done():
                    task.cancel()
                    
        self._active_tasks.clear()
        logger.info("✅ CardGenerationQueue stopped")
    
    async def add_card_request(self, 
                              session_id: str,
                              card_type: str, 
                              user_message: str,
                              rag_data: Dict[str, Any],
                              backend: Any,
                              priority: CardPriority = CardPriority.NORMAL) -> bool:
        """
        Add a card generation request to the queue.
        Returns False if queue is full.
        """
        async with self._queue_lock:
            if len(self._queue) >= self.queue_size:
                logger.warning(f"🚨 Queue full ({self.queue_size}), dropping card request for {session_id}")
                return False
                
            request = CardRequest(
                session_id=session_id,
                card_type=card_type,
                user_message=user_message,
                rag_data=rag_data,
                backend=backend,
                priority=priority
            )
            
            heapq.heappush(self._queue, request)
            logger.info(f"📥 Queued {card_type} card for session {session_id} (priority: {priority.name}, queue: {len(self._queue)})")
            return True
    
    async def _process_queue_worker(self, worker_name: str):
        """Worker process that consumes requests from the priority queue"""
        logger.info(f"🤖 Worker {worker_name} started")
        
        while self._running:
            try:
                # Get next request from priority queue
                request = await self._get_next_request()
                if not request:
                    await asyncio.sleep(0.1)  # Brief pause when queue empty
                    continue
                    
                # Process the request
                await self._process_card_request(worker_name, request)
                
            except Exception as e:
                logger.error(f"❌ Worker {worker_name} error: {e}")
                await asyncio.sleep(1.0)  # Longer pause on error
                
        logger.info(f"🛑 Worker {worker_name} stopped")
    
    async def _get_next_request(self) -> Optional[CardRequest]:
        """Get next highest priority request from queue"""
        async with self._queue_lock:
            if not self._queue:
                return None
            return heapq.heappop(self._queue)
    
    async def _process_card_request(self, worker_name: str, request: CardRequest):
        """Process a single card generation request with timeout"""
        start_time = time.time()
        
        logger.info(f"🎯 {worker_name} processing {request.card_type} card for {request.session_id}")
        
        try:
            # Import here to avoid circular imports
            from rosa_pattern1_api import generate_cards_async
            
            # Track active task
            self._track_active_task(request.session_id, worker_name)
            
            # Execute with timeout
            await asyncio.wait_for(
                generate_cards_async(
                    user_message=request.user_message,
                    rag_data=request.rag_data,
                    session_id=request.session_id,
                    backend=request.backend
                ),
                timeout=self.task_timeout
            )
            
            # Update metrics
            duration = time.time() - start_time
            self._update_completion_metrics(request.session_id, duration)
            
            logger.info(f"✅ {worker_name} completed {request.card_type} for {request.session_id} in {duration:.2f}s")
            
        except asyncio.TimeoutError:
            logger.error(f"⏰ {worker_name} timeout after {self.task_timeout}s for {request.session_id}")
            self._update_error_metrics(request.session_id)
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"❌ {worker_name} failed {request.card_type} for {request.session_id} after {duration:.2f}s: {e}")
            self._update_error_metrics(request.session_id)
            
        finally:
            self._untrack_active_task(request.session_id, worker_name)
    
    def _track_active_task(self, session_id: str, worker_name: str):
        """Track active task for session"""
        if session_id not in self._active_tasks:
            self._active_tasks[session_id] = []
        # Note: Could track the actual task here for cancellation
    
    def _untrack_active_task(self, session_id: str, worker_name: str):
        """Remove task from active tracking"""
        # Cleanup could happen here
        pass
    
    def _update_completion_metrics(self, session_id: str, duration: float):
        """Update metrics for successful completion"""
        self._total_processed += 1
        self._completed_tasks[session_id] = self._completed_tasks.get(session_id, 0) + 1
        
        # Update rolling average duration
        if self._total_processed == 1:
            self._average_duration = duration
        else:
            alpha = 0.1  # Exponential moving average factor
            self._average_duration = (1 - alpha) * self._average_duration + alpha * duration
    
    def _update_error_metrics(self, session_id: str):
        """Update metrics for failed tasks"""
        self._total_errors += 1
        self._failed_tasks[session_id] = self._failed_tasks.get(session_id, 0) + 1
    
    async def get_session_stats(self, session_id: str) -> Dict[str, Any]:
        """Get statistics for a specific session"""
        active_count = len(self._active_tasks.get(session_id, []))
        completed_count = self._completed_tasks.get(session_id, 0)
        failed_count = self._failed_tasks.get(session_id, 0)
        
        return {
            "session_id": session_id,
            "active_tasks": active_count,
            "completed_tasks": completed_count,
            "failed_tasks": failed_count,
            "success_rate": completed_count / max(1, completed_count + failed_count)
        }
    
    async def get_queue_stats(self) -> Dict[str, Any]:
        """Get overall queue statistics"""
        async with self._queue_lock:
            queue_length = len(self._queue)
            
        total_active = sum(len(tasks) for tasks in self._active_tasks.values())
        
        return {
            "queue_length": queue_length,
            "active_workers": len([w for w in self._workers if not w.done()]),
            "total_workers": len(self._workers),
            "active_tasks": total_active,
            "total_processed": self._total_processed,
            "total_errors": self._total_errors,
            "average_duration": self._average_duration,
            "success_rate": self._total_processed / max(1, self._total_processed + self._total_errors),
            "running": self._running
        }
    
    async def cleanup_session(self, session_id: str):
        """Clean up all tasks and data for a session"""
        # Cancel active tasks for session
        if session_id in self._active_tasks:
            for task in self._active_tasks[session_id]:
                if not task.done():
                    task.cancel()
            del self._active_tasks[session_id]
        
        # Clear session metrics
        self._completed_tasks.pop(session_id, None)
        self._failed_tasks.pop(session_id, None)
        
        logger.info(f"🧹 Cleaned up queue data for session {session_id}")

# Global queue instance (initialized when needed)
_card_queue: Optional[CardGenerationQueue] = None

async def get_card_queue() -> CardGenerationQueue:
    """Get or create the global card generation queue"""
    global _card_queue
    
    if _card_queue is None:
        _card_queue = CardGenerationQueue(
            max_workers=2,      # Conservative for current load
            queue_size=50,      # Reasonable buffer
            task_timeout=45.0   # Longer than typical card generation
        )
        await _card_queue.start()
        
    return _card_queue

async def queue_card_generation(session_id: str,
                               card_type: str,
                               user_message: str, 
                               rag_data: Dict[str, Any],
                               backend: Any,
                               priority: CardPriority = CardPriority.NORMAL) -> bool:
    """
    Queue a card generation request.
    This is the main entry point for using the queue system.
    """
    queue = await get_card_queue()
    return await queue.add_card_request(
        session_id=session_id,
        card_type=card_type,
        user_message=user_message,
        rag_data=rag_data,
        backend=backend,
        priority=priority
    ) 