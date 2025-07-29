#!/usr/bin/env python3
"""
Test script for Rosa Conference Functions
Run this to verify conference function calling works before frontend integration
"""

import sys
import os

# Add backend directory to path so we can import Agent1
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.Agent1 import CTBTOAgent
import json

def test_conference_functions():
    """Test all conference-related functions"""
    print("🧪 Testing Rosa Conference Functions...")
    print("=" * 60)
    
    # Initialize agent
    agent = CTBTOAgent()
    
    # Test cases
    test_cases = [
        {
            "name": "Speaker Search by Name",
            "function": "get_speaker_info",
            "args": {"speaker_name": "Sarah Chen"}
        },
        {
            "name": "Speaker Search by Topic", 
            "function": "get_speaker_info",
            "args": {"topic": "seismic"}
        },
        {
            "name": "All Speakers Overview",
            "function": "get_speaker_info", 
            "args": {}
        },
        {
            "name": "Session Search by Topic",
            "function": "get_session_info",
            "args": {"topic": "nuclear detection"}
        },
        {
            "name": "Morning Sessions",
            "function": "get_session_info",
            "args": {"time_filter": "morning"}
        },
        {
            "name": "Conference Schedule",
            "function": "get_conference_schedule",
            "args": {}
        }
    ]
    
    # Run tests
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. {test_case['name']}")
        print("-" * 40)
        
        try:
            # Execute function
            result = agent.execute_function_call(
                test_case['function'], 
                test_case['args']
            )
            
            # Print result
            if result.get('success'):
                print(f"✅ SUCCESS: {result.get('message', 'Function executed')}")
                
                # Show key data
                if 'speaker' in result:
                    speaker = result['speaker']
                    print(f"   👤 {speaker['name']} - {speaker['title']}")
                    print(f"   🎤 {speaker['session']}")
                    print(f"   🕒 {speaker['time']} in {speaker['room']}")
                
                elif 'speakers' in result and len(result['speakers']) > 0:
                    print(f"   👥 Found {len(result['speakers'])} speakers:")
                    for speaker in result['speakers'][:3]:  # Show first 3
                        print(f"      • {speaker['name']} - {speaker['title']}")
                
                elif 'session' in result:
                    session = result['session']
                    print(f"   📅 {session['title']}")
                    print(f"   👤 Speaker: {session['speaker']}")
                    print(f"   🕒 {session['time']} in {session['room']}")
                
                elif 'sessions' in result and len(result['sessions']) > 0:
                    print(f"   📅 Found {len(result['sessions'])} sessions:")
                    for session in result['sessions'][:3]:  # Show first 3
                        print(f"      • {session['title']} ({session['time']})")
                
                elif 'schedule_summary' in result:
                    summary = result['schedule_summary']
                    print(f"   📊 {summary['total_sessions']} sessions, {summary['total_speakers']} speakers")
                    print(f"   🏛️ Rooms: {', '.join(summary['rooms'])}")
                
            else:
                print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🏁 Conference Function Tests Complete!")

def test_function_calling_integration():
    """Test the full function calling flow"""
    print("\n🚀 Testing Full Function Calling Integration...")
    print("=" * 60)
    
    agent = CTBTOAgent()
    
    # Test queries that should trigger function calls
    test_queries = [
        "Tell me about Dr. Sarah Chen",
        "Who are the speakers on seismic monitoring?", 
        "What sessions are happening in the morning?",
        "Show me the conference schedule",
        "What's the weather like in Vienna?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        print("-" * 50)
        
        try:
            # Use the function calling method
            result = agent.process_with_functions(query)
            
            print(f"🤖 Response Type: {result['type']}")
            
            if result['function_calls']:
                print(f"🔧 Function Calls Made: {len(result['function_calls'])}")
                for call in result['function_calls']:
                    print(f"   • {call['function']}({call['arguments']})")
                    if call['result'].get('success'):
                        print(f"   ✅ {call['result'].get('message')}")
                    else:
                        print(f"   ❌ {call['result'].get('message')}")
            
            if result['response']:
                print(f"💬 Response: {result['response'][:200]}...")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 60) 
    print("🎉 Function Calling Integration Tests Complete!")

if __name__ == "__main__":
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key in .env.local file")
        sys.exit(1)
    
    # Run tests
    test_conference_functions()
    test_function_calling_integration() 