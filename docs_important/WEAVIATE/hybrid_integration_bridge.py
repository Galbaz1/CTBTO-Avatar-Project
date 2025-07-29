#!/usr/bin/env python3
"""
Hybrid Search Integration Bridge
-------------------------------
Connects the new HybridSearchEngine to the existing UIIntelligenceAgent
and card processor pipeline without breaking changes.

This bridge:
- Maintains existing RAG callback interface
- Translates hybrid search results to card processor format
- Provides feature flags for gradual rollout
- Handles errors gracefully with fallback

Usage:
    from hybrid_integration_bridge import HybridIntegrationBridge
    
    # Replace the existing search tool in main_conversation_agent.py
    bridge = HybridIntegrationBridge()
    agent = CTBTOAgent(weaviate_search_tool=bridge)
"""

import os
import asyncio
import json
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
import logging

# Import compatibility adapter for seamless integration
from compatibility_adapter import CompatibilityAdapter, SearchResult

# Import existing card processor
from backend.smart_card_manager import UIIntelligenceAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class BridgeConfiguration:
    """Configuration for the integration bridge"""
    use_hybrid_search: bool = None  # None = check env var
    enable_parallel_processing: bool = True
    max_results_per_category: int = 10
    enable_result_caching: bool = True
    cache_ttl_seconds: int = 300
    fallback_on_error: bool = True
    log_performance_metrics: bool = True

class HybridIntegrationBridge:
    """
    Integration bridge that connects HybridSearchEngine to existing
    UIIntelligenceAgent and card processor pipeline
    """
    
    def __init__(self, config: BridgeConfiguration = None):
        """
        Initialize the integration bridge
        
        Args:
            config: Configuration for the bridge (uses defaults if None)
        """
        self.config = config or BridgeConfiguration()
        
        # Initialize compatibility adapter (handles hybrid/legacy switching)
        self.search_adapter = CompatibilityAdapter(
            use_hybrid=self.config.use_hybrid_search
        )
        
        # Cache for search results
        self.result_cache = {} if self.config.enable_result_caching else None
        
        # Performance tracking
        self.performance_metrics = {
            'search_count': 0,
            'cache_hits': 0,
            'hybrid_success': 0,
            'fallback_used': 0,
            'errors': 0
        }
        
        logger.info(f"🌉 Hybrid Integration Bridge initialized (hybrid: {self.search_adapter.use_hybrid})")
    
    def enhanced_conference_search(
        self, 
        query: str, 
        search_mode: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Main search interface that maintains compatibility with existing code
        while using the new hybrid search engine under the hood
        """
        
        start_time = datetime.now()
        self.performance_metrics['search_count'] += 1
        
        try:
            # Check cache first
            cache_key = self._get_cache_key(query, search_mode)
            if self._check_cache(cache_key):
                self.performance_metrics['cache_hits'] += 1
                logger.info(f"📦 Cache hit for query: '{query[:50]}...'")
                return self.result_cache[cache_key]['result']
            
            # Execute search through compatibility adapter
            categorized_results = self.search_adapter.enhanced_conference_search(
                query=query,
                search_mode=search_mode,
                limit=self.config.max_results_per_category
            )
            
            # Enhance results with bridge-specific processing
            enhanced_results = self._enhance_search_results(categorized_results, query)
            
            # Format for card processor compatibility
            formatted_response = self._format_for_card_processor(enhanced_results, query)
            
            # Build final response structure
            response = {
                'success': True,
                'query': query,
                'search_mode': search_mode,
                'categorized_results': enhanced_results,
                'formatted_response': formatted_response,
                'total_results': {
                    'sessions': len(enhanced_results.get('sessions', [])),
                    'speakers': len(enhanced_results.get('speakers', [])),
                    'topics': len(enhanced_results.get('topics', [])),
                    'rooms': len(enhanced_results.get('rooms', [])),
                    'glossary': len(enhanced_results.get('glossary', []))
                },
                'metadata': {
                    'search_engine': 'hybrid' if self.search_adapter.use_hybrid else 'legacy',
                    'processing_time_ms': (datetime.now() - start_time).total_seconds() * 1000,
                    'bridge_version': '2.0'
                }
            }
            
            # Cache the result
            if self.result_cache is not None:
                self._cache_result(cache_key, response)
            
            # Track success
            if self.search_adapter.use_hybrid:
                self.performance_metrics['hybrid_success'] += 1
            
            if self.config.log_performance_metrics:
                logger.info(f"🔍 Search completed: '{query[:30]}...' -> {sum(response['total_results'].values())} results in {response['metadata']['processing_time_ms']:.1f}ms")
            
            return response
            
        except Exception as e:
            self.performance_metrics['errors'] += 1
            logger.error(f"❌ Search failed for query '{query}': {e}")
            
            # Return error response
            return {
                'success': False,
                'query': query,
                'error': str(e),
                'categorized_results': self._empty_results(),
                'formatted_response': "I apologize, but I'm having trouble searching the conference database right now. Please try again.",
                'total_results': {'sessions': 0, 'speakers': 0, 'topics': 0, 'rooms': 0, 'glossary': 0},
                'metadata': {
                    'search_engine': 'error',
                    'processing_time_ms': (datetime.now() - start_time).total_seconds() * 1000,
                    'bridge_version': '2.0'
                }
            }
    
    def _enhance_search_results(
        self, 
        categorized_results: Dict[str, List[SearchResult]], 
        query: str
    ) -> Dict[str, List[SearchResult]]:
        """
        Enhance search results with additional processing for card generation
        """
        
        enhanced = {}
        
        for category, results in categorized_results.items():
            enhanced_results = []
            
            for result in results:
                # Add query context to each result
                enhanced_result = result
                if hasattr(enhanced_result, 'metadata') and enhanced_result.metadata:
                    enhanced_result.metadata['query_context'] = query
                    enhanced_result.metadata['category'] = category
                
                # Add relevance context for card processor
                if enhanced_result.relevance_score is not None:
                    if enhanced_result.relevance_score > 0.8:
                        enhanced_result.metadata['relevance_level'] = 'high'
                    elif enhanced_result.relevance_score > 0.5:
                        enhanced_result.metadata['relevance_level'] = 'medium'
                    else:
                        enhanced_result.metadata['relevance_level'] = 'low'
                
                enhanced_results.append(enhanced_result)
            
            # Sort by relevance score (highest first)
            enhanced_results.sort(
                key=lambda x: x.relevance_score or 0, 
                reverse=True
            )
            
            enhanced[category] = enhanced_results
        
        return enhanced
    
    def _format_for_card_processor(
        self, 
        enhanced_results: Dict[str, List[SearchResult]], 
        query: str
    ) -> str:
        """
        Format results for the existing UIIntelligenceAgent card processor
        """
        
        formatted_parts = []
        
        # Sessions (highest priority for conversation)
        if enhanced_results.get("sessions"):
            formatted_parts.append("RELEVANT SESSIONS:")
            for session in enhanced_results["sessions"][:3]:  # Top 3
                relevance_pct = f"{session.relevance_score*100:.1f}%" if session.relevance_score else "N/A"
                formatted_parts.append(f"- {session.title} (Relevance: {relevance_pct})")
                
                # Add speaker information
                if session.related_speakers:
                    speakers = [s['name'] for s in session.related_speakers]
                    formatted_parts.append(f"  Speaker(s): {', '.join(speakers)}")
                
                # Add session metadata
                if session.metadata:
                    session_type = session.metadata.get('sessionType', 'N/A')
                    start_time = session.metadata.get('startTime', 'N/A')
                    formatted_parts.append(f"  Session Type: {session_type}")
                    formatted_parts.append(f"  Start Time: {start_time}")
                
                formatted_parts.append("")
        
        # Speakers (for name recognition)
        if enhanced_results.get("speakers"):
            formatted_parts.append("RELEVANT SPEAKERS:")
            for speaker in enhanced_results["speakers"][:3]:
                relevance_pct = f"{speaker.relevance_score*100:.1f}%" if speaker.relevance_score else "N/A"
                formatted_parts.append(f"- {speaker.title} (Relevance: {relevance_pct})")
                if speaker.content:  # Affiliation from content
                    formatted_parts.append(f"  Affiliation: {speaker.content}")
            formatted_parts.append("")
        
        # Topics (for thematic context)
        if enhanced_results.get("topics"):
            formatted_parts.append("RELATED TOPICS:")
            for topic in enhanced_results["topics"][:3]:
                relevance_pct = f"{topic.relevance_score*100:.1f}%" if topic.relevance_score else "N/A"
                formatted_parts.append(f"- {topic.title} (Relevance: {relevance_pct})")
                if topic.content:  # Topic code from content
                    formatted_parts.append(f"  Code: {topic.content}")
            formatted_parts.append("")
        
        # Rooms/Venues
        if enhanced_results.get("rooms"):
            formatted_parts.append("RELEVANT VENUES:")
            for room in enhanced_results["rooms"][:2]:
                relevance_pct = f"{room.relevance_score*100:.1f}%" if room.relevance_score else "N/A"
                formatted_parts.append(f"- {room.title} (Relevance: {relevance_pct})")
                if room.content:
                    formatted_parts.append(f"  Details: {room.content}")
            formatted_parts.append("")
        
        return "\n".join(formatted_parts) if formatted_parts else "No relevant conference information found for your query."
    
    def _get_cache_key(self, query: str, search_mode: str) -> str:
        """Generate cache key for query + mode combination"""
        normalized_query = query.lower().strip()
        return f"{normalized_query}_{search_mode}"
    
    def _check_cache(self, cache_key: str) -> bool:
        """Check if result is in cache and still valid"""
        if not self.result_cache or cache_key not in self.result_cache:
            return False
        
        cached_entry = self.result_cache[cache_key]
        age_seconds = (datetime.now() - cached_entry['timestamp']).total_seconds()
        
        return age_seconds < self.config.cache_ttl_seconds
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """Cache search result with timestamp"""
        if self.result_cache is not None:
            self.result_cache[cache_key] = {
                'result': result,
                'timestamp': datetime.now()
            }
            
            # Simple cache cleanup - remove old entries if cache gets too large
            if len(self.result_cache) > 100:
                oldest_key = min(
                    self.result_cache.keys(),
                    key=lambda k: self.result_cache[k]['timestamp']
                )
                del self.result_cache[oldest_key]
    
    def _empty_results(self) -> Dict[str, List]:
        """Return empty results structure"""
        return {
            "sessions": [],
            "speakers": [],
            "topics": [],
            "rooms": [],
            "glossary": []
        }
    
    # Additional methods for graph lookups (maintain compatibility)
    def find_sessions_by_speaker(self, speaker_name: str, limit: int = 5) -> List[SearchResult]:
        """Graph lookup compatibility method"""
        return self.search_adapter.hybrid_search("SnT25_Session", f"speaker {speaker_name}", limit)
    
    def find_speakers_for_session(self, session_title: str, limit: int = 5) -> List[SearchResult]:
        """Graph lookup compatibility method"""
        return self.search_adapter.hybrid_search("SnT25_Speaker", f"session {session_title}", limit)
    
    def find_sessions_on_topic(self, topic: str, limit: int = 5) -> List[SearchResult]:
        """Graph lookup compatibility method"""
        return self.search_adapter.hybrid_search("SnT25_Session", f"topic {topic}", limit)
    
    def find_sessions_in_room(self, room_name: str, limit: int = 5) -> List[SearchResult]:
        """Graph lookup compatibility method"""
        return self.search_adapter.hybrid_search("SnT25_Session", f"room {room_name}", limit)
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for monitoring"""
        total_searches = self.performance_metrics['search_count']
        
        if total_searches == 0:
            return self.performance_metrics
        
        return {
            **self.performance_metrics,
            'cache_hit_rate': self.performance_metrics['cache_hits'] / total_searches,
            'hybrid_success_rate': self.performance_metrics['hybrid_success'] / total_searches,
            'error_rate': self.performance_metrics['errors'] / total_searches,
            'fallback_rate': self.performance_metrics['fallback_used'] / total_searches
        }
    
    def close(self):
        """Clean up resources"""
        if hasattr(self.search_adapter, 'close'):
            self.search_adapter.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class HybridCardProcessor:
    """
    Enhanced card processor that leverages hybrid search results
    for better card generation decisions
    """
    
    def __init__(self, integration_bridge: HybridIntegrationBridge):
        """
        Initialize card processor with integration bridge
        
        Args:
            integration_bridge: The bridge connecting to hybrid search
        """
        self.bridge = integration_bridge
        self.ui_agent = UIIntelligenceAgent()
    
    def process_conversation_for_cards(
        self,
        conversation_context: Dict[str, Any],
        user_message: str,
        session_id: str
    ) -> List[Dict[str, Any]]:
        """
        Process conversation and generate card decisions using hybrid search
        """
        
        try:
            # Execute search through bridge
            search_results = self.bridge.enhanced_conference_search(
                query=user_message,
                search_mode="comprehensive"
            )
            
            if not search_results.get('success'):
                logger.error(f"Search failed for card processing: {search_results.get('error')}")
                return []
            
            # Use existing UI intelligence agent with enhanced results
            card_decisions = self.ui_agent.analyze_conversation_for_cards(
                conversation_context=conversation_context,
                rag_results=search_results['categorized_results'],
                session_id=session_id
            )
            
            # Enhance card decisions with hybrid search metadata
            enhanced_decisions = []
            for decision in card_decisions:
                if hasattr(decision, 'card_data'):
                    # Add hybrid search metadata to card data
                    decision.card_data['_hybrid_metadata'] = {
                        'search_engine': search_results['metadata']['search_engine'],
                        'processing_time_ms': search_results['metadata']['processing_time_ms'],
                        'total_results': search_results['total_results']
                    }
                enhanced_decisions.append(decision)
            
            return enhanced_decisions
            
        except Exception as e:
            logger.error(f"Card processing failed: {e}")
            return []


# Factory function for easy integration
def create_hybrid_bridge(
    use_hybrid: bool = None,
    enable_caching: bool = True,
    max_results: int = 10
) -> HybridIntegrationBridge:
    """
    Factory function to create a configured integration bridge
    
    Args:
        use_hybrid: Whether to use hybrid search (None = check env var)
        enable_caching: Whether to enable result caching
        max_results: Maximum results per category
    
    Returns:
        Configured HybridIntegrationBridge instance
    """
    config = BridgeConfiguration(
        use_hybrid_search=use_hybrid,
        enable_result_caching=enable_caching,
        max_results_per_category=max_results
    )
    
    return HybridIntegrationBridge(config)


# Testing function
def test_integration_bridge():
    """Test the integration bridge functionality"""
    
    print("🧪 Testing Hybrid Integration Bridge")
    
    # Test basic search
    print("\n1️⃣ Testing basic search interface:")
    try:
        bridge = create_hybrid_bridge(use_hybrid=True)
        
        # Test queries using real SnT2025 data
        test_queries = [
            "machine learning seismic location",
            "Anooshiravan Ansari",
            "IMS detection capabilities"
        ]
        
        for query in test_queries:
            print(f"\n🔍 Query: '{query}'")
            result = bridge.enhanced_conference_search(query)
            
            print(f"Success: {result['success']}")
            print(f"Engine: {result['metadata']['search_engine']}")
            print(f"Time: {result['metadata']['processing_time_ms']:.1f}ms")
            
            total = sum(result['total_results'].values())
            print(f"Results: {total} total")
            
            for category, count in result['total_results'].items():
                if count > 0:
                    print(f"  - {category}: {count}")
        
        # Test performance metrics
        print(f"\n📊 Performance Metrics:")
        metrics = bridge.get_performance_metrics()
        for key, value in metrics.items():
            if isinstance(value, float):
                print(f"  {key}: {value:.2%}")
            else:
                print(f"  {key}: {value}")
        
        bridge.close()
        
    except Exception as e:
        print(f"❌ Bridge test failed: {e}")
    
    print("\n✅ Integration bridge testing complete")


if __name__ == "__main__":
    test_integration_bridge() 