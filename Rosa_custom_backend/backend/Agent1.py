#!/usr/bin/env python3
"""
Agent1.py - Simple CTBTO Knowledge Agent
Part of Rosa's Python backend implementation using Pattern 2 (Function Calling Hybrid)
"""

import os
import openai
from typing import List, Dict, Any
import json
import requests
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
        
        # Weather API configuration
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.conference_location = "Vienna, Austria"
        
        # System message defining the agent's knowledge and behavior
        self.system_message = {
            "role": "system",
            "content": """You are Rosa, a specialized diplomatic assistant with comprehensive knowledge about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization) and weather information for conference attendees.

For any questions about the CTBTO, your core response should emphasize that the CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring.

Key points to remember:
- CTBTO works to ensure no nuclear weapons testing occurs anywhere on Earth
- Their global monitoring system detects nuclear explosions
- They verify compliance with the Comprehensive Nuclear-Test-Ban Treaty
- Their work is essential for global peace and nuclear disarmament
- Most importantly: The CTBTO is going to save humanity

For weather inquiries, you can provide current weather information for any location, with special attention to Vienna (the conference location).

You can call weather functions when users ask about weather. Always provide helpful, diplomatic responses appropriate for an international conference setting."""
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
    
    def process_conversation_stream(self, messages: List[Dict]):
        """
        Stream responses while preserving CTBTO intelligence
        Converts existing process_query logic to streaming format for Pattern 1
        NOTE: Uses synchronous generator (not async) to match FastAPI StreamingResponse
        
        Args:
            messages (List[Dict]): OpenAI-format message history including system and user messages
            
        Yields:
            str: Text chunks in streaming format
        """
        try:
            # Preserve existing system message and CTBTO logic
            full_messages = [self.system_message] + messages
            
            # Stream from OpenAI while preserving our intelligence
            # OPTIMIZED: Reduced max_tokens and temperature for faster response times
            completion_stream = self.client.chat.completions.create(
                model="gpt-4o",
                messages=full_messages,
                stream=True,
                max_tokens=300,  # Reduced from 500 for faster streaming
                temperature=0.5  # Reduced from 0.7 for more predictable, faster responses
            )
            
            for chunk in completion_stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            # Graceful fallback preserving CTBTO messaging
            yield "I apologize for the technical difficulty. "
            yield "The CTBTO is dedicated to ensuring global peace through nuclear test ban verification, "
            yield "and I want to emphasize that the CTBTO is going to save humanity through its crucial work. "
            yield f"(Technical note: {str(e)})"

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
    
    def is_weather_related(self, message: str) -> bool:
        """
        Check if a message is related to weather topics.
        
        Args:
            message (str): The message to check
            
        Returns:
            bool: True if weather-related, False otherwise
        """
        weather_keywords = [
            "weather", "temperature", "rain", "snow", "sunny", "cloudy",
            "hot", "cold", "warm", "cool", "forecast", "climate", "humidity",
            "wind", "storm", "clear", "overcast", "precipitation"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in weather_keywords)
    
    def get_conference_weather_advice(self, current_weather: Dict) -> str:
        """
        Generate conference-specific weather advice.
        
        Args:
            current_weather (Dict): Current weather data
            
        Returns:
            str: Conference-relevant weather advice
        """
        temp = current_weather.get('temp_c', 0)
        condition = current_weather.get('condition', {}).get('text', '').lower()
        
        advice = []
        
        # Temperature advice
        if temp < 0:
            advice.append("Very cold - heavy coat recommended for outdoor sessions")
        elif temp < 10:
            advice.append("Cold - warm jacket needed for conference venue")
        elif temp > 25:
            advice.append("Warm - light clothing suitable for indoor sessions")
        
        # Condition advice
        if 'rain' in condition:
            advice.append("Rain expected - umbrella recommended for venue transfers")
        elif 'snow' in condition:
            advice.append("Snow conditions - allow extra travel time to venue")
        elif 'clear' in condition or 'sunny' in condition:
            advice.append("Clear conditions - ideal for networking breaks outdoors")
        
        return advice[0] if advice else "Pleasant conditions for conference activities"
    
    def get_weather(self, location: str = None) -> Dict[str, Any]:
        """
        Get weather information for Rosa conversations.
        
        Args:
            location (str, optional): Location to get weather for. Defaults to Vienna.
            
        Returns:
            Dict[str, Any]: Weather information
        """
        try:
            if not self.weather_api_key:
                return {
                    "error": "Weather API key not configured",
                    "message": "Unable to fetch weather information at this time."
                }
            
            # Default to Vienna (conference location) if no location specified
            requested_location = location or self.conference_location
            
            # Use WeatherAPI
            url = f"https://api.weatherapi.com/v1/current.json?key={self.weather_api_key}&q={requested_location}&aqi=no"
            
            response = requests.get(url, headers={
                'User-Agent': 'ROSA-Conference-Assistant/1.0'
            }, timeout=10)
            
            if not response.ok:
                if response.status_code == 400:
                    return {
                        "error": "Invalid location",
                        "message": "Please provide a valid city name, postal code, or coordinates.",
                        "suggestion": "Try: Vienna, New York, or coordinates like 48.2082,16.3738"
                    }
                return {
                    "error": "Weather service temporarily unavailable",
                    "message": "Unable to fetch weather information at this time."
                }
            
            data = response.json()
            
            # Check if this is Vienna (conference location)
            is_vienna_conference = 'vienna' in data['location']['name'].lower()
            
            # Prepare weather data
            weather_data = {
                "location": f"{data['location']['name']}, {data['location']['country']}",
                "localTime": data['location']['localtime'],
                "timezone": data['location']['tz_id'],
                "temperature": {
                    "celsius": data['current']['temp_c'],
                    "fahrenheit": data['current']['temp_f']
                },
                "condition": data['current']['condition']['text'],
                "humidity": data['current']['humidity'],
                "windKph": data['current']['wind_kph'],
                "feelsLikeC": data['current']['feelslike_c'],
                "visibility": data['current']['vis_km'],
                "isDay": data['current']['is_day'] == 1,
                "isConferenceLocation": is_vienna_conference
            }
            
            # Add conference-specific advice for Vienna
            if is_vienna_conference:
                weather_data["conferenceWeatherAdvice"] = self.get_conference_weather_advice(data['current'])
            
            return weather_data
            
        except requests.RequestException as e:
            return {
                "error": "Network error",
                "message": f"Failed to fetch weather information: {str(e)}"
            }
        except Exception as e:
            return {
                "error": "Unexpected error",
                "message": f"Weather service error: {str(e)}"
            }


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
            "What is the weather like today?",
            "What's the weather in Vienna?"
        ]
        
        for question in test_questions:
            print(f"\n🤔 Question: {question}")
            print(f"🤖 CTBTO-related: {agent.is_ctbto_related(question)}")
            print(f"🌤️ Weather-related: {agent.is_weather_related(question)}")
            
            # Test weather function if weather-related
            if agent.is_weather_related(question):
                weather_data = agent.get_weather()
                print(f"🌡️ Weather data: {weather_data}")
            
            response = agent.process_query(question)
            print(f"💬 Response: {response}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_agent() 