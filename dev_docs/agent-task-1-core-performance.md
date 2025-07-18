# Task: Core Performance Configuration - Enable speculative_inference

**Priority**: Foundation (Merge First)  
**Estimated Time**: 30 minutes  
**Dependencies**: None

## Objective

Add critical performance flags to conversation creation without changing UI or other components. This implements the key optimization from Tavus documentation that provides dramatic speed improvements.

## Critical Files/Anchors

- @file/examples/cvi-ui-conversation/src/api/createConversation.ts#createConversation  
- @file/dev_docs/tavus.txt#search="speculative_inference"
- @file/dev_docs/tavus.txt#search="conversation properties" 
- @file/dev_docs/tavus.txt#search="max_call_duration"

## Implementation Requirements

### 1. Locate Current Configuration
Find the conversation creation in:
```
@file/examples/cvi-ui-conversation/src/api/createConversation.ts
```
Search for the POST request to `/v2/conversations`

### 2. Add Performance Properties  
Add these properties to the conversation creation request body:
```typescript
properties: {
  speculative_inference: true, // Key performance boost
  max_call_duration: 1800, // 30 minutes for conference sessions
  participant_left_timeout: 30 // Quick timeout for efficiency
}
```

### 3. Reference Documentation
The implementation should match the patterns described in:
- @file/dev_docs/tavus.txt#search="speculative_inference: true" 
- Lines 3450-3550 in tavus.txt contain the performance documentation

## Constraints

- **ONLY modify createConversation.ts** - no other files
- Preserve existing API interface completely
- Add performance flags as documented in tavus.txt
- No UI changes whatsoever
- Performance: must be <1ms additional overhead

## Verification

- [ ] speculative_inference: true added to properties
- [ ] max_call_duration: 1800 configured  
- [ ] participant_left_timeout: 30 configured
- [ ] Existing functionality unchanged
- [ ] TypeScript compilation successful
- [ ] No breaking changes to API interface

## Expected Performance Impact

- 30-50% improvement in conversation loading speed
- Reduced avatar warm-up time from 5-7 seconds to 2-3 seconds
- Foundation for subsequent optimization tasks 