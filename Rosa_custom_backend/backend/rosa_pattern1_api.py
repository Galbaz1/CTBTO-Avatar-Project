"""
Enhanced Rosa Pattern 1 API - OpenAI-compatible chat completions endpoint
Supports function calling for weather and app message integration
"""

import os
import json
import time
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our CTBTO agent
from Agent1 import CTBTOAgent

# Load environment variables from parent directory
load_dotenv('../.env')

# Check if we're in development mode
IS_DEVELOPMENT = os.getenv("NODE_ENV") == "development"

# Initialize FastAPI
app = FastAPI(title="Rosa Pattern 1 API", version="1.1.0")

# Configure CORS - allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                   "https://*.ngrok-free.app", "https://*.ngrok.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models for new endpoint
class ConversationConnectionRequest(BaseModel):
    conversation_url: str
    conversation_id: str

# OpenAI-compatible request models (exact format)
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    stream: bool = True
    temperature: float = 0.7
    max_tokens: int = 150

class RosaBackend:
    """
    Backend service for Rosa with session management, weather data storage, and RAG capabilities
    """
    def __init__(self):
        self.ctbto_agent = CTBTOAgent()
        self.sessions = {}  # Maps session IDs to conversation URLs
        self.current_conversation_url = None
        self.session_weather_data = {}  # Weather data per session
        self.latest_weather_data = None  # Latest weather data (fallback)
        self.session_rag_data = {}  # RAG data per session (for UI Intelligence)
    
    def register_session(self, session_id: str, conversation_url: str):
        """Register a session with its conversation URL"""
        self.sessions[session_id] = conversation_url
        print(f"📝 Registered session {session_id} with conversation URL: {conversation_url}")
    
    def get_session_url(self, session_id: str) -> Optional[str]:
        """Get conversation URL for a session"""
        return self.sessions.get(session_id)
    
    def get_current_session_id(self) -> str:
        """Get current session ID (for demo purposes, use a default)"""
        # In production, this would track the current active session
        return "current_session"
    
    def store_rag_data_for_session(self, session_id: str, rag_data: dict):
        """Store RAG results for UI Intelligence Agent"""
        if session_id not in self.session_rag_data:
            self.session_rag_data[session_id] = {}
        
        self.session_rag_data[session_id].update({
            "query": rag_data.get("query"),
            "categorized_results": rag_data.get("categorized_results", {}),
            "search_timestamp": time.time(),
            "total_results": rag_data.get("total_results", {})
        })
    
    def send_app_message(self, message_data: dict, conversation_url: str = None, session_id: str = None):
        """Store app message for frontend polling"""
        try:
            # Cache weather data if it's a weather update
            if message_data.get('event_type') == 'weather_update' and message_data.get('data'):
                self.latest_weather_data = message_data['data']
                print(f"💾 Cached weather data: {self.latest_weather_data}")
                
                # Store by session if available
                if session_id:
                    self.session_weather_data[session_id] = message_data['data']
                    print(f"📱 Stored weather data for session {session_id}")
        except Exception as e:
            print(f"❌ Failed to store weather data: {e}")

# Global backend instance
rosa_backend = RosaBackend()

# Global flag to track warmup status
_warmed_up = False

def warmup_backend():
    """Warmup the backend by making a test call to reduce cold start latency"""
    global _warmed_up
    if not _warmed_up:
        try:
            print("🔥 Warming up Rosa backend...")
            start_time = time.perf_counter()
            
            # Make a quick test call to warm up the agent
            for _ in rosa_backend.ctbto_agent.process_conversation_stream("warmup", []):
                break  # Just get the first chunk to warm up
                
            warmup_time = time.perf_counter() - start_time
            print(f"✅ Rosa backend warmed up in {warmup_time:.3f}s")
            _warmed_up = True
        except Exception as e:
            print(f"⚠️ Warmup failed (will continue): {e}")

@app.get("/")
async def root():
    return {
        "status": "Rosa Pattern 1 API running",
        "version": "1.1.0",
        "daily_available": False, # Removed Daily.co integration
        "daily_connected": rosa_backend.current_conversation_url is not None
    }

@app.post("/connect-conversation")
async def connect_conversation(request: ConversationConnectionRequest):
    """Connect backend to Daily.co conversation room for app message support"""
    try:
        print(f"🔗 Frontend requesting connection to conversation: {request.conversation_id}")
        print(f"📍 Conversation URL: {request.conversation_url}")
        
        # Register the session with the backend
        rosa_backend.register_session(request.conversation_id, request.conversation_url)
        rosa_backend.current_conversation_url = request.conversation_url
        
        return {
            "success": True,
            "message": "Backend registered session successfully",
            "conversation_id": request.conversation_id,
            "daily_available": False # Removed Daily.co integration
        }
    except Exception as e:
        print(f"❌ Failed to connect to conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")

@app.post("/chat/completions")
async def chat_completions(request: ChatCompletionRequest, http_request: Request):
    """
    Enhanced OpenAI-compatible chat completions endpoint with function calling and app messages
    """
    try:
        # Warmup on first request if not already done
        if not _warmed_up:
            warmup_backend()
        
        # Get conversation URL from headers if provided
        conversation_url = http_request.headers.get("X-Conversation-URL")
        # Try multiple header formats for session ID
        session_id = (http_request.headers.get("X-Session-ID") or 
                     http_request.headers.get("conversation-id") or
                     http_request.headers.get("conversation_id"))
        
        # Debug: print all headers
        print(f"📋 Request headers: {dict(http_request.headers)}")
        print(f"🔑 Extracted session_id: {session_id}")
        
        if conversation_url:
            rosa_backend.current_conversation_url = conversation_url
            print(f"📍 Using conversation URL from header: {conversation_url}")
            
            # If we have both session ID and URL, register them
            if session_id:
                rosa_backend.register_session(session_id, conversation_url)
        elif session_id:
            # Try to get URL from session
            conversation_url = rosa_backend.get_session_url(session_id)
            if conversation_url:
                print(f"📍 Using conversation URL from session {session_id}: {conversation_url}")
            
        start_time = time.perf_counter()
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        print(f"Rosa processing messages: {messages}")

        # Enhanced streaming response with function calling and app message support
        def generate():
            try:
                # Extract user message and conversation history from messages
                conversation_history = []
                user_message = ""
                
                for msg in messages:
                    if msg["role"] == "user":
                        # The last user message is the current query
                        user_message = msg["content"]
                    conversation_history.append(msg)
                
                # Remove the last user message from history (it will be added by process_conversation_stream)
                if conversation_history and conversation_history[-1]["role"] == "user":
                    conversation_history = conversation_history[:-1]
                
                # Create app message callback that includes session info
                def send_message_with_session(data):
                    rosa_backend.send_app_message(data, conversation_url, session_id)
                
                # Helper to store weather data when function is called
                def handle_weather_function(args):
                    location = args.get("location", "Unknown")
                    weather_data = rosa_backend.ctbto_agent.get_weather(location)
                    
                    # Store the weather data for frontend retrieval
                    if weather_data.get("success"):
                        # Store by session if available
                        if session_id:
                            if not hasattr(rosa_backend, 'session_weather_data'):
                                rosa_backend.session_weather_data = {}
                            rosa_backend.session_weather_data[session_id] = weather_data
                            print(f"💾 Stored weather data for session {session_id}: {location}")
                        
                        # Also store as latest
                        rosa_backend.latest_weather_data = weather_data
                        
                        # Send app message notification if callback available
                        if send_message_with_session:
                            send_message_with_session({
                                "event_type": "weather_update",
                                "data": weather_data
                            })
                    
                    return weather_data
                
                # Helper to store RAG data when function is called
                def handle_rag_function(args, captured_session_id=session_id):
                    print(f"🔍 RAG function called with args: {args}, session_id: {captured_session_id}")
                    query = args.get("query", "Unknown")
                    search_type = args.get("search_type", "comprehensive")
                    rag_data = rosa_backend.ctbto_agent.search_conference_knowledge(query, search_type)
                    
                    print(f"🔍 RAG data success: {rag_data.get('success')}, session_id: {captured_session_id}")
                    
                    # Store the RAG data for UI Intelligence and frontend retrieval
                    if rag_data.get("success") and captured_session_id:
                        rosa_backend.store_rag_data_for_session(captured_session_id, rag_data)
                        print(f"💾 Stored RAG data for session {captured_session_id}: {query}")
                        
                        # Use UI Intelligence Agent to decide which cards to show
                        try:
                            from ui_intelligence_agent import UIIntelligenceAgent
                            
                            ui_agent = UIIntelligenceAgent()
                            
                            # Build conversation context for UI Intelligence
                            conversation_context = {
                                "user_message": user_message,
                                "assistant_response": "Searching conference information...",  # Placeholder
                                "turn_number": 1,  # Could be tracked from conversation history
                                "elapsed_time": "30s"  # Could be calculated from session start
                            }
                            
                            # Convert SearchResult objects to dicts for JSON serialization
                            categorized_results = rag_data.get("categorized_results", {})
                            serializable_results = {}
                            
                            for category, results in categorized_results.items():
                                if isinstance(results, list):
                                    serializable_results[category] = []
                                    for result in results:
                                        if hasattr(result, '__dict__'):
                                            # Convert dataclass/object to dict
                                            serializable_results[category].append({
                                                'id': getattr(result, 'id', ''),
                                                'title': getattr(result, 'title', ''),
                                                'content': getattr(result, 'content', ''),
                                                'metadata': getattr(result, 'metadata', {}),
                                                'relevance_score': getattr(result, 'relevance_score', 0.0),
                                                'collection': getattr(result, 'collection', ''),
                                                'search_type': getattr(result, 'search_type', '')
                                            })
                                        else:
                                            serializable_results[category].append(result)
                                else:
                                    serializable_results[category] = results
                            
                            # Get intelligent card decisions
                            card_decisions = ui_agent.analyze_conversation_for_cards(
                                conversation_context=conversation_context,
                                rag_results=serializable_results,
                                session_id=captured_session_id
                            )
                            
                            # Store card decisions for frontend polling
                            if captured_session_id not in rosa_backend.session_rag_data:
                                rosa_backend.session_rag_data[captured_session_id] = {}
                            
                            for decision in card_decisions:
                                if decision.card_type == "session":
                                    rosa_backend.session_rag_data[captured_session_id]["latest_session"] = {
                                        "card_data": decision.card_data,  # Changed from "session" to "card_data"
                                        "display_reason": decision.display_reason,  # Changed from "reason"
                                        "confidence": decision.confidence,
                                        "timing": decision.timing
                                    }
                                    print(f"📊 Stored session card for {captured_session_id}")
                                elif decision.card_type == "speaker":
                                    rosa_backend.session_rag_data[captured_session_id]["latest_speaker"] = {
                                        "card_data": decision.card_data,  # Changed to match frontend expectations
                                        "display_reason": decision.display_reason,
                                        "confidence": decision.confidence,
                                        "timing": decision.timing
                                    }
                                    print(f"👤 Stored speaker card for {captured_session_id}")
                                elif decision.card_type == "topic":
                                    rosa_backend.session_rag_data[captured_session_id]["latest_topic"] = {
                                        "card_data": decision.card_data,  # Changed to match frontend expectations
                                        "display_reason": decision.display_reason,
                                        "confidence": decision.confidence,
                                        "timing": decision.timing
                                    }
                                    print(f"🏷️ Stored topic card for {captured_session_id}")
                            
                            print(f"🧠 UI Intelligence made {len(card_decisions)} card decisions for session {captured_session_id}")
                            
                        except Exception as e:
                            print(f"⚠️ UI Intelligence failed, using fallback: {e}")
                            import traceback
                            traceback.print_exc()
                            # Fallback to simple logic if UI Intelligence fails
                            categorized_results = rag_data.get("categorized_results", {})
                            if categorized_results.get("sessions"):
                                first_session = categorized_results["sessions"][0]
                                if session_id not in rosa_backend.session_rag_data:
                                    rosa_backend.session_rag_data[session_id] = {}
                                rosa_backend.session_rag_data[session_id]["latest_session"] = {
                                    "session": first_session,
                                    "reason": "Most relevant session found (fallback)",
                                    "confidence": 0.7,
                                    "timing": "immediate"
                                }
                    
                    return rag_data
                
                # Use enhanced conversation stream with app message callback
                for chunk in rosa_backend.ctbto_agent.process_conversation_stream(
                    user_message,
                    conversation_history,
                    handle_weather_function,
                    handle_rag_function
                ):
                    if chunk:  # Only yield non-empty chunks
                        # Format as OpenAI streaming response
                        data = {
                            "id": f"rosa-{int(time.time())}",
                            "object": "chat.completion.chunk",
                            "created": int(time.time()),
                            "model": "rosa-ctbto-agent",
                            "choices": [{
                                "index": 0,
                                "delta": {"content": chunk},
                                "finish_reason": None
                            }]
                        }
                        yield f"data: {json.dumps(data)}\n\n"
                
                # Send final chunk
                final_data = {
                    "id": f"rosa-{int(time.time())}",
                    "object": "chat.completion.chunk", 
                    "created": int(time.time()),
                    "model": "rosa-ctbto-agent",
                    "choices": [{
                        "index": 0,
                        "delta": {},
                        "finish_reason": "stop"
                    }]
                }
                yield f"data: {json.dumps(final_data)}\n\n"
                yield "data: [DONE]\n\n"
                
                processing_time = time.perf_counter() - start_time
                print(f"✅ Rosa response completed in {processing_time:.3f}s")
                
            except Exception as e:
                print(f"❌ Error in generate(): {str(e)}")
                error_data = {
                    "error": {
                        "message": str(e),
                        "type": "server_error"
                    }
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                yield "data: [DONE]\n\n"

        # Return streaming response
        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        print(f"Rosa endpoint error: {e}") # Removed traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoint for testing weather functionality
@app.post("/test/weather")
async def test_weather(location: str = "Vienna"):
    """Test endpoint for weather functionality"""
    try:
        weather_data = rosa_backend.ctbto_agent.get_weather(location)
        return {
            "location": location,
            "weather": weather_data,
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/latest-weather/{session_id}")
async def get_latest_weather(session_id: str):
    """Get the latest weather data for a session"""
    try:
        # Check if we have session-specific weather data
        if hasattr(rosa_backend, 'session_weather_data') and session_id in rosa_backend.session_weather_data:
            weather_data = rosa_backend.session_weather_data[session_id]
            return weather_data
        
        # Fallback to latest weather data
        if hasattr(rosa_backend, 'latest_weather_data') and rosa_backend.latest_weather_data:
            return rosa_backend.latest_weather_data
            
        return {"success": False, "error": "No weather data available"}
    except Exception as e:
        print(f"❌ Error retrieving weather data: {e}")
        return {"success": False, "error": str(e)}

@app.get("/latest-session/{session_id}")
async def get_latest_session_data(session_id: str):
    """Get latest session card data for frontend polling"""
    try:
        if session_id in rosa_backend.session_rag_data and "latest_session" in rosa_backend.session_rag_data[session_id]:
            print(f"📅 Returning session data for {session_id}")
            return rosa_backend.session_rag_data[session_id]["latest_session"]
        return None
    except Exception as e:
        print(f"❌ Error retrieving session data: {e}")
        return None

@app.get("/latest-speaker/{session_id}")  
async def get_latest_speaker_data(session_id: str):
    """Get latest speaker card data for frontend polling"""
    try:
        if session_id in rosa_backend.session_rag_data and "latest_speaker" in rosa_backend.session_rag_data[session_id]:
            return rosa_backend.session_rag_data[session_id]["latest_speaker"]
        return None
    except Exception as e:
        print(f"❌ Error retrieving speaker data: {e}")
        return None

@app.get("/latest-topic/{session_id}")
async def get_latest_topic_data(session_id: str):
    """Get latest topic card data for frontend polling"""
    try:
        if session_id in rosa_backend.session_rag_data and "latest_topic" in rosa_backend.session_rag_data[session_id]:
            return rosa_backend.session_rag_data[session_id]["latest_topic"]
        return None
    except Exception as e:
        print(f"❌ Error retrieving topic data: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Rosa Pattern 1 API...")
    print("🌤️ Weather function calling enabled")
    warmup_backend()
    uvicorn.run(app, host="0.0.0.0", port=8000) 