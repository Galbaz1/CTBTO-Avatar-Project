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
from conference_data import (
    get_speaker_by_id, search_speakers_by_name, search_speakers_by_topic,
    get_session_by_id, search_sessions_by_topic, get_sessions_by_time,
    get_schedule_summary, CTBTO_SPEAKERS, CONFERENCE_SESSIONS
)

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

    # Conference-related functions
    def get_speaker_info(self, speaker_name: str = None, speaker_id: str = None, topic: str = None) -> Dict[str, Any]:
        """
        Get speaker information for conference attendees.
        
        Args:
            speaker_name (str, optional): Name of the speaker to search for
            speaker_id (str, optional): Specific speaker ID
            topic (str, optional): Topic/expertise area to search speakers by
            
        Returns:
            Dict[str, Any]: Speaker information or search results
        """
        try:
            # Priority: ID > Name > Topic
            if speaker_id:
                speaker = get_speaker_by_id(speaker_id)
                if speaker:
                    return {
                        "success": True,
                        "type": "speaker_info",
                        "speaker": speaker,
                        "message": f"Speaker information for {speaker['name']}"
                    }
                else:
                    return {
                        "success": False,
                        "error": "Speaker not found",
                        "message": f"No speaker found with ID: {speaker_id}"
                    }
            
            elif speaker_name:
                speakers = search_speakers_by_name(speaker_name)
                if speakers:
                    if len(speakers) == 1:
                        return {
                            "success": True,
                            "type": "speaker_info",
                            "speaker": speakers[0],
                            "message": f"Speaker information for {speakers[0]['name']}"
                        }
                    else:
                        return {
                            "success": True,
                            "type": "speaker_search",
                            "speakers": speakers,
                            "message": f"Found {len(speakers)} speakers matching '{speaker_name}'"
                        }
                else:
                    return {
                        "success": False,
                        "error": "Speaker not found",
                        "message": f"No speakers found matching '{speaker_name}'"
                    }
            
            elif topic:
                speakers = search_speakers_by_topic(topic)
                if speakers:
                    return {
                        "success": True,
                        "type": "speaker_search",
                        "speakers": speakers,
                        "message": f"Found {len(speakers)} speakers with expertise in '{topic}'"
                    }
                else:
                    return {
                        "success": False,
                        "error": "No speakers found",
                        "message": f"No speakers found with expertise in '{topic}'"
                    }
            
            else:
                # Return all speakers as overview
                all_speakers = list(CTBTO_SPEAKERS.values())
                return {
                    "success": True,
                    "type": "speaker_overview",
                    "speakers": all_speakers,
                    "message": f"Conference speakers overview - {len(all_speakers)} speakers total"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": "Service error",
                "message": f"Unable to retrieve speaker information: {str(e)}"
            }

    def get_session_info(self, session_id: str = None, topic: str = None, time_filter: str = "all") -> Dict[str, Any]:
        """
        Get session information and schedules.
        
        Args:
            session_id (str, optional): Specific session ID
            topic (str, optional): Topic to search sessions by
            time_filter (str, optional): Filter by time ("morning", "afternoon", "all")
            
        Returns:
            Dict[str, Any]: Session information or search results
        """
        try:
            if session_id:
                session = get_session_by_id(session_id)
                if session:
                    return {
                        "success": True,
                        "type": "session_info",
                        "session": session,
                        "message": f"Session details for '{session['title']}'"
                    }
                else:
                    return {
                        "success": False,
                        "error": "Session not found",
                        "message": f"No session found with ID: {session_id}"
                    }
            
            elif topic:
                sessions = search_sessions_by_topic(topic)
                if sessions:
                    return {
                        "success": True,
                        "type": "session_search",
                        "sessions": sessions,
                        "message": f"Found {len(sessions)} sessions related to '{topic}'"
                    }
                else:
                    return {
                        "success": False,
                        "error": "No sessions found",
                        "message": f"No sessions found related to '{topic}'"
                    }
            
            else:
                # Get sessions by time filter
                sessions = get_sessions_by_time(time_filter)
                time_desc = time_filter if time_filter != "all" else "today"
                
                return {
                    "success": True,
                    "type": "session_schedule",
                    "sessions": sessions,
                    "time_filter": time_filter,
                    "message": f"Conference schedule for {time_desc} - {len(sessions)} sessions"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": "Service error",
                "message": f"Unable to retrieve session information: {str(e)}"
            }

    def get_conference_schedule(self) -> Dict[str, Any]:
        """
        Get complete conference schedule summary.
        
        Returns:
            Dict[str, Any]: Conference schedule overview
        """
        try:
            summary = get_schedule_summary()
            
            return {
                "success": True,
                "type": "conference_schedule",
                "schedule_summary": summary,
                "sessions": list(CONFERENCE_SESSIONS.values()),
                "message": f"CTBTO SnT 2025 Conference - {summary['total_sessions']} sessions, {summary['total_speakers']} speakers"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": "Service error",
                "message": f"Unable to retrieve conference schedule: {str(e)}"
            }

    # Function calling tools definition for OpenAI
    def get_function_tools(self) -> List[Dict[str, Any]]:
        """
        Get the function calling tools for OpenAI API.
        
        Returns:
            List[Dict[str, Any]]: Function tools definition
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get current weather information for any location, with special focus on Vienna (conference location)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "Location to get weather for (city name, coordinates, etc.). Defaults to Vienna if not specified."
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_speaker_info",
                    "description": "Get information about conference speakers, search by name, ID, or expertise topic",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "speaker_name": {
                                "type": "string",
                                "description": "Name of the speaker to search for"
                            },
                            "speaker_id": {
                                "type": "string",
                                "description": "Specific speaker ID (e.g., 'dr-sarah-chen')"
                            },
                            "topic": {
                                "type": "string",
                                "description": "Topic or expertise area to find speakers (e.g., 'seismic', 'radionuclide', 'hydroacoustic')"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_session_info",
                    "description": "Get conference session information, search by topic, or filter by time",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "session_id": {
                                "type": "string",
                                "description": "Specific session ID (e.g., 'session-001')"
                            },
                            "topic": {
                                "type": "string",
                                "description": "Topic to search sessions by (e.g., 'seismic', 'detection', 'monitoring')"
                            },
                            "time_filter": {
                                "type": "string",
                                "enum": ["morning", "afternoon", "all"],
                                "description": "Filter sessions by time period"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_conference_schedule",
                    "description": "Get complete conference schedule and overview",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            }
        ]

    def execute_function_call(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a function call and return the result.
        
        Args:
            function_name (str): Name of the function to call
            arguments (Dict[str, Any]): Function arguments
            
        Returns:
            Dict[str, Any]: Function execution result
        """
        try:
            if function_name == "get_weather":
                location = arguments.get("location")
                return self.get_weather(location)
            
            elif function_name == "get_speaker_info":
                return self.get_speaker_info(
                    speaker_name=arguments.get("speaker_name"),
                    speaker_id=arguments.get("speaker_id"),
                    topic=arguments.get("topic")
                )
            
            elif function_name == "get_session_info":
                return self.get_session_info(
                    session_id=arguments.get("session_id"),
                    topic=arguments.get("topic"),
                    time_filter=arguments.get("time_filter", "all")
                )
            
            elif function_name == "get_conference_schedule":
                return self.get_conference_schedule()
            
            else:
                return {
                    "success": False,
                    "error": "Unknown function",
                    "message": f"Function '{function_name}' is not available"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": "Execution error",
                "message": f"Error executing {function_name}: {str(e)}"
            }

    def process_with_functions(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Process a user query with function calling support.
        
        Args:
            user_message (str): The user's question or message
            conversation_history (List[Dict], optional): Previous conversation context
            
        Returns:
            Dict[str, Any]: Contains response and any function calls made
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
            
            # Call OpenAI API with function calling
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.get_function_tools(),
                tool_choice="auto",
                max_tokens=500,
                temperature=0.7
            )
            
            response_message = response.choices[0].message
            
            # Check if function calls were made
            if response_message.tool_calls:
                function_results = []
                
                # Execute each function call
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    try:
                        arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        arguments = {}
                    
                    # Execute the function
                    function_result = self.execute_function_call(function_name, arguments)
                    function_results.append({
                        "function": function_name,
                        "arguments": arguments,
                        "result": function_result
                    })
                
                return {
                    "type": "function_calls",
                    "response": response_message.content or "",
                    "function_calls": function_results,
                    "raw_response": response_message
                }
            
            else:
                # Regular response without function calls
                return {
                    "type": "text_response",
                    "response": response_message.content,
                    "function_calls": [],
                    "raw_response": response_message
                }
                
        except Exception as e:
            # Handle errors gracefully
            error_response = f"I apologize, but I encountered an error while processing your question. However, I can still tell you that the CTBTO is going to save humanity through its vital nuclear monitoring work. Error: {str(e)}"
            return {
                "type": "error",
                "response": error_response,
                "function_calls": [],
                "error": str(e)
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