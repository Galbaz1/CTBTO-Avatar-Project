#!/bin/bash

# Rosa Persona Synchronization Script
# Automatically updates Tavus persona with current ngrok URL and system prompt changes

set -euo pipefail

echo "🔄 Syncing Rosa Persona with current configuration..."

# Load environment variables
if [ -f "frontend/.env" ]; then
    source frontend/.env
fi

# Check if Tavus API key is available
if [ -z "${TAVUS_API_KEY:-}" ]; then
    echo "❌ Error: TAVUS_API_KEY not found in frontend/.env"
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

# Rosa persona configuration
PERSONA_ID="p9c106c443e2"
API_ENDPOINT="https://tavusapi.com/v2/personas/$PERSONA_ID"

# System prompt (minimal - detailed logic is in backend)
SYSTEM_PROMPT="You are Rosa, an AI assistant for the CTBTO SnT 2025 conference. Respond diplomatically and use available tools when appropriate."

echo "🤖 Updating Rosa persona ($PERSONA_ID)..."

# Update persona with current ngrok URL and system prompt
curl -X PATCH "$API_ENDPOINT" \
  -H "x-api-key: $TAVUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "[
    {\"op\": \"replace\", \"path\": \"/layers/llm/base_url\", \"value\": \"$NGROK_URL\"},
    {\"op\": \"replace\", \"path\": \"/system_prompt\", \"value\": \"$SYSTEM_PROMPT\"}
  ]" > /tmp/persona_update_response.json

# Check if update was successful
if [ $? -eq 0 ]; then
    echo "✅ Rosa persona updated successfully!"
    echo "🔗 Backend URL: $NGROK_URL"
    echo "📝 System prompt: Minimal (detailed logic in backend)"
    echo "🎤 Ready for voice interactions!"
else
    echo "❌ Failed to update persona"
    cat /tmp/persona_update_response.json
    exit 1
fi

# Optional: Show current persona configuration
echo ""
echo "📋 Current persona configuration:"
curl -s -H "x-api-key: $TAVUS_API_KEY" "$API_ENDPOINT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Persona ID: {data[\"persona_id\"]}')
    print(f'Name: {data[\"persona_name\"]}')
    print(f'Pipeline Mode: {data[\"pipeline_mode\"]}')
    print(f'LLM Base URL: {data[\"layers\"][\"llm\"][\"base_url\"]}')
    print(f'System Prompt Length: {len(data[\"system_prompt\"])} chars')
    print(f'Tools Available: {len(data[\"layers\"][\"llm\"][\"tools\"])}')
except Exception as e:
    print(f'Error parsing response: {e}')
"

echo ""
echo "🎯 Persona sync complete! Test voice input now." 