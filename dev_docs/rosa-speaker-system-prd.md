# Rosa Dynamic Speaker System - PRD
*Building on Proven Function Calling Architecture*

## 📋 **Product Requirements Document**

### **Vision**
Create an intelligent speaker discovery system where Rosa can dynamically surface speaker profiles, bios, and session information based on user queries using AI-optimized metadata and function calling.

### **Current Architecture Foundation** ✅
- **Split-Screen UI**: `src/components/RosaDemo.tsx` with Rosa (left) + content tabs (right)
- **Function Calling**: Working pattern via `CTBTOHandler.tsx` + `SimpleWeatherHandler.tsx`
- **Backend**: Python `backend/Agent1.py` with OpenAI Responses API
- **State Management**: Zustand store pattern from existing implementations
- **UI Components**: Professional styling with modern card layouts

---

## 🎯 **Core Requirements**

### **1. Speaker Data Structure**
Each speaker must have:
- **ID**: Unique identifier for function call targeting
- **Profile**: Name, title, organization, photo
- **Session Info**: Room, time, topic
- **AI Metadata**: Rich context for intelligent matching
- **Conference Relevance**: CTBTO-specific expertise areas

### **2. Query Intelligence**
Rosa should handle queries like:
- "Are there any speakers for seismic monitoring?"
- "Show me nuclear verification experts"
- "Who's speaking about radionuclide detection?"
- "Tell me about Dr. Sarah Chen"
- "What speakers are in the main auditorium?"

### **3. Visual Components**
- **Speaker Profile Cards**: Photo, bio, session details
- **Session Information**: Room, time, navigation hints
- **QR Code Integration**: Mobile-friendly speaker details
- **Smooth Transitions**: From welcome → speaker → back to welcome

---

## 🏗️ **Technical Implementation Plan**

### **Phase 1: Data & Backend (1-2 days)**

#### **Step 1.1: Speaker Data Structure**
**File**: `examples/cvi-ui-conversation/backend/speakers_data.py`
```python
# Following Agent1.py pattern for data management
CTBTO_SPEAKERS = [
    {
        "id": "dr-sarah-chen",
        "profile": {
            "name": "Dr. Sarah Chen",
            "title": "Lead Nuclear Verification Scientist", 
            "organization": "CTBTO Preparatory Commission",
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "main-auditorium",
            "room_name": "Main Auditorium",
            "time": "09:30 - 10:15",
            "topic": "Advanced Seismic Analysis for Nuclear Test Detection"
        },
        "ai_metadata": {
            "expertise": ["seismic monitoring", "nuclear verification", "signal processing"],
            "keywords": ["seismic", "nuclear test", "verification", "monitoring", "detection"],
            "bio_summary": "Leading expert in seismic analysis with 15+ years at CTBTO...",
            "conference_relevance": "keynote_speaker"
        }
    },
    # 4 more speakers with diverse expertise...
]
```

#### **Step 1.2: Backend Agent Extension**
**File**: `examples/cvi-ui-conversation/backend/Agent1.py` (extend existing)
```python
# Add to CTBTOAgent class (lines 90-100)
def find_speakers_by_topic(self, topic: str, language: str = "en") -> Dict[str, Any]:
    """Find speakers matching a topic using AI-powered matching"""
    # Use OpenAI to match topic to speaker metadata
    # Return structured speaker data for frontend

def get_speaker_by_id(self, speaker_id: str) -> Dict[str, Any]:
    """Get specific speaker details by ID"""
    # Return complete speaker profile for UI display
```

#### **Step 1.3: FastAPI Endpoints** 
**File**: `examples/cvi-ui-conversation/backend/simple_api.py` (extend existing)
```python
# Add endpoints following existing weather/CTBTO pattern
@app.post("/api/speakers/search")
@app.get("/api/speakers/{speaker_id}")
```

### **Phase 2: Frontend Integration (1-2 days)**

#### **Step 2.1: Speaker Handler Component**
**File**: `src/components/SpeakerHandler.tsx`
Following **exact pattern** from `CTBTOHandler.tsx` (lines 44-100):
```typescript
// Copy useDailyEvent pattern for conversation.tool_call events
// Listen for 'getSpeakerInfo', 'findSpeakers' tool calls
// Call backend API and update Zustand store
// Send formatted response back to Rosa via daily.sendAppMessage
```

#### **Step 2.2: Speaker UI Components**
**File**: `src/components/conference/SpeakerProfile.tsx`
Following **exact pattern** from modernized welcome panel in `RosaDemo.tsx`:
```typescript
// Professional card layout with speaker photo, bio, session info
// QR code placeholder for mobile access
// Navigation back to welcome
```

#### **Step 2.3: State Management**
**File**: `src/components/conference/useSpeakerStore.ts`
Following **exact pattern** from `hack-cvi-shop/src/store/useStore.ts`:
```typescript
// Zustand store for speaker state management
// Actions: showSpeaker, showSpeakerList, resetToWelcome
// State: currentSpeaker, speakerList, currentPanel
```

#### **Step 2.4: RosaDemo Integration**
**File**: `src/components/RosaDemo.tsx` (extend existing)
Add speaker content to existing `contentData` object (lines 15-80):
```typescript
// Add 'speakers' to content navigation tabs
// Integrate SpeakerProfile component
// Connect to speaker store state
```

### **Phase 3: Function Calling Integration (1 day)**

#### **Step 3.1: Tool Definitions**
**File**: `examples/cvi-ui-conversation/backend/Agent1.py`
```python
# Add OpenAI function definitions for speaker tools
SPEAKER_TOOLS = [
    {
        "name": "findSpeakers",
        "description": "Find conference speakers by topic, expertise, or session",
        "parameters": {
            "topic": "string",
            "expertise_area": "string (optional)"
        }
    },
    {
        "name": "getSpeakerInfo", 
        "description": "Get detailed information about a specific speaker",
        "parameters": {
            "speaker_id": "string"
        }
    }
]
```

#### **Step 3.2: Handler Integration**
**File**: `src/App.tsx` or main conversation component
```typescript
// Add SpeakerHandler alongside existing WeatherHandler and CTBTOHandler
<SpeakerHandler conversationId={conversation.conversation_id} />
```

---

## 🎨 **UI/UX Design Specifications**

### **Speaker Profile Card Layout**
Based on modernized welcome panel pattern from `RosaDemo.tsx`:
- **Header**: Speaker photo (circular, 80px) + name + title
- **Organization**: CTBTO affiliation with logo
- **Session Info**: Time, room, topic in highlighted box
- **Bio Section**: 2-3 paragraphs of expertise
- **QR Code**: Mobile access for detailed schedule
- **Navigation**: Back to welcome, related speakers

### **Speaker List View**
- **Grid Layout**: 2 columns, responsive cards
- **Quick Info**: Photo, name, session time
- **Filter Hints**: "Showing speakers for: [topic]"
- **Call-to-Action**: "Ask about specific expertise areas"

---

## 📁 **File Structure & References**

### **Data Files**
- `backend/speakers_data.py` - Speaker database (follows Agent1.py patterns)
- `backend/Agent1.py` - Extended with speaker functions (lines 90-120)
- `backend/simple_api.py` - Speaker endpoints (extend existing)

### **Frontend Components**
- `src/components/SpeakerHandler.tsx` - Event handler (copy CTBTOHandler.tsx pattern)
- `src/components/conference/SpeakerProfile.tsx` - UI component (copy welcome panel style)
- `src/components/conference/useSpeakerStore.ts` - State management (copy useStore.ts pattern)
- `src/components/RosaDemo.tsx` - Integration point (extend contentData object)

### **Integration Points**
- `src/App.tsx` - Add SpeakerHandler to component tree
- `backend/Agent1.py` - Tool definitions and OpenAI integration
- `src/types/index.ts` - TypeScript interfaces for speaker data

---

## 🧪 **Testing Strategy**

### **Phase 1 Testing: Backend**
```bash
cd examples/cvi-ui-conversation/backend
python Agent1.py  # Test speaker search functions
curl http://localhost:3002/api/speakers/search -X POST -d '{"topic":"seismic"}'
```

### **Phase 2 Testing: Function Calls**
Test Rosa queries:
- "Tell me about nuclear verification experts"
- "Who's speaking about seismic monitoring?"
- "Show me Dr. Sarah Chen's profile"

### **Phase 3 Testing: UI Flow**
- Speaker profile displays correctly
- Navigation back to welcome works
- QR code placeholder shows
- Mobile-responsive layout

---

## 🚀 **Success Metrics**

### **Technical Success**
- [ ] 5 unique speaker profiles with rich metadata
- [ ] AI-powered topic matching works accurately
- [ ] Function calling integration seamless with existing handlers
- [ ] Professional UI matching conference standards

### **User Experience Success**
- [ ] Rosa can answer "who speaks about X" queries naturally
- [ ] Speaker profiles load within 200ms of query
- [ ] UI transitions smoothly between welcome and speaker views
- [ ] QR code integration ready for mobile scanning

### **Architecture Success**
- [ ] Pattern reuse from existing CTBTOHandler and WeatherHandler
- [ ] No breaking changes to current working system
- [ ] Zustand state management follows proven patterns
- [ ] Ready for database scaling in Phase 3

---

## 🔄 **Next Phase Preview**

After speaker system success:
- **Venue Mapping**: Interactive room locations with navigation
- **Schedule Integration**: Real-time session updates
- **Database Migration**: Move from hardcoded to dynamic data
- **Multi-language**: Speaker bios in 6 UN languages
- **QR Code Generation**: Live mobile-friendly speaker pages 