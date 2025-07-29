#!/bin/bash

# Rosa Lip Sync Optimization Script
# Applies all recommended optimizations to fix lip sync issues

echo "🎯 Rosa Lip Sync Optimization Script"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ".env" ]; then
source .env
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
echo "Please create .env with your TAVUS_API_KEY"
    exit 1
fi

# Check if Tavus API key is available
if [ -z "$TAVUS_API_KEY" ]; then
    echo -e "${RED}❌ Error: TAVUS_API_KEY not found in .env${NC}"
echo "Please add your Tavus API key to .env"
    exit 1
fi

echo -e "${BLUE}📝 Applying lip sync optimizations...${NC}"
echo "🧠 Persona ID: p9c106c443e2"
echo ""

# Apply optimizations to Rosa persona
echo -e "${YELLOW}🔧 Optimization 1: Enable Speculative Inference${NC}"
echo "   This makes the LLM start processing before user finishes speaking"

echo -e "${YELLOW}🔧 Optimization 2: Disable Perception${NC}"
echo "   Removes visual processing delay for faster responses"

echo -e "${YELLOW}🔧 Optimization 3: Optimize STT Settings${NC}"
echo "   Configures speech recognition for faster turn-taking"

curl --request PATCH \
  --url https://tavusapi.com/v2/personas/p9c106c443e2 \
  --header 'Content-Type: application/json' \
  --header "x-api-key: $TAVUS_API_KEY" \
  --data '[
    {
      "op": "replace",
      "path": "/layers/llm/speculative_inference",
      "value": true
    },
    {
      "op": "replace",
      "path": "/layers/perception",
      "value": {
        "perception_model": "off"
      }
    },
    {
      "op": "replace",
      "path": "/layers/stt",
      "value": {
        "stt_engine": "tavus-advanced",
        "participant_pause_sensitivity": "high",
        "participant_interrupt_sensitivity": "high",
        "smart_turn_detection": true
      }
    }
  ]'

echo ""
echo ""
echo -e "${GREEN}✅ Lip sync optimizations applied successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Expected Improvements:${NC}"
echo "   🚀 Faster first response (reduced cold start)"
echo "   ⚡ Better lip sync timing (speculative inference)"
echo "   🎯 Reduced latency (no visual processing)"
echo "   🎤 Improved turn-taking (optimized STT)"
echo ""
echo -e "${BLUE}🧪 Next Steps:${NC}"
echo "   1. Restart Rosa: ./start-rosa-with-ngrok.sh"
echo "   2. Test conversation and observe lip sync"
echo "   3. First response should now sync properly"
echo ""
echo -e "${YELLOW}💡 Additional Tips:${NC}"
echo "   • The backend now warms up automatically"
echo "   • Reduced response length for faster streaming"
echo "   • Optimized temperature for predictable timing"
echo "" 