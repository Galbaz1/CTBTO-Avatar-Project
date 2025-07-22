# 🏗️ Rosa Backend Refactor Plan: Self-Contained Split Screen + Green Screen

## 📋 **Objective**
Port advanced frontend features (split screen, green screen removal, generative UI) from the `backend-refactor` branch into our `Rosa_custom_backend` folder, while maintaining our custom backend approach and avoiding external dependencies.

## 🎯 **Priority Features to Port**

### **Phase 1: Split Screen Layout** ⚡ *High Priority*
- **Source**: `examples/cvi-ui-conversation/src/components/RosaDemo.tsx` (469 lines)
- **Target**: `Rosa_custom_backend/src/components/RosaDemo.tsx`
- **Features**:
  - Grid-based split screen layout (left: avatar, right: dynamic content)
  - Professional styling with backdrop blur and animations
  - Dynamic content switching (speaker profiles, conference info, QR codes)
  - Responsive design with proper CSS modules

### **Phase 2: Green Screen Removal** ⚡ *High Priority*
- **Source**: `examples/cvi-ui-conversation/src/components/cvi/components/webgl-green-screen-video/`
- **Target**: `Rosa_custom_backend/src/components/cvi/components/webgl-green-screen-video/`
- **Features**:
  - WebGL-based real-time chroma key processing
  - OBS Studio algorithm implementation
  - Configurable parameters (similarity, smoothness, spill)
  - Debug mode for troubleshooting

### **Phase 3: Advanced Components** 🔥 *Medium Priority*
- **Green Screen Debugger**: Real-time parameter tuning
- **Speaker Management**: Profile cards, lists, conference data
- **Generative UI**: Dynamic content generation based on function calls

## 🗂️ **Current State Analysis**

### **Rosa_custom_backend Has:**
✅ Basic CVI components (conversation, audio-wave, device-select, hair-check)  
✅ Custom backend with Agent1.py (CTBTO intelligence)  
✅ Pattern 1 function calling setup  
✅ Working startup scripts (python3 compatible)  
✅ SimpleConversationLogger  

### **Missing (Available on backend-refactor):**
❌ Split screen layout  
❌ WebGL green screen removal  
❌ Advanced speaker/conference components  
❌ Green screen debugging tools  
❌ Dynamic content switching  

## 📦 **Components to Port**

### **Critical Components**
```
examples/cvi-ui-conversation/src/components/
├── RosaDemo.tsx                    # 469 lines - Split screen layout ⚡
├── cvi/components/
│   └── webgl-green-screen-video/   # 387 lines - Green screen removal ⚡
├── GreenScreenDebugger.tsx         # 254 lines - Debug tools
├── SpeakerHandler.tsx              # 230 lines - Conference speakers
├── SpeakerProfile.tsx              # 255 lines - Speaker cards
├── SpeakerList.tsx                 # 268 lines - Speaker management
├── ConferencePlannerHandler.tsx    # 157 lines - Conference logic
└── PersonalizedAgenda.tsx          # 326 lines - Agenda generation
```

### **Supporting Components**
```
├── ManualParameterControls.tsx     # 206 lines - Green screen tuning
├── ParameterTester.tsx             # 191 lines - Parameter testing
├── ui/                            # Reusable UI components
└── conference/                    # Conference-specific components
```

## 🚀 **Implementation Strategy**

### **Step 1: Prepare Rosa_custom_backend Structure**
```bash
Rosa_custom_backend/src/
├── components/
│   ├── RosaDemo.tsx               # 🆕 Split screen main component
│   ├── cvi/components/
│   │   ├── webgl-green-screen-video/  # 🆕 Green screen removal
│   │   └── (existing components...)
│   ├── ui/                        # 🆕 Reusable UI components
│   ├── conference/                # 🆕 Conference-specific components
│   └── debug/                     # 🆕 Debug and testing tools
├── hooks/                         # 🆕 Custom hooks for new features
├── utils/                         # 🆕 Utilities for green screen, etc.
└── styles/                        # 🆕 CSS modules for new components
```

### **Step 2: Port Core Components (Self-Contained)**
1. **Copy webgl-green-screen-video component**
   - Ensure no external dependencies beyond @daily-co/daily-react
   - Keep all WebGL shaders embedded in the component
   
2. **Copy RosaDemo.tsx as main layout**
   - Update imports to use our Rosa_custom_backend structure
   - Integrate with our existing CVIProvider
   - Connect to our custom backend function calls

3. **Copy green screen debugger tools**
   - ManualParameterControls, ParameterTester, GreenScreenDebugger
   - Self-contained parameter tuning interface

### **Step 3: Conference Components Integration**
1. **Speaker Management System**
   - SpeakerHandler, SpeakerProfile, SpeakerList
   - Connect to our Agent1.py backend for speaker data
   - Use our existing function calling patterns

2. **Dynamic Content System**
   - PersonalizedAgenda, ConferencePlannerHandler
   - Integrate with our rosa_pattern1_api.py

### **Step 4: Backend Integration**
1. **Update Agent1.py**
   - Add speaker profile functions
   - Add conference agenda functions
   - Add green screen parameter functions

2. **Update rosa_pattern1_api.py**
   - Add endpoints for conference data
   - Add endpoints for speaker management
   - Maintain Pattern 1 compatibility

## 🔧 **Technical Requirements**

### **Dependencies (Must Stay Minimal)**
- Keep existing: `@daily-co/daily-react`, `@tavus/cvi-ui`
- No additional npm packages
- Self-contained WebGL implementation
- CSS modules for styling (no external CSS frameworks)

### **Backend Compatibility**
- Maintain Agent1.py custom LLM integration
- Keep rosa_pattern1_api.py FastAPI structure
- Preserve existing function calling patterns
- Add new functions without breaking existing ones

### **Performance Targets**
- WebGL green screen: 60fps minimum
- Split screen responsive design: <100ms layout updates
- Component switching: <200ms transitions
- Memory efficient: Clean up WebGL contexts

## 📋 **Development Checklist**

### **Phase 1: Split Screen** (Week 1)
- [ ] Copy RosaDemo.tsx to Rosa_custom_backend
- [ ] Update imports and dependencies
- [ ] Test basic split screen layout
- [ ] Integrate with existing CVIProvider
- [ ] Update App.tsx to use RosaDemo

### **Phase 2: Green Screen** (Week 1-2)  
- [ ] Copy webgl-green-screen-video component
- [ ] Copy green screen debugger tools
- [ ] Test WebGL chroma key processing
- [ ] Integrate with conversation component
- [ ] Add parameter controls

### **Phase 3: Conference Components** (Week 2-3)
- [ ] Copy speaker management components
- [ ] Copy conference planner components
- [ ] Update backend Agent1.py with new functions
- [ ] Test function calling integration
- [ ] Add conference data endpoints

### **Phase 4: Polish & Testing** (Week 3-4)
- [ ] Optimize WebGL performance
- [ ] Add error handling
- [ ] Test all function calls
- [ ] Update documentation
- [ ] Performance testing

## 📁 **File Structure After Refactor**

```
Rosa_custom_backend/
├── backend/
│   ├── Agent1.py                  # ✅ Enhanced with conference functions
│   └── rosa_pattern1_api.py       # ✅ Enhanced with new endpoints
├── src/
│   ├── components/
│   │   ├── RosaDemo.tsx           # 🆕 Split screen main layout
│   │   ├── cvi/components/
│   │   │   ├── webgl-green-screen-video/  # 🆕 Green screen removal
│   │   │   └── (existing...)
│   │   ├── conference/            # 🆕 Conference components
│   │   │   ├── SpeakerHandler.tsx
│   │   │   ├── SpeakerProfile.tsx
│   │   │   └── ConferencePlanner.tsx
│   │   ├── debug/                 # 🆕 Debug tools
│   │   │   ├── GreenScreenDebugger.tsx
│   │   │   └── ParameterControls.tsx
│   │   └── ui/                    # 🆕 Reusable UI
│   ├── hooks/                     # 🆕 Custom hooks
│   ├── utils/                     # 🆕 Utilities
│   └── App.tsx                    # ✅ Updated to use RosaDemo
├── start-rosa-with-ngrok.sh       # ✅ Working
└── start.py                       # ✅ Working
```

## 🎯 **Success Criteria**

1. **Split Screen Working**: Avatar on left, dynamic content on right
2. **Green Screen Removal**: Real-time WebGL chroma key processing
3. **Self-Contained**: No dependencies outside Rosa_custom_backend folder
4. **Backend Compatible**: Works with our Agent1.py custom backend
5. **Performance**: 60fps green screen, <200ms UI responses
6. **Function Calling**: Seamless integration with rosa_pattern1_api.py

## 🚨 **Anti-Patterns to Avoid**

- ❌ **No external service dependencies** (weather APIs, etc.)
- ❌ **No native Tavus model usage** (stick to our custom backend)
- ❌ **No files outside Rosa_custom_backend/** (self-contained)
- ❌ **No breaking existing function calls** (backward compatibility)
- ❌ **No performance regressions** (maintain current speed)

## 🏁 **Getting Started**

1. **Start with RosaDemo.tsx** - Copy and adapt the split screen layout
2. **Add green screen next** - Port the WebGL video component  
3. **Test incrementally** - Each component should work in isolation
4. **Integrate gradually** - Connect to our existing backend functions
5. **Polish and optimize** - Performance and error handling

This plan keeps Rosa completely self-contained while bringing in the best features from the advanced branch. All work stays within `Rosa_custom_backend/` with our custom backend approach. 