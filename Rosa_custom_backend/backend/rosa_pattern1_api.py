#!/usr/bin/env python3
"""
Rosa Pattern 1 API - Enhanced OpenAI-Compatible Custom LLM for Tavus
Now includes Daily.co integration for sending app messages with weather data
"""

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import time
import threading
import traceback

from Agent1 import CTBTOAgent

# Import Daily.co SDK if available
try:
    import daily
    DAILY_AVAILABLE = True
    print("✅ Daily.co SDK available")
except ImportError:
    print("⚠️ Daily.co SDK not available")
    DAILY_AVAILABLE = False

print("🚀 Starting Enhanced Rosa Pattern 1 API...")
print("🌤️ Weather function calling enabled")
print("📱 Daily.co app message integration enabled")

app = FastAPI(title="Rosa Pattern 1 API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Rosa backend with Daily.co integration
class RosaBackend:
    def __init__(self):
        self.ctbto_agent = CTBTOAgent()
        self.current_conversation_url = None
        # Session mapping: session_id -> conversation_url
        self.sessions = {}
        
    def register_session(self, session_id: str, conversation_url: str):
        """Register a session with its conversation URL"""
        self.sessions[session_id] = conversation_url
        print(f"📝 Registered session {session_id} with conversation URL: {conversation_url}")
        
    def get_session_url(self, session_id: str) -> str:
        """Get conversation URL for a session"""
        return self.sessions.get(session_id)
        
    def send_app_message(self, message_data: dict, conversation_url: str = None, session_id: str = None):
        """Send app message to frontend for UI updates"""
        try:
            # Cache weather data if it's a weather update
            if message_data.get('event_type') == 'weather_update' and message_data.get('data'):
                self.latest_weather_data = message_data['data']
                print(f"💾 Cached weather data: {self.latest_weather_data}")
            
            # Determine which URL to use
            url_to_use = conversation_url
            if not url_to_use and session_id:
                url_to_use = self.get_session_url(session_id)
            if not url_to_use:
                url_to_use = self.current_conversation_url
            
            if url_to_use:
                # Log the app message that would be sent
                print(f"📱 App message ready to send: {message_data}")
                print(f"📍 For conversation: {url_to_use}")
                
                # In Pattern 1, the frontend handles app messages directly
                # The backend prepares the message, but the frontend must send it
                # This avoids needing a separate Daily.co API key
                
                # Store the message for potential future use
                if session_id and not hasattr(self, 'pending_messages'):
                    self.pending_messages = {}
                if session_id:
                    if session_id not in self.pending_messages:
                        self.pending_messages[session_id] = []
                    self.pending_messages[session_id].append(message_data)
            else:
                print(f"📱 Would send app message: {message_data} (No conversation URL)")
        except Exception as e:
            print(f"❌ Failed to prepare app message: {e}")

# Global backend instance
rosa_backend = RosaBackend()

# Warmup flag to track if backend has been warmed up
_warmed_up = False

def warmup_backend():
    """Warmup the backend by making a test call to reduce cold start latency"""
    global _warmed_up
    if not _warmed_up:
        try:
            print("🔥 Warming up Rosa backend...")
            start_time = time.perf_counter()
            
            # Make a quick test call to warm up the agent
            test_messages = [{"role": "user", "content": "warmup"}]
            for _ in rosa_backend.ctbto_agent.process_conversation_stream(test_messages):
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
        "daily_available": DAILY_AVAILABLE,
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
            "daily_available": DAILY_AVAILABLE
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
        print(f"Rosa endpoint error: {traceback.format_exc()}")
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

@app.get("/pending-messages/{session_id}")
async def get_pending_messages(session_id: str):
    """Get pending messages for a session"""
    try:
        if hasattr(rosa_backend, 'pending_messages') and session_id in rosa_backend.pending_messages:
            messages = rosa_backend.pending_messages[session_id]
            # Clear the messages after sending
            rosa_backend.pending_messages[session_id] = []
            return messages
        return []
    except Exception as e:
        print(f"❌ Error retrieving pending messages: {e}")
        return []

@app.get("/latest-weather/{session_id}")
async def get_latest_weather(session_id: str):
    """Get the latest weather data for a session"""
    try:
        # Check if we have session-specific weather data
        if hasattr(rosa_backend, 'session_weather_data') and session_id in rosa_backend.session_weather_data:
            weather_data = rosa_backend.session_weather_data[session_id]
            print(f"📊 Found session weather data for {session_id}: {weather_data.get('location')}")
            return weather_data
        
        # Check if we have weather data in pending messages
        if hasattr(rosa_backend, 'pending_messages') and session_id in rosa_backend.pending_messages:
            messages = rosa_backend.pending_messages.get(session_id, [])
            # Find the most recent weather update
            for msg in reversed(messages):
                if msg.get('event_type') == 'weather_update':
                    return msg.get('data', {})
        
        # Also check if we have cached weather data
        if hasattr(rosa_backend, 'latest_weather_data'):
            return rosa_backend.latest_weather_data
            
        return {"success": False, "error": "No weather data available"}
    except Exception as e:
        print(f"❌ Error retrieving weather data: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Warmup before starting server
    print("🚀 Starting Enhanced Rosa Pattern 1 API...")
    print("🌤️ Weather function calling enabled")
    print("📱 Daily.co app message integration enabled" if DAILY_AVAILABLE else "📱 Daily.co integration disabled (install daily-python)")
    warmup_backend()
    uvicorn.run(app, host="0.0.0.0", port=8000) 