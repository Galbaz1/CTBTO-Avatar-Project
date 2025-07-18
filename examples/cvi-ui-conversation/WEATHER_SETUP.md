# ROSA Weather Integration Setup

This setup follows the **"one-call/one-tool" approach** for optimal latency in real-time CVI conversations, using WeatherAPI with **Vienna as the default conference location**.

## 🏛️ Vienna Conference Default

ROSA defaults to **Vienna, Austria** as the conference location. Users can ask for other locations, but Vienna weather will be provided when no specific location is mentioned.

## 🚀 Quick Setup (Using Bun)

### 1. Get WeatherAPI Key
```bash
# Sign up at https://www.weatherapi.com/
# Free tier: 1M calls/month - perfect for ROSA
echo "WEATHER_API_KEY=your_key_here" >> .env
```

### 2. Start Weather Service
```bash
# Copy package.json and install dependencies with Bun
cp weather-package.json package.json
bun install

# Start the weather server
bun start
# → Weather service runs on http://localhost:3001
```

### 3. Test Weather Service
```bash
# Test Vienna (default conference location)
bun run test-vienna
# → Should return Vienna weather with conference advice

# Test custom location
bun run test-custom
# → Should return New York weather

# Test POST endpoint with Vienna
bun run test
# → Should return Vienna weather data

# Check health
bun run health
# → {"status": "ROSA Weather Service is running", "conference_location": "Vienna, Austria"}
```

### 4. Update ROSA Persona (Required)

To enable weather functionality, update your ROSA persona with the tool definition:

```bash
curl --request PATCH \
  --url https://tavusapi.com/v2/personas/pc50ef44d21c \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: YOUR_TAVUS_API_KEY' \
  --data '[
    {
      "op": "add",
      "path": "/layers/llm/tools",
      "value": [
        {
          "type": "function",
          "function": {
            "name": "getWeatherAndTime",
            "description": "Get current weather and local time. Defaults to Vienna conference location if no location specified.",
            "parameters": {
              "type": "object",
              "properties": {
                "location": {
                  "type": "string",
                  "description": "City name, postal code, or coordinates. Defaults to Vienna if not provided. Examples: Vienna, New York, 1010, or 48.2082,16.3738"
                }
              },
              "required": []
            }
          }
        }
      ]
    },
    {
      "op": "replace",
      "path": "/context",
      "value": "You are ROSA, a diplomatic conference assistant at CTBTO SnT 2025 in Vienna, Austria. You can provide current weather and local time information. You default to Vienna conference location weather unless users specifically ask for other locations. When providing weather, include conference-relevant advice for Vienna."
    }
  ]'
```

### 5. Run ROSA with Weather (Vite + Bun)
```bash
# Start the React app (Vite development server)
bun run dev

# ROSA will now respond to weather queries like:
# "What's the weather like?" (→ Vienna default)
# "What's the conference weather?" (→ Vienna with advice)
# "What's the weather in New York?" (→ Custom location)
# "What time is it in London?" (→ London weather + time)
```

## 🌤️ How It Works

### Architecture (Vienna-First Design)
```
User: "What's the weather?" → ROSA defaults to Vienna →
Weather service → WeatherAPI → Vienna weather + conference advice →
ROSA: "Weather in Vienna: 5°C, cloudy. Conference advice: Cold - warm jacket needed for venue."
```

### Vienna Conference Features
- ✅ **Default location**: Always Vienna unless specified
- ✅ **Conference advice**: Clothing, venue, travel recommendations
- ✅ **Local time**: Vienna timezone (Europe/Vienna)
- ✅ **Diplomatic context**: Conference-specific language

### Latency Optimization (Vite + Bun)
- ✅ **Vite dev server**: Ultra-fast hot reload for development
- ✅ **Bun runtime**: Faster than Node.js for JavaScript execution
- ✅ **Single API call** (weather + time together)
- ✅ **Vienna endpoint**: Direct GET request for conference default
- ✅ **Speculative inference**: ROSA starts processing while user speaks

## 🧪 Testing Commands

```bash
# Test Vienna default (conference location)
curl http://localhost:3001/api/weather/vienna

# Test custom location via POST
curl -X POST http://localhost:3001/api/weather \
  -H 'Content-Type: application/json' \
  -d '{"location":"New York"}'

# Test with coordinates
curl -X POST http://localhost:3001/api/weather \
  -H 'Content-Type: application/json' \
  -d '{"location":"48.2082,16.3738"}'  # Vienna coordinates

# Test no location (defaults to Vienna)
curl -X POST http://localhost:3001/api/weather \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 📊 Expected Response Format

### Vienna Conference Location
```json
{
  "location": "Vienna, Austria (Conference Location)",
  "localTime": "2025-01-18 14:30",
  "timezone": "Europe/Vienna",
  "temperature": {
    "celsius": 2,
    "fahrenheit": 36
  },
  "condition": "Partly cloudy",
  "windKph": 15,
  "humidity": 65,
  "feelsLikeC": -1,
  "visibility": 10,
  "isDay": true,
  "isConferenceLocation": true,
  "conferenceWeatherAdvice": "Cold - warm jacket needed for conference venue"
}
```

### Custom Location
```json
{
  "location": "New York, United States",
  "localTime": "2025-01-18 08:30",
  "timezone": "America/New_York",
  "temperature": {
    "celsius": 10,
    "fahrenheit": 50
  },
  "condition": "Clear",
  "windKph": 8,
  "humidity": 45,
  "feelsLikeC": 8,
  "visibility": 16,
  "isDay": true,
  "isConferenceLocation": false,
  "conferenceWeatherAdvice": null
}
```

## 🎯 ROSA Weather Capabilities

After setup, ROSA can handle:
- **Default conference**: "What's the weather?" → Vienna + conference advice
- **Conference planning**: "Weather for tomorrow's outdoor reception?" → Vienna forecast
- **Travel advice**: "Should delegates bring umbrellas?" → Vienna precipitation
- **Time coordination**: "What time is it?" → Vienna local time
- **International queries**: "Weather in Tokyo?" → Custom location
- **Multilingual requests**: Works in all 6 UN languages

## 🔧 Tech Stack Summary

- **Frontend**: Vite + React + TypeScript [[memory:3651457]]
- **Runtime**: Bun (JavaScript runtime + package manager) [[memory:3651457]]
- **API**: Express.js weather service
- **Weather**: WeatherAPI.com (1M free calls/month)
- **Conference**: Vienna, Austria (CTBTO SnT 2025)

## 🔧 Production Deployment

For production deployment:
1. Deploy weather service to cloud (Railway, Fly.io work well with Bun)
2. Update frontend to use production URL
3. Enable HTTPS endpoints
4. Add caching layer (Redis) for Vienna frequent requests
5. Configure rate limiting and monitoring

---

**Implementation Status**: ✅ Vienna-first design with Bun + Vite  
**Default Location**: Vienna, Austria (Conference)  
**Runtime**: Bun (faster than Node.js)  
**Build Tool**: Vite (ultra-fast development)  
**Cost**: $0/month for up to 1M requests 