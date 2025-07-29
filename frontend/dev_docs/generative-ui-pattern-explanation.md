# Generative UI Pattern for Tool Integration

## 🎨 Pattern Overview

The generative UI pattern established with the weather tool creates a **decoupled, polling-based architecture** that allows any backend tool to update the frontend UI without direct event coupling.

## 🔄 How the Pattern Works

### 1. **Tool Execution Flow**
```
User speaks → Tavus processes → Custom LLM (GPT-4.1) → Function Call → Backend stores data → Frontend polls → UI updates
```

### 2. **Key Components**

#### Backend Pattern:
```python
# Tool execution stores data
if function_name == "get_weather":
    result = get_weather(location)
    backend.session_weather_data[session_id] = result
    
# Endpoint exposes latest data
@app.get("/latest-weather/{session_id}")
async def get_latest_weather(session_id: str):
    return backend.session_weather_data.get(session_id, {})
```

#### Frontend Pattern:
```typescript
// Handler polls for updates
const WeatherHandler = ({ onWeatherUpdate }) => {
  useEffect(() => {
    if (meetingState !== 'joined-meeting') return;
    
    const interval = setInterval(async () => {
      const data = await fetchLatestWeatherData(conversationId);
      if (data) onWeatherUpdate(data);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [meetingState]);
  
  return null; // No UI, just logic
};

// Parent renders UI based on state
const [weatherData, setWeatherData] = useState(null);
return (
  <>
    <WeatherHandler onWeatherUpdate={setWeatherData} />
    {weatherData && <WeatherCard data={weatherData} />}
  </>
);
```

## 🏗️ Why This Pattern Works for ANY Tool

### 1. **Complete Decoupling**
- Backend doesn't know about frontend
- Frontend doesn't know about tool execution timing
- Tools are independent of each other

### 2. **Session-Based Isolation**
- Each conversation has its own data namespace
- Multiple users can use tools simultaneously
- No data collision between sessions

### 3. **Predictable Updates**
- 2-second polling = maximum 2-second delay
- No missed events
- No complex event subscription logic

### 4. **Tool Agnostic**
The pattern is identical regardless of tool complexity:
- Simple data fetch (weather) ✓
- Complex search (RAG) ✓
- Multi-step processes ✓
- External API calls ✓

## 📐 Design Principles

### 1. **Handler/Card Separation**
- **Handler**: Logic only, no UI, manages polling
- **Card**: UI only, no logic, pure presentation
- **Parent**: Orchestrates multiple tools

### 2. **State Management**
```typescript
// Each tool gets its own state
const [weatherData, setWeatherData] = useState(null);
const [ragData, setRagData] = useState(null);
const [calendarData, setCalendarData] = useState(null);

// Clean composition
return (
  <div className="tools-container">
    <WeatherHandler onWeatherUpdate={setWeatherData} />
    <RAGHandler onRAGUpdate={setRagData} />
    <CalendarHandler onCalendarUpdate={setCalendarData} />
    
    <div className="tools-display">
      {weatherData && <WeatherCard data={weatherData} />}
      {ragData && <RAGCard data={ragData} />}
      {calendarData && <CalendarCard data={calendarData} />}
    </div>
  </div>
);
```

### 3. **Data Flow**
```
1. Tool executes in backend (triggered by function call)
2. Result stored in session_tool_data[session_id][tool_name]
3. Frontend polls /latest-{tool}/{session_id}
4. Handler detects new data
5. Handler calls onUpdate callback
6. Parent updates state
7. Card re-renders with new data
```

## 🚀 Advantages for Development

1. **Easy to Add Tools**: Copy pattern, change names, implement logic
2. **No Infrastructure Changes**: Same polling, same endpoints
3. **Independent Development**: Backend and frontend can be developed separately
4. **Easy Testing**: Can manually POST to endpoints to test UI
5. **Debugging**: Clear data flow, easy to trace

## ⚠️ Common Pitfalls to Avoid

### ❌ Don't Try to "Optimize"
```typescript
// WRONG - Don't do conditional polling
if (userAskedForWeather) {
  startPolling();
}

// RIGHT - Always poll when in meeting
if (meetingState === 'joined-meeting') {
  // Poll regardless of tool usage
}
```

### ❌ Don't Share State Between Tools
```typescript
// WRONG
const [toolsData, setToolsData] = useState({});

// RIGHT
const [weatherData, setWeatherData] = useState(null);
const [ragData, setRagData] = useState(null);
```

### ❌ Don't Combine Handlers
```typescript
// WRONG - One handler for multiple tools
<UniversalToolHandler tools={['weather', 'rag']} />

// RIGHT - Separate handler per tool
<WeatherHandler />
<RAGHandler />
```

## 🎯 Summary

The generative UI pattern succeeds because it:
1. **Treats every tool the same way**
2. **Maintains clear separation of concerns**
3. **Uses simple, reliable polling**
4. **Stores data per session**
5. **Renders UI reactively**

This pattern scales from simple weather queries to complex RAG searches without architectural changes. The key is maintaining the pattern discipline - resist the urge to "improve" it for specific tools. 