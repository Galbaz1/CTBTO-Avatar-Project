# Task: Preloaded Video Infrastructure

**Priority**: Independent System (Merge Second)  
**Estimated Time**: 45 minutes  
**Dependencies**: None (creates new files)

## Objective

Build video generation infrastructure for loading screen content using Tavus /v2/videos endpoint. This creates the foundation for seamless avatar transitions by pre-generating generic loading videos.

## Critical Files/Anchors

- @file/dev_docs/tavus.txt#search="/v2/videos"
- @file/dev_docs/tavus.txt#search="transparent_background" 
- @file/dev_docs/tavus.txt#search="Generate Video"
- @file/examples/cvi-ui-conversation/src/api/createConversation.ts (reference pattern only)

## Implementation Requirements

### 1. Create preloadAvatarContent.ts
Create new file: `examples/cvi-ui-conversation/src/api/preloadAvatarContent.ts`

**Required Functions:**
```typescript
export async function generateLoadingVideos(): Promise<VideoResponse[]>
export async function cacheLoadingVideo(videoUrl: string): Promise<void>
export async function getPreloadedVideo(scriptId: string): Promise<string>
```

### 2. Generic Loading Scripts
Implement these loading messages:
```typescript
const loadingScripts = [
  "Welcome to the CTBTO conference. I'm Rosa, preparing your session...",
  "Loading speaker information and venue details...", 
  "Connecting to conference systems...",
  "Your diplomatic assistant is ready. Let's begin."
];
```

### 3. Video Generation API Implementation
Use Tavus video generation as documented in:
- @file/dev_docs/tavus.txt#search="post /v2/videos" 
- Lines 396-440 contain video generation endpoint details

**Required Parameters:**
```typescript
{
  replica_id: "your-replica-id",
  script: script,
  transparent_background: true, // ✅ Works for videos
  fast: true, // Fast generation mode
  properties: {
    start_with_wave: false // Clean start
  }
}
```

### 4. Create videoCache.ts 
Create new file: `examples/cvi-ui-conversation/src/api/videoCache.ts`

**Cache Management:**
- Video URL caching with expiration
- Error handling and retry logic  
- Background preloading on app start

## Constraints

- **Create new files only** - no modifications to existing files
- No modifications to createConversation.ts or any UI components
- Use Tavus video generation API as documented in tavus.txt
- Implement proper error handling and caching
- Follow existing code patterns from the codebase

## Verification

- [ ] preloadAvatarContent.ts created with video generation functions
- [ ] videoCache.ts created with caching functionality
- [ ] Uses transparent_background: true for videos
- [ ] Implements fast: true for quick generation
- [ ] Error handling for failed video generation
- [ ] No existing files modified
- [ ] TypeScript types properly defined

## Expected Functionality

- Pre-generate 3-4 loading videos during app initialization
- Cache video URLs for instant playback
- Provide seamless content for Task 3 (transition component)
- Enable zero perceived latency through preloaded content 