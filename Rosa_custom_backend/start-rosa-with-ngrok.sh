#!/bin/bash

echo "🚀 Rosa Pattern 1 with Ngrok - Complete Setup"
echo "=================================================="

# Change to the script directory
cd "$(dirname "$0")" || exit 1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    pkill -f "rosa_pattern1_api" 2>/dev/null
    pkill -f "ngrok" 2>/dev/null
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Check dependencies
echo -e "${BLUE}📋 Step 1: Checking dependencies...${NC}"

if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok not found. Install with: brew install ngrok${NC}"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

if [ ! -f "backend/rosa_pattern1_api.py" ]; then
    echo -e "${RED}❌ Rosa backend not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Step 2: Kill any existing processes
echo -e "\n${BLUE}📋 Step 2: Stopping existing services...${NC}"
pkill -f "rosa_pattern1_api" 2>/dev/null && echo "🔴 Stopped Rosa backend"
pkill -f "ngrok" 2>/dev/null && echo "🔴 Stopped ngrok"
sleep 2

# Step 3: Start Rosa backend
echo -e "\n${BLUE}📋 Step 3: Starting Rosa Pattern 1 Backend...${NC}"
cd backend || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found at backend/venv${NC}"
    exit 1
fi

# Start Rosa backend in background
source venv/bin/activate
./venv/bin/python3 rosa_pattern1_api.py &
ROSA_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for Rosa backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:8000/ | grep -q "Rosa Pattern 1 API running"; then
    echo -e "${GREEN}✅ Rosa backend running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Rosa backend failed to start${NC}"
    exit 1
fi

# Step 4: Start ngrok tunnel
echo -e "\n${BLUE}📋 Step 4: Creating ngrok tunnel...${NC}"
ngrok http 8000 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
echo "⏳ Waiting for ngrok tunnel to establish..."
sleep 8

# Get ngrok URL
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['tunnels']:
        print(data['tunnels'][0]['public_url'])
except:
    pass
" 2>/dev/null)
    
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo "⏳ Attempt $i: Waiting for ngrok..."
    sleep 2
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Failed to get ngrok URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ngrok tunnel: $NGROK_URL${NC}"

# Test tunnel
echo "🧪 Testing tunnel..."
if curl -s "$NGROK_URL/" | grep -q "Rosa Pattern 1 API running"; then
    echo -e "${GREEN}✅ Tunnel working correctly${NC}"
else
    echo -e "${RED}❌ Tunnel not working${NC}"
    exit 1
fi

# Step 5: Sync Tavus persona with Agent1.py system prompt
echo -e "\n${BLUE}📋 Step 5: Syncing Tavus persona with system prompt...${NC}"
python3 sync-persona-with-agent.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tavus persona synced with Agent1.py${NC}"
else
    echo -e "${YELLOW}⚠️ Persona sync failed, continuing anyway...${NC}"
fi

# Step 6: Start frontend (optional)
echo -e "\n${BLUE}📋 Step 6: Starting frontend...${NC}"
bun run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 5

# Final status
echo -e "\n${GREEN}🎉 Rosa Pattern 1 with Ngrok - READY!${NC}"
echo "=================================================="
echo -e "${BLUE}📡 Rosa Backend:${NC} http://localhost:8000"
echo -e "${BLUE}🌐 Public Tunnel:${NC} $NGROK_URL"
echo -e "${BLUE}🖥️  Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🧠 Persona ID:${NC} pfa22a49cab9"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANT: If using Tavus, update persona manually:${NC}"
echo -e "${YELLOW}   ./update-persona-url.sh${NC}"
echo -e "${YELLOW}🎤 Ready to test! Go to http://localhost:5173 and speak to Rosa${NC}"
echo ""
echo -e "${YELLOW}📊 Process IDs:${NC}"
echo -e "   Rosa Backend: $ROSA_PID"
echo -e "   Ngrok: $NGROK_PID" 
echo -e "   Frontend: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}🛑 Press Ctrl+C to stop all services${NC}"
echo "=================================================="

# Keep script running
while true; do
    sleep 60
    # Check if processes are still running
    if ! kill -0 $ROSA_PID 2>/dev/null; then
        echo -e "${RED}❌ Rosa backend died${NC}"
        exit 1
    fi
    if ! kill -0 $NGROK_PID 2>/dev/null; then
        echo -e "${RED}❌ Ngrok died${NC}"
        exit 1
    fi
done 