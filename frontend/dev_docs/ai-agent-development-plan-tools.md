# AI Agent Development Plan: Adding Tools to Rosa Custom Backend

## 🎯 Primary Objective
Add tools incrementally to the Rosa Custom backend using the established weather tool pattern as a template. Each tool must follow the proven architecture without deviation.

## ✅ WHAT TO DO (Required Actions)

### 1. Follow the Established Tool Pattern
Every new tool MUST follow this exact pattern:
```
Backend (Python/FastAPI):
1. Define OpenAI function in tools list
2. Implement function handler in generate() method
3. Store tool data in session_data[session_id]
4. Create GET endpoint: /latest-{toolname}/{session_id}
5. Return data in standardized format

Frontend (React/TypeScript):
1. Create {ToolName}Handler.tsx component
2. Implement 2-second polling when meetingState === 'joined-meeting'
3. Create {ToolName}Card.tsx for UI display
4. Pass data via onUpdate callback to parent
```

### 2. Tool Implementation Order
1. **RAG System (First Priority)**
   - Vector database: Weaviate
   - Data: schedules, speakers, sessions
   - Endpoint: `/latest-rag-results/{session_id}`
   - UI: Results list with expandable cards

2. **Future Tools** (implement only when requested):
   - Document search
   - Calendar integration
   - Email summaries
   - Task management

### 3. Generative UI Pattern (MANDATORY)
```typescript
// Every tool MUST follow this pattern:
interface ToolHandler {
  onToolUpdate: (data: ToolData) => void;
}

// Polling mechanism (DO NOT CHANGE):
useEffect(() => {
  if (meetingState !== 'joined-meeting') return;
  
  const poll = async () => {
    const response = await fetch(`http://localhost:8000/latest-${toolname}/${conversationId}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data !== lastData) {
        onToolUpdate(data);
      }
    }
  };
  
  const interval = setInterval(poll, 2000);
  return () => clearInterval(interval);
}, [meetingState, onToolUpdate]);
```

### 4. Backend Session Management
```python
# ALWAYS use this pattern for tool data storage:
class RosaBackend:
    def __init__(self):
        self.sessions = {}
        self.session_tool_data = {}  # e.g., session_rag_data
    
    def store_tool_data(self, session_id: str, tool_name: str, data: dict):
        if session_id not in self.session_tool_data:
            self.session_tool_data[session_id] = {}
        self.session_tool_data[session_id][tool_name] = data
```

### 5. Function Calling Format
```python
# OpenAI function definition template:
{
    "name": "tool_name",
    "description": "Clear description for GPT-4.1",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "User query"},
            # Add other parameters as needed
        },
        "required": ["query"]
    }
}
```

## ❌ WHAT NOT TO DO (Strict Prohibitions)

### 1. Architecture Changes - FORBIDDEN
- ❌ DO NOT modify the polling interval (keep 2 seconds)
- ❌ DO NOT use WebSockets or Server-Sent Events
- ❌ DO NOT add Daily.co Python SDK dependencies
- ❌ DO NOT implement direct app messaging
- ❌ DO NOT change the session management structure
- ❌ DO NOT create new architectural patterns

### 2. Code Patterns to AVOID
- ❌ DO NOT use event listeners for tool updates
- ❌ DO NOT implement real-time subscriptions
- ❌ DO NOT add authentication to tool endpoints
- ❌ DO NOT create middleware for tool handling
- ❌ DO NOT modify the existing warmup flow

### 3. UI/UX Restrictions
- ❌ DO NOT create modal dialogs for tool results
- ❌ DO NOT implement tool-specific routing
- ❌ DO NOT add tool configuration screens
- ❌ DO NOT create admin interfaces
- ❌ DO NOT implement user preferences

### 4. Over-Engineering Prohibitions
- ❌ DO NOT create abstract base classes for tools
- ❌ DO NOT implement dependency injection
- ❌ DO NOT add caching layers
- ❌ DO NOT create tool registries
- ❌ DO NOT implement plugin systems

## 📋 Implementation Checklist for Each Tool

### Backend Checklist:
- [ ] Add function to `tools` list in `rosa_pattern1_api.py`
- [ ] Implement handler in `generate()` method
- [ ] Create session storage dictionary (e.g., `session_rag_data`)
- [ ] Add GET endpoint `/latest-{toolname}/{session_id}`
- [ ] Test with curl: `curl http://localhost:8000/latest-{toolname}/test-session`

### Frontend Checklist:
- [ ] Create `{ToolName}Handler.tsx` in `src/components/`
- [ ] Copy polling pattern from `WeatherHandler.tsx`
- [ ] Create `{ToolName}Card.tsx` for display
- [ ] Add handler to `SimpleConferenceHandler.tsx`
- [ ] Test UI updates with console logs

## 🔧 RAG System Specific Requirements

### Weaviate Integration:
```python
# Use weaviate-client Python package
# Store connection in app startup
# Query in function handler ONLY
# Return standardized results format:
{
    "success": True,
    "query": "user query here",
    "results": [
        {
            "title": "Result title",
            "content": "Result content",
            "relevance": 0.95,
            "metadata": {}
        }
    ],
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### UI Display Pattern:
```typescript
// RAGCard component structure:
<div className="rag-results">
  <h3>Search Results for: {data.query}</h3>
  <div className="results-list">
    {data.results.map(result => (
      <div key={result.id} className="result-card">
        <h4>{result.title}</h4>
        <p>{result.content}</p>
        <span className="relevance">{(result.relevance * 100).toFixed(0)}% match</span>
      </div>
    ))}
  </div>
</div>
```

## 🚨 Critical Success Factors

1. **Pattern Conformity**: Every tool MUST match the weather tool pattern exactly
2. **Session Isolation**: Each conversation has its own tool data
3. **Polling Reliability**: Frontend polls every 2 seconds when in meeting
4. **Data Persistence**: Tool data stored per session until conversation ends
5. **Error Handling**: Silent failures with console logs, no user-facing errors

## 📝 Final Notes for AI Agents

- Always refer to `WeatherHandler.tsx` and weather implementation in `rosa_pattern1_api.py` as the canonical pattern
- When in doubt, copy the weather pattern exactly and modify only the tool-specific parts
- Test each tool in isolation before integrating
- Use [[memory:4002432]] GPT-4.1 for all OpenAI API calls
- Keep tool implementations simple and focused on their specific purpose

## ⚠️ WARNING
Deviating from these patterns will break the established architecture. The weather tool pattern has been thoroughly tested and proven to work. DO NOT attempt to "improve" or "optimize" it. Copy it exactly for each new tool. 