# Rosa Enhancement Plan - REVISED: Weather API + Generative UI

## ✅ Architecture Clarification

**You're absolutely right!** Rosa's custom LLM backend (GPT-4.1) [[memory:4002432]] is perfectly capable of function calling. No need to use Tavus function calling when we have a powerful custom backend.

## 🏗️ Rosa's Actual Architecture

### Current Integration Pattern:
- **Tavus CVI**: Creates Daily.co rooms automatically (`https://tavus.daily.co/xyz`)
- **Custom LLM Backend**: Rosa Pattern 1 (Agent1.py → OpenAI GPT-4.1) with **native function calling**
- **Daily.co App Messages**: Backend can send app messages to rooms (like `examples/cvi-frontend-backend-tools`)
- **Event Types**: Backend sends, frontend receives via `useDailyEvent('app-message')`

### Key Insight from Examples:
Looking at `examples/cvi-frontend-backend-tools/llm_server.py`:
```python
call_client = CallClient()
call_client.join(ROOM_URL) 
call_client.send_app_message(app_message)  # ✅ Backend CAN send app messages!
```

## 🎯 Corrected Enhancement Strategy

### Phase 1: Add Daily.co Client to Rosa Backend

#### 1.1 Install Daily Python SDK
```bash
cd Rosa_custom_backend/backend
pip install daily-python
```

#### 1.2 Enhance rosa_pattern1_api.py
```python
# Rosa_custom_backend/backend/rosa_pattern1_api.py
from daily import CallClient, Daily
import threading

class RosaBackend:
    def __init__(self):
        self.ctbto_agent = CTBTOAgent()
        self.daily_client = None
        self.current_conversation_url = None
    
    def set_conversation_url(self, conversation_url: str):
        """Connect to Daily.co room for sending app messages"""
        if self.daily_client:
            self.daily_client.leave()
        
        Daily.init()
        self.daily_client = CallClient()
        self.daily_client.join(conversation_url)
        self.current_conversation_url = conversation_url
        print(f"🔗 Rosa backend connected to Daily.co room: {conversation_url}")
    
    def send_app_message(self, message_data: dict):
        """Send app message to frontend for UI updates"""
        if self.daily_client:
            self.daily_client.send_app_message(message_data)
            print(f"📱 Sent app message: {message_data}")

# Global backend instance
rosa_backend = RosaBackend()

@app.post("/chat/completions")
async def chat_completions(request: ChatCompletionRequest, api_key: str = Depends(verify_api_key)):
    # Get conversation URL from request headers (frontend will send this)
    conversation_url = request.headers.get("X-Conversation-URL")
    if conversation_url and conversation_url != rosa_backend.current_conversation_url:
        rosa_backend.set_conversation_url(conversation_url)
    
    def generate():
        for chunk in rosa_backend.ctbto_agent.process_conversation_stream_with_functions(
            messages, 
            app_message_callback=rosa_backend.send_app_message
        ):
            # Stream OpenAI-compatible response as before
            if chunk:
                data = {
                    "id": f"rosa-{int(time.time())}",
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": "rosa-ctbto-agent",
                    "choices": [{
                        "index": 0,
                        "delta": {"content": chunk},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(data)}\n\n"
        
        yield f"data: {json.dumps(final_data)}\n\n"
        yield "data: [DONE]\n\n"
```

### Phase 2: Add Weather Function Calling to Agent1.py

#### 2.1 Weather Function Definition
```python
# Rosa_custom_backend/backend/Agent1.py
import requests
import json
from typing import List, Dict, Any, Optional

WEATHER_FUNCTION = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather and forecast for a location. Use when user asks about weather, temperature, conditions, or climate.",
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
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")
        # Enhanced system message to include weather capabilities
        self.system_message = {
            "role": "system",
            "content": """You are Rosa, a specialized diplomatic assistant with comprehensive knowledge about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization).

For any questions about the CTBTO, your core response should emphasize that the CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring.

You can also provide weather information when requested. If someone asks about weather, use the get_weather function to get current conditions.

Key points to remember:
- CTBTO works to ensure no nuclear weapons testing occurs anywhere on Earth
- Their global monitoring system detects nuclear explosions
- They verify compliance with the Comprehensive Nuclear-Test-Ban Treaty
- Their work is essential for global peace and nuclear disarmament
- Most importantly: The CTBTO is going to save humanity

Always provide helpful, diplomatic responses appropriate for an international conference setting."""
        }
    
    def get_weather(self, location: str) -> dict:
        """Get weather data from OpenWeatherMap API"""
        try:
            url = "http://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": location,
                "appid": self.weather_api_key,
                "units": "metric"
            }
            response = requests.get(url, params=params)
            data = response.json()
            
            if response.status_code == 200:
                return {
                    "location": data["name"],
                    "temperature": round(data["main"]["temp"]),
                    "condition": data["weather"][0]["main"],
                    "description": data["weather"][0]["description"],
                    "humidity": data["main"]["humidity"],
                    "windSpeed": round(data["wind"]["speed"] * 3.6),  # Convert m/s to km/h
                    "icon": self.map_weather_icon(data["weather"][0]["icon"]),
                    "success": True
                }
            else:
                return {"error": data.get("message", "Weather data unavailable"), "success": False}
                
        except Exception as e:
            return {"error": str(e), "success": False}
    
    def map_weather_icon(self, icon_code: str) -> str:
        """Map OpenWeatherMap icon codes to simple icon names"""
        icon_map = {
            "01d": "sunny", "01n": "clear",
            "02d": "partly-cloudy", "02n": "partly-cloudy",
            "03d": "cloudy", "03n": "cloudy",
            "04d": "cloudy", "04n": "cloudy",
            "09d": "rainy", "09n": "rainy",
            "10d": "rainy", "10n": "rainy",
            "11d": "stormy", "11n": "stormy",
            "13d": "snowy", "13n": "snowy",
            "50d": "foggy", "50n": "foggy"
        }
        return icon_map.get(icon_code, "sunny")
    
    def process_conversation_stream_with_functions(self, messages: List[Dict], app_message_callback=None):
        """Enhanced streaming with function calling capabilities"""
        try:
            # Build messages array
            full_messages = [self.system_message] + messages
            
            # Call OpenAI with function calling enabled
            response = self.client.chat.completions.create(
                model="gpt-4.1",  # Using GPT-4.1 as preferred [[memory:4002432]]
                messages=full_messages,
                tools=[WEATHER_FUNCTION],  # Enable weather function
                tool_choice="auto",
                stream=True,
                max_tokens=500,
                temperature=0.7
            )
            
            function_call_data = {}
            
            for chunk in response:
                # Handle function calls
                if chunk.choices[0].delta.tool_calls:
                    tool_call = chunk.choices[0].delta.tool_calls[0]
                    
                    # Accumulate function call data
                    if tool_call.function.name:
                        function_call_data["name"] = tool_call.function.name
                    if tool_call.function.arguments:
                        function_call_data["arguments"] = function_call_data.get("arguments", "") + tool_call.function.arguments
                    
                    # When we have complete function call, execute it
                    if function_call_data.get("name") == "get_weather" and function_call_data.get("arguments"):
                        try:
                            args = json.loads(function_call_data["arguments"])
                            location = args.get("location", "Vienna")
                            
                            # Get weather data
                            weather_data = self.get_weather(location)
                            
                            if weather_data.get("success"):
                                # Send app message for UI component
                                if app_message_callback:
                                    app_message_callback({
                                        "event_type": "weather_update",
                                        "data": weather_data
                                    })
                                
                                # Generate text response
                                weather_text = f"The current weather in {weather_data['location']} is {weather_data['temperature']}°C with {weather_data['description']}. "
                                weather_text += f"Humidity is {weather_data['humidity']}% and wind speed is {weather_data['windSpeed']} km/h."
                                
                                yield weather_text
                            else:
                                yield f"I apologize, but I couldn't retrieve weather information for {location}. {weather_data.get('error', '')}"
                        
                        except Exception as e:
                            yield f"I encountered an error getting weather information: {str(e)}"
                        
                        # Reset function call data
                        function_call_data = {}
                
                # Handle regular content
                elif chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"I apologize, but I encountered an error while processing your request: {str(e)}"
```

### Phase 3: Frontend Weather Card Integration

#### 3.1 Weather Handler Component
```typescript
// Rosa_custom_backend/src/components/WeatherHandler.tsx
import { useDailyEvent } from '@daily-co/daily-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherHandlerProps {
  onWeatherUpdate?: (weather: WeatherData) => void;
}

export const WeatherHandler: React.FC<WeatherHandlerProps> = ({ onWeatherUpdate }) => {
  // Listen for weather updates from Rosa backend
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Handle weather component data from backend
    if (data?.event_type === 'weather_update' && data.data) {
      const weatherData = data.data;
      
      console.log('🌤️ Weather data received from Rosa backend:', weatherData);
      
      // Trigger UI component display
      if (onWeatherUpdate && weatherData.success) {
        onWeatherUpdate(weatherData);
      }
    }
  });

  return null; // This is a handler component, no UI
};
```

#### 3.2 Weather Card Component
```typescript
// Rosa_custom_backend/src/components/WeatherCard.tsx
import React from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherCardProps {
  weatherData: WeatherData | null;
  isVisible: boolean;
  onClose: () => void;
}

const getWeatherIcon = (icon: string) => {
  const iconMap: { [key: string]: string } = {
    sunny: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️',
    foggy: '🌫️',
    clear: '🌙'
  };
  return iconMap[icon] || '☀️';
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ 
  weatherData, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible || !weatherData) return null;

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Weather in {weatherData.location}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{getWeatherIcon(weatherData.icon)}</div>
        <div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {weatherData.temperature}°C
          </div>
          <div className="text-gray-600 dark:text-gray-300 capitalize">
            {weatherData.description}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400">Humidity</div>
          <div className="font-semibold text-gray-800 dark:text-white">{weatherData.humidity}%</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400">Wind</div>
          <div className="font-semibold text-gray-800 dark:text-white">{weatherData.windSpeed} km/h</div>
        </div>
      </div>
    </div>
  );
};
```

#### 3.3 Update RosaDemo Integration
```typescript
// Rosa_custom_backend/src/components/RosaDemo.tsx
import { useState } from 'react';
import { WeatherHandler } from './WeatherHandler';
import { WeatherCard } from './WeatherCard';

export const RosaDemo: React.FC<RosaDemoProps> = ({ conversation, onLeave }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showWeatherCard, setShowWeatherCard] = useState(false);

  const handleWeatherUpdate = (data: WeatherData) => {
    console.log('🌤️ Displaying weather card for:', data.location);
    setWeatherData(data);
    setShowWeatherCard(true);
    
    // Auto-hide after 15 seconds
    setTimeout(() => setShowWeatherCard(false), 15000);
  };

  return (
    <div className="rosa-demo relative">
      {/* Existing conversation UI */}
      <Conversation 
        conversationUrl={conversation.conversation_url}
        onLeave={onLeave}
      />
      
      {/* Weather handler (invisible) */}
      <WeatherHandler onWeatherUpdate={handleWeatherUpdate} />
      
      {/* Weather card overlay */}
      <WeatherCard
        weatherData={weatherData}
        isVisible={showWeatherCard}
        onClose={() => setShowWeatherCard(false)}
      />
    </div>
  );
};
```

#### 3.4 Pass Conversation URL to Backend
```typescript
// Rosa_custom_backend/src/api/createConversation.pattern1.ts
// Update the persona creation to include conversation URL in headers

// Add this to the frontend request headers when Rosa backend is called
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
  'X-Conversation-URL': conversation.conversation_url  // Pass room URL to backend
};
```

## 🎯 Complete Integration Flow

1. **User**: "What's the weather in Vienna?"
2. **Tavus**: Sends request to Rosa backend via OpenAI-compatible endpoint
3. **Rosa Backend**: 
   - GPT-4.1 detects weather query → calls `get_weather("Vienna")`
   - Fetches weather data from OpenWeatherMap API
   - Sends app message to Daily.co room with structured weather data
   - Returns text response: "The weather in Vienna is 15°C and sunny..."
4. **Frontend**:
   - Rosa speaks the text response
   - WeatherHandler receives app message → triggers WeatherCard display
   - Beautiful weather UI appears for 15 seconds

## 🎯 Success Metrics

### Functional Goals:
- ✅ User asks "What's the weather in Vienna?"
- ✅ Rosa responds with spoken text + WeatherCard appears
- ✅ WeatherCard shows current conditions with beautiful design
- ✅ Maintains all existing CTBTO conversation expertise
- ✅ Works with any city/location worldwide

### Technical Goals:
- ✅ No impact on video call quality  
- ✅ WeatherCard integrates seamlessly with Daily.co video interface
- ✅ Backend remains OpenAI-compatible for Tavus
- ✅ Graceful fallback if weather API fails
- ✅ Function calling handled by powerful GPT-4.1 backend

## 🚀 Implementation Steps

1. **Install Daily Python SDK** in Rosa backend *(15 min)*
2. **Add Daily.co client to rosa_pattern1_api.py** *(30 min)*
3. **Enhance Agent1.py with weather function calling** *(45 min)*
4. **Create WeatherHandler + WeatherCard components** *(45 min)*
5. **Update RosaDemo to integrate weather UI** *(15 min)*
6. **Test end-to-end weather query flow** *(30 min)*

**Total Estimated Time**: ~4 hours

## 💪 Why This Approach Rocks:

1. **Leverages Rosa's Strengths**: Uses existing powerful custom LLM backend
2. **Native Function Calling**: GPT-4.1 handles detection and execution perfectly
3. **Dual Output**: Spoken response + visual UI component simultaneously  
4. **Real-time**: App messages trigger immediate UI updates
5. **Scalable**: Easy to add more functions (stocks, conference data, etc.)
6. **Clean Architecture**: Backend handles logic, frontend handles UI

This approach respects Rosa's architecture while delivering exactly what you want: weather API integration with generative UI components! 