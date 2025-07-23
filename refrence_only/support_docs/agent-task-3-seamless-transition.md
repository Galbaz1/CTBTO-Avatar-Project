# Task: Seamless Transition Component

**Priority**: UI Enhancement (Merge Third)  
**Estimated Time**: 60 minutes  
**Dependencies**: Task 2 (preload infrastructure)

## Objective

Implement smooth transition logic between preloaded and live avatar without affecting existing split-screen layout. This creates the seamless user experience where loading is imperceptible.

## Critical Files/Anchors

- @file/examples/cvi-ui-conversation/src/components/RosaDemo.tsx#split-screen
- @file/examples/cvi-ui-conversation/src/api/preloadAvatarContent.ts (created in Task 2)
- @file/dev_docs/rosa-split-screen-simple-implementation.md
- @file/examples/cvi-ui-conversation/src/components/SimpleWeatherHandler.tsx (reference pattern)

## Implementation Requirements

### 1. Add Transition Hook
Create new custom hook in RosaDemo.tsx:
```typescript
const useSeamlessAvatarTransition = () => {
  const [phase, setPhase] = useState<'preloaded' | 'transitioning' | 'live'>('preloaded');
  const [preloadedVideoUrl, setPreloadedVideoUrl] = useState<string>();
  const [liveConversationReady, setLiveConversationReady] = useState(false);
  
  // Implementation details...
}
```

### 2. Background Loading Logic
Implement parallel loading:
- Start live conversation in background
- Play preloaded content in foreground
- Transition at natural speaking pause

### 3. Preserve Split-Screen Layout
**Critical**: Must maintain existing layout structure:
- @file/examples/cvi-ui-conversation/src/components/RosaDemo.tsx#search="split-screen"
- Left panel: Avatar (with transition logic)
- Right panel: Content (unchanged)

### 4. Integration Points
Reference existing patterns:
- Use Daily.co integration pattern from SimpleWeatherHandler.tsx
- Follow component structure from current RosaDemo.tsx
- Integrate with preloadAvatarContent.ts from Task 2

## Constraints

- **Preserve existing split-screen layout completely**
- Only add transition logic - no layout changes
- Use React hooks pattern from existing codebase  
- Maintain current green screen functionality
- Do not modify any other components
- Performance: transition must be <200ms

## Verification

- [ ] Transition logic added without breaking existing UI
- [ ] Split-screen layout unchanged
- [ ] Compatible with existing WebGL green screen
- [ ] Preloaded videos play seamlessly
- [ ] Live conversation starts in background
- [ ] Transition timing optimized for user experience
- [ ] No breaking changes to component interface

## Expected User Experience

- **Zero perceived loading time** - user sees avatar immediately
- **Seamless transition** - switch from preloaded to live is imperceptible  
- **Professional quality** - no blurriness or choppiness from first frame
- **Maintained functionality** - all existing features work unchanged 