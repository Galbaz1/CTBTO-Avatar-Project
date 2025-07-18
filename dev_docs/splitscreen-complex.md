# Rosa Split-Screen Generative UI Implementation Plan

*A step-by-step guide for implementing dynamic conference UI components that respond to Rosa's tool calls.*

## 🎯 Project Overview

**Objective**: Implement a split-screen interface where Rosa (with transparent background) appears on the left, and dynamic conference information appears on the right panel based on Python backend tool calls.

**Current Status**: ✅ WebGL transparent background working (production-ready OBS algorithms)  
**Next Phase**: Build the right-panel generative UI system

---

## 📋 Prerequisites & Current Architecture

### ✅ What's Already Working
- **WebGL Transparent Rosa**: `src/components/cvi/components/webgl-green-screen-video/index.tsx` (PRODUCTION READY)
- **Split-screen Layout**: `src/components/RosaDemo.tsx` (reference implementation)
- **Tool Call System**: `src/components/CTBTOHandler.tsx` 
- **Asset Pipeline**: Vite + TypeScript in `examples/cvi-ui-conversation/`
- **Conference Assets**: `src/assets/hofburg-plan.jpg` (venue map example)
- **Parameter Testing**: Advanced debugging tools with `GreenScreenDebugger.tsx`

### ⚠️ Critical Constraints
- **DO NOT modify** the existing Rosa video components unless explicitly needed
- **DO NOT change** the Tavus API configuration in `src/api/createConversation.ts`
- **DO NOT break** the existing tool call mechanism in CTBTOHandler
- **DO NOT add** complex state management libraries (Zustand, Redux, etc.)

---

## 🏗️ Implementation Strategy: Static React Components (Option 1)

### Why This Approach?
- **Fixed Conference Data**: CTBTO SnT 2025 venue and speakers are predetermined
- **Performance**: No database calls during conversation
- **Reliability**: Components always available offline
- **Simplicity**: Leverages existing Vite + React 19 + TypeScript + WebGL setup

---

## 📁 File Structure Plan

```
src/
├── components/
│   ├── conference/                     # ← NEW: Conference UI components
│   │   ├── InfoBulletin.tsx           # ← Main container component
│   │   ├── hooks/                     # ← NEW: Custom hooks (React best practice)
│   │   │   └── useToolCallHandler.tsx # ← Tool call state management
│   │   ├── panels/                    # ← Individual panel components
│   │   │   ├── VenueMap.tsx           
│   │   │   ├── SpeakerProfile.tsx     
│   │   │   ├── WeatherWidget.tsx      
│   │   │   ├── WalkingDirections.tsx  
│   │   │   ├── ConferenceSchedule.tsx 
│   │   │   ├── WelcomePanel.tsx
│   │   │   └── ErrorPanel.tsx         # ← NEW: Error handling
│   │   ├── types/                     # ← TypeScript interfaces
│   │   │   └── conference.ts          
│   │   └── data/                      # ← Static conference data
│   │       ├── venues.ts              
│   │       ├── speakers.ts            
│   │       └── schedule.ts            
│   ├── cvi/                           # ← EXISTING: Don't modify
│   └── RosaDemo.tsx                   # ← EXISTING: Reference only
├── assets/                            # ← EXISTING: Add new assets here
│   ├── conference/                    # ← NEW: Conference assets
│   │   ├── venue-maps/                
│   │   ├── speaker-photos/            
│   │   ├── room-photos/               
│   │   └── icons/                     
│   └── hofburg-plan.jpg               # ← EXISTING: Don't move
```

---

## 🎯 Step-by-Step Implementation

### Phase 1: Core Infrastructure

#### Step 1.1: Create TypeScript Interfaces
**File**: `src/components/conference/types/conference.ts`

```typescript
// Base interfaces for conference data
export interface VenueInfo {
  id: string;
  name: string;
  description: string;
  mapImage: string;
  roomPhoto?: string;
  walkingTimeMinutes: number;
  amenities: string[];
  capacity?: number;
}

export interface SpeakerInfo {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  photo: string;
  presentation: {
    title: string;
    time: string;
    room: string;
  };
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  feelsLike: number;
  windSpeed: number;
}

export interface UIState {
  currentPanel: 'welcome' | 'venue' | 'speaker' | 'weather' | 'walking' | 'schedule';
  data: VenueInfo | SpeakerInfo | WeatherInfo | null;
  timestamp: number;
  error: string | null; // Error handling for tool call failures
}

export interface ToolCallResponse {
  action: string;
  panel: UIState['currentPanel'];
  data: any;
}
```

#### Step 1.2: Create Static Conference Data
**File**: `src/components/conference/data/venues.ts`

```typescript
import { VenueInfo } from '../types/conference';
import hofburgPlan from '@/assets/hofburg-plan.jpg';

export const CTBTO_VENUES: Record<string, VenueInfo> = {
  'main-auditorium': {
    id: 'main-auditorium',
    name: 'Vienna International Centre - Main Auditorium',
    description: 'Primary conference venue for CTBTO SnT 2025',
    mapImage: hofburgPlan, // Use existing asset
    walkingTimeMinutes: 2,
    amenities: ['🎤 Microphone system', '📽️ Large projector', '☕ Coffee station nearby'],
    capacity: 500
  },
  'conference-room-a': {
    id: 'conference-room-a',
    name: 'Conference Room A',
    description: 'Breakout sessions and technical presentations',
    mapImage: hofburgPlan,
    walkingTimeMinutes: 3,
    amenities: ['🎤 Wireless mic', '💻 Presentation system', '🪑 Round table seating'],
    capacity: 50
  }
  // Add more venues as needed
};
```

**⚠️ CRITICAL: Use existing assets first** - Don't add new images until you confirm the data structure works.

#### Step 1.3: Create Welcome Panel (Simplest First)
**File**: `src/components/conference/panels/WelcomePanel.tsx`

```typescript
import React from 'react';

export const WelcomePanel: React.FC = () => {
  return (
    <div className="welcome-panel">
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
          🌹 Welcome to CTBTO SnT 2025
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Comprehensive Nuclear-Test-Ban Treaty Organization<br/>
          Science and Technology Conference
        </p>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          <p>📍 Vienna International Centre</p>
          <p>🗣️ Ask Rosa about speakers, venues, or Vienna weather</p>
        </div>
      </div>
    </div>
  );
};
```

### Phase 2: Core InfoBulletin Component

#### Step 2.1: Create Custom Hook for Tool Call Management
**File**: `src/components/conference/hooks/useToolCallHandler.tsx`

```typescript
import { useReducer, useCallback } from 'react';
import { UIState, ToolCallResponse } from '../types/conference';

// Modern React pattern: useReducer for complex state logic
function uiStateReducer(state: UIState, action: ToolCallResponse): UIState {
  switch (action.action) {
    case 'show_venue':
      return {
        currentPanel: 'venue',
        data: action.data,
        timestamp: Date.now(),
        error: null
      };
    case 'show_speaker':
      return {
        currentPanel: 'speaker', 
        data: action.data,
        timestamp: Date.now(),
        error: null
      };
    case 'show_weather':
      return {
        currentPanel: 'weather',
        data: action.data, 
        timestamp: Date.now(),
        error: null
      };
    case 'reset':
      return {
        currentPanel: 'welcome',
        data: null,
        timestamp: Date.now(),
        error: null
      };
    case 'error':
      return {
        ...state,
        error: action.data.message,
        timestamp: Date.now()
      };
    default:
      console.warn('Unknown tool call action:', action.action);
      return state;
  }
}

const initialUIState: UIState = {
  currentPanel: 'welcome',
  data: null,
  timestamp: Date.now(),
  error: null
};

export function useToolCallHandler(conversationId?: string) {
  const [uiState, dispatch] = useReducer(uiStateReducer, initialUIState);

  const handleToolCall = useCallback((toolCall: ToolCallResponse) => {
    console.log('🎛️ Tool call received:', toolCall);
    
    try {
      dispatch(toolCall);
    } catch (error) {
      console.error('Error handling tool call:', error);
      dispatch({
        action: 'error',
        panel: 'welcome',
        data: { message: 'Failed to process request' }
      });
    }
  }, []);

  const resetToWelcome = useCallback(() => {
    dispatch({
      action: 'reset',
      panel: 'welcome', 
      data: null
    });
  }, []);

  return {
    uiState,
    handleToolCall,
    resetToWelcome
  };
}
```

#### Step 2.2: Create Main InfoBulletin Container  
**File**: `src/components/conference/InfoBulletin.tsx`

```typescript
'use client';

import React, { memo } from 'react';
import { useToolCallHandler } from './hooks/useToolCallHandler';
import { WelcomePanel } from './panels/WelcomePanel';
import { VenueMap } from './panels/VenueMap';
import { SpeakerProfile } from './panels/SpeakerProfile';
import { WeatherWidget } from './panels/WeatherWidget';
import { ErrorPanel } from './panels/ErrorPanel';

interface InfoBulletinProps {
  conversationId?: string;
}

export const InfoBulletin: React.FC<InfoBulletinProps> = ({ conversationId }) => {
  const { uiState, resetToWelcome } = useToolCallHandler(conversationId);

  // Error handling with proper fallback
  if (uiState.error) {
    return (
      <div className="info-bulletin error-state" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff'
      }}>
        <ErrorPanel 
          error={uiState.error} 
          onRetry={resetToWelcome}
        />
      </div>
    );
  }

  // Render appropriate panel based on current state
  const renderCurrentPanel = () => {
    switch (uiState.currentPanel) {
      case 'venue':
        return <VenueMapMemo venueData={uiState.data} />;
      case 'speaker':
        return <SpeakerProfileMemo speakerData={uiState.data} />;
      case 'weather':
        return <WeatherWidgetMemo weatherData={uiState.data} />;
      case 'welcome':
      default:
        return <WelcomePanelMemo />;
    }
  };

  return (
    <div className="info-bulletin" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #ecf0f1',
        background: '#ffffff'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#2c3e50', 
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📋 Conference Information
          {uiState.currentPanel !== 'welcome' && (
            <button
              onClick={resetToWelcome}
              style={{
                padding: '4px 8px',
                background: '#ecf0f1',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          )}
        </h2>
      </div>

      {/* Dynamic Content Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        {renderCurrentPanel()}
      </div>

      {/* Footer */}
      <div style={{
        padding: '15px 20px',
        background: '#f8f9fa',
        borderTop: '1px solid #ecf0f1',
        fontSize: '12px',
        color: '#7f8c8d',
        textAlign: 'center'
      }}>
        CTBTO Science & Technology Conference 2025 • Vienna International Centre
      </div>
    </div>
  );
};

// Performance optimization: Memoize panel components to prevent unnecessary re-renders
const WelcomePanelMemo = memo(WelcomePanel);
const VenueMapMemo = memo(VenueMap);
const SpeakerProfileMemo = memo(SpeakerProfile);  
const WeatherWidgetMemo = memo(WeatherWidget);
```

#### Step 2.3: Create Error Handling Panel
**File**: `src/components/conference/panels/ErrorPanel.tsx`

```typescript
import React from 'react';

interface ErrorPanelProps {
  error: string;
  onRetry: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onRetry }) => {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      background: '#fee',
      borderRadius: '12px',
      border: '1px solid #fcc',
      margin: '20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
      <h2 style={{ color: '#c53030', marginBottom: '16px' }}>
        Oops! Something went wrong
      </h2>
      <p style={{ color: '#744210', marginBottom: '24px', fontSize: '16px' }}>
        {error || 'Failed to load conference information'}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: '12px 24px',
          background: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        🔄 Try Again
      </button>
      <div style={{
        marginTop: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        Or ask Rosa to help you navigate the conference
      </div>
    </div>
  );
};
```

#### Step 2.4: Create Basic Venue Panel
**File**: `src/components/conference/panels/VenueMap.tsx`

```typescript
import React from 'react';
import { VenueInfo } from '../types/conference';

interface VenueMapProps {
  venueData: VenueInfo | null;
}

export const VenueMap: React.FC<VenueMapProps> = ({ venueData }) => {
  if (!venueData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No venue information available</p>
      </div>
    );
  }

  return (
    <div className="venue-map-panel">
      <div style={{
        background: '#e8f5e8',
        borderRadius: '12px',
        padding: '20px',
        minHeight: '400px'
      }}>
        <h3 style={{ marginTop: 0, color: '#2d5a2d' }}>
          {venueData.name}
        </h3>
        
        {/* Venue Map */}
        <div style={{
          background: '#fff',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <img 
            src={venueData.mapImage} 
            alt={venueData.name}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Walking Directions */}
        <div style={{
          background: '#d4edda',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#155724', 
            textAlign: 'center', 
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            🚶‍♂️ {venueData.walkingTimeMinutes} minutes from your location
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h4 style={{ color: '#2d5a2d' }}>Available Facilities:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {venueData.amenities.map((amenity, index) => (
              <span
                key={index}
                style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px'
                }}
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Phase 3: Integration with Existing Tool Call System

#### Step 3.1: Modify Existing CTBTOHandler
**File**: `src/components/CTBTOHandler.tsx` (MODIFY EXISTING)

**⚠️ CRITICAL**: Only add the InfoBulletin integration, don't break existing functionality.

```typescript
// ADD this import to the existing file
import { InfoBulletin } from './conference/InfoBulletin';

// ADD this state to the existing CTBTOHandler component
const [infoUIState, setInfoUIState] = useState<any>(null);

// MODIFY the existing handleAppMessage function to include:
const handleToolCall = (toolCall: any) => {
  // ... existing CTBTO logic ...
  
  // ADD: Check for UI update tool calls
  if (toolCall.name === 'show_venue_info') {
    setInfoUIState({
      action: 'show_venue',
      panel: 'venue',
      data: {
        id: toolCall.arguments.venue_id,
        name: toolCall.arguments.venue_name,
        walkingTimeMinutes: toolCall.arguments.walking_time || 2,
        // Map to your venue data structure
      }
    });
  }
  
  if (toolCall.name === 'show_speaker_info') {
    setInfoUIState({
      action: 'show_speaker', 
      panel: 'speaker',
      data: {
        name: toolCall.arguments.speaker_name,
        // Map to your speaker data structure
      }
    });
  }
};
```

#### Step 3.2: Integrate InfoBulletin into Main Layout
**File**: `src/App.tsx` (MODIFY EXISTING)

**⚠️ CRITICAL**: Reference RosaDemo.tsx for the correct split-screen layout pattern.

```typescript
// ADD import
import { InfoBulletin } from './components/conference/InfoBulletin';

// MODIFY the existing JSX where Conversation is rendered:
{screen === 'call' && conversation && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 50/50 split like RosaDemo
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    {/* Left Panel - Rosa with existing components */}
    <div style={{ position: 'relative' }}>
      <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />
      {/* Keep existing handlers */}
      <SimpleWeatherHandler 
        conversationId={conversation.conversation_id}
        onWeatherUpdate={(weather: any) => {
          console.log('🌤️ Weather update received in App:', weather);
        }} 
      />
      <CTBTOHandler
        conversationId={conversation.conversation_id}
        onCTBTOUpdate={(ctbtoData: any) => {
          console.log('🏛️ CTBTO update received in App:', ctbtoData);
        }}
        onSpeakerUpdate={(speakerData: any) => {
          console.log('👤 Speaker update received in App:', speakerData);
        }}
      />
      <SimpleConversationLogger 
        conversationId={conversation.conversation_id}
        enabled={true}
      />
    </div>
    
    {/* Right Panel - NEW InfoBulletin */}
    <div style={{ borderLeft: '3px solid #3498db' }}>
      <InfoBulletin conversationId={conversation.conversation_id} />
    </div>
  </div>
)}
```

---

## 🚀 Modern React Patterns (Context7 Insights)

### **Key Improvements Based on Latest React Best Practices**

#### 1. **useReducer for Complex State Logic**
The Context7 research revealed that `useReducer` is preferred over `useState` for complex state management like our InfoBulletin:

**✅ Recommended Pattern:**
```typescript
// Better than multiple useState calls
const [uiState, dispatch] = useReducer(uiStateReducer, initialState);

// Clear action-based updates
dispatch({ action: 'show_venue', data: venueData });
```

**❌ Avoid:**
```typescript
// Don't use multiple useState for related state
const [currentPanel, setCurrentPanel] = useState('welcome');
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

#### 2. **Custom Hooks for Reusable Logic**
Extract tool call handling into custom hooks following React best practices:

**✅ Modern Pattern:**
```typescript
// Custom hook encapsulates all tool call logic
const { uiState, handleToolCall, resetToWelcome } = useToolCallHandler(conversationId);
```

#### 3. **React.memo for Performance**
Memoize panel components to prevent unnecessary re-renders:

**✅ Performance Optimization:**
```typescript
const VenueMapMemo = memo(VenueMap);
const SpeakerProfileMemo = memo(SpeakerProfile);
```

#### 4. **Error Boundaries and Proper Error Handling**
Include robust error handling patterns from React 19:

**✅ Error Handling:**
```typescript
// Proper error state management
case 'error':
  return { ...state, error: action.data.message };
```

#### 5. **useCallback for Stable References**
Use `useCallback` for event handlers passed to child components:

**✅ Stable References:**
```typescript
const resetToWelcome = useCallback(() => {
  dispatch({ action: 'reset', panel: 'welcome', data: null });
}, []);
```

### **React 19 Features to Consider**

#### **useActionState (if applicable)**
For form-based tool call handling, consider the new `useActionState` hook:

```typescript
// Potential future enhancement for tool call actions
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    // Handle tool call action
    return newState;
  },
  initialState
);
```

#### **Server Components Integration**
If future expansion includes server-side rendering:
- Static conference data can be Server Components
- Dynamic UI panels remain Client Components with `'use client'`

---

## ⚡ Vite Optimization Insights (Context7 Research)

### **Asset Optimization for Conference UI**

#### 1. **Smart Asset Inlining**
Configure `build.assetsInlineLimit` for conference assets:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 8192, // 8KB threshold (increased from default 4KB)
    rollupOptions: {
      output: {
        assetFileNames: 'assets/conference/[name]-[hash][extname]'
      }
    }
  }
});
```

**Why:** Small venue icons and speaker photos (<8KB) get inlined as base64, reducing HTTP requests.

#### 2. **Conference Asset Preloading** 
Leverage Vite's automatic `<link rel="modulepreload">` generation:

```typescript
// Assets referenced in components get automatic preload directives
import hofburgPlan from '@/assets/hofburg-plan.jpg';
import speakerPhoto from '@/assets/speakers/dr-chen.jpg';
```

#### 3. **Dynamic Asset Loading Optimization**
For dynamic venue/speaker images:

```typescript
// Optimized pattern for dynamic assets
function getConferenceAsset(type: 'venue' | 'speaker', id: string) {
  return new URL(`./assets/conference/${type}/${id}.jpg`, import.meta.url).href;
}
```

### **Development Performance**

#### 1. **Warmup Frequently Used Components** 
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/conference/InfoBulletin.tsx',
        './src/components/conference/panels/VenueMap.tsx',
        './src/components/conference/panels/SpeakerProfile.tsx'
      ]
    }
  }
});
```

#### 2. **Dependency Optimization for Rosa**
```typescript
// vite.config.ts  
export default defineConfig({
  optimizeDeps: {
    include: [
      '@daily-co/daily-react',
      '@daily-co/daily-js',
      'react',
      'react-dom'
    ],
    // Force re-bundling if needed during development
    force: process.env.NODE_ENV === 'development'
  }
});
```

### **TypeScript Integration**

#### 1. **Enhanced TypeScript Performance**
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

#### 2. **Asset Type Definitions**
```typescript
// vite-env.d.ts
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;  
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_TAVUS_API_KEY: string;
  readonly VITE_DAILY_API_KEY: string;
}
```

### **Production Build Optimization**

#### 1. **Conference Bundle Splitting**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'conference-ui': [
            './src/components/conference/InfoBulletin.tsx',
            './src/components/conference/panels/VenueMap.tsx',
            './src/components/conference/panels/SpeakerProfile.tsx'
          ],
          'cvi-core': [
            './src/components/cvi/components/conversation/index.tsx',
            './src/components/cvi/components/webgl-green-screen-video/index.tsx'
          ]
        }
      }
    }
  }
});
```

#### 2. **Asset Manifest for Backend Integration**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    manifest: true, // Generates .vite/manifest.json
    assetsDir: 'conference-assets'
  }
});
```

### **Development vs Production Modes**

```typescript
// vite.config.ts - Environment-aware configuration
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  
  return {
    define: {
      __DEV__: isDev,
      __CONFERENCE_DEBUG__: mode === 'development'
    },
    build: {
      sourcemap: isDev ? true : false,
      minify: isDev ? false : 'esbuild'
    }
  };
});
```

### **Performance Monitoring**
```bash
# Profile build performance
bun run build --profile

# Analyze bundle size
npx vite-bundle-analyzer
```

---

## ⚠️ Critical Implementation Warnings

### 🚫 What NOT to Do

1. **DO NOT modify Rosa video components** 
   - Don't touch `webgl-green-screen-video/index.tsx` (production-ready WebGL)
   - Don't modify `conversation/index.tsx` 
   - Don't change WebGL transparent background logic

2. **DO NOT add complex state management**
   - No Redux, Zustand, or similar libraries
   - Use simple useState in InfoBulletin
   - Don't create global state stores

3. **DO NOT break existing tool calls**
   - CTBTOHandler must continue working for weather/CTBTO data
   - Only ADD new tool call handling, don't modify existing

4. **DO NOT add database calls**
   - Conference data should be static TypeScript objects
   - No API calls during conversation
   - No external data fetching

5. **DO NOT modify Tavus API configuration**
   - Don't touch `src/api/createConversation.ts`
   - Don't change `apply_greenscreen: true` setting
   - Don't modify conversation properties

6. **DO NOT add new dependencies**
   - Work with existing Vite + React 19 + TypeScript setup
   - Don't add UI libraries (Material-UI, Chakra, etc.)
   - Use inline styles initially

### ✅ What TO Do

1. **Follow existing patterns**
   - Use RosaDemo.tsx as layout reference
   - Follow CTBTOHandler.tsx for tool call patterns
   - Use existing asset structure

2. **Build incrementally**
   - Start with WelcomePanel only
   - Add one panel type at a time
   - Test each step before proceeding

3. **Use TypeScript properly**
   - Define interfaces first
   - Type all props and state
   - Leverage existing type checking

4. **Handle errors gracefully**
   - Always check for null/undefined data
   - Provide fallback content
   - Log errors clearly

---

## 🧪 Testing Strategy

### Phase Testing
1. **Phase 1**: InfoBulletin shows WelcomePanel only
2. **Phase 2**: Can manually switch between panels
3. **Phase 3**: Tool calls trigger panel changes

### Manual Testing Checklist
- [ ] Split-screen layout works (50/50)
- [ ] Rosa video still shows with transparency
- [ ] InfoBulletin renders without errors
- [ ] Can switch between different panels
- [ ] Images load correctly
- [ ] Responsive design works
- [ ] No console errors

### Debug Tools
- Use existing Green Screen Debugger
- Console.log tool call data
- React DevTools for component state

---

## 📚 Reference Files

### Existing Code to Study
- `src/components/RosaDemo.tsx` - Split-screen layout pattern
- `src/components/CTBTOHandler.tsx` - Tool call handling pattern
- `src/components/cvi/components/conversation/index.tsx` - Component structure
- `src/assets/hofburg-plan.jpg` - Asset usage example

### Existing Systems to Preserve  
- WebGL transparent background system (production-ready)
- Tool call mechanism (CTBTOHandler, WeatherHandler)
- Asset pipeline (Vite + TypeScript)
- React 19 component patterns

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- ✅ Split-screen layout with Rosa (left) + InfoBulletin (right)
- ✅ Modern React patterns: useReducer + custom hooks
- ✅ Static conference data displays correctly
- ✅ At least 3 panel types working (welcome, venue, speaker)
- ✅ Python tool calls trigger UI changes
- ✅ Error handling with graceful fallbacks
- ✅ No breaking changes to existing Rosa functionality

### Full Implementation
- ✅ All 6 panel types implemented with React.memo optimization
- ✅ Smooth transitions between panels using useCallback
- ✅ Comprehensive conference data with TypeScript safety
- ✅ Robust error handling and retry mechanisms
- ✅ Performance optimization (memoization, stable references)
- ✅ Mobile-responsive design
- ✅ Modern React 19 patterns throughout codebase
- ✅ Production-ready WebGL green screen with OBS Studio algorithms

---

## 🚀 Deployment Notes

### Build Process
```bash
# Development testing
bun dev

# Production build
bun run build

# Preview production build
bun run preview
```

### File Size Considerations
- Conference images should be optimized (<500KB each)
- Total component bundle should be <2MB
- Vite will automatically optimize assets

### Browser Compatibility
- WebGL support required (already implemented and working)
- InfoBulletin uses standard React patterns
- No additional browser requirements beyond existing WebGL

---

*This implementation plan ensures the Rosa split-screen generative UI integrates seamlessly with the existing production-ready WebGL transparent background system while providing a robust foundation for conference information display.* 