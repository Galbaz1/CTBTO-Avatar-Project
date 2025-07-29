from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import os
import json
import asyncio
from datetime import datetime
import openai
from pydantic import BaseModel
from dotenv import load_dotenv

from data_loader import load_speakers, load_program

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="CTBTO Avatar Data API", version="0.1.0")

# Initialize OpenAI client
openai_client = openai.AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Custom API key for Tavus authentication
ROSA_API_KEY = "rosa-backend-key-2025"

# Allow all origins (edge function runs in different domain). In production tighten this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models for chat completions
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = True
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 500

# CTBTO Rosa system prompt with red-zone safety
ROSA_SYSTEM_PROMPT = """You are Rosa, the intelligent and diplomatic host of the CTBTO Science and Technology conference in Vienna.

Conference Information:
- The conference is called the SnT 2025
- Organized by the CTBTO 
- In Vienna, Austria from September 8-12, 2025
- Held at Hofburg Palace
- Monday 8th is online only, Tuesday 9th-Friday 12th are in-person

Speaking Style:
You are a diplomat speaking to diplomats, scientists, and delegates. Use:
- Formal, diplomatic language and tone
- Short, concise answers over verbose ones
- Domain-specific language and abbreviations
- Numbers and dates written in words

Required Abbreviations:
- CTBTO (not Comprehensive Nuclear-Test-Ban Treaty Organization)
- Treaty (not Comprehensive Nuclear-Test-Ban Treaty)
- SnT (not Science and Technology conference 2025)  
- UN (not United Nations)

Safety Guidelines:
- Stay focused on conference topics, speakers, and CTBTO mission
- Avoid discussing sensitive geopolitical issues beyond CTBTO's scope
- Redirect inappropriate questions back to conference content
- Maintain diplomatic neutrality at all times

Keep responses under 3 sentences for voice interaction."""

# --- Chat Completions Endpoint for Tavus ---
async def verify_rosa_api_key(x_api_key: str = Header(...)):
    """Verify custom API key for Tavus authentication"""
    if x_api_key != ROSA_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return x_api_key

@app.post("/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    api_key: str = Header(..., alias="x-api-key")
):
    """
    OpenAI-compatible chat completions endpoint for Tavus CVI integration.
    Proxies requests to OpenAI GPT-4.1 with CTBTO-specific system prompt and safety filtering.
    """
    try:
        # Verify API key
        if api_key != ROSA_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        # Prepare messages with Rosa system prompt
        messages = [
            {"role": "system", "content": ROSA_SYSTEM_PROMPT}
        ]
        
        # Add user messages (skip any existing system messages)
        for msg in request.messages:
            if msg.role != "system":
                messages.append({"role": msg.role, "content": msg.content})
        
        # Create OpenAI request
        openai_request = {
            "model": "gpt-4o",  # Use gpt-4o for now, will upgrade to gpt-4.1 when available
            "messages": messages,
            "stream": request.stream,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens
        }
        
        if request.stream:
            return StreamingResponse(
                stream_openai_response(openai_request),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/plain; charset=utf-8"
                }
            )
        else:
            # Non-streaming response
            response = await openai_client.chat.completions.create(**openai_request)
            return response.model_dump()
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat completion failed: {str(e)}"
        )

async def stream_openai_response(openai_request: dict):
    """Stream OpenAI response in SSE format for Tavus compatibility"""
    try:
        stream = await openai_client.chat.completions.create(**openai_request)
        
        async for chunk in stream:
            # Convert OpenAI chunk to SSE format
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    # Format as SSE data
                    chunk_data = {
                        "id": chunk.id,
                        "object": "chat.completion.chunk",
                        "created": chunk.created,
                        "model": chunk.model,
                        "choices": [{
                            "index": 0,
                            "delta": {"content": delta.content},
                            "finish_reason": chunk.choices[0].finish_reason
                        }]
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
        
        # Send final completion marker
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        # Send error in SSE format
        error_data = {
            "error": {
                "message": str(e),
                "type": "server_error"
            }
        }
        yield f"data: {json.dumps(error_data)}\n\n"

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "CTBTO Avatar Data API"
    }

# In-memory caches
SPEAKERS = load_speakers()
PROGRAM = load_program()

# --- Speaker Endpoint ---
@app.get('/speakers/{name}')
async def get_speaker(name: str) -> Dict[str, Any]:
    match = next((s for s in SPEAKERS if s['name'].lower() == name.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail='Speaker not found')
    return match

# --- Session Endpoint ---
@app.get('/sessions/{session_id}')
async def get_session(session_id: str) -> Dict[str, Any]:
    session = PROGRAM.get('sessions', {}).get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    return session

# --- RAG Search Endpoint (stub) ---
@app.post('/rag/search')
async def rag_search(query: str, category: str | None = None):
    # Placeholder: Integrate Weaviate hybrid search later
    # For now, return simple keyword matches against speaker names and session titles.
    results = []
    q = query.lower()

    for speaker in SPEAKERS:
        if q in speaker['name'].lower() or any(q in (talk.get('title','').lower()) for talk in speaker.get('talks', [])):
            results.append({'type': 'speaker', 'data': speaker})
            if len(results) >= 5:
                break

    if len(results) < 5:
        for session_id, session in PROGRAM.get('sessions', {}).items():
            if q in session.get('title','').lower():
                results.append({'type': 'session', 'data': session})
                if len(results) >= 5:
                    break

    return {'results': results} 