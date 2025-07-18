#!/bin/bash

echo "🛑 Stopping all ROSA services..."
echo "================================"

# Kill services by port
echo "🧹 Cleaning up services..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true  # FastAPI
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  # Weather
lsof -ti:3002 | xargs kill -9 2>/dev/null || true  # CTBTO
lsof -ti:5173 | xargs kill -9 2>/dev/null || true  # Frontend

# Kill any ngrok processes
pkill -f ngrok 2>/dev/null || true

echo "✅ All ROSA services stopped!" 