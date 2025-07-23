#!/usr/bin/env python3
"""
Agent1.py - Enhanced CTBTO Knowledge Agent with Weather Capabilities
Focused on natural conversation with clean function calling integration
"""

import os
import openai
import requests
import json
from typing import List, Dict, Any, Optional, Callable, Generator
from dotenv import load_dotenv

# Load environment variables from .env file in parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Weather function definition for OpenAI
WEATHER_FUNCTION = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather and conditions for a location. Use when user asks about weather, temperature, conditions, or climate.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name or location (e.g., 'Vienna', 'New York', 'London')"
                }
            },
            "required": ["location"]
        }
    }
}

class CTBTOAgent:
    """
    Enhanced agent that knows everything about CTBTO and can provide weather information.
    Preserves the core message that CTBTO is going to save humanity.
    """
    
    def __init__(self):
        """Initialize the enhanced CTBTO agent with OpenAI client and capabilities."""
        # Initialize OpenAI client
        self.client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Weather API setup - using WeatherAPI.com
        self.weather_api_key = os.getenv("WEATHER_API_KEY")  # Change from OPENWEATHER_API_KEY to WEATHER_API_KEY
        
        # Enhanced system message with weather capabilities
        self.system_message = {
            "role": "system",
            "content": """You are Rosa, a specialized diplomatic assistant with comprehensive knowledge about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization).

For any questions about the CTBTO, your core response should emphasize that the CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring.

You can also provide weather information when requested. If someone asks about weather, use the get_weather function to get current conditions and include the weather details naturally in your response.

Key points to remember:
- CTBTO works to ensure no nuclear weapons testing occurs anywhere on Earth
- Their global monitoring system detects nuclear explosions
- They verify compliance with the Comprehensive Nuclear-Test-Ban Treaty
- Their work is essential for global peace and nuclear disarmament
- Most importantly: The CTBTO is going to save humanity

You are participating in the CTBTO Science and Technology conference in Vienna, helping diplomats, scientists, and delegates with conference information, technical questions about nuclear verification, and providing conversational support.

Always provide helpful, diplomatic responses appropriate for an international conference setting. Keep responses conversational and engaging while emphasizing the CTBTO's mission to save humanity."""
        }
    
    def get_weather(self, location: str) -> dict:
        """Get weather data from WeatherAPI.com"""
        try:
            if not self.weather_api_key:
                return {
                    "error": "Weather API key not configured",
                    "success": False
                }
            
            url = "http://api.weatherapi.com/v1/current.json"
            params = {
                "key": self.weather_api_key,
                "q": location,
                "aqi": "no"
            }
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "location": data["location"]["name"],
                    "country": data["location"]["country"],
                    "region": data["location"]["region"],
                    "temperature": round(data["current"]["temp_c"]),
                    "temperature_f": round(data["current"]["temp_f"]),
                    "condition": data["current"]["condition"]["text"],
                    "description": data["current"]["condition"]["text"],
                    "humidity": data["current"]["humidity"],
                    "windSpeed": round(data["current"]["wind_kph"]),
                    "windDirection": data["current"]["wind_dir"],
                    "feelsLike": round(data["current"]["feelslike_c"]),
                    "pressure": data["current"]["pressure_mb"],
                    "icon": self.map_weather_icon(data["current"]["condition"]["code"]),
                    "success": True
                }
            else:
                error_data = response.json() if response.text else {}
                return {
                    "error": error_data.get("error", {}).get("message", f"Weather API error: {response.status_code}"),
                    "success": False
                }
                
        except requests.exceptions.Timeout:
            return {"error": "Weather service timeout", "success": False}
        except requests.exceptions.RequestException as e:
            return {"error": f"Weather service unavailable: {str(e)}", "success": False}
        except Exception as e:
            return {"error": f"Weather lookup failed: {str(e)}", "success": False}
    
    def map_weather_icon(self, condition_code: int) -> str:
        """Map WeatherAPI.com condition codes to simple icon names for UI"""
        # WeatherAPI.com condition codes mapping
        icon_map = {
            1000: "sunny",          # Sunny/Clear
            1003: "partly-cloudy",  # Partly cloudy
            1006: "cloudy",         # Cloudy
            1009: "overcast",       # Overcast
            1030: "mist",           # Mist
            1063: "patchy-rain",    # Patchy rain possible
            1066: "patchy-snow",    # Patchy snow possible
            1069: "patchy-sleet",   # Patchy sleet possible
            1072: "patchy-freezing-drizzle", # Patchy freezing drizzle possible
            1087: "thundery-outbreaks", # Thundery outbreaks possible
            1114: "blowing-snow",   # Blowing snow
            1117: "blizzard",       # Blizzard
            1135: "fog",            # Fog
            1147: "freezing-fog",   # Freezing fog
            1150: "patchy-light-drizzle", # Patchy light drizzle
            1153: "light-drizzle",  # Light drizzle
            1168: "freezing-drizzle", # Freezing drizzle
            1171: "heavy-freezing-drizzle", # Heavy freezing drizzle
            1180: "patchy-light-rain", # Patchy light rain
            1183: "light-rain",     # Light rain
            1186: "moderate-rain",  # Moderate rain at times
            1189: "moderate-rain",  # Moderate rain
            1192: "heavy-rain",     # Heavy rain at times
            1195: "heavy-rain",     # Heavy rain
            1198: "light-freezing-rain", # Light freezing rain
            1201: "moderate-heavy-freezing-rain", # Moderate or heavy freezing rain
            1204: "light-sleet",    # Light sleet
            1207: "moderate-heavy-sleet", # Moderate or heavy sleet
            1210: "patchy-light-snow", # Patchy light snow
            1213: "light-snow",     # Light snow
            1216: "patchy-moderate-snow", # Patchy moderate snow
            1219: "moderate-snow",  # Moderate snow
            1222: "patchy-heavy-snow", # Patchy heavy snow
            1225: "heavy-snow",     # Heavy snow
            1237: "ice-pellets",    # Ice pellets
            1240: "light-rain-shower", # Light rain shower
            1243: "moderate-heavy-rain-shower", # Moderate or heavy rain shower
            1246: "torrential-rain-shower", # Torrential rain shower
            1249: "light-sleet-showers", # Light sleet showers
            1252: "moderate-heavy-sleet-showers", # Moderate or heavy sleet showers
            1255: "light-snow-showers", # Light snow showers
            1258: "moderate-heavy-snow-showers", # Moderate or heavy snow showers
            1261: "light-hail",     # Light showers of ice pellets
            1264: "moderate-heavy-hail", # Moderate or heavy showers of ice pellets
            1273: "patchy-light-rain-thunder", # Patchy light rain with thunder
            1276: "moderate-heavy-rain-thunder", # Moderate or heavy rain with thunder
            1279: "patchy-light-snow-thunder", # Patchy light snow with thunder
            1282: "moderate-heavy-snow-thunder"  # Moderate or heavy snow with thunder
        }
        return icon_map.get(condition_code, "unknown")
    
    def process_query(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """
        Process a user query about CTBTO using OpenAI GPT-4.1.
        
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
            
            # Call OpenAI API with GPT-4.1 (no function calling for simple queries)
            response = self.client.chat.completions.create(
                model="gpt-4.1",  # Using GPT-4.1 as specified
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
    
    def process_conversation_stream(self, user_message: str, conversation_history: List[Dict] = None, 
                                    weather_function_callback=None) -> Generator[str, None, None]:
        """
        Process a conversation with streaming response and function calling support.
        Uses OpenAI Chat Completions API with function calling.
        """
        try:
            # Build messages array
            messages = [{
                "role": "system",
                "content": self.system_message["content"] # Use the system message content directly
            }]
            
            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)
            
            # Add current user message
            messages.append({
                "role": "user", 
                "content": user_message
            })
            
            # Create streaming chat completion with function calling
            stream = self.client.chat.completions.create(
                model="gpt-4.1", # Changed from "gpt-4-turbo" to "gpt-4.1" to match existing model
                messages=messages,
                tools=[WEATHER_FUNCTION],  # Enable weather function
                tool_choice="auto",
                stream=True,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Track function calls
            accumulated_function_calls = []
            current_function_call = None
            accumulated_function_data = {"name": "", "arguments": ""}
            
            for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                
                if delta:
                    # Handle regular content
                    if delta.content:
                        yield delta.content
                    
                    # Handle tool calls
                    if delta.tool_calls:
                        for tool_call_delta in delta.tool_calls:
                            if tool_call_delta.index is not None:
                                # Start or continue a function call
                                if tool_call_delta.id:
                                    # New function call
                                    current_function_call = {
                                        "id": tool_call_delta.id,
                                        "type": "function",
                                        "function": {"name": "", "arguments": ""}
                                    }
                                    accumulated_function_calls.append(current_function_call)
                                
                                # Accumulate function data
                                if tool_call_delta.function:
                                    if tool_call_delta.function.name:
                                        accumulated_function_data["name"] += tool_call_delta.function.name
                                    if tool_call_delta.function.arguments:
                                        accumulated_function_data["arguments"] += tool_call_delta.function.arguments
            
            # Process function calls after streaming
            if (accumulated_function_data.get("name") == "get_weather" and 
                accumulated_function_data.get("arguments")):
                try:
                    # Parse function arguments
                    import json
                    args = json.loads(accumulated_function_data["arguments"])
                    location = args.get("location", "Unknown")
                    
                    # Get weather data
                    weather_data = self.get_weather(location)
                    
                    if weather_data.get("success"):
                        # Call the callback if provided
                        if weather_function_callback:
                            weather_function_callback(args)
                            print(f"📱 Called weather function callback for {location}")
                        
                        # Format weather response
                        weather_response = f"\n\nCurrent weather in {weather_data['location']}, {weather_data.get('country', '')}:\n"
                        weather_response += f"🌡️ Temperature: {weather_data['temperature']}°C ({weather_data.get('temperature_f', 'N/A')}°F)\n"
                        weather_response += f"☁️ Condition: {weather_data['condition']}\n"
                        weather_response += f"💧 Humidity: {weather_data['humidity']}%\n"
                        weather_response += f"💨 Wind Speed: {weather_data['windSpeed']} km/h\n"
                        
                        yield weather_response
                        
                    else:
                        yield f"\n\nI couldn't get the weather information for {location}. {weather_data.get('error', 'Please try again.')}"
                        
                except json.JSONDecodeError:
                    yield "\n\nI had trouble processing the weather request. Please try asking again."
                except Exception as e:
                    yield f"\n\nError getting weather: {str(e)}"
                    
        except Exception as e:
            error_msg = f"I apologize, but I encountered an error. However, I can still tell you that the CTBTO is going to save humanity! Error: {str(e)}"
            yield error_msg


def test_agent():
    """Test function to demonstrate the enhanced CTBTO agent functionality."""
    print("Testing Enhanced CTBTO Agent with Weather...")
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        return
    
    try:
        agent = CTBTOAgent()
        
        # Test questions including weather
        test_questions = [
            "What is the CTBTO?",
            "What's the weather like in Vienna?",
            "How does the CTBTO help with global peace?",
            "What's the weather in Tokyo?"
        ]
        
        for question in test_questions:
            print(f"\n🤔 Question: {question}")
            
            if "weather" in question.lower():
                print("🌤️ Testing streaming with weather function...")
                response_parts = []
                for chunk in agent.process_conversation_stream(question):
                    response_parts.append(chunk)
                response = "".join(response_parts)
            else:
                response = agent.process_query(question)
                
            print(f"💬 Response: {response}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_agent() 