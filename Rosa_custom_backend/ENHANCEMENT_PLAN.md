# Rosa Enhancement Plan: Weather API + Generative UI

## Overview
Enhance Rosa (custom LLM) with weather API functionality and generative UI components, inspired by the streaming_components example while maintaining compatibility with Tavus CVI and Daily.co integration.

## Current Architecture Analysis

### Rosa Custom Backend (Current)
- **Backend**: FastAPI with OpenAI-compatible `/chat/completions` endpoint
- **Agent**: CTBTOAgent using GPT-4.1, focused on CTBTO knowledge
- **Frontend**: React with Tavus CVI components, Daily.co integration
- **Pattern**: No function calling, pure conversational AI

### Streaming Components (Reference)
- **Backend**: FastAPI with progressive JSON streaming
- **Frontend**: React with progressive JSON parsing for real-time UI updates
- **Components**: WeatherCard, StockCard with loading states
- **Pattern**: JSON response format triggers specific UI components

### Tavus Integration Points
- Custom LLM via OpenAI-compatible API
- Daily.co for WebRTC video calls
- CVI (Conversational Video Interface) components
- App message system for real-time communication

## Enhancement Strategy

### Phase 1: Backend Weather API Integration

#### 1.1 Weather Service Enhancement
```python
# Add to Agent1.py
class WeatherAgent:
    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")
    
    def get_weather(self, location: str) -> dict:
        # Implementation with OpenWeatherMap API
        pass
    
    def format_weather_component(self, weather_data: dict) -> dict:
        # Return structured data for UI component
        return {
            "type": "weather",
            "data": {
                "location": weather_data.get("location"),
                "current": {
                    "temperature": weather_data.get("temp"),
                    "condition": weather_data.get("condition"),
                    "humidity": weather_data.get("humidity"),
                    "windSpeed": weather_data.get("wind_speed"),
                    "icon": weather_data.get("icon")
                },
                "forecast": weather_data.get("forecast", [])
            }
        }
```

#### 1.2 Function Calling Integration
```python
# Enhanced CTBTOAgent with function calling
WEATHER_FUNCTION = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather and forecast for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name or location"
                }
            },
            "required": ["location"]
        }
    }
}
```

#### 1.3 Streaming Response Enhancement
```python
# Modified rosa_pattern1_api.py streaming logic
def generate_with_components():
    # Enhanced streaming that can return both text and component data
    # Progressive JSON parsing support for real-time UI updates
    pass
```

### Phase 2: Frontend Generative UI Integration

#### 2.1 Weather Component Creation
- Copy `WeatherCard.tsx` pattern from streaming_components
- Adapt styling to match Rosa's design system
- Add progressive loading states for real-time updates

#### 2.2 Progressive JSON Parser
```typescript
// Enhanced ChatInterface for component parsing
interface ComponentData {
  type: 'weather' | 'ctbto_info';
  data: any;
}

const parseProgressiveJSON = (content: string): {
  componentData: ComponentData | null;
  textContent: string;
  isJsonDetected: boolean;
  isComplete: boolean;
} => {
  // Implementation similar to streaming_components
}
```

#### 2.3 Integration with Daily.co
```typescript
// Enhanced message handling for Tavus integration
useDailyEvent('app-message', (event) => {
  // Handle both Rosa responses and weather component data
  if (event.data?.component_data) {
    // Render generative UI component
  }
});
```

### Phase 3: Tavus-Specific Optimizations

#### 3.1 Conversation Flow Integration
- Weather requests trigger both text response AND UI component
- Maintain natural conversation flow with Rosa's CTBTO expertise
- Use Tavus conversation.echo for sending structured data

#### 3.2 Performance Optimizations
- Leverage Tavus speculative inference compatibility
- Optimize for real-time video conversation context
- Minimal latency for UI component rendering

## Implementation Details

### Backend Changes (Rosa_custom_backend)

1. **Enhanced Agent1.py**
   - Add WeatherAgent class
   - Integrate OpenWeatherMap API
   - Add function calling support to CTBTOAgent
   - Maintain existing CTBTO knowledge base

2. **Modified rosa_pattern1_api.py**
   - Add weather function to available tools
   - Enhanced streaming response for component data
   - Progressive JSON support in streaming

3. **New weather_service.py**
   - Dedicated weather API service
   - Error handling and fallbacks
   - Data formatting for UI components

### Frontend Changes (Rosa_custom_backend/src)

1. **New Components**
   - `WeatherCard.tsx` - Weather display component
   - `ComponentRenderer.tsx` - Generic component renderer
   - Enhanced `ChatInterface` with component support

2. **Enhanced Hooks**
   - Progressive JSON parsing
   - Component state management
   - Integration with existing CVI hooks

3. **Updated App Architecture**
   - Component-aware message handling
   - Maintain Daily.co integration
   - Preserve Tavus CVI functionality

## Technical Considerations

### API Integration
- **OpenWeatherMap**: Use for weather data (key already available)
- **Fallback Strategy**: Default to estimated data if API fails
- **Rate Limiting**: Implement caching for frequently requested locations

### UI/UX Design
- **Progressive Loading**: Show partial weather data as it streams
- **Error States**: Graceful handling of API failures
- **Responsive Design**: Work well in video call interface
- **Accessibility**: Maintain ARIA compliance

### Performance
- **Streaming Optimization**: Minimize latency for real-time updates
- **Memory Management**: Efficient component rendering
- **Network Efficiency**: Smart caching and minimal API calls

## Testing Strategy

### Backend Testing
1. Weather API integration tests
2. Function calling functionality
3. Streaming response validation
4. OpenAI compatibility verification

### Frontend Testing
1. Component rendering with partial data
2. Progressive JSON parsing edge cases
3. Daily.co integration compatibility
4. Responsive design validation

### Integration Testing
1. End-to-end weather request flow
2. Tavus conversation compatibility
3. Real-time UI updates during video calls
4. Error handling across the stack

## Deployment Strategy

### Development Phase
1. Local development with mock weather data
2. Integration with OpenWeatherMap API
3. Component development and testing
4. Tavus integration validation

### Production Considerations
- Environment variable management (API keys)
- Error monitoring and logging
- Performance monitoring
- Backup/fallback strategies

## Success Metrics

### Functional Goals
- ✅ Weather requests trigger both text and UI components
- ✅ Real-time UI updates during streaming
- ✅ Maintains Rosa's CTBTO expertise
- ✅ Compatible with Tavus video conversations

### Performance Goals
- < 2s response time for weather requests
- Smooth progressive UI loading
- No impact on video call quality
- Efficient memory usage

## Timeline Estimate

- **Phase 1 (Backend)**: 2-3 days
- **Phase 2 (Frontend)**: 2-3 days  
- **Phase 3 (Integration)**: 1-2 days
- **Testing & Polish**: 1-2 days

**Total**: 6-10 days for complete implementation

## Risk Mitigation

1. **API Reliability**: Implement fallback responses and caching
2. **Performance Impact**: Monitor and optimize streaming performance
3. **Tavus Compatibility**: Thorough testing with CVI integration
4. **User Experience**: Graceful degradation if components fail to load

## Next Steps

1. Set up development environment with weather API keys
2. Implement basic weather function in Agent1.py
3. Create initial WeatherCard component
4. Test progressive JSON parsing
5. Integrate with Tavus conversation flow
6. Comprehensive testing and optimization

This plan maintains Rosa's existing CTBTO expertise while adding weather capabilities and generative UI, following proven patterns from the streaming_components example while respecting the Tavus/Daily.co architecture constraints. 