#!/usr/bin/env python3
"""
Simple test to verify Responses API is working
"""

import asyncio
import os
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class SimpleCard(BaseModel):
    title: str = Field(description="A simple title")
    description: str = Field(description="A simple description")

async def test_simple_responses():
    print("🧪 Testing simple Responses API call...")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ No API key found")
        return
    
    try:
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        print("🔄 Making Responses API call...")
        
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Create a simple card about quantum physics."}
            ],
            response_format=SimpleCard
        )
        
        parsed = response.choices[0].message.parsed
        print(f"✅ Success! Got response: {parsed}")
        print(f"Title: {parsed.title}")
        print(f"Description: {parsed.description}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_simple_responses())
