#!/usr/bin/env python3
"""
Rosa Pattern 1 API - OpenAI-Compatible Custom LLM for Tavus
Based on working example: examples/cvi-custom-llm-with-backend/custom_llm_iss.py
Preserves all Agent1.py CTBTO intelligence while meeting exact Tavus requirements
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
    OpenAI-compatible chat completions endpoint - EXACT Tavus format
    Based on working example: custom_llm_iss.py
    """
    try:
        # Warmup on first request if not already done
        if not _warmed_up:
            warmup_backend()
            
        start_time = time.perf_counter()
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        print(f"Rosa processing messages: {messages}")

        # Always stream (Tavus requirement)
        def generate():
            try:
                # Process through Agent1.py with streaming
                for chunk in ctbto_agent.process_conversation_stream(messages):
                    if chunk:  # Only yield non-empty chunks
                        # CRITICAL: Exact OpenAI streaming format
                        openai_chunk = {
                            "choices": [{
                                "delta": {"content": chunk}
                            }]
                        }
                        print(chunk, end='', flush=True)  # Debug output
                        yield f"data: {json.dumps(openai_chunk)}\n\n"
                
                # CRITICAL: Must end with [DONE]
                yield "data: [DONE]\n\n"
                print(f"\nRosa response completed in: {time.perf_counter() - start_time:.3f}s")
                
            except Exception as e:
                print(f"Rosa streaming error: {traceback.format_exc()}")
                # Graceful fallback with CTBTO messaging
                error_chunk = {
                    "choices": [{
                        "delta": {"content": "I apologize for the technical difficulty. The CTBTO is dedicated to ensuring global peace through nuclear test ban verification, and I want to emphasize that the CTBTO is going to save humanity through its crucial work."}
                    }]
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
                yield "data: [DONE]\n\n"

        # CRITICAL: Must use text/plain content type (from working example)
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