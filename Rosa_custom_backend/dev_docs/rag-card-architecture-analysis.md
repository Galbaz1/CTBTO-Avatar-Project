# RAG Card Architecture Analysis

## Problem Statement

When implementing RAG (Retrieval Augmented Generation) for the Rosa Custom backend, we need to determine how to store and render UI cards based on search results. Unlike the simple weather pattern, RAG presents unique challenges:

1. **Unpredictable Results**: RAG can return sessions, speakers, documents, or mixed content
2. **Semantic Decision Making**: Card type selection requires LLM understanding, not just raw data
3. **Non-deterministic UI**: Frontend can't predict what cards to render from raw Weaviate results

## Weather vs RAG: The Core Difference

### Weather Pattern (Simple)
```
LLM calls get_weather("Vienna") → Weather API → Structured data → WeatherCard
```
- **Predictable**: Function call always returns weather data
- **Deterministic**: Frontend knows to render WeatherCard
- **1:1 mapping**: One function call → One card type

### RAG Pattern (Complex)
```
LLM calls search_knowledge("quantum sensing") → Weaviate → Raw search results → ???
```
- **Unpredictable**: Could return sessions, speakers, documents, mixed content
- **Non-deterministic**: Frontend has no idea what cards to render
- **1:many mapping**: One function call → Unknown number/types of cards

## Initial Approaches Considered

### Approach 1: Structured Outputs
Use OpenAI's structured outputs to get both natural text and card decisions in one response:

```python
{
    "message": "There are two fascinating quantum sensing sessions...",
    "cards": [
        {"card_type": "session", "entity_id": "session-2025-09-10-0900", "relevance": 0.95},
        {"card_type": "speaker", "entity_id": "elizabeth-hayes", "relevance": 0.87}
    ]
}
```

### Approach 2: Backend Pre-categorization
Backend analyzes Weaviate results and pre-categorizes them:

```python
def search_knowledge(query):
    raw_results = weaviate_search(query)
    categorized = []
    for result in raw_results:
        if "session_id" in result.metadata:
            categorized.append({"type": "session", "data": result})
```

### Approach 3: Text-First with Optional Cards
LLM responds naturally, backend extracts entities via NLP/regex:

```python
response = "Dr. Elizabeth Hayes presents quantum sensing..."
extracted_cards = extract_entities_from_text(response)
```

## Technical Challenges Discovered

### 1. Streaming Structured Outputs Are Barely Parseable

**Reality**: OpenAI streams JSON token by token, not field by field:
```javascript
// What you actually get:
{" 
field_1
":"
value
","
field_2
":"
value
// ... incomplete JSON fragments
```

**Requirements**:
- OpenAI SDK dependency for reliable parsing
- Complex partial JSON state management
- Error-prone manual chunked parsing

### 2. Tavus Integration Architectural Conflict

**Critical Issue**: Tavus expects plain text for speech synthesis:

```python
# Tavus needs THIS:
return "There are two quantum sensing sessions today..."

# Structured outputs give you THIS:
return '{"message": "There are two quantum sensing sessions...", "cards": [...]}'
```

**Tavus cannot synthesize JSON as speech** - it needs natural language.

### 3. SDK Dependency Problem

OpenAI docs state: *"We recommend relying on the SDKs to handle streaming with Structured Outputs."*

**Our Setup**: Custom LLM backend making HTTP requests, not using OpenAI Python SDK directly.

**Implications**:
- No built-in streaming JSON parser
- Manual implementation required
- High complexity and error rate

### 4. The Fundamental Architectural Conflict

```
Current Tavus Flow: User Speech → LLM Text Response → Speech Synthesis
Required RAG Flow:  User Speech → LLM JSON Response → Extract Text + Cards → Speech Synthesis
```

**The Core Issue**: We need **TWO outputs from ONE LLM call**:
1. Natural text for Tavus speech synthesis
2. Structured data for UI cards

## Viable Solutions Analysis

### Option 1: Post-Processing Extraction ⭐ **Most Realistic**

```python
# LLM generates natural text response
response = "There are two quantum sensing sessions today. The first is 'Quantum Sensing for Nuclear Detection' by Prof. Elizabeth Hayes..."

# Backend post-processes text to extract entities
extracted_cards = extract_entities_from_text(response)
session_rag_cards[session_id] = extracted_cards

# Tavus gets clean text, frontend gets cards via polling
return response  # Natural text only
```

**Pros**:
- Maintains existing Tavus integration
- Uses proven polling pattern
- Lower implementation complexity

**Cons**:
- NLP/regex extraction can be brittle
- Potential for missed entities
- Less precise than LLM-driven decisions

### Option 2: Dual LLM Calls

```python
# Call 1: Natural response for Tavus
natural_response = llm.generate("Tell me about quantum sensing sessions")

# Call 2: Structured extraction from the natural response  
cards = llm.generate_structured(
    f"Extract session cards from: {natural_response}",
    schema=card_schema
)
```

**Pros**:
- Clean separation of concerns
- Maintains natural conversation
- LLM-driven card decisions

**Cons**:
- Higher cost (2x LLM calls)
- Increased latency
- Additional complexity

### Option 3: Function Calling Chain ⭐ **Most Architecturally Sound**

```python
# LLM natural response triggers follow-up function calls
# "I found two relevant sessions" → triggers show_session_card("session-123")
# "Dr. Hayes is presenting" → triggers show_speaker_card("elizabeth-hayes")

# Functions available to LLM:
{
    "name": "search_conference_knowledge",
    "description": "Search conference database",
    "parameters": {"query": "quantum sensing"}
},
{
    "name": "show_session_details", 
    "description": "Display detailed session card",
    "parameters": {"session_id": "session-2025-09-10-0900"}
},
{
    "name": "show_speaker_details",
    "description": "Display speaker biography card", 
    "parameters": {"speaker_id": "elizabeth-hayes"}
}
```

**Pros**:
- Preserves natural conversation flow
- LLM makes semantic UI decisions
- Maintains existing polling architecture
- Each function → known card type (deterministic)

**Cons**:
- Multiple round trips
- More complex orchestration
- LLM might make suboptimal card choices

## Recommended Implementation

**Primary Choice**: **Option 3 (Function Calling Chain)**

### Why This Works Best:

1. **Semantic Intelligence**: LLM decides which cards are relevant based on context
2. **Architectural Compatibility**: Works with existing Tavus + polling pattern
3. **Deterministic Rendering**: Each function call maps to a specific card type
4. **Natural Flow**: Maintains conversational experience

### Implementation Strategy:

1. **Initial RAG Function**: Returns raw results to LLM for analysis
2. **LLM Reasoning**: Analyzes results, decides what's worth showing
3. **Follow-up Functions**: LLM calls specific card functions based on analysis
4. **Incremental Updates**: Frontend polls and updates cards as they arrive

### Example Flow:

```
1. User: "Tell me about quantum sensing sessions"
2. LLM calls: search_conference_knowledge("quantum sensing")
3. LLM analyzes results, responds: "I found two relevant sessions..."
4. LLM calls: show_session_details("session-2025-09-10-0900")
5. LLM calls: show_speaker_details("elizabeth-hayes")
6. Frontend polls, renders cards incrementally
```

## Key Architectural Principles

1. **LLM as UI Decision Maker**: Only the LLM has semantic understanding needed for card selection
2. **Maintain Conversation Flow**: Don't break natural dialogue for structured data
3. **Preserve Polling Pattern**: Stick with proven 2-second polling architecture
4. **Incremental Updates**: Cards can appear progressively as LLM makes decisions

## Implementation Notes

- Each tool function stores data in `session_rag_data[session_id][tool_name]`
- Frontend polls `/latest-rag-results/{session_id}` for card updates
- Use existing card components: `SessionCard.tsx`, `SpeakerCard.tsx`
- Create new endpoint structure following weather pattern

## Rejected Approaches

- **Structured Outputs**: Too complex for streaming, incompatible with Tavus
- **Backend Pre-categorization**: Loses semantic understanding, brittle rules
- **Text Extraction**: Less reliable than LLM-driven decisions

---

**Last Updated**: January 2025  
**Status**: Architecture Approved, Ready for Implementation 