# Rosa Pattern 1 Cleanup Plan - Remove Legacy Pattern 2 Code

> **Status**: Pattern 1 (Direct Custom LLM) is working perfectly ✅  
> **Branch**: `pattern1-direct-llm` - Future range, be rigorous ⚡  
> **Goal**: Remove ALL Pattern 2 infrastructure, integrate weather as Python function call  
> **Risk Level**: Very Low - We're on cleanup branch, can be aggressive

## 🎯 **Cleanup Summary**

With Rosa Pattern 1 working via direct custom LLM integration, we can aggressively remove:
- ❌ **ALL Function Call Handlers** (React components)
- ❌ **ALL Pattern 2 Backend Services** (Express servers, weather-server, ctbto-server)
- ❌ **ALL Tool Call Infrastructure** (persona patching, tools configuration)
- ❌ **ALL Legacy Scripts** (Pattern 2 startup scripts)
- ❌ **ALL Pattern 2 Documentation** (setup guides, configs)
- ✅ **INTEGRATE Weather as Python Function Call** (within Agent1.py, not external service)

## 🗂️ **Files Safe to Delete**

### **🚨 MASSIVE CLEANUP - Root Level & Other Examples**
```bash
# ROOT LEVEL - DELETE
ngrok.log                                                                        # Temporary file
.env.local                                                                       # Root env file (we use examples/cvi-ui-conversation/.env.local)

# OTHER EXAMPLES - DELETE ALL (8 directories!)
examples/cvi-frontend-backend-tools/                                             # Pattern 2 function calling e-commerce example
examples/replica-recording/                                                      # Not Rosa-related
examples/start-stop-recording/                                                   # Not Rosa-related
examples/cvi-ui-haircheck-conversation/                                          # Different UI pattern
examples/cvi-transparent-background/                                             # Different use case
examples/cvi-quickstart-react/                                                   # Basic example, not Rosa
examples/cvi-hover-over-website/                                                 # Different use case  
examples/cvi-custom-llm-with-backend/                                            # Was reference, no longer needed

# SHOWCASE - DELETE
showcase/santa-demo/                                                             # Marketing demo, not Rosa development

# DOCUMENTATION - DELETE AFTER CLEANUP
dev_docs/pattern1-migration-plan.md                                             # 600 lines - Historical migration doc
```

**Reason**: We only need `examples/cvi-ui-conversation/` for Rosa Pattern 1. Everything else is clutter.

## 🗂️ **Pattern 2 Files Within Rosa Project**

### **React Components - Function Call Handlers**
```bash
# Pattern 2 function calling React components - DELETE
examples/cvi-ui-conversation/src/components/CTBTOHandler.tsx                    # 228 lines - CTBTO function call handler
examples/cvi-ui-conversation/src/components/WeatherHandler.tsx                  # 287 lines - Weather function call handler  
examples/cvi-ui-conversation/src/components/SimpleWeatherHandler.tsx            # 124 lines - Simple weather handler
examples/cvi-ui-conversation/src/components/ConversationLogger.tsx              # 275 lines - Complex function call logging
```

**Reason**: Pattern 1 uses `SimpleConversationLogger.tsx` only. All function calling is handled by our backend now.

### **Backend Services - Pattern 2 Infrastructure**
```bash
# Pattern 2 backend services - DELETE ALL
examples/cvi-ui-conversation/backend/simple_api.py                              # 47 lines - Pattern 2 FastAPI bridge
examples/cvi-ui-conversation/backend/ctbto-server.cjs                           # 304 lines - Express CTBTO service  
examples/cvi-ui-conversation/weather-server.cjs                                 # 202 lines - Express weather service (EXTRACT weather logic first)
examples/cvi-ui-conversation/weather-package.json                               # 36 lines - Weather service config
```

**Reason**: Pattern 1 uses `rosa_pattern1_api.py` only. Weather functionality will be integrated as Python function call within Agent1.py.

### **API Configuration - Function Calling Tools**
```bash
# Pattern 2 function calling API - DELETE
examples/cvi-ui-conversation/src/api/createConversation.ts                      # 218 lines - Persona patching with tools
```

**Reason**: Pattern 1 uses `createConversation.pattern1.ts` which directly configures the custom LLM persona without tools.

### **Scripts - Pattern 2 Startup/Management**
```bash
# Pattern 2 startup scripts - DELETE
examples/cvi-ui-conversation/start-rosa.sh                                      # 22 lines - Pattern 2 weather + frontend
examples/cvi-ui-conversation/start-rosa-complete.sh                             # 61 lines - Pattern 2 all services
examples/cvi-ui-conversation/check-rosa-services.sh                             # 29 lines - Pattern 2 health checks
examples/cvi-ui-conversation/start-rosa-pattern1.sh                             # 51 lines - Outdated Pattern 1 backend only
examples/cvi-ui-conversation/start-rosa-pattern1-complete.sh                    # 158 lines - Outdated Pattern 1 without ngrok
```

**Reason**: Pattern 1 uses `start-rosa-with-ngrok.sh` and `start.py` only.

### **Documentation - Pattern 2 Specific**
```bash
# Pattern 2 documentation - DELETE
examples/cvi-ui-conversation/WEATHER_SETUP.md                                   # 222 lines - Weather service setup
examples/cvi-ui-conversation/ROSA_PERSONA_CONFIG.md                             # 147 lines - Function calling persona config
examples/cvi-ui-conversation/ROSA_QUICK_START.md                                # 68 lines - Pattern 1 without ngrok
examples/cvi-ui-conversation/backend/README.md                                  # 81 lines - Pattern 2 backend docs
```

**Reason**: Pattern 1 uses `ROSA_NGROK_QUICKSTART.md` and `ROSA_PATTERN1_README.md` only.

### **Utility Files - Pattern 2 Helpers**
```bash
# Pattern 2 utility files - DELETE
examples/cvi-ui-conversation/backend/test-agent.sh                              # 31 lines - Pattern 2 CTBTO testing
examples/cvi-ui-conversation/create-rosa-persona.py                             # 145 lines - One-time persona creation
examples/cvi-ui-conversation/rosa-pattern1-persona-id.txt                       # 2 lines - Persona ID storage
```

**Reason**: Persona is created and configured. Testing is done via ngrok tunnel now.

## 📝 **package.json Scripts Cleanup**

### **Remove These Scripts**
```json
{
  "scripts": {
    "weather": "node weather-server.cjs",                    // ❌ DELETE - Pattern 2 weather service
    "weather:test": "curl http://localhost:3001/api/weather/vienna",  // ❌ DELETE - Pattern 2 testing
    "weather:health": "curl http://localhost:3001/health",   // ❌ DELETE - Pattern 2 health check
    "rosa": "./start-rosa.sh",                               // ❌ DELETE - Pattern 2 startup
    "rosa:complete": "./start-rosa-complete.sh",             // ❌ DELETE - Pattern 2 all services
    "rosa:pattern1": "cd backend && ./venv/bin/python rosa_pattern1_api.py",  // ❌ DELETE - Manual backend only
    "rosa:pattern1:complete": "./start-rosa-pattern1-complete.sh",  // ❌ DELETE - Outdated Pattern 1
    "rosa:dev": "node weather-server.cjs & bun dev",        // ❌ DELETE - Pattern 2 dev mode
    "rosa:check": "./check-rosa-services.sh"                // ❌ DELETE - Pattern 2 health checks
  }
}
```

### **Keep These Scripts**
```json
{
  "scripts": {
    "dev": "vite",                                           // ✅ KEEP - Frontend dev server
    "build": "tsc && vite build",                            // ✅ KEEP - Production build
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",  // ✅ KEEP - Code quality
    "preview": "vite preview",                               // ✅ KEEP - Production preview
    "rosa:ngrok": "./start-rosa-with-ngrok.sh",             // ✅ KEEP - Pattern 1 with ngrok
    "start": "./start-rosa-with-ngrok.sh",                  // ✅ KEEP - One command startup
    "rosa:stop": "./stop-rosa.py"                           // ✅ KEEP - Graceful shutdown
  }
}
```

## 🔄 **Code Updates Required**

### **1. Integrate Weather Function Call in Agent1.py**
```python
# File: examples/cvi-ui-conversation/backend/Agent1.py
# ADD weather function call capability

import requests
from typing import Dict, Any

class CTBTOAgent:
    def __init__(self):
        # ... existing code ...
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
    
    def get_weather(self, location: str = "Vienna") -> Dict[str, Any]:
        """Get weather information for Rosa conversations"""
        # Extract weather logic from weather-server.cjs
        # Integrate directly into Agent1.py as function call
        pass
    
    def process_conversation_stream(self, messages: List[Dict]):
        # ... existing streaming code ...
        # Add weather tool calling if user asks about weather
        # Handle weather requests directly in streaming response
```

### **2. Update App.tsx - Remove ALL Pattern 2**
```typescript
// File: examples/cvi-ui-conversation/src/App.tsx

// ❌ REMOVE ALL these imports (Pattern 2)
import { SimpleWeatherHandler } from './components/SimpleWeatherHandler';
import { CTBTOHandler } from './components/CTBTOHandler';
import { WeatherHandler } from './components/WeatherHandler';
import { ConversationLogger } from './components/ConversationLogger';

// ✅ KEEP ONLY these imports (Pattern 1)
import { createConversation } from './api/createConversation.pattern1';
import { SimpleConversationLogger } from './components/SimpleConversationLogger';

// ❌ REMOVE ALL function call handler components from JSX
// ALL handlers deleted - weather is now handled in Python backend
```

## 🧪 **Validation Steps**

### **Before Cleanup** - Test Current Pattern 1
```bash
# 1. Verify Pattern 1 is working
./start-rosa-with-ngrok.sh
# Should show: "🎉 Rosa Pattern 1 with Ngrok - READY!"

# 2. Test conversation flow
# Visit http://localhost:3000, speak to Rosa, verify responses

# 3. Stop and confirm clean shutdown
# Ctrl+C should stop all services gracefully
```

### **During Cleanup** - Integrate Weather Function
```bash
# 1. Extract weather logic from weather-server.cjs
# 2. Integrate into Agent1.py as function call capability
# 3. Test weather requests through Rosa backend
# 4. Verify "What's the weather in Vienna?" works via Python
```

### **After Cleanup** - Verify Nothing Broke  
```bash
# 1. Start Rosa after cleanup
./start-rosa-with-ngrok.sh
# Should still work exactly the same

# 2. Check no broken imports
npm run lint
# Should pass without errors

# 3. Test full conversation flow again
# Should be identical to before cleanup
```

## ⚠️ **Important Notes**

### **Preserve These Files**
```bash
# Core Pattern 1 implementation - DO NOT DELETE
examples/cvi-ui-conversation/backend/rosa_pattern1_api.py                       # ✅ KEEP - Pattern 1 backend
examples/cvi-ui-conversation/backend/Agent1.py                                  # ✅ KEEP - CTBTO intelligence  
examples/cvi-ui-conversation/src/api/createConversation.pattern1.ts             # ✅ KEEP - Pattern 1 conversation
examples/cvi-ui-conversation/src/components/SimpleConversationLogger.tsx        # ✅ KEEP - Pattern 1 logging
examples/cvi-ui-conversation/start-rosa-with-ngrok.sh                           # ✅ KEEP - Pattern 1 startup
examples/cvi-ui-conversation/stop-rosa.py                                       # ✅ KEEP - Clean shutdown
examples/cvi-ui-conversation/start.py                                           # ✅ KEEP - Backend starter
examples/cvi-ui-conversation/ROSA_NGROK_QUICKSTART.md                           # ✅ KEEP - Current docs
examples/cvi-ui-conversation/ROSA_PATTERN1_README.md                            # ✅ KEEP - Technical docs
```

### **Git Strategy**
```bash
# Create cleanup branch for safety
git checkout -b pattern2-cleanup

# Remove files in batches
git rm examples/cvi-ui-conversation/src/components/CTBTOHandler.tsx
git rm examples/cvi-ui-conversation/src/components/WeatherHandler.tsx
git rm examples/cvi-ui-conversation/src/components/SimpleWeatherHandler.tsx
# ... etc

# Test after each batch
npm run lint && ./start-rosa-with-ngrok.sh

# Commit when verified working
git commit -m "Remove Pattern 2 function call handlers"
```

### **Environment Variables Cleanup**
```bash
# These can be removed from .env.local after cleanup:
CTBTO_SERVICE_PORT=3002               # ❌ Used by ctbto-server.cjs only  
WEATHER_SERVICE_PORT=3001             # ❌ Used by weather-server.cjs only

# These must be kept:
WEATHER_API_KEY=xxx                   # ✅ Now used by Agent1.py weather function call
NEXT_TAVUS_API_KEY=xxx                # ✅ Pattern 1 persona updates
ROSA_API_KEY=rosa-backend-key-2025    # ✅ Pattern 1 backend auth
OPENAI_API_KEY=xxx                    # ✅ Agent1.py intelligence
```

## 📊 **MASSIVE Cleanup Impact**

| Metric | Before Cleanup | After Cleanup | Improvement |
|--------|---------------|---------------|-------------|
| **Example Directories** | 9 examples | 1 example (Rosa only) | 89% reduction |
| **Total Project Files** | ~500+ files | ~50 files | 90% reduction |
| **Rosa Project Files** | ~45 files | ~15 files | 67% reduction |
| **Code Lines** | ~2,000+ lines | ~400 lines | 80% reduction |
| **Services** | 4+ services across examples | 1 service (Rosa FastAPI) | 75%+ simpler |
| **Scripts** | 20+ scripts across examples | 3 scripts (Rosa only) | 85% fewer |
| **Dependencies** | Express + FastAPI + Node + Python | FastAPI + Python only | Much simpler |
| **Startup Complexity** | Multiple example setups | Single Rosa command | Much easier |
| **Weather Integration** | External Express service | Python function call | Integrated |
| **Architecture** | Multiple patterns + examples | Pure Rosa Pattern 1 | Single focus |
| **Development Clarity** | Confusing multiple examples | Crystal clear Rosa focus | Much cleaner |

## 🎉 **Expected Results**

After MASSIVE cleanup:
- ✅ **Dramatically Simpler Repository**: 90% fewer files, single Rosa focus
- ✅ **Pure Rosa Pattern 1**: Only essential Rosa files, zero clutter
- ✅ **Integrated Weather**: Weather function calls directly in Python backend
- ✅ **Single Service**: FastAPI only, no Express dependencies
- ✅ **Single Example**: Only Rosa, no confusing multiple patterns
- ✅ **Same Functionality**: Rosa + CTBTO + Weather via integrated function calls
- ✅ **Better Performance**: No external service calls, all internal
- ✅ **Crystal Clear Development**: Zero confusion, laser focus on Rosa
- ✅ **Repository Clarity**: Developers see only what matters for Rosa

## 🚀 **Execution Order**

### **Phase 1: Weather Integration**
1. **Extract weather logic** from `weather-server.cjs` → integrate into `Agent1.py`
2. **Test weather function calls** through Rosa backend
3. **Verify** "What's the weather in Vienna?" works via Python backend

### **Phase 2: Rosa Project Cleanup**  
4. **Delete ALL Pattern 2 files** in Rosa project aggressively
5. **Update imports** and remove all handler references
6. **Clean package.json** scripts

### **Phase 3: MASSIVE Repository Cleanup**
7. **Delete ALL other example directories** (8 examples)
8. **Delete showcase** and marketing demos
9. **Delete root-level clutter** (ngrok.log, root .env.local)
10. **Delete historical documentation** (migration plan)

### **Phase 4: Verification**
11. **Verify single Rosa service** startup works perfectly
12. **Test complete Rosa functionality** (CTBTO + Weather)
13. **Confirm clean repository** with only essential files

---

**🗂️ REPOSITORY AFTER CLEANUP:**
```
tavus-examples/
├── dev_docs/
│   ├── rosa-pattern1-cleanup-plan.md    # ✅ This cleanup plan
│   ├── prd.md                          # ✅ Rosa requirements  
│   └── tavus.txt                       # ✅ Tavus API docs
├── examples/
│   └── cvi-ui-conversation/            # ✅ ONLY Rosa Pattern 1
└── LICENSE                             # ✅ Keep legal files
```

**⚡ Ready to execute MASSIVE cleanup - we're on `pattern1-direct-llm` branch, eliminate everything unnecessary!** 