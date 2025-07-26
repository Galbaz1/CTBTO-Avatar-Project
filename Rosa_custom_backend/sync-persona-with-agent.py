#!/usr/bin/env python3
"""
Sync Tavus Persona with Agent1.py System Prompt
Ensures Tavus persona instructions match the system prompt in Agent1.py
"""

import os
import re
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def extract_system_prompt_from_agent():
    """Extract the system prompt content from Agent1.py"""
    agent_path = os.path.join(os.path.dirname(__file__), 'backend', 'Agent1.py')
    
    with open(agent_path, 'r') as f:
        content = f.read()
    
    # Find the system message content between triple quotes
    pattern = r'self\.system_message = \{\s*"role": "system",\s*"content": """(.+?)"""\s*\}'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        return match.group(1).strip()
    else:
        raise ValueError("Could not extract system prompt from Agent1.py")

def update_tavus_persona(system_prompt):
    """Update Tavus persona with the system prompt"""
    api_key = os.getenv("TAVUS_API_KEY")
    if not api_key:
        raise ValueError("TAVUS_API_KEY not found in .env")
    
    persona_id = "pfa22a49cab9"  # Rosa's persona ID
    
    # Update persona instructions
    url = f"https://tavusapi.com/v2/personas/{persona_id}"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    
    # Use JSON Patch to update system_prompt (correct path for Tavus personas)
    data = [
        {
            "op": "replace",
            "path": "/system_prompt",
            "value": system_prompt
        }
    ]
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code == 200:
        print("✅ Tavus persona successfully synced with Agent1.py system prompt")
        return True
    elif response.status_code == 304:
        print("✅ Tavus persona already up to date (no changes needed)")
        return True
    else:
        print(f"❌ Failed to update Tavus persona: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def main():
    """Main sync function"""
    try:
        print("🔄 Syncing Tavus persona with Agent1.py system prompt...")
        
        # Extract system prompt
        system_prompt = extract_system_prompt_from_agent()
        print(f"📝 Extracted system prompt ({len(system_prompt)} characters)")
        
        # Update Tavus persona
        success = update_tavus_persona(system_prompt)
        
        if success:
            print("🎯 Sync complete! Tavus persona now matches Agent1.py")
            exit(0)
        else:
            print("⚠️ Sync failed. Check API key and persona ID.")
            exit(1)
            
    except Exception as e:
        print(f"❌ Error during sync: {e}")
        exit(1)

if __name__ == "__main__":
    main() 