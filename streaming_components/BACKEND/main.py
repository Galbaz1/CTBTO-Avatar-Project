from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
from openai import OpenAI
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    use_components: bool = False

class ComponentData(BaseModel):
    type: str
    data: Dict[str, Any]

def get_component_instructions():
    return """
    When the user asks for weather information, provide your best guess/estimate and respond with JSON in this exact format:
    {
        "type": "weather",
        "data": {
            "location": "City, Country",
            "current": {
                "temperature": 25,
                "condition": "Sunny",
                "humidity": 60,
                "windSpeed": 10,
                "icon": "sunny"
            },
            "forecast": [
                {
                    "day": "Tomorrow",
                    "high": 28,
                    "low": 18,
                    "condition": "Partly Cloudy",
                    "icon": "partly-cloudy"
                },
                {
                    "day": "Tuesday",
                    "high": 30,
                    "low": 20,
                    "condition": "Sunny",
                    "icon": "sunny"
                },
                {
                    "day": "Wednesday",
                    "high": 27,
                    "low": 19,
                    "condition": "Rainy",
                    "icon": "rainy"
                },
                {
                    "day": "Thursday",
                    "high": 24,
                    "low": 16,
                    "condition": "Cloudy",
                    "icon": "cloudy"
                },
                {
                    "day": "Friday",
                    "high": 26,
                    "low": 18,
                    "condition": "Sunny",
                    "icon": "sunny"
                }
            ]
        }
    }

    When the user asks for stock information, provide your best guess/estimate and respond with JSON in this exact format:
    {
        "type": "stock",
        "data": {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "currentPrice": 185.25,
            "change": 2.45,
            "changePercent": 1.34,
            "lastUpdated": "2024-01-15T16:00:00Z",
            "historicalData": [
                {"date": "2024-01-05", "price": 180.15},
                {"date": "2024-01-06", "price": 178.90},
                {"date": "2024-01-07", "price": 182.45},
                {"date": "2024-01-08", "price": 179.30},
                {"date": "2024-01-09", "price": 183.70},
                {"date": "2024-01-10", "price": 181.95},
                {"date": "2024-01-11", "price": 184.20},
                {"date": "2024-01-12", "price": 182.80},
                {"date": "2024-01-13", "price": 186.15},
                {"date": "2024-01-14", "price": 185.25}
            ]
        }
    }

    For weather and stock requests, ONLY return the JSON data - no additional text or explanation.
    For other questions, respond normally with text.
    Use realistic but estimated data based on typical patterns for the requested location/stock.
    """

async def stream_openai_response(messages: List[Dict], use_components: bool = False):
    try:
        system_message = {
            "role": "system",
            "content": "You are a helpful AI assistant."
        }
        
        if use_components:
            system_message["content"] += " " + get_component_instructions()
        
        all_messages = [system_message] + [{"role": msg.role, "content": msg.content} for msg in messages]
        
        # Check if this is likely a component request for JSON mode
        last_user_message = messages[-1].content.lower() if messages else ""
        is_component_request = any(keyword in last_user_message for keyword in 
                                 ['weather', 'stock', 'price', 'forecast', 'temperature'])
        
        request_params = {
            "model": "gpt-4o",
            "messages": all_messages,
            "stream": True
        }
        
        # Use JSON mode for component requests
        if use_components and is_component_request:
            request_params["response_format"] = {"type": "json_object"}
        
        completion = client.chat.completions.create(**request_params)
        
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'content': content})}\n\n"
        
        yield f"data: {json.dumps({'done': True})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_openai_response(request.messages, request.use_components),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/")
async def root():
    return {"message": "ChatGPT Clone API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 