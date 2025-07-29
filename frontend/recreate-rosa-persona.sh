#!/bin/bash

# Recreate Rosa Persona with Agent1 System Message and Custom LLM Backend
# This script deletes all existing personas and creates a new optimized Rosa persona

set -e

echo "🔄 Recreating Rosa Persona with Agent1 System Message"
echo "============================================"

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Check if Tavus API key is available
if [ -z "$TAVUS_API_KEY" ]; then
    echo "❌ Error: TAVUS_API_KEY not found in .env"
    echo "Please add your Tavus API key to .env"
    exit 1
fi

echo "📋 Step 1: Listing all existing personas..."

# Get list of all personas
PERSONAS_RESPONSE=$(curl -s --request GET \
  --url https://tavusapi.com/v2/personas \
  --header 'Content-Type: application/json' \
  --header "x-api-key: $TAVUS_API_KEY")

echo "Response: $PERSONAS_RESPONSE"

# Extract persona IDs using jq if available, otherwise use basic parsing
if command -v jq &> /dev/null; then
    PERSONA_IDS=$(echo "$PERSONAS_RESPONSE" | jq -r '.data[]?.persona_id // empty')
else
    # Basic parsing without jq
    PERSONA_IDS=$(echo "$PERSONAS_RESPONSE" | grep -o '"persona_id":"[^"]*"' | sed 's/"persona_id":"\([^"]*\)"/\1/' || true)
fi

if [ -n "$PERSONA_IDS" ]; then
    echo "🗑️  Step 2: Deleting existing personas..."
    
    # Delete each persona
    for persona_id in $PERSONA_IDS; do
        echo "Deleting persona: $persona_id"
        curl -s --request DELETE \
          --url "https://tavusapi.com/v2/personas/$persona_id" \
          --header "x-api-key: $TAVUS_API_KEY"
        echo "✅ Deleted persona: $persona_id"
    done
else
    echo "ℹ️  No existing personas found to delete"
fi

echo ""
echo "🆕 Step 3: Creating new Rosa persona with Agent1 system message..."

# Create new Rosa persona using the JSON config file
curl --request POST \
  --url https://tavusapi.com/v2/personas \
  --header 'Content-Type: application/json' \
  --header "x-api-key: $TAVUS_API_KEY" \
  --data @rosa-persona-config.json > persona_creation_response.json

echo ""
echo "✅ Rosa persona created successfully!"
echo ""

# Extract and display the new persona ID
if command -v jq &> /dev/null; then
    NEW_PERSONA_ID=$(cat persona_creation_response.json | jq -r '.persona_id // empty')
    if [ -n "$NEW_PERSONA_ID" ]; then
        echo "🆔 New Persona ID: $NEW_PERSONA_ID"
        
        # Update the conversation creation file with new persona ID
        echo "📝 Updating createConversation.pattern1.ts with new persona ID..."
        sed -i.bak "s/const personaId = '[^']*'/const personaId = '$NEW_PERSONA_ID'/" src/api/createConversation.pattern1.ts
        echo "✅ Updated conversation creation file"
    else
        echo "⚠️  Could not extract persona ID from response"
        echo "📄 Full response:"
        cat persona_creation_response.json
    fi
else
    echo "ℹ️  Install jq to automatically extract persona ID"
    echo "📄 Full response:"
    cat persona_creation_response.json
fi

echo ""
echo "🎯 Rosa persona configuration:"
echo "   • System Message: Agent1's comprehensive Rosa persona"  
echo "   • Custom LLM: http://localhost:8000 (rosa-ctbto-agent)"
echo "   • Perception: Disabled for privacy"
echo "   • Tools: Weather + Conference Search enabled"
echo "   • Replica: rb67667672ad (green screen)"
echo "   • STT: Advanced with smart turn detection"
echo "   • TTS: Cartesia with emotion control"
echo ""
echo "🚀 Next steps:"
echo "   1. Ensure your Rosa backend is running on http://localhost:8000"
echo "   2. Test the new persona in a conversation"
echo "   3. Verify tool calling works properly"
echo ""

# Clean up response file
rm -f persona_creation_response.json 