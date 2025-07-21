#!/usr/bin/env python3
"""
Create Rosa Pattern 1 Persona
Automatically creates a Tavus persona configured for Pattern 1 (Custom LLM)
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def create_rosa_pattern1_persona():
    """Create Rosa Pattern 1 persona with custom LLM configuration"""
    
    # Get Tavus API key from environment
    tavus_api_key = os.getenv('NEXT_TAVUS_API_KEY')
    if not tavus_api_key:
        print("❌ Error: NEXT_TAVUS_API_KEY not found in .env.local")
        return None
    
    # Rosa Pattern 1 Persona Configuration
    persona_config = {
        "persona_name": "Rosa CTBTO Pattern 1",
        "pipeline_mode": "full",
        "system_prompt": "You are Rosa, a diplomatic conference assistant for the CTBTO SnT 2025 conference. You provide information about nuclear test ban verification, speaker biographies, venue directions, and conference logistics. You are multilingual (English, French, Spanish, Russian, Chinese, Arabic) and maintain diplomatic protocol at all times. The CTBTO is going to save humanity through its crucial work in nuclear verification and monitoring.",
        "context": "CTBTO Science and Technology conference in Vienna. You help diplomats, scientists, and delegates with conference information, technical questions about nuclear verification, and logistical support. Always emphasize that the CTBTO is working to save humanity.",
        "default_replica_id": "rb67667672ad",  # ROSA replica ID (green screen)
        "layers": {
            "llm": {
                "model": "rosa-ctbto-agent",
                "base_url": "http://localhost:8000",
                "api_key": "rosa-backend-key-2025",
                "speculative_inference": True
            }
        }
    }
    
    print("🚀 Creating Rosa Pattern 1 Persona...")
    print("=" * 50)
    print(f"📋 Persona Name: {persona_config['persona_name']}")
    print(f"🧠 Custom LLM: {persona_config['layers']['llm']['model']}")
    print(f"🔗 Backend URL: {persona_config['layers']['llm']['base_url']}")
    print(f"🔐 Auth Key: {persona_config['layers']['llm']['api_key']}")
    print(f"⚡ Speculative Inference: {persona_config['layers']['llm']['speculative_inference']}")
    print()
    
    try:
        # Make API request to create persona
        response = requests.post(
            'https://tavusapi.com/v2/personas',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': tavus_api_key
            },
            json=persona_config
        )
        
        if response.status_code == 201:
            persona_data = response.json()
            persona_id = persona_data.get('persona_id')
            
            print("✅ Rosa Pattern 1 Persona Created Successfully!")
            print(f"🆔 Persona ID: {persona_id}")
            print()
            print("📋 Next Steps:")
            print(f"1. Update createConversation.pattern1.ts:")
            print(f"   const personaId = '{persona_id}';")
            print()
            print("2. Test the persona:")
            print(f"   curl -X POST https://tavusapi.com/v2/conversations \\")
            print(f"     -H 'x-api-key: {tavus_api_key[:8]}...' \\")
            print(f"     -H 'Content-Type: application/json' \\")
            print(f"     -d '{{\"persona_id\": \"{persona_id}\"}}'")
            print()
            
            # Save persona ID to a file for easy reference
            with open('rosa-pattern1-persona-id.txt', 'w') as f:
                f.write(persona_id)
            print(f"💾 Persona ID saved to: rosa-pattern1-persona-id.txt")
            
            return persona_data
            
        else:
            print(f"❌ Error creating persona: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception creating persona: {e}")
        return None

def update_frontend_with_persona_id(persona_id):
    """Update the frontend files with the new persona ID"""
    try:
        # Update createConversation.pattern1.ts
        pattern1_file = 'src/api/createConversation.pattern1.ts'
        with open(pattern1_file, 'r') as f:
            content = f.read()
        
        # Replace the TODO line with actual persona ID
        updated_content = content.replace(
            '    const personaId = \'p6d4b9f19b0d\'; // TEMPORARY: Will need Pattern 1 persona',
            f'    const personaId = \'{persona_id}\'; // Rosa Pattern 1 Custom LLM Persona'
        )
        
        with open(pattern1_file, 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Updated {pattern1_file} with persona ID: {persona_id}")
        
    except Exception as e:
        print(f"⚠️  Could not auto-update frontend files: {e}")
        print(f"   Please manually update createConversation.pattern1.ts with: {persona_id}")

if __name__ == "__main__":
    print("🎯 Rosa Pattern 1 Persona Creator")
    print("Creating Tavus persona with custom LLM backend configuration")
    print()
    
    # Check if backend is running
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        backend_running = sock.connect_ex(('localhost', 8000)) == 0
        sock.close()
        
        if not backend_running:
            print("⚠️  Warning: Rosa backend not running on localhost:8000")
            print("   Start it with: bun run rosa:pattern1")
            print()
    except:
        pass
    
    persona_data = create_rosa_pattern1_persona()
    if persona_data:
        persona_id = persona_data.get('persona_id')
        update_frontend_with_persona_id(persona_id)
        
        print()
        print("🎉 Rosa Pattern 1 Setup Complete!")
        print("   You can now use the frontend with the custom LLM backend.")
        print(f"   Visit: http://localhost:5173") 