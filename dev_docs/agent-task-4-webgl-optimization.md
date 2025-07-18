# Task: Green Screen WebGL Optimization

**Priority**: Performance Enhancement (Merge Fourth)  
**Estimated Time**: 40 minutes  
**Dependencies**: None (isolated optimization)

## Objective

Optimize WebGL green screen performance for faster rendering by enhancing GPU processing and chroma key parameters for better real-time performance.

## Critical Files/Anchors

- @file/examples/cvi-ui-conversation/src/components/cvi/components/webgl-green-screen-video/index.tsx
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="WebGL optimization"
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="chroma key parameters"
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="GPU-accelerated processing"

## Implementation Requirements

### 1. Optimize Chroma Key Parameters
Update performance settings in WebGL component:
```typescript
const chromaKeyOptimization = {
  threshold: 0.4, // Balanced for speed vs quality
  smoothing: 0.1,  // Minimal for performance
  spillSuppression: 0.8 // Good balance
};
```

### 2. Add WebGPU Fallback
Implement modern GPU API support:
```typescript
const preferredAPI = 'webgpu' in navigator ? 'webgpu' : 'webgl2';
```

### 3. Performance Monitoring
Add frame rate optimization:
- Target 60fps for smooth rendering
- Optimize shader compilation
- Reduce GPU memory usage

### 4. Reference Implementation
Follow patterns from:
- @file/dev_docs/rosa-green-screen-transparency-guide.md#search="real-time performance"
- Current WebGL implementation in webgl-green-screen-video/index.tsx

## Constraints

- **Only modify WebGL green screen components**
- Preserve existing API and functionality completely
- Focus on performance optimizations only  
- No breaking changes to component interface
- Must maintain transparency quality
- Performance: target <16ms per frame (60fps)

## Verification

- [ ] Optimized chroma key parameters applied
- [ ] WebGPU fallback implemented where supported
- [ ] Existing functionality preserved
- [ ] Frame rate improved (target 60fps)
- [ ] GPU memory usage optimized
- [ ] No breaking changes to transparency API
- [ ] Cross-browser compatibility maintained

## Expected Performance Impact

- **~1.5fps boost** in greenscreen mode (as documented in Tavus improvements)
- **Reduced GPU memory usage** through optimized shaders
- **Better real-time performance** for live avatar rendering
- **Improved transparency quality** with optimized parameters 