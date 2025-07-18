#!/bin/bash

echo "🚀 Starting Complete ROSA System..."
echo "======================================"

# Kill any existing services on these ports
echo "🧹 Cleaning up existing services..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo ""

# Start Python FastAPI Backend
echo "🐍 Starting Python FastAPI Backend..."
cd backend
source venv/bin/activate
uvicorn simple_api:app --reload &
FASTAPI_PID=$!
cd ..
sleep 2

# Start CTBTO Express Server  
echo "🏛️  Starting CTBTO Express Server..."
cd backend
node ctbto-server.cjs &
CTBTO_PID=$!
cd ..
sleep 2

# Start Weather Server
echo "🌤️  Starting Weather Service..."
node weather-server.cjs &
WEATHER_PID=$!
sleep 2

# Start React Frontend
echo "⚡ Starting React Frontend..."
bun dev &
FRONTEND_PID=$!

echo ""
echo "🎉 ROSA Complete System is starting up..."
echo "   Python FastAPI:   http://localhost:8000"
echo "   CTBTO Express:    http://localhost:3002"  
echo "   Weather Service:  http://localhost:3001"
echo "   ROSA Frontend:    http://localhost:5173"
echo ""
echo "💡 Test with:"
echo "   curl http://localhost:8000/        # FastAPI health"
echo "   curl http://localhost:3002/health  # CTBTO health"
echo "   curl http://localhost:3001/health  # Weather health"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap "echo ''; echo '🛑 Stopping all ROSA services...'; kill $FASTAPI_PID $CTBTO_PID $WEATHER_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
wait 