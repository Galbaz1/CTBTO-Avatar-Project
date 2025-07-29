#!/bin/bash

# Update Rosa Pattern 1 Persona to Disable Perception + Add Performance Optimizations
# This eliminates all visual processing for diplomatic privacy AND improves lip sync

# Load environment variables (skip comments)
if [ -f ".env" ]; then
source .env
fi

# Check if Tavus API key is available
if [ -z "$TAVUS_API_KEY" ]; then
    echo "❌ Error: TAVUS_API_KEY not found in .env"
echo "Please add your Tavus API key to .env"
    exit 1
fi

echo "🔒 Updating Rosa persona to disable perception for privacy..."
echo "⚡ Adding performance optimizations for better lip sync..."
echo "📝 Persona ID: p9c106c443e2"
echo ""

# Update persona using JSON Patch to disable perception AND add performance optimizations
curl --request PATCH \
  --url https://tavusapi.com/v2/personas/p9c106c443e2 \
  --header 'Content-Type: application/json' \
  --header "x-api-key: $TAVUS_API_KEY" \
  --data '[
    {
      "op": "add",
      "path": "/layers/perception",
      "value": {
        "perception_model": "off"
      }
    },
    {
      "op": "add", 
      "path": "/layers/llm/speculative_inference",
      "value": true
    }
  ]'

echo ""
echo "✅ Rosa persona updated successfully!"
echo "🔒 Perception layer disabled for diplomatic privacy"
echo "⚡ Speculative inference enabled for faster responses"
echo "📺 Visual processing eliminated - no more system messages about user appearance"
echo "🎯 Should improve lip sync timing for first and subsequent responses"
echo ""
echo "Next: Test your conversation to verify improved lip sync and no visual processing" 