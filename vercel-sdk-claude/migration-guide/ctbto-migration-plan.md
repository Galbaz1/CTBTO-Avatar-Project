# CTBTO-Avatar-Project Migration to Vercel AI SDK v5 & Tavus CVI

## Executive Summary

This migration plan addresses the critical issues identified in the current implementation and provides a step-by-step approach to transform the CTBTO-Avatar-Project from an interactive, polling-based system to a voice-first, AI-driven interface. This new architecture leverages the **Tavus Conversational Video Interface (CVI)** for real-time voice interaction and the **Vercel AI SDK v5** for generative UI and server-side LLM logic.

## Current State Analysis

### Critical Issues Identified

1. **Interactive Elements Violations**: 20+ instances of `onClick`, `hover`, and `scrollbar`.
2. **Polling Architecture Problems**: Inefficient 2-second polling causes network flooding and race conditions.
3. **Performance Issues**: Framer Motion + polling creates render storms on kiosk hardware.
4. **Accessibility Violations**: Non-compliant fonts, contrast ratios, and lack of ARIA support.

## Migration Strategy Overview

### Phase 1: Foundation Setup (Week 1-2)
- Install Vercel AI SDK v5 & Tavus CVI UI library
- Create voice-first tools architecture
- Setup SSE streaming endpoints
- Integrate Tavus `CVIProvider` and hooks

### Phase 2: Component Transformation (Week 3-4)
- Replace interactive cards with generative components
- Implement tool-based UI generation
- Remove all click handlers, scrolling, and hover states

### Phase 3: Voice Integration & Logic (Week 5-6)
- Connect Tavus `useObservableEvent` to Vercel's `useChat` hook
- Implement voice command processing logic
- Add accessibility improvements (ARIA, high contrast)

### Phase 4: Performance Optimization & Deployment (Week 7-8)
- Edge function deployment
- Kiosk hardware optimization
- Testing and validation

## Detailed Implementation Plan

### Phase 1: Foundation Setup

#### 1.1 Install Dependencies

```bash
# Remove old dependencies
npm uninstall framer-motion

# Install Vercel AI SDK v5
npm install ai @ai-sdk/react @ai-sdk/openai zod

# Install Tavus CVI UI Library
npx @tavus/cvi-ui@latest init
npm install @daily-co/daily-react @daily-co/daily-js jotai
```

#### 1.2 Create New Architecture Structure

```bash
mkdir -p src/ai/{tools,providers,hooks}
mkdir -p src/components/voice-first/{cards,layouts,core}
mkdir -p src/api/voice-chat
```

#### 1.3 Setup Core AI Tools

*This step remains the same as the previous plan, defining `conferenceTools` in `src/ai/tools/conference-tools.ts`.*

#### 1.4 Create Voice Chat API (Vercel)

*This step remains the same as the previous plan, creating the `/api/voice-chat/route.ts` Edge Function.*

### Phase 2: Component Transformation

#### 2.1 Replace Current Card System with Voice-First Components

**Before (Interactive):**
```typescript
const SessionCard = ({ session, onClick, onClose }) => (
  <motion.div whileHover="hover" onClick={() => onClick(session)}>
    {/* ... interactive content */}
  </motion.div>
);
```

**After (Voice-First & Accessible):**
```typescript
export const VoiceSessionCard = ({ sessions }: { sessions: SessionData[] }) => {
  return (
    <section role="region" aria-labelledby="sessions-heading">
      <h2 id="sessions-heading" className="text-3xl font-bold text-white mb-6">
        Conference Sessions
      </h2>
      {sessions.map((session, index) => (
        <article key={index} role="article" aria-labelledby={`session-${index}-title`} className="bg-gray-800 rounded-lg p-6">
          {/* ... semantic, non-interactive content */}
        </article>
      ))}
    </section>
  );
};
```
*This process is repeated for all card types (`SpeakerCard`, `WeatherCard`, etc.).*

#### 2.2 Create Component Renderer

*This step remains the same, creating `src/components/voice-first/MessageRenderer.tsx` to dynamically render the new voice-first cards based on the output from the Vercel AI SDK.*

### Phase 3: Voice Integration & Logic

#### 3.1 Implement Core Tavus CVI Wrapper

Create a new component `src/components/voice-first/core/TavusVoiceWrapper.tsx`:

```typescript
'use client';
import { CVIProvider } from '@/components/cvi/components/cvi-provider';
import { useCVICall, useObservableEvent, useSendAppMessage } from '@/components/cvi/hooks';
import { useEffect } from 'react';

interface TavusVoiceWrapperProps {
  conversationUrl: string;
  onUtterance: (text: string) => void;
  textToSpeak: string | null;
  children: React.ReactNode;
}

export function TavusVoiceWrapper({ conversationUrl, onUtterance, textToSpeak, children }: TavusVoiceWrapperProps) {
  const { joinCall, leaveCall } = useCVICall();
  const sendMessage = useSendAppMessage();

  useEffect(() => {
    if (conversationUrl) {
      joinCall({ url: conversationUrl });
    }
    return () => leaveCall();
  }, [conversationUrl, joinCall, leaveCall]);

  useObservableEvent((event) => {
    if (event.event_type === 'conversation.utterance' && event.properties.speech) {
      onUtterance(event.properties.speech);
    }
  });

  useEffect(() => {
    if (textToSpeak) {
      sendMessage({
        message_type: 'conversation',
        event_type: 'conversation.respond',
        properties: { text: textToSpeak },
      });
    }
  }, [textToSpeak, sendMessage]);

  return <CVIProvider>{children}</CVIProvider>;
}
```

#### 3.2 Replace Main Interface with Integrated Solution

**Replace current `RosaDemo.tsx` with a new `VoiceFirstKiosk.tsx`:**

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { MessageRenderer } from '@/components/voice-first/MessageRenderer';
import { TavusVoiceWrapper } from '@/components/voice-first/core/TavusVoiceWrapper';
import { useState, useEffect } from 'react';
import { createConversation } from '@/api/createConversation'; // Assumes API helper

export default function VoiceFirstKiosk() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [textToSpeak, setTextToSpeak] = useState<string | null>(null);

  const { messages, sendMessage, isLoading } = useChat({
    api: '/api/voice-chat',
    id: 'ctbto-kiosk',
    onFinish: (message) => {
      // Find the last text part from the assistant's response to speak
      const assistantResponse = message.parts.find(p => p.type === 'text');
      if (assistantResponse) {
        setTextToSpeak(assistantResponse.text);
      }
    }
  });

  useEffect(() => {
    // Create an audio-only Tavus conversation on component mount
    async function initConversation() {
      const url = await createConversation({ audio_only: true });
      setConversationUrl(url);
    }
    initConversation();
  }, []);

  const handleUtterance = (transcript: string) => {
    setTextToSpeak(null); // Clear previous TTS on new user input
    sendMessage({ text: transcript });
  };
  
  if (!conversationUrl) {
    return <div>Initializing Conversation...</div>;
  }

  return (
    <TavusVoiceWrapper
      conversationUrl={conversationUrl}
      onUtterance={handleUtterance}
      textToSpeak={textToSpeak}
    >
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        <div className="container mx-auto px-8 py-8 max-w-6xl">
          {/* ... Header and Welcome Message ... */}
          <div className="space-y-8">
            {messages.map(message => (
              <MessageRenderer key={message.id} message={message} />
            ))}
          </div>
        </div>
      </main>
    </TavusVoiceWrapper>
  );
}
```

### Phase 4: Performance Optimization & Deployment

*This phase remains the same, focusing on Edge Function configuration, bundle size optimization, and robust testing.*

## Testing Strategy (Updated)

### 1. Voice Interaction Testing
- Test with Tavus CVI for STT accuracy, turn-taking, and interruption handling.
- Verify seamless data flow from `useObservableEvent` to `useChat`.
- Confirm TTS playback is synchronized with UI updates.

### 2. Accessibility Testing
- Remains critical: Automated Axe tests and manual screen reader validation.

## Success Metrics

1.  **Voice-First Compliance**: 0 interactive elements (onClick, hover, scroll).
2.  **Performance**: <150ms from end of user speech to start of UI update and TTS response.
3.  **Accessibility**: WCAG AAA compliance.
4.  **Voice UX**: High STT accuracy and natural turn-taking via Tavus.

This revised migration plan provides a more robust and sophisticated architecture by correctly integrating the specialized Tavus CVI for voice processing, while leveraging the Vercel AI SDK for its powerful generative UI and serverless capabilities. This ensures a state-of-the-art voice-first experience. 