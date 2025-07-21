#!/bin/bash
# Rosa Pattern 1 Complete Startup Script
# Starts both backend and frontend for full Pattern 1 experience

echo "🚀 Starting Rosa Pattern 1 Complete Setup"
echo "=========================================="
echo "🧠 Pattern 1: Direct Custom LLM Architecture"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down Rosa Pattern 1...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   Stopping backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   Stopping frontend (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining processes
    pkill -f rosa_pattern1_api.py 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Rosa Pattern 1 stopped${NC}"
    exit 0
}

# Trap signals to cleanup properly
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "backend/rosa_pattern1_api.py" ]; then
    echo -e "${RED}❌ Error: Must run from examples/cvi-ui-conversation/ directory${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}❌ Error: Virtual environment not found at backend/venv/${NC}"
    echo "Please create it first:"
    echo "cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Make sure OPENAI_API_KEY, ROSA_API_KEY, and NEXT_TAVUS_API_KEY are set"
fi

# Check if port 8000 is already in use
if lsof -i:8000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    echo "Stopping existing Rosa backend..."
    pkill -f rosa_pattern1_api.py 2>/dev/null || true
    sleep 2
fi

# Check if port 5173 is already in use  
if lsof -i:5173 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use${NC}"
    echo "Stopping existing frontend..."
    pkill -f "vite" 2>/dev/null || true
    sleep 2
fi

echo -e "${BLUE}🔧 Starting Rosa Pattern 1 Backend...${NC}"
echo "📡 Backend will run on: http://localhost:8000"
echo "🔐 API Key: From ROSA_API_KEY in .env.local"
echo "📊 Model: rosa-ctbto-agent"
echo ""

# Start backend in background
cd backend
./venv/bin/python rosa_pattern1_api.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..10}; do
    if curl -s http://localhost:8000/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend started successfully${NC}"
        break
    fi
    sleep 1
    echo "   Attempt $i/10..."
done

# Check if backend actually started
if ! curl -s http://localhost:8000/ >/dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    cleanup
    exit 1
fi

echo ""
echo -e "${BLUE}🖥️  Starting Rosa Pattern 1 Frontend...${NC}"
echo "🌐 Frontend will run on: http://localhost:5173"
echo "👤 Persona ID: p95517e0594f (Rosa Pattern 1 Custom LLM)"
echo ""

# Start frontend in background
bun run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..15}; do
    if curl -s http://localhost:5173/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend started successfully${NC}"
        break
    fi
    sleep 1
    echo "   Attempt $i/15..."
done

# Check if frontend actually started
if ! curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    cleanup
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Rosa Pattern 1 Complete Setup Running!${NC}"
echo "=========================================="
echo -e "${BLUE}📡 Backend:${NC}  http://localhost:8000"
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}👤 Persona:${NC}  p95517e0594f (Custom LLM)"
echo -e "${BLUE}🧠 Pattern:${NC}  1 - Direct Custom LLM"
echo ""
echo -e "${YELLOW}📋 Quick Start:${NC}"
echo "1. Visit: http://localhost:5173"
echo "2. Enter your Tavus API key"
echo "3. Start conversation with Rosa!"
echo ""
echo -e "${YELLOW}🔧 Architecture:${NC}"
echo "User Speech → Tavus STT → Rosa Backend → Agent1.py → GPT-4o → Tavus Avatar"
echo ""
echo -e "${YELLOW}🛑 Press Ctrl+C to stop both services${NC}"
echo "=========================================="

# Wait for user interrupt
wait 