#!/usr/bin/env python3
"""
Rosa Pattern 1 API - OpenAI-Compatible Custom LLM for Tavus
Simplified version focused on natural conversation without complex function calling
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import time
import traceback
from Agent1 import CTBTOAgent

app = FastAPI(title="Rosa Pattern 1 API", version="1.0.0")
security = HTTPBearer()
ctbto_agent = CTBTOAgent()

# Warmup flag to track if backend has been warmed up
_warmed_up = False

# OpenAI-compatible request models (exact format)
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "rosa-ctbto-agent"
    stream: Optional[bool] = True
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

# Authentication - Tavus sends Authorization: Bearer <api_key>
def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    import os
    from dotenv import load_dotenv
    
    # Load environment variables from .env.local in parent directory
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
    
    expected_key = os.getenv("ROSA_API_KEY", "rosa-backend-key-2025")
    if credentials.credentials != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

def warmup_backend():
    """Warmup the backend by making a test call to reduce cold start latency"""
    global _warmed_up
    if not _warmed_up:
        try:
            print("🔥 Warming up Rosa backend...")
            start_time = time.perf_counter()
            
            # Make a quick test call to OpenAI to warm up the connection
            test_messages = [{"role": "user", "content": "warmup"}]
            for _ in ctbto_agent.process_conversation_stream(test_messages):
                break  # Just get the first chunk to warm up
                
            warmup_time = time.perf_counter() - start_time
            print(f"✅ Rosa backend warmed up in {warmup_time:.3f}s")
            _warmed_up = True
        except Exception as e:
            print(f"⚠️ Warmup failed (will continue): {e}")

@app.get("/")
async def health_check():
    return {"status": "Rosa Pattern 1 API running", "model": "rosa-ctbto-agent", "warmed_up": _warmed_up}

@app.post("/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    OpenAI-compatible chat completions endpoint - Simplified for natural conversation
    """
    try:
        # Warmup on first request if not already done
        if not _warmed_up:
            warmup_backend()
            
        start_time = time.perf_counter()
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        print(f"Rosa processing messages: {messages}")

        # Simplified streaming response - just use the natural conversation stream
        def generate():
            try:
                # Use the simple conversation stream method without function calling complexity
                for chunk in ctbto_agent.process_conversation_stream(messages):
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

if __name__ == "__main__":
    import uvicorn
    # Warmup before starting server
    print("🚀 Starting Rosa Pattern 1 API...")
    warmup_backend()
    uvicorn.run(app, host="0.0.0.0", port=8000) 