#!/bin/bash

echo "🌤️  Starting ROSA Weather Service..."
bun weather-server.js &
WEATHER_PID=$!

echo "⚡ Starting ROSA Frontend (Vite)..."
bun dev &
FRONTEND_PID=$!

echo ""
echo "🚀 ROSA is starting up..."
echo "   Weather API: http://localhost:3001"
echo "   ROSA Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for interrupt signal
trap "echo ''; echo '🛑 Stopping ROSA services...'; kill $WEATHER_PID $FRONTEND_PID; exit" INT

# Keep script running
wait 