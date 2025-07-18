# Rosa Split-Screen Implementation Plan (SIMPLIFIED)
*Quick & Dirty First → Build Up Incrementally*

## 🎯 **Core Philosophy: Prove It Works, Then Scale**

**Starting Point**: 10 rooms, 10 pre-made maps, hardcoded data  
**End Goal**: 50+ speakers, dynamic content, database-ready  
**Strategy**: Copy proven patterns, start simple, extend systematically

---

## 📍 **Exact Codebase References (What We're Copying)**

### **✅ Proven Patterns in Our Codebase:**

1. **AppMessageHandler Pattern**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/components/AppMessageHandler/index.tsx`
   - Lines 16-42: `useDailyEvent('app-message')` with event handling
   - Lines 25-32: Data lookup and UI updates
   - Lines 35-42: Product highlighting with `scrollIntoView()`

2. **Zustand Store Pattern**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/useStore.ts`
   - Lines 42-85: Simple state actions with `set()` function
   - Lines 1-37: Static data structure (products.json pattern)
   - Lines 44-65: Clean action functions without complex logic

3. **Split-Screen Layout**: `examples/cvi-ui-conversation/src/components/RosaDemo.tsx`
   - Lines 121-130: Perfect grid layout `gridTemplateColumns: '1fr 1fr'`
   - Lines 131-157: Left panel Rosa structure
   - Lines 200-226: Right panel dynamic content switching

4. **ShadCN Components**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/components/ui/`
   - `card.tsx`: Production-ready card components
   - `button.tsx`: Button variants and styling
   - `dialog.tsx`: Modal/dialog patterns
   - `toast.tsx`: Notification system

5. **Function Calling Architecture**: **CRITICAL - We'll use Python backend, not native Tavus models**
   - **Weather Pattern**: `src/components/WeatherHandler.tsx` - Working `useDailyEvent('app-message')` integration
   - **CTBTO Agent**: `examples/cvi-ui-conversation/backend/Agent1.py` - Python backend with OpenAI function calling
   - **Tool Call Backend**: `examples/cvi-frontend-backend-tools/functions.py` - Returns `(app_message, llm_response)` tuple
   - **Two-Service Architecture**: Express/Python backend + React frontend (see weather-server.js pattern)

6. **Existing Function Call Implementations**: **MUST INTEGRATE WITH THESE**
   - **Weather Handler**: `src/components/SimpleWeatherHandler.tsx` - Already working with tool calls
   - **CTBTO Handler**: `src/components/CTBTOHandler.tsx` - Existing agent integration
   - **Event Structure**: Uses `conversation.tool_call` events, `properties.speech` for utterances

---

## 🚀 **Phase 1: Quick & Dirty Proof of Concept (1-2 Days)**

### **Goal**: Prove tool calls can update the right panel with hardcoded data

### **Step 1.1: Copy Foundation (30 minutes)**
```bash
# Copy working UI components
cp examples/cvi-frontend-backend-tools/hack-cvi-shop/src/components/ui/* examples/cvi-ui-conversation/src/components/ui/
cp examples/cvi-frontend-backend-tools/hack-cvi-shop/src/hooks/use-toast.ts examples/cvi-ui-conversation/src/hooks/

# Update package.json dependencies (from hack-cvi-shop/package.json lines 20-32)
# Add: zustand, @radix-ui/react-dialog, @radix-ui/react-toast, clsx, etc.
```

### **Step 1.2: Create Simple Data (30 minutes)**
**File**: `src/components/conference/simpleData.ts`
```typescript
// Hardcoded data - exact same pattern as examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/products.json
export const SIMPLE_SPEAKERS = [
  {
    id: 'dr-chen',
    name: 'Dr. Sarah Chen',
    title: 'Lead Nuclear Verification Scientist',
    photo: '/api/placeholder/150/150', // Placeholder for now
    session: { room: 'main-auditorium', time: '09:30' }
  },
  {
    id: 'prof-martinez', 
    name: 'Prof. Elena Martinez',
    title: 'Radionuclide Monitoring Director',
    photo: '/api/placeholder/150/150',
    session: { room: 'conference-room-a', time: '11:00' }
  }
  // Just 2-3 speakers initially
];

export const SIMPLE_VENUES = [
  {
    id: 'main-auditorium',
    name: 'Main Auditorium',
    mapImage: '/src/assets/hofburg-plan.jpg', // Use existing asset
    walkingTime: '2 minutes'
  },
  {
    id: 'conference-room-a', 
    name: 'Conference Room A',
    mapImage: '/src/assets/hofburg-plan.jpg', // Same image for now
    walkingTime: '3 minutes'
  }
  // Just 2-3 venues initially
];
```

### **Step 1.3: Simple Store (30 minutes)**
**File**: `src/components/conference/useSimpleStore.ts`
```typescript
// Copy exact pattern from examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/useStore.ts
import { create } from "zustand";
import { SIMPLE_SPEAKERS, SIMPLE_VENUES } from './simpleData';

interface SimpleConferenceState {
  currentPanel: 'welcome' | 'speaker' | 'venue';
  currentSpeaker: any | null;
  currentVenue: any | null;
  
  // Simple actions like in useStore.ts lines 44-85
  showSpeaker: (speakerId: string) => void;
  showVenue: (venueId: string) => void;
  resetToWelcome: () => void;
}

export const useSimpleStore = create<SimpleConferenceState>((set) => ({
  currentPanel: 'welcome',
  currentSpeaker: null,
  currentVenue: null,
  
  showSpeaker: (speakerId) => {
    const speaker = SIMPLE_SPEAKERS.find(s => s.id === speakerId);
    set({ currentPanel: 'speaker', currentSpeaker: speaker });
  },
  
  showVenue: (venueId) => {
    const venue = SIMPLE_VENUES.find(v => v.id === venueId);
    set({ currentPanel: 'venue', currentVenue: venue });
  },
  
  resetToWelcome: () => set({ 
    currentPanel: 'welcome', 
    currentSpeaker: null, 
    currentVenue: null 
  }),
}));
```

### **Step 1.4: Simple Message Handler (45 minutes)**
**File**: `src/components/conference/SimpleConferenceHandler.tsx`
```typescript
// Copy exact pattern from existing WeatherHandler.tsx and CTBTOHandler.tsx
import { useDailyEvent } from "@daily-co/daily-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleStore } from './useSimpleStore';

export const SimpleConferenceHandler = () => {
  const { toast } = useToast();
  const { showSpeaker, showVenue } = useSimpleStore();

  useDailyEvent(
    'app-message',
    useCallback((ev: any) => {
      console.log('🏛️ Conference event:', ev);
      
      // CRITICAL: These events come from Python backend function calls, not direct UI events
      // Pattern matches existing WeatherHandler and CTBTOHandler implementations
      
      if (ev.data?.event === 'show_speaker_info') {
        const speakerId = ev.data.data?.speaker_id;
        if (speakerId) {
          showSpeaker(speakerId);
          toast({
            title: 'Speaker profile displayed',
            description: `Showing ${speakerId}`,
          });
        }
      }
      
      if (ev.data?.event === 'show_venue_info') {
        const venueId = ev.data.data?.venue_id;
        if (venueId) {
          showVenue(venueId);
          toast({
            title: 'Venue information displayed', 
            description: `Showing ${venueId}`,
          });
        }
      }
      
      // Future: Add other conference events as Python backend expands
      // - show_schedule, show_route, search_conference, etc.
      
    }, [showSpeaker, showVenue, toast])
  );

  return null;
};
```

### **Step 1.4b: Integrate with Existing Handlers (15 minutes)**
**CRITICAL**: Don't break existing function call implementations!

The conference handler must work **alongside** existing handlers:
- **WeatherHandler**: Already handles weather tool calls from Python
- **CTBTOHandler**: Already handles CTBTO agent calls from Python  
- **SimpleConferenceHandler**: NEW - handles conference UI updates

**Integration Notes:**
- All three handlers can coexist using the same `useDailyEvent('app-message')` pattern
- Different `event` types prevent conflicts (`weather_update` vs `show_speaker_info`)
- Python backend can send multiple event types in one response

### **Step 1.5: Simple InfoBulletin (45 minutes)**
**File**: `src/components/conference/SimpleInfoBulletin.tsx`
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimpleStore } from './useSimpleStore';

export const SimpleInfoBulletin = () => {
  const { currentPanel, currentSpeaker, currentVenue, resetToWelcome } = useSimpleStore();

  const renderContent = () => {
    switch (currentPanel) {
      case 'speaker':
        return currentSpeaker ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentSpeaker.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{currentSpeaker.title}</p>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p><strong>Session:</strong> {currentSpeaker.session.time}</p>
                <p><strong>Room:</strong> {currentSpeaker.session.room}</p>
              </div>
            </CardContent>
          </Card>
        ) : <div>No speaker data</div>;
      
      case 'venue':
        return currentVenue ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentVenue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={currentVenue.mapImage} alt="Venue map" className="w-full mb-4" />
              <div className="bg-green-50 p-3 rounded text-center">
                <p className="font-semibold">🚶‍♂️ {currentVenue.walkingTime} from kiosk</p>
              </div>
            </CardContent>
          </Card>
        ) : <div>No venue data</div>;
      
      default:
        return (
          <Card className="bg-blue-500 text-white">
            <CardHeader>
              <CardTitle>Welcome to CTBTO SnT 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ask Rosa about speakers, venues, or the conference!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Conference Info</h2>
        {currentPanel !== 'welcome' && (
          <Button onClick={resetToWelcome} size="sm" variant="outline">
            ← Back
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-4">
        {renderContent()}
      </div>
    </div>
  );
};
```

### **Step 1.6: Integrate with Main App (30 minutes)**
**File**: `src/App.tsx` (modify existing)
```typescript
// Add imports
import { SimpleConferenceHandler } from './components/conference/SimpleConferenceHandler';
import { SimpleInfoBulletin } from './components/conference/SimpleInfoBulletin';
import { Toaster } from "@/components/ui/toaster";

// Modify the call screen section to use RosaDemo.tsx grid pattern (lines 121-226)
{screen === 'call' && conversation && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Copy from RosaDemo.tsx line 124
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    {/* Left Panel - Rosa (existing) */}
    <div>
      <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />
      
      {/* Add simple handler */}
      <SimpleConferenceHandler />
      
      {/* Keep existing handlers */}
      <SimpleWeatherHandler conversationId={conversation.conversation_id} />
      <CTBTOHandler conversationId={conversation.conversation_id} />
    </div>
    
    {/* Right Panel - NEW */}
    <div style={{ borderLeft: '3px solid #3498db' }}>
      <SimpleInfoBulletin />
    </div>
  </div>
)}

<Toaster />
```

### **Step 1.7: Extend Existing Python Backend (30 minutes)**
**File**: `examples/cvi-ui-conversation/backend/Agent1.py` (MODIFY EXISTING)

**CRITICAL**: Extend the existing Agent1.py, don't create new files. Work with the current CTBTO agent implementation.

```python
# ADD these functions to the existing Agent1.py file
# Copy pattern from examples/cvi-frontend-backend-tools/functions.py lines 31-95

def show_speaker_info(speaker_name: str):
    """Display speaker information in the conference UI"""
    # Map speaker name to ID (hardcoded for Phase 1)
    speaker_map = {
        "dr chen": "dr-chen",
        "sarah chen": "dr-chen", 
        "prof martinez": "prof-martinez",
        "elena martinez": "prof-martinez"
    }
    
    speaker_id = speaker_map.get(speaker_name.lower())
    
    if speaker_id:
        app_message = {
            "event": "show_speaker_info",
            "data": {"speaker_id": speaker_id}
        }
        response = f"Here's information about {speaker_name} displayed on your screen."
        return app_message, response
    else:
        return None, f"I couldn't find speaker {speaker_name} in the conference directory."

def show_venue_info(venue_name: str):
    """Display venue information and navigation in the conference UI"""
    venue_map = {
        "main auditorium": "main-auditorium",
        "auditorium": "main-auditorium",
        "conference room a": "conference-room-a",
        "room a": "conference-room-a"
    }
    
    venue_id = venue_map.get(venue_name.lower())
    
    if venue_id:
        app_message = {
            "event": "show_venue_info", 
            "data": {"venue_id": venue_id}
        }
        response = f"Here's the location and walking directions for {venue_name}."
        return app_message, response
    else:
        return None, f"I couldn't find venue {venue_name} in the conference directory."

# ADD these to the existing CTBTOAgent class tool definitions
CONFERENCE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "show_speaker_info",
            "description": "Display speaker profile and session information in the conference interface",
            "parameters": {
                "type": "object",
                "properties": {
                    "speaker_name": {
                        "type": "string",
                        "description": "Name of the conference speaker to display information for"
                    }
                },
                "required": ["speaker_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_venue_info",
            "description": "Display venue information and navigation directions in the conference interface", 
            "parameters": {
                "type": "object",
                "properties": {
                    "venue_name": {
                        "type": "string",
                        "description": "Name of the conference venue/room to display information for"
                    }
                },
                "required": ["venue_name"]
            }
        }
    }
]

# MODIFY the existing CTBTOAgent to include these tools alongside existing CTBTO functionality
```

### **Step 1.7b: Update Tavus Persona Configuration (15 minutes)**
**File**: `src/api/createConversation.ts` (MODIFY EXISTING)

Add conference tools to the existing persona configuration:
```typescript
// ADD to existing system_prompt
"You also help with conference navigation and speaker information using your available tools."

// ADD to existing layers.llm.tools array (don't replace existing tools)
const conferenceTools = [
  // ... CONFERENCE_TOOLS from Agent1.py
];

// Merge with existing tools
layers: {
  llm: {
    model: "existing_model",
    tools: [...existingTools, ...conferenceTools], // Combine existing + new
    // ... other existing config
  }
}
```

**Expected Result**: User says "Tell me about Dr. Chen" → Python backend calls `show_speaker_info()` → UI shows speaker card on right panel

### **Step 1.8: Test Integration (15 minutes)**
**CRITICAL**: Verify new conference tools work alongside existing implementations

**Test Sequence:**
1. **Weather (existing)**: "What's the weather in Vienna?" → Weather data should still work
2. **CTBTO (existing)**: "What is the CTBTO?" → CTBTO response should still work  
3. **Speaker (new)**: "Tell me about Dr. Chen" → Speaker profile should appear on right panel
4. **Venue (new)**: "Where is the main auditorium?" → Venue map should appear on right panel
5. **Mixed**: "Tell me about the CTBTO and Dr. Chen" → Should handle both requests

**Debug Tips:**
- Check browser console for `🏛️ Conference event:` logs
- Verify all three handlers are loaded: WeatherHandler, CTBTOHandler, SimpleConferenceHandler
- Ensure Python backend includes both CTBTO and conference function definitions
- Tool call events should show different `event` types for different handlers

---

## 🚀 **Phase 2: Add Real Data & Maps (2-3 Days)**

### **Goal**: Replace hardcoded data with realistic conference data

### **Step 2.1: Real Speaker Data**
- Add 10-15 real speaker profiles
- Use actual conference session times
- Add speaker photos (or professional placeholders)

### **Step 2.2: Real Venue Maps**
- Create 10 venue map versions from kiosk location
- Add visual footstep paths on each map
- Use actual Hofburg Palace room layouts

### **Step 2.3: Enhanced UI Components**
- Better speaker profile layouts
- QR code placeholders
- Improved venue navigation display

---

## 🚀 **Phase 3: Full Production (1-2 Weeks)**

### **Goal**: Scale to 50+ speakers, modular architecture

### **Step 3.1: Data Architecture**
- Move to normalized data structure
- Add search functionality
- Implement data caching

### **Step 3.2: Component Modularity**
- Generic content renderers
- Template system for similar content types
- Reusable UI patterns

### **Step 3.3: Advanced Features**
- Schedule integration
- Weather display
- Multi-language support

### **Step 3.4: Database Integration**
- API-ready data layer
- Dynamic content loading
- Real-time updates

---

## 🎯 **Critical Success Factors**

### **✅ Start Simple**
- Prove the core concept works first
- Use hardcoded data initially
- Copy proven patterns exactly

### **✅ Build Incrementally**
- Each phase adds one major capability
- Always maintain working state
- Test thoroughly at each step

### **✅ Function Calling Architecture (CRITICAL)**
- **Use Python backend** for complex function calling, not native Tavus models
- **Extend existing Agent1.py** - don't create separate conference agent
- **Integrate with existing handlers** - Weather and CTBTO must continue working
- **Follow existing patterns** - `useDailyEvent('app-message')` with different event types
- **Tool definitions** - Add to existing Tavus persona configuration

### **✅ Reference Existing Code**
- WeatherHandler/CTBTOHandler patterns for function call handling
- Agent1.py for Python backend tool implementations
- Zustand store for state management (from ecommerce example)
- RosaDemo layout for split-screen
- ShadCN components for UI

### **✅ Plan for Scale**
- Design data structures for future expansion
- Keep components modular and reusable
- Plan API integration points early
- Maintain separation between existing and new function calls

---

## ⚠️ **Common Pitfalls to Avoid**

1. **Don't over-engineer Phase 1** - Keep it simple and working
2. **Don't skip the copy step** - Use proven patterns first
3. **Don't forget error handling** - What if speaker not found?
4. **Don't ignore performance** - Images and maps can be large
5. **Don't break existing Rosa functionality** - Additive changes only

---

## 📝 **Testing Strategy**

### **Phase 1 Tests:**
- User says "Tell me about Dr. Chen" → Speaker card appears
- User says "Where is the main auditorium" → Venue map appears  
- Back button returns to welcome screen
- Tool call failures show appropriate messages

### **Phase 2+ Tests:**
- All 10 venues load correctly
- Maps display proper footstep paths
- Speaker photos load efficiently
- Search finds correct speakers/venues

---

## 🔗 **Key File Locations**

**Reference these exact files when implementing:**

### **Function Calling (MUST INTEGRATE WITH EXISTING):**
- **Weather Handler**: `src/components/SimpleWeatherHandler.tsx` - Working function call integration
- **CTBTO Handler**: `src/components/CTBTOHandler.tsx` - Existing agent integration  
- **Python Backend**: `examples/cvi-ui-conversation/backend/Agent1.py` - EXTEND this file
- **Backend Pattern**: `examples/cvi-frontend-backend-tools/functions.py` - Copy return pattern
- **Persona Config**: `src/api/createConversation.ts` - ADD tools to existing config

### **UI Patterns:**
- **State Management**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/useStore.ts`
- **Split-Screen Layout**: `examples/cvi-ui-conversation/src/components/RosaDemo.tsx`
- **UI Components**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/components/ui/`
- **Tool Call Events**: `examples/cvi-frontend-backend-tools/hack-cvi-shop/src/components/AppMessageHandler/index.tsx`

### **Architecture Reference:**
- **Two-Service Pattern**: Weather integration (weather-server.js + WeatherHandler.tsx)
- **Event Structure**: `conversation.tool_call` events, `properties.speech` for utterances
- **Error Handling**: Graceful fallbacks when function calls fail

This approach gets you a **working proof of concept in 1-2 days**, then builds up systematically to the full production system! 