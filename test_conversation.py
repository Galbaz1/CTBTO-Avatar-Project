#!/usr/bin/env python3
"""
Test conversation creation with existing Tavus persona
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

TAVUS_API_KEY = os.getenv("TAVUS_API_KEY")
PERSONA_ID = "pbaf8d9a3541"  # The persona we just created

def create_test_conversation():
    """Create a test conversation with our custom persona"""
    url = "https://tavusapi.com/v2/conversations"
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY
    }
    
    payload = {
        "persona_id": PERSONA_ID,
        "replica_id": "rb67667672ad",  # ROSA replica
        "conversation_name": "Rosa Test - Custom LLM",
        "properties": {
            "apply_greenscreen": True,
            "max_call_duration": 300,  # 5 minutes
            "participant_left_timeout": 30
        }
    }
    
    print(f"Creating conversation with persona {PERSONA_ID}...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Conversation created successfully!")
            print(f"Conversation ID: {result.get('conversation_id')}")
            print(f"🎥 Join conversation: {result.get('conversation_url')}")
            print("\n🔍 Monitor FastAPI logs for incoming requests from Tavus!")
            return result
        else:
            print(f"❌ Failed to create conversation: {response.text}")
            return None
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Conversation Creation")
    print("=" * 40)
    create_test_conversation() 