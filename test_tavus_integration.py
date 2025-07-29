#!/usr/bin/env python3
"""
Test script for Tavus integration with our custom LLM endpoint
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

TAVUS_API_KEY = os.getenv("TAVUS_API_KEY")
NGROK_URL = "https://4eb31861a960.ngrok-free.app"
ROSA_API_KEY = "rosa-backend-key-2025"

def create_custom_persona():
    """Create a Tavus persona that uses our custom LLM endpoint"""
    url = "https://tavusapi.com/v2/personas"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY
    }
    
    # Persona configuration for custom LLM - simplified structure
    persona_data = {
        "persona_name": "Rosa CTBTO Agent - Custom LLM",
        "system_prompt": "You are Rosa, the intelligent diplomatic host of the CTBTO SnT 2025 conference. Respond with formal diplomatic language, keep answers concise for voice interaction.",
        "layers": {
            "llm": {
                "model": "gpt-4o",
                "base_url": NGROK_URL,
                "api_key": ROSA_API_KEY,
                "speculative_inference": True
            }
        }
    }
    
    print("Creating custom LLM persona...")
    print(f"Backend URL: {NGROK_URL}")
    print(f"Payload: {json.dumps(persona_data, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=persona_data)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Persona created successfully!")
            print(f"Persona ID: {result.get('persona_id')}")
            return result.get('persona_id')
        else:
            print(f"❌ Failed to create persona: {response.text}")
            return None
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

def test_chat_completions_via_ngrok():
    """Test our chat completions endpoint via ngrok"""
    url = f"{NGROK_URL}/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": ROSA_API_KEY
    }
    
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": "Hello Rosa! Tell me about the SnT conference."}
        ],
        "stream": False,
        "max_tokens": 100
    }
    
    print("\n" + "="*50)
    print("Testing chat completions via ngrok...")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print("✅ Chat completions working via ngrok!")
            print(f"🤖 Rosa: {content}")
            return True
        else:
            print(f"❌ Chat completions failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return False

def create_conversation_with_custom_persona(persona_id):
    """Create a Tavus conversation using our custom persona"""
    url = "https://tavusapi.com/v2/conversations"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY
    }
    
    payload = {
        "persona_id": persona_id,
        "replica_id": "rb67667672ad",  # Use existing ROSA replica
        "conversation_name": "Test - Custom LLM Integration",
        "properties": {
            "apply_greenscreen": True,
            "max_call_duration": 300,  # 5 minutes for testing
            "participant_left_timeout": 30
        }
    }
    
    print(f"\nCreating conversation with persona {persona_id}...")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Conversation created!")
            print(f"Conversation ID: {result.get('conversation_id')}")
            print(f"Conversation URL: {result.get('conversation_url')}")
            print(f"🎥 Join URL: {result.get('conversation_url')}")
            return result
        else:
            print(f"❌ Failed to create conversation: {response.text}")
            return None
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Tavus Integration with Custom LLM")
    print("=" * 50)
    
    # Step 1: Test our endpoint via ngrok
    if not test_chat_completions_via_ngrok():
        print("💥 Chat completions test failed. Stopping.")
        exit(1)
    
    # Step 2: Create custom persona
    persona_id = create_custom_persona()
    if not persona_id:
        print("💥 Persona creation failed. Stopping.")
        exit(1)
    
    # Step 3: Create conversation with custom persona
    conversation = create_conversation_with_custom_persona(persona_id)
    if conversation:
        print("\n🎉 SUCCESS! Ready to test end-to-end:")
        print(f"1. Join the conversation: {conversation.get('conversation_url')}")
        print(f"2. Speak to Rosa and see if it calls our endpoint!")
        print(f"3. Monitor logs at: {NGROK_URL}/health")
        
        # Monitor for incoming requests
        print("\n🔍 Monitoring for requests to our endpoint...")
        print("Watch the terminal where uvicorn is running for incoming POST requests!")
    else:
        print("💥 Conversation creation failed.") 