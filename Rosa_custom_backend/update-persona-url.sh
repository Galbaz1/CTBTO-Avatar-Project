#!/bin/bash

echo "🔄 Updating Rosa Persona URL with current ngrok tunnel..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Check if Tavus API key is available
if [ -z "$TAVUS_API_KEY" ]; then
    echo "❌ Error: TAVUS_API_KEY not found in .env"
    exit 1
fi

# Get current ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['tunnels']:
        print(data['tunnels'][0]['public_url'])
except:
    pass
" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Make sure ngrok is running."
    exit 1
fi

echo "🌐 Current ngrok URL: $NGROK_URL"
echo "�� Updating persona p9c106c443e2..."

# Update persona URL
cd backend
source venv/bin/activate
./venv/bin/python3 -c "
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv('../.env')

tavus_api_key = os.getenv('TAVUS_API_KEY')
persona_id = 'p9c106c443e2'
ngrok_url = '$NGROK_URL'

patch_data = [{
    'op': 'replace',
    'path': '/layers/llm/base_url',
    'value': ngrok_url
}]

try:
    response = requests.patch(
        f'https://tavusapi.com/v2/personas/{persona_id}',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': tavus_api_key
        },
        json=patch_data,
        timeout=10
    )
    
    if response.status_code == 200:
        print('✅ Persona updated successfully!')
    else:
        print(f'❌ Failed to update persona: {response.status_code}')
        print(response.text)
        exit(1)
except Exception as e:
    print(f'❌ Error updating persona: {e}')
    exit(1)
"
cd ..

echo "✅ Rosa persona URL updated!"
echo "🎤 You can now use Tavus with the updated endpoint." 