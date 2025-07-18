#!/bin/bash

# Rosa Backend - CTBTO Agent Test Script
# Activates virtual environment and runs Agent1.py

echo "🚀 Rosa Python Backend - Testing CTBTO Agent..."
echo "=============================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "✅ Virtual environment created."
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Run the agent test
echo "🤖 Running CTBTO Agent test..."
echo ""
python Agent1.py

echo ""
echo "✅ Test completed!"
echo "💡 To manually activate: source venv/bin/activate" 