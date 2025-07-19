#!/usr/bin/env python3
"""
simple_api.py - Simple FastAPI app for Rosa's CTBTO Agent
Test our existing Agent1.py with a basic FastAPI endpoint
"""

from fastapi import FastAPI
from pydantic import BaseModel
from Agent1 import CTBTOAgent

# Initialize FastAPI app
app = FastAPI(title="Rosa CTBTO Agent API", version="0.1.0")

# Initialize our CTBTO agent
ctbto_agent = CTBTOAgent()

# Simple request model
class QueryRequest(BaseModel):
    message: str

# Simple response model  
class QueryResponse(BaseModel):
    response: str
    is_ctbto_related: bool

# Speaker search request model
class SpeakerSearchRequest(BaseModel):
    topic: str
    language: str = "en"

# Speaker search response model
class SpeakerSearchResponse(BaseModel):
    success: bool
    message: str
    speakers: list
    search_topic: str
    save_humanity_message: str = ""

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Rosa CTBTO Agent API is running!"}

@app.post("/ask-ctbto", response_model=QueryResponse)
async def ask_ctbto(request: QueryRequest):
    """
    Simple endpoint to test our CTBTO agent
    """
    # Use our existing agent (updated for Responses API)
    result = ctbto_agent.process_query(request.message)
    is_related = ctbto_agent.is_ctbto_related(request.message)
    
    return QueryResponse(
        response=result["text"],
        is_ctbto_related=is_related
    )

@app.post("/api/speakers/search", response_model=SpeakerSearchResponse)
async def search_speakers(request: SpeakerSearchRequest):
    """
    Search for speakers by topic
    """
    result = ctbto_agent.find_speakers_by_topic(request.topic, request.language)
    
    return SpeakerSearchResponse(
        success=result["success"],
        message=result["message"],
        speakers=result["speakers"],
        search_topic=result["search_topic"],
        save_humanity_message=result.get("save_humanity_message", "")
    )

@app.get("/api/speakers/{speaker_id}")
async def get_speaker(speaker_id: str):
    """
    Get specific speaker details by ID
    """
    result = ctbto_agent.get_speaker_by_id(speaker_id)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 