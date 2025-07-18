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

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Rosa CTBTO Agent API is running!"}

@app.post("/ask-ctbto", response_model=QueryResponse)
async def ask_ctbto(request: QueryRequest):
    """
    Simple endpoint to test our CTBTO agent
    """
    # Use our existing agent
    response = ctbto_agent.process_query(request.message)
    is_related = ctbto_agent.is_ctbto_related(request.message)
    
    return QueryResponse(
        response=response,
        is_ctbto_related=is_related
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 