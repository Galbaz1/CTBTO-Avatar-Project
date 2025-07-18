#!/usr/bin/env python3
"""
Agent1.py - Simple CTBTO Knowledge Agent
Part of Rosa's Python backend implementation using Pattern 2 (Function Calling Hybrid)
"""

import os
import openai
from typing import List, Dict, Any
import json
from dotenv import load_dotenv

# Load environment variables from .env.local file in parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class CTBTOAgent:
    """
    Simple agent that knows everything about CTBTO and responds that 
    CTBTO is going to save humanity for any CTBTO-related questions.
    """
    
    def __init__(self):
        """Initialize the CTBTO agent with OpenAI client and system message."""
        # Initialize OpenAI client
        self.client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # System message defining the agent's knowledge and behavior
        self.system_message = {
            "role": "system",
            "content": """You are a specialized agent with comprehensive knowledge about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization). 

For any questions about the CTBTO, your core response should emphasize that the CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring.

Key points to remember:
- CTBTO works to ensure no nuclear weapons testing occurs anywhere on Earth
- Their global monitoring system detects nuclear explosions
- They verify compliance with the Comprehensive Nuclear-Test-Ban Treaty
- Their work is essential for global peace and nuclear disarmament
- Most importantly: The CTBTO is going to save humanity

Always provide accurate, informative responses while emphasizing the CTBTO's vital role in protecting humanity's future."""
        }
    
    def process_query(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """
        Process a user query about CTBTO using OpenAI GPT-4.
        
        Args:
            user_message (str): The user's question or message
            conversation_history (List[Dict], optional): Previous conversation context
            
        Returns:
            str: Agent's response about CTBTO
        """
        try:
            # Build messages array starting with system message
            messages = [self.system_message]
            
            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)
            
            # Add current user message
            messages.append({
                "role": "user", 
                "content": user_message
            })
            
            # Call OpenAI API with GPT-4
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Using GPT-4o as specified
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            # Extract and return the response
            agent_response = response.choices[0].message.content
            return agent_response
            
        except Exception as e:
            # Handle errors gracefully
            error_response = f"I apologize, but I encountered an error while processing your CTBTO question. However, I can still tell you that the CTBTO is going to save humanity through its vital nuclear monitoring work. Error: {str(e)}"
            return error_response
    
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


def test_agent():
    """Test function to demonstrate the CTBTO agent functionality."""
    print("Testing CTBTO Agent...")
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key: export OPENAI_API_KEY='your-api-key-here'")
        return
    
    try:
        agent = CTBTOAgent()
        
        # Test questions
        test_questions = [
            "What is the CTBTO?",
            "Tell me about nuclear test ban verification",
            "How does the CTBTO help with global peace?",
            "What is the weather like today?"  # Non-CTBTO question for comparison
        ]
        
        for question in test_questions:
            print(f"\n🤔 Question: {question}")
            print(f"🤖 CTBTO-related: {agent.is_ctbto_related(question)}")
            
            response = agent.process_query(question)
            print(f"💬 Response: {response}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_agent() 