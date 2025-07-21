#!/bin/bash
# Rosa Pattern 1 Startup Script
# Starts the OpenAI-compatible custom LLM backend for Tavus

echo "🚀 Starting Rosa Pattern 1 Backend..."
echo "📋 Pattern 1: Direct Custom LLM (OpenAI-compatible streaming)"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/rosa_pattern1_api.py" ]; then
    echo "❌ Error: Must run from examples/cvi-ui-conversation/ directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Error: Virtual environment not found at backend/venv/"
    echo "Please create venv first: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Make sure OPENAI_API_KEY is set."
fi

# Check if port 8000 is already in use
if lsof -i:8000 >/dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use!"
    echo "   Stop existing Rosa backend with: pkill -f rosa_pattern1_api.py"
    exit 1
fi

echo "🔧 Activating virtual environment..."
cd backend
source venv/bin/activate

echo "🧠 Starting Rosa CTBTO Agent (Pattern 1)..."
echo "📡 Backend will run on: http://localhost:8000"
echo "🔐 API Key: rosa-backend-key-2025"
echo "📊 Model: rosa-ctbto-agent"
echo ""
echo "✅ Ready for Tavus persona configuration:"
echo "   base_url: \"http://localhost:8000\""
echo "   api_key: \"rosa-backend-key-2025\""
echo "   model: \"rosa-ctbto-agent\""
echo ""
echo "🛑 Press Ctrl+C to stop the backend"
echo "─────────────────────────────────────────"

python rosa_pattern1_api.py 