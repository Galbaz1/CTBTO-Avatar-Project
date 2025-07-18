# Task: WebRTC Latency Optimization

**Priority**: Network Enhancement (Merge Fifth)  
**Estimated Time**: 35 minutes  
**Dependencies**: None (isolated hook optimization)

## Objective

Configure VP9 encoding and network preloading for sub-100ms response times by optimizing WebRTC settings for reduced conversation latency.

## Critical Files/Anchors

- @file/examples/cvi-ui-conversation/src/components/cvi/hooks/use-cvi-call.tsx#daily
- @file/dev_docs/tavus.txt#search="Daily.co"
- @file/examples/cvi-ui-conversation/src/components/SimpleWeatherHandler.tsx (reference pattern)
- @file/examples/cvi-ui-conversation/src/components/CTBTOHandler.tsx (reference pattern)

## Implementation Requirements

### 1. VP9 Encoder Configuration
Add VP9 encoding optimization to use-cvi-call.tsx:
```typescript
const optimizeWebRTCSettings = () => {
  daily.setVideoProcessor({
    codec: 'VP9', // Better compression than H.264
    maxBitrate: 2500000, // 2.5 Mbps for quality
    adaptiveBitrate: true
  });
};
```

### 2. Network Preloading
Implement early connection optimization:
```typescript
// Network preloading
daily.preAuth(); // Authenticate early
daily.load(); // Preload Daily.co resources
```

### 3. Regional Optimization
Add Vienna-specific configuration:
```typescript
const viennaOptimization = {
  primaryRegion: 'eu-central-1',
  fallbackRegions: ['eu-west-1', 'eu-north-1']
};
```

### 4. Reference Daily.co Integration
Follow existing patterns from:
- @file/examples/cvi-ui-conversation/src/components/cvi/hooks/use-cvi-call.tsx
- Daily.co usage in SimpleWeatherHandler.tsx

## Constraints

- **Only modify use-cvi-call.tsx hook**
- Preserve existing Daily.co integration completely
- Add VP9 encoder and network optimizations only
- No changes to component interfaces
- Must maintain backward compatibility
- Performance: target <100ms response time

## Verification

- [ ] VP9 encoder configuration added
- [ ] Network preloading implemented
- [ ] Regional optimization for Vienna configured
- [ ] Existing Daily.co functionality unchanged
- [ ] Hook interface preserved
- [ ] Backward compatibility maintained
- [ ] Error handling for unsupported features

## Expected Performance Impact

- **Sub-100ms latency** (inspired by Hopp achieving <100ms with VP9)
- **Better compression** with VP9 vs H.264
- **Faster connection establishment** through preloading
- **Optimized for Vienna region** for CTBTO conference 