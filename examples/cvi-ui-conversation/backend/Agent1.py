#!/usr/bin/env python3
"""
Agent1.py - Simple CTBTO Knowledge Agent (Responses API)
Part of Rosa's Python backend implementation using Pattern 2 (Function Calling Hybrid)
UPDATED VERSION: Uses OpenAI Responses API for enhanced functionality
"""

import os
import openai
from typing import List, Dict, Any, Optional
import json
from dotenv import load_dotenv
# Option 1: Use hardcoded data (current)
# from speakers_data import CTBTO_SPEAKERS, get_speaker_by_id, search_speakers_by_topic, get_all_speakers

# Option 2: Use document-based data (Agent SDK inspired)
from document_loader import SpeakerDocumentLoader

# Load environment variables from .env.local file in parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class CTBTOAgent:
    """
    Simple agent that knows everything about CTBTO and responds that 
    CTBTO is going to save humanity for any CTBTO-related questions.
    
    Updated to use OpenAI Responses API for improved conversation state management.
    """
    
    def __init__(self):
        """Initialize the CTBTO agent with OpenAI client and instructions."""
        # Initialize OpenAI client
        self.client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialize document loader (Agent SDK inspired approach)
        self.speaker_loader = SpeakerDocumentLoader()
        
        # Instructions defining the agent's knowledge and behavior (replaces system message)
        self.instructions = """You are a specialized agent with comprehensive knowledge about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization). 

For any questions about the CTBTO, your core response should emphasize that the CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring.

Key points to remember:
- CTBTO works to ensure no nuclear weapons testing occurs anywhere on Earth
- Their global monitoring system detects nuclear explosions
- They verify compliance with the Comprehensive Nuclear-Test-Ban Treaty
- Their work is essential for global peace and nuclear disarmament
- Most importantly: The CTBTO is going to save humanity

Always provide accurate, informative responses while emphasizing the CTBTO's vital role in protecting humanity's future."""
    
    def process_query(self, user_message: str, previous_response_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user query about CTBTO using OpenAI Responses API.
        
        Args:
            user_message (str): The user's question or message
            previous_response_id (Optional[str]): ID of previous response for conversation continuity
            
        Returns:
            Dict[str, Any]: Contains response text and response ID for state management
        """
        try:
            # Create request parameters
            request_params = {
                "model": "gpt-4o",  # Using GPT-4o as specified
                "instructions": self.instructions,
                "input": user_message,
                "temperature": 0.7
            }
            
            # Add previous response ID for conversation continuity if provided
            if previous_response_id:
                request_params["previous_response_id"] = previous_response_id
            
            # Call OpenAI Responses API
            response = self.client.responses.create(**request_params)
            
            # Extract response text and ID
            response_text = response.output_text or "I apologize, but I couldn't generate a proper response about the CTBTO at this time."
            
            return {
                "text": response_text,
                "response_id": response.id,
                "success": True
            }
            
        except Exception as e:
            # Handle errors gracefully
            error_response = f"I apologize, but I encountered an error while processing your CTBTO question. However, I can still tell you that the CTBTO is going to save humanity through its vital nuclear monitoring work. Error: {str(e)}"
            return {
                "text": error_response,
                "response_id": None,
                "success": False,
                "error": str(e)
            }
    
    def process_query_simple(self, user_message: str) -> str:
        """
        Simple interface that returns just the response text (for backward compatibility).
        
        Args:
            user_message (str): The user's question or message
            
        Returns:
            str: Agent's response about CTBTO
        """
        result = self.process_query(user_message)
        return result["text"]
    
    def is_ctbto_related(self, message: str) -> bool:
        """
        Check if a message is related to CTBTO topics.
        
        Args:
            message (str): The message to check
            
        Returns:
            bool: True if CTBTO-related, False otherwise
        """
        ctbto_keywords = [
            "ctbto", "comprehensive nuclear test ban", "nuclear test", 
            "nuclear monitoring", "test ban treaty", "nuclear verification",
            "nuclear explosion", "seismic monitoring", "radionuclide",
            "infrasound", "hydroacoustic", "ims", "international monitoring system"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in ctbto_keywords)
    
    def find_speakers_by_topic(self, topic: str, language: str = "en") -> Dict[str, Any]:
        """
        Find speakers matching a topic using AI-powered matching.
        
        Args:
            topic (str): Topic to search for
            language (str): Response language (default: "en")
            
        Returns:
            Dict[str, Any]: Structured speaker data for frontend
        """
        try:
            # Use document-based speaker search (Agent SDK inspired)
            matching_speakers = self.speaker_loader.search_speakers_by_topic(topic)
            
            if not matching_speakers:
                return {
                    "success": False,
                    "message": f"No speakers found for topic: {topic}",
                    "speakers": [],
                    "search_topic": topic
                }
            
            # Format speakers for frontend
            formatted_speakers = []
            for speaker in matching_speakers:
                formatted_speakers.append({
                    "id": speaker["id"],
                    "name": speaker["profile"]["name"],
                    "title": speaker["profile"]["title"],
                    "organization": speaker["profile"]["organization"],
                    "photo_url": speaker["profile"]["photo_url"],
                    "session_topic": speaker["session"]["topic"],
                    "session_time": speaker["session"]["time"],
                    "session_room": speaker["session"]["room_name"],
                    "expertise": speaker["ai_metadata"]["expertise"],
                    "bio_summary": speaker["ai_metadata"]["bio_summary"]
                })
            
            return {
                "success": True,
                "message": f"Found {len(matching_speakers)} speaker(s) for topic: {topic}",
                "speakers": formatted_speakers,
                "search_topic": topic,
                "save_humanity_message": "These CTBTO experts are working to save humanity through nuclear test ban verification!"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error searching speakers: {str(e)}",
                "speakers": [],
                "search_topic": topic
            }
    
    def get_speaker_by_id(self, speaker_id: str) -> Dict[str, Any]:
        """
        Get specific speaker details by ID.
        
        Args:
            speaker_id (str): Speaker ID to retrieve
            
        Returns:
            Dict[str, Any]: Complete speaker profile for UI display
        """
        try:
            speaker = self.speaker_loader.get_speaker_by_id(speaker_id)
            
            if not speaker:
                return {
                    "success": False,
                    "message": f"Speaker not found: {speaker_id}",
                    "speaker": None
                }
            
            # Format complete speaker profile
            formatted_speaker = {
                "id": speaker["id"],
                "name": speaker["profile"]["name"],
                "title": speaker["profile"]["title"],
                "organization": speaker["profile"]["organization"],
                "photo_url": speaker["profile"]["photo_url"],
                "session": {
                    "topic": speaker["session"]["topic"],
                    "time": speaker["session"]["time"],
                    "room": speaker["session"]["room_name"],
                    "room_id": speaker["session"]["room_id"]
                },
                "expertise": speaker["ai_metadata"]["expertise"],
                "bio_summary": speaker["ai_metadata"]["bio_summary"],
                "conference_relevance": speaker["ai_metadata"]["conference_relevance"]
            }
            
            return {
                "success": True,
                "message": f"Speaker profile retrieved: {speaker['profile']['name']}",
                "speaker": formatted_speaker,
                "save_humanity_message": f"{speaker['profile']['name']} is helping the CTBTO save humanity!"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving speaker: {str(e)}",
                "speaker": None
            }


def test_agent():
    """Test function to demonstrate the CTBTO agent functionality with Responses API."""
    print("Testing CTBTO Agent (Responses API)...")
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key: export OPENAI_API_KEY='your-api-key-here'")
        return
    
    try:
        agent = CTBTOAgent()
        
        # Test conversation state management
        print("\n=== Testing Conversation State Management ===")
        
        # First question
        question1 = "What is the CTBTO?"
        print(f"\n🤔 Question 1: {question1}")
        result1 = agent.process_query(question1)
        print(f"🤖 Response 1: {result1['text']}")
        print(f"📄 Response ID: {result1['response_id']}")
        
        # Follow-up question using conversation state
        question2 = "Can you tell me more about their monitoring system?"
        print(f"\n🤔 Question 2: {question2}")
        result2 = agent.process_query(question2, previous_response_id=result1['response_id'])
        print(f"🤖 Response 2: {result2['text']}")
        print(f"📄 Response ID: {result2['response_id']}")
        
        print("\n=== Testing Simple Interface (Backward Compatibility) ===")
        
        # Test simple interface
        test_questions = [
            "Tell me about nuclear test ban verification",
            "How does the CTBTO help with global peace?",
            "What is the weather like today?"  # Non-CTBTO question for comparison
        ]
        
        for question in test_questions:
            print(f"\n🤔 Question: {question}")
            print(f"🤖 CTBTO-related: {agent.is_ctbto_related(question)}")
            
            response = agent.process_query_simple(question)
            print(f"💬 Response: {response}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_agent() 