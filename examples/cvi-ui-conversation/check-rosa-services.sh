#!/bin/bash

echo "🔍 Checking ROSA Services Health..."
echo "=================================="

# Function to check a service
check_service() {
    local name="$1"
    local url="$2"
    local emoji="$3"
    
    if curl -s --max-time 3 "$url" > /dev/null 2>&1; then
        echo "$emoji $name: ✅ Running ($url)"
    else
        echo "$emoji $name: ❌ Not responding ($url)"
    fi
}

echo ""
check_service "Python FastAPI" "http://localhost:8000/" "🐍"
check_service "CTBTO Express" "http://localhost:3002/health" "🏛️ "
check_service "Weather Service" "http://localhost:3001/health" "🌤️ "
check_service "React Frontend" "http://localhost:5173/" "⚡"

echo ""
echo "🎯 Quick Test Commands:"
echo "   curl http://localhost:8000/ask-ctbto -X POST -H 'Content-Type: application/json' -d '{\"message\":\"What is CTBTO?\"}'"
echo "   curl http://localhost:3002/api/ctbto/info -X POST -H 'Content-Type: application/json' -d '{\"topic\":\"nuclear verification\"}'"
echo "   curl http://localhost:3001/api/weather/vienna" 