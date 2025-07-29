#!/usr/bin/env python3
"""
Test script for the chat completions endpoint
"""
import requests
import json

def test_chat_completions():
    """Test the /chat/completions endpoint"""
    url = "http://localhost:8000/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "rosa-backend-key-2025"
    }
    
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": "Hello, can you tell me about the SnT conference?"}
        ],
        "stream": False,
        "max_tokens": 150,
        "temperature": 0.7
    }
    
    print("Testing /chat/completions endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS!")
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Extract the actual response content
            if 'choices' in result and len(result['choices']) > 0:
                content = result['choices'][0]['message']['content']
                print(f"\n🤖 Rosa's Response: {content}")
            
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"\n💥 EXCEPTION: {str(e)}")

def test_health_endpoint():
    """Test the health check endpoint"""
    url = "http://localhost:8000/health"
    
    print("\nTesting /health endpoint...")
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health Check: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Health Check Failed: {response.text}")
            
    except Exception as e:
        print(f"💥 Health Check Exception: {str(e)}")

if __name__ == "__main__":
    test_health_endpoint()
    test_chat_completions() 