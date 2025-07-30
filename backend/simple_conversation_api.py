"""
Simple FastAPI server for conversation creation endpoint only.
Enhanced with proven patterns from Rosa's custom backend.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import requests
import time
import asyncio
import json
import os
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client for voice processing
from openai import OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = OpenAI(api_key=api_key)
print("✅ OpenAI client initialized for GPT-4.1")

app = FastAPI(title="Simple Conversation API", version="1.0.0")

# CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced conversation tracking (Rosa pattern)
active_conversations = {}
conversation_lock = asyncio.Lock()
sessions = {}  # Maps session IDs to conversation URLs (Rosa pattern)

# Request models
class ConversationCreateRequest(BaseModel):
    """Request model for creating Tavus conversation"""
    api_key: str = Field(..., description="Tavus API key")

class ConversationCreateResponse(BaseModel):
    """Response model for conversation creation"""
    success: bool
    conversation_id: str
    conversation_url: str
    message: str | None = None
    error: str | None = None

class Message(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[Message]
    stream: bool = True
    temperature: float = 0.7

# Rosa's proven session management pattern
def register_session(session_id: str, conversation_url: str):
    """Register a session with its conversation URL (Rosa pattern)"""
    sessions[session_id] = conversation_url
    print(f"📝 Registered session {session_id} with conversation URL: {conversation_url}")

def get_session_url(session_id: str) -> Optional[str]:
    """Get conversation URL for a session (Rosa pattern)"""
    return sessions.get(session_id)

@app.post("/api/conversation/create", response_model=ConversationCreateResponse)
async def create_conversation_server_side(
    request: ConversationCreateRequest
) -> ConversationCreateResponse:
    """
    Create Tavus conversation server-side using Rosa's proven patterns.
    
    Key improvements:
    - Uses Rosa's proven persona ID (pfa22a49cab9)
    - Implements retry logic with exponential backoff
    - Better error handling and logging
    """
    try:
        # Check for recent conversation creation (Rosa's deduplication pattern)
        async with conversation_lock:
            current_time = time.time()
            # Clean up old entries
            active_conversations_copy = active_conversations.copy()
            for key, timestamp in active_conversations_copy.items():
                if current_time - timestamp > 5:
                    del active_conversations[key]
            
            # Check if we recently created a conversation
            client_key = f"{request.api_key[-8:]}"
            if client_key in active_conversations:
                time_diff = current_time - active_conversations[client_key]
                if time_diff < 5:  # Within 5 seconds
                    return ConversationCreateResponse(
                        success=False,
                        conversation_id="",
                        conversation_url="",
                        message="Conversation creation in progress, please wait",
                        error="duplicate_request"
                    )
            
            # Mark as creating
            active_conversations[client_key] = current_time
        
        # Rosa's proven configuration
        # Using Rosa's working persona from Pattern 1
        persona_id = 'pfa22a49cab9'  # Rosa Clean Diplomatic Assistant (PROVEN)
        replica_id = 'rb67667672ad'  # ROSA replica ID (green screen) (PROVEN)
        
        request_payload = {
            "persona_id": persona_id,
            "replica_id": replica_id,
            "conversation_name": "ROSA - Voice-First Kiosk (Proven Pattern)",
            "properties": {
                "apply_greenscreen": True,
                "max_call_duration": 1800,  # 30 minutes max
                "participant_left_timeout": 60,  # End call 60s after participant leaves
            }
        }
        
        print(f"🚀 Creating conversation with Rosa's proven pattern:")
        print(f"   Persona: {persona_id}")
        print(f"   Replica: {replica_id}")
        
        # Rosa's retry logic with exponential backoff
        response = None
        last_error = None
        max_retries = 3
        request_start = time.time()
        
        for attempt in range(1, max_retries + 1):
            try:
                print(f"🔄 Attempt {attempt}/{max_retries}")
                
                response = requests.post(
                    "https://tavusapi.com/v2/conversations",
                    headers={
                        "Content-Type": "application/json",
                        "x-api-key": request.api_key,
                    },
                    json=request_payload,
                    timeout=30
                )
                
                # If successful, break out of retry loop
                break
                
            except Exception as error:
                last_error = error
                print(f"⚠️ Retry {attempt}: {str(error)}")
                
                if attempt == max_retries:
                    raise last_error
                
                # Wait before retry (exponential backoff - Rosa pattern)
                await asyncio.sleep(1.0 * attempt)
        
        request_duration = time.time() - request_start
        
        if not response:
            raise Exception("Failed to get response after retries")
        
        if response.status_code == 200:
            data = response.json()
            conversation_id = data.get("conversation_id", "")
            conversation_url = data.get("conversation_url", "")
            
            print(f"✅ Conversation created using Rosa's proven pattern: {conversation_id}")
            print(f"🔗 URL: {conversation_url}")
            print(f"⏱️ Duration: {request_duration:.2f}s")
            
            # Register session (Rosa pattern)
            if conversation_id:
                register_session(conversation_id, conversation_url)
            
            return ConversationCreateResponse(
                success=True,
                conversation_id=conversation_id,
                conversation_url=conversation_url,
                message="Conversation created successfully with proven Rosa patterns"
            )
        else:
            error_text = response.text
            print(f"❌ Tavus API error: {response.status_code} - {error_text}")
            
            return ConversationCreateResponse(
                success=False,
                conversation_id="",
                conversation_url="",
                error=f"Tavus API error: {response.status_code} - {error_text}"
            )
            
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        return ConversationCreateResponse(
            success=False,
            conversation_id="",
            conversation_url="",
            error=f"Server error: {str(e)}"
        )

@app.post("/api/conversation/end")
async def end_conversation(request: dict):
    """
    End a Tavus conversation.
    Enhanced with Rosa's session cleanup patterns.
    """
    try:
        conversation_id = request.get("conversation_id")
        api_key = request.get("api_key")
        
        if not conversation_id or not api_key:
            return {"success": False, "error": "Missing conversation_id or api_key"}
        
        # End conversation via Tavus API
        response = requests.post(
            f"https://tavusapi.com/v2/conversations/{conversation_id}/end",
            headers={"x-api-key": api_key},
            timeout=10
        )
        
        # Clean up session registration (Rosa pattern)
        if conversation_id in sessions:
            del sessions[conversation_id]
            print(f"🗑️ Cleaned up session: {conversation_id}")
        
        if response.status_code == 200:
            print(f"✅ Conversation ended: {conversation_id}")
            return {"success": True, "message": "Conversation ended successfully"}
        else:
            print(f"❌ Error ending conversation: {response.status_code}")
            return {"success": False, "error": f"Tavus API error: {response.status_code}"}
            
    except Exception as e:
        print(f"❌ Error ending conversation: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health_check():
    """Health check with session info (Rosa pattern)"""
    return {
        "status": "healthy", 
        "service": "simple-conversation-api",
        "active_sessions": len(sessions),
        "pattern": "Rosa proven patterns"
    }

@app.post("/chat/completions")
async def chat_completions(request: ChatCompletionRequest, http_request: Request):
    """
    OpenAI-compatible endpoint following Rosa Custom Backend pattern.
    Enhanced with session management and proper conversation tracking.
    """
    try:
        # Extract conversation ID from headers (Tavus sends this)
        session_id = (http_request.headers.get("X-Session-ID") or 
                     http_request.headers.get("conversation-id") or
                     http_request.headers.get("conversation_id"))
        
        # Get conversation URL from session if available (Rosa pattern)
        conversation_url = None
        if session_id:
            conversation_url = get_session_url(session_id)
            if conversation_url:
                print(f"📍 Using registered conversation URL for session: {session_id}")
        
        # Convert messages to dict format
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Extract user message for logging
        user_message = messages[-1].get("content", "") if messages else ""
        print(f"🎤 Voice input from user: {user_message}")
        if session_id:
            print(f"📍 Session ID: {session_id}")
        
        # Streaming response generator (following Rosa pattern)
        def generate():
            try:
                # Enhanced system prompt for Rosa (diplomatic language)
                system_prompt = """You are Rosa, a diplomatic AI assistant for the CTBTO SnT 2025 conference in Vienna. 

Key guidelines:
- Be friendly, concise, and professional
- Use diplomatic language appropriate for scientists, delegates, and diplomats
- Provide helpful information about the conference, speakers, sessions, and CTBTO
- Keep responses focused and actionable
- Maintain cultural sensitivity for international audience"""
                
                # Use GPT-4.1 to process the conversation
                completion = client.chat.completions.create(
                    model="gpt-4.1",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        *messages
                    ],
                    stream=True,
                    temperature=0.0  # Consistent diplomatic responses
                )
                
                # Stream the response chunks (Rosa pattern)
                for chunk in completion:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        
                        # Format as OpenAI streaming response
                        data = {
                            "id": f"rosa-{int(time.time())}",
                            "object": "chat.completion.chunk",
                            "created": int(time.time()),
                            "model": "gpt-4.1",
                            "choices": [{
                                "index": 0,
                                "delta": {"content": content},
                                "finish_reason": None
                            }]
                        }
                        yield f"data: {json.dumps(data)}\n\n"
                
                # Send the final done message
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                print(f"❌ Chat completion error: {e}")
                error_data = {
                    "error": {
                        "message": "I'm having trouble processing that request. Please try again.",
                        "type": "internal_error"
                    }
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
        
    except Exception as e:
        print(f"❌ Chat completions error: {e}")
        return {"error": {"message": str(e), "type": "internal_error"}}

# Enhanced startup message
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple Conversation API")
    print("📋 Using Rosa's proven patterns:")
    print("   - Persona ID: pfa22a49cab9 (Rosa Clean Diplomatic Assistant)")
    print("   - Replica ID: rb67667672ad (ROSA green screen)")
    print("   - Retry logic with exponential backoff")
    print("   - Enhanced session management")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 