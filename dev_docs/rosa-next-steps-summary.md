# Rosa Implementation Status & Next Steps
*Current State + Speaker System Plan*

## ✅ **WHAT'S WORKING NOW**

### **Split-Screen UI** 
- **File**: `src/components/RosaDemo.tsx`
- **Status**: ✅ Complete - Rosa avatar (left) + content tabs (right)
- **Features**: Professional welcome panel, navigation tabs, responsive layout

### **Function Calling Architecture**
- **Backend**: `backend/Agent1.py` - Python with OpenAI Responses API ✅
- **Weather Integration**: `src/components/SimpleWeatherHandler.tsx` ✅ 
- **CTBTO Integration**: `src/components/CTBTOHandler.tsx` ✅
- **Pattern**: `useDailyEvent('app-message')` → Backend API → UI update ✅

### **Proven Patterns**
- **Event Handling**: `conversation.tool_call` events working ✅
- **State Management**: Zustand store patterns available ✅
- **UI Components**: Modern card layouts implemented ✅
- **Backend APIs**: FastAPI structure in place ✅

---

## 🎯 **NEXT: SPEAKER SYSTEM** 

### **Goal**: AI-Powered Speaker Discovery
Rosa answers: *"Are there any speakers for seismic monitoring?"* 
→ Shows relevant speaker profiles with session details

### **Implementation Strategy**: Copy Proven Patterns
1. **Data Structure**: Follow `Agent1.py` pattern for speaker metadata
2. **Backend Extension**: Add speaker functions to existing `CTBTOAgent` class  
3. **Frontend Handler**: Copy `CTBTOHandler.tsx` pattern exactly
4. **UI Components**: Copy modernized welcome panel styling
5. **Integration**: Add to existing `RosaDemo.tsx` content tabs

---

## 📁 **KEY FILES TO EXTEND**

### **Backend Extensions**
- `backend/Agent1.py` → Add speaker search functions (lines 90-120)
- `backend/simple_api.py` → Add `/api/speakers/*` endpoints  
- `backend/speakers_data.py` → New file with 5 speaker profiles

### **Frontend Extensions**  
- `src/components/SpeakerHandler.tsx` → New (copy CTBTOHandler pattern)
- `src/components/conference/SpeakerProfile.tsx` → New (copy welcome panel style)
- `src/components/RosaDemo.tsx` → Extend contentData object (lines 15-80)
- `src/App.tsx` → Add SpeakerHandler to component tree

### **No Breaking Changes**
- Weather and CTBTO handlers continue working unchanged
- Current UI navigation remains intact  
- Backend Agent1.py extended, not replaced
- All existing function calls preserved

---

## 🚀 **3-DAY IMPLEMENTATION PLAN**

### **Day 1: Backend Foundation**
```bash
cd examples/cvi-ui-conversation/backend
# Create speakers_data.py with 5 CTBTO speaker profiles
# Extend Agent1.py with speaker search functions
# Add FastAPI endpoints to simple_api.py
# Test: python Agent1.py (speaker functions work)
```

### **Day 2: Frontend Integration** 
```bash
cd examples/cvi-ui-conversation/src
# Create SpeakerHandler.tsx (copy CTBTOHandler pattern)
# Create conference/SpeakerProfile.tsx (copy welcome panel style)  
# Extend RosaDemo.tsx contentData with speaker tab
# Test: UI shows speaker profiles correctly
```

### **Day 3: Function Calling**
```bash
# Add SpeakerHandler to App.tsx component tree
# Test Rosa queries: "Show me nuclear experts"
# Verify: useDailyEvent → Backend → UI update flow
# Polish: QR code placeholders, navigation
```

---

## 🧪 **TESTING APPROACH**

### **Backend Testing**
```python
# Test speaker search in Agent1.py
agent = CTBTOAgent()
result = agent.find_speakers_by_topic("seismic monitoring")
print(result)  # Should return Dr. Sarah Chen + others
```

### **Function Call Testing**  
Ask Rosa:
- *"Tell me about nuclear verification experts"*
- *"Who's speaking about radionuclide detection?"*  
- *"Show me Dr. Sarah Chen's profile"*

Expected: Speaker profile appears in right panel within 200ms

### **UI Testing**
- Speaker cards display professionally ✅
- Navigation between welcome ↔ speaker works ✅  
- QR code placeholders show ✅
- Mobile-responsive layout ✅

---

## 🎯 **SUCCESS CRITERIA**

### **Technical Success**
- [ ] 5 unique speakers with rich AI metadata
- [ ] Topic-based speaker search works via function calls
- [ ] No breaking changes to existing weather/CTBTO systems
- [ ] Professional UI matching conference standards

### **User Experience Success**  
- [ ] Rosa intelligently matches user queries to speakers
- [ ] Smooth transitions between content types
- [ ] Sub-200ms response times maintained
- [ ] QR code integration ready for mobile

### **Architecture Success**
- [ ] Proven patterns reused exactly (CTBTOHandler → SpeakerHandler)  
- [ ] Zustand state management follows existing patterns
- [ ] Backend scalable for database migration
- [ ] Function calling architecture remains clean

---

## 🔄 **BEYOND SPEAKER SYSTEM**

Once speaker system proves the pattern works:

### **Phase 3: Venue System**  
- Interactive room maps using existing `assets/hofburg-plan.jpg`
- Navigation hints: "Main Auditorium is 2 minutes from here"
- QR codes for mobile venue details

### **Phase 4: Database Migration**
- Move from hardcoded speaker data to database
- Real-time session updates  
- Multi-language support (6 UN languages)

### **Phase 5: Full Conference System**
- 50+ speakers, 20+ sessions, 10+ venues
- Live schedule updates
- Diplomatic-grade compliance (sub-200ms, 99.9% uptime)

---

## 🎨 **VISUAL PREVIEW**

Current UI: **Welcome Panel** (left) + **Rosa Avatar** (right)  
After Speaker System: **Welcome/Speaker/Venue/Weather Tabs** + **Rosa Avatar**

Speaker Profile Card Layout:
```
┌─────────────────────────────────────────┐
│ 👤 Dr. Sarah Chen                       │
│    Lead Nuclear Verification Scientist  │
│    CTBTO Preparatory Commission         │
│                                         │
│ 📅 Session: Main Auditorium             │
│    09:30 - 10:15                        │
│    "Advanced Seismic Analysis..."       │
│                                         │
│ 📖 Dr. Chen is a leading expert in...   │
│                                         │
│ 📱 [QR Code for Mobile Details]         │
└─────────────────────────────────────────┘
```

**Result**: Rosa can intelligently surface speaker expertise based on natural language queries, with professional diplomatic-grade UI presentation. 