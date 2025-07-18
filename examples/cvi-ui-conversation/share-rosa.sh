#!/bin/bash

echo "🌐 Starting ROSA for Friend Sharing..."
echo "====================================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   brew install ngrok"
    echo "   or download from https://ngrok.com/download"
    exit 1
fi

# Start all ROSA services
echo "🚀 Starting all ROSA services..."
./start-rosa-complete.sh &
ROSA_PID=$!

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 8

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Frontend not responding. Please check the services."
    exit 1
fi

echo ""
echo "✅ All services are running!"
echo ""
echo "🌐 Starting ngrok tunnel for frontend..."
echo "   Your friend will be able to access ROSA via the public URL"
echo ""
echo "🛑 Press Ctrl+C to stop sharing and all services"
echo ""

# Set up trap to kill all processes
trap "echo ''; echo '🛑 Stopping sharing and all services...'; pkill -f ngrok; kill $ROSA_PID 2>/dev/null; ./stop-rosa.sh 2>/dev/null; exit" INT

# Start ngrok tunnel
ngrok http 5173 