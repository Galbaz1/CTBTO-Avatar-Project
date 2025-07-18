# Tavus Avatar Latency Optimization - Background Agent Task Index

*Parallel background agent execution plans designed for sequential merging with minimal conflicts*

## 🎯 **Task Execution Strategy**

**Parallel Execution**: All agents run simultaneously on separate branches
**Sequential Merge**: Merge in numerical order (1→2→3→4→5) to minimize conflicts
**File Isolation**: Each task targets different files/directories to prevent conflicts

---

## **Agent Task 1: Core Performance Configuration** 
**Priority**: Foundation (Merge First)
**Files**: `examples/cvi-ui-conversation/src/api/createConversation.ts`
**Estimated Time**: 30 minutes
**Dependencies**: None

### Task: Enable speculative_inference and optimize conversation properties

**Objective**: Add critical performance flags to conversation creation without changing UI or other components.

**Critical Files/Anchors**:
- @file/examples/cvi-ui-conversation/src/api/createConversation.ts#createConversation
- @file/dev_docs/tavus.txt#search="speculative_inference"
- @file/dev_docs/tavus.txt#search="conversation properties"

**Constraints**:
- Only modify createConversation.ts - no other files
- Preserve existing API interface
- Add performance flags as documented in tavus.txt
- No UI changes

**Verification**:
- speculative_inference: true added to properties
- max_call_duration and participant_left_timeout configured
- Existing functionality unchanged

---

## **Agent Task 2: Preloaded Video Infrastructure**
**Priority**: Independent System (Merge Second) 
**Files**: New files in `examples/cvi-ui-conversation/src/api/`
**Estimated Time**: 45 minutes
**Dependencies**: None (creates new files)

### Task: Create preloaded avatar video generation system

**Objective**: Build video generation infrastructure for loading screen content using Tavus /v2/videos endpoint.

**Critical Files/Anchors**:
- @file/dev_docs/tavus.txt#search="/v2/videos"
- @file/dev_docs/tavus.txt#search="transparent_background"
- @file/examples/cvi-ui-conversation/src/api/createConversation.ts (reference only - do not modify)

**Constraints**:
- Create new files only: preloadAvatarContent.ts, videoCache.ts
- No modifications to existing files
- Use Tavus video generation API as documented
- Implement caching and error handling

**Verification**:
- New files created with video generation functions
- No existing files modified
- API integration follows tavus.txt documentation

---

## **Agent Task 3: Seamless Transition Component**
**Priority**: UI Enhancement (Merge Third)
**Files**: `examples/cvi-ui-conversation/src/components/RosaDemo.tsx`
**Estimated Time**: 60 minutes  
**Dependencies**: Task 2 (preload infrastructure)

### Task: Implement seamless video transition in RosaDemo component

**Objective**: Add smooth transition logic between preloaded and live avatar without affecting existing split-screen layout.

**Critical Files/Anchors**:
- @file/examples/cvi-ui-conversation/src/components/RosaDemo.tsx#split-screen
- @file/examples/cvi-ui-conversation/src/api/preloadAvatarContent.ts (created in Task 2)
- @file/dev_docs/rosa-split-screen-simple-implementation.md

**Constraints**:
- Preserve existing split-screen layout completely
- Only add transition logic, no layout changes
- Use React hooks pattern from existing codebase
- Maintain current green screen functionality

**Verification**:
- Transition logic added without breaking existing UI
- Split-screen layout unchanged
- Compatible with existing WebGL green screen

---

## **Agent Task 4: Green Screen Optimization** 
**Priority**: Performance Enhancement (Merge Fourth)
**Files**: `examples/cvi-ui-conversation/src/components/cvi/components/webgl-green-screen-video/`
**Estimated Time**: 40 minutes
**Dependencies**: None (isolated optimization)

### Task: Optimize WebGL green screen performance for faster rendering

**Objective**: Enhance GPU processing and chroma key parameters for better real-time performance.

**Critical Files/Anchors**:
- @file/examples/cvi-ui-conversation/src/components/cvi/components/webgl-green-screen-video/index.tsx
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="WebGL optimization"
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="chroma key parameters"

**Constraints**:
- Only modify WebGL green screen components
- Preserve existing API and functionality  
- Focus on performance optimizations only
- No breaking changes to component interface

**Verification**:
- Optimized chroma key parameters applied
- WebGPU fallback implemented where supported
- Existing functionality preserved

---

## **Agent Task 5: WebRTC Latency Optimization**
**Priority**: Network Enhancement (Merge Fifth)
**Files**: `examples/cvi-ui-conversation/src/components/cvi/hooks/use-cvi-call.tsx`
**Estimated Time**: 35 minutes
**Dependencies**: None (isolated hook optimization)

### Task: Optimize WebRTC settings for reduced conversation latency

**Objective**: Configure VP9 encoding and network preloading for sub-100ms response times.

**Critical Files/Anchors**:
- @file/examples/cvi-ui-conversation/src/components/cvi/hooks/use-cvi-call.tsx#daily
- @file/dev_docs/tavus.txt#search="Daily.co"
- @file/examples/cvi-ui-conversation/src/components/SimpleWeatherHandler.tsx (reference pattern)

**Constraints**:
- Only modify use-cvi-call.tsx hook
- Preserve existing Daily.co integration
- Add VP9 encoder and network optimizations only
- No changes to component interfaces

**Verification**:
- VP9 encoder configuration added
- Network preloading implemented
- Existing Daily.co functionality unchanged

---

## **Agent Task 6: Performance Monitoring System**
**Priority**: Observability (Merge Last)
**Files**: New files in `examples/cvi-ui-conversation/src/utils/`
**Estimated Time**: 30 minutes
**Dependencies**: All previous tasks (monitors their performance)

### Task: Create performance monitoring and metrics collection

**Objective**: Build monitoring system to track avatar loading times and transition performance.

**Critical Files/Anchors**:
- @file/examples/cvi-ui-conversation/src/utils/logger.ts (reference pattern)
- Create new: performanceMonitoring.ts, latencyMetrics.ts

**Constraints**:
- Create new files only - no modifications to existing code
- Use existing logger.ts pattern for consistency
- Implement non-intrusive monitoring
- Export metrics for analysis

**Verification**:
- Performance monitoring utilities created
- Metrics collection implemented
- No impact on existing functionality

---

## 🔄 **Merge Strategy**

1. **Task 1** (Foundation) → Creates performance base
2. **Task 2** (Infrastructure) → Adds video generation (no conflicts)
3. **Task 3** (UI) → Uses Task 2 infrastructure
4. **Task 4** (WebGL) → Isolated component optimization  
5. **Task 5** (WebRTC) → Isolated hook optimization
6. **Task 6** (Monitoring) → Observes all previous improvements

Each task works on different files/directories, ensuring clean sequential merges with minimal conflicts. 