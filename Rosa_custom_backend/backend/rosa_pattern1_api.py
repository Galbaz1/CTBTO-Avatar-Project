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

# Load environment variables
load_dotenv()

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
    Backend service for Rosa with session management and weather data storage
    """
    def __init__(self):
        self.ctbto_agent = CTBTOAgent()
        self.sessions = {}  # Maps session IDs to conversation URLs
        self.current_conversation_url = None
        self.session_weather_data = {}  # Weather data per session
        self.latest_weather_data = None  # Latest weather data (fallback)
    
    def register_session(self, session_id: str, conversation_url: str):
        """Register a session with its conversation URL"""
        self.sessions[session_id] = conversation_url
        print(f"📝 Registered session {session_id} with conversation URL: {conversation_url}")
    
    def get_session_url(self, session_id: str) -> Optional[str]:
        """Get conversation URL for a session"""
        return self.sessions.get(session_id)
    
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
        session_id = http_request.headers.get("X-Session-ID")
        
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
                
                # Use enhanced conversation stream with app message callback
                for chunk in rosa_backend.ctbto_agent.process_conversation_stream(
                    user_message,
                    conversation_history,
                    handle_weather_function
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

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Rosa Pattern 1 API...")
    print("🌤️ Weather function calling enabled")
    warmup_backend()
    uvicorn.run(app, host="0.0.0.0", port=8000) 