# Voice-First AI System Architecture
## CTBTO-Avatar-Project with Vercel AI SDK v5 and Tavus CVI

## System Overview

This document outlines the complete system architecture for transforming the CTBTO-Avatar-Project from an interactive, polling-based interface to a voice-first, AI-driven system. This architecture leverages the **Tavus Conversational Video Interface (CVI)** for real-time voice interaction and the **Vercel AI SDK v5** for generative UI and server-side LLM logic.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Voice-First React Components                                  │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │    Tavus CVI Hooks   │  │  MessageRenderer + Tool Cards   │  │
│  │ (useObservableEvent) │  │  (AI-Generated Components)     │  │
│  └──────────┬──────────┘  └───────────────┬─────────────────┘  │
│             │                              │                    │
│             │ (User Utterance)             │ (Render UI)        │
│             └─────────────┐                │                    │
│                           ▼                │                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              useChat Hook (Vercel AI SDK)                │  │
│  │   Manages Generative UI State & SSE Message Streaming   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/SSE (to Vercel AI SDK Backend)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Edge Runtime Layer (Vercel)                │
├─────────────────────────────────────────────────────────────────┤
│  Vercel Edge Functions                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              /api/voice-chat/route.ts                    │  │
│  │                                                         │  │
│  │  streamText({ model, tools, messages })                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Tool Execution
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AI Tools Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Conference-Specific Tools (Zod Validated)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│
│  │ showSpeaker  │ │ showSession  │ │ showVenueNavigation      ││
│  └──────────────┘ └──────────────┘ └──────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Data Queries
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Integration Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  Existing CTBTO Backend Systems (Weaviate RAG, Conf. Data)     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Voice-First Client Layer

#### Tavus CVI Integration
The client will be wrapped in a `CVIProvider` from `@tavus/cvi-ui`. The core voice interaction will be managed by Tavus hooks, not a manual MediaRecorder implementation.

```typescript
// Key Tavus Hooks
interface TavusIntegration {
  // Manages the WebRTC connection for the audio-only conversation
  useCVICall: () => { joinCall, leaveCall }

  // Listens for real-time events from the Tavus pipeline
  useObservableEvent: (callback: (event: TavusEvent) => void) => void

  // Sends messages back to the Tavus pipeline (e.g., for TTS)
  useSendAppMessage: () => (message: AppMessage) => void
}
```
**Key Features:**
- **Advanced STT**: Utilizes Tavus's "Sparrow" engine with smart turn detection and interruption handling.
- **Real-time Events**: Granular events like `conversation.utterance` and `replica.started_speaking` provide precise control.
- **Managed Connection**: Tavus (via Daily) handles the entire WebRTC lifecycle for robust audio streaming.

#### Vercel AI SDK Integration (`useChat`)
The `useChat` hook remains the central piece for managing the *generative UI* state. It communicates with our Vercel-hosted backend.

**Synergy between Tavus and Vercel AI SDK:**
1.  `useObservableEvent` captures a `conversation.utterance` event from Tavus.
2.  The utterance text is passed to `useChat`'s `sendMessage` function.
3.  `useChat` sends the message to the `/api/voice-chat` endpoint.
4.  The backend streams back UI components, which are stored in `useChat`'s `messages` state.
5.  `MessageRenderer` displays the generative UI based on the `messages` state.
6.  The text response from the LLM is sent back to the Tavus pipeline via `useSendAppMessage` for synchronized TTS playback.

### 2. Edge Runtime Layer (Vercel)

This layer remains unchanged from the previous architecture. It is responsible for:
- Receiving transcribed text from the client.
- Using `streamText` to interact with an LLM and our custom tools.
- Streaming `UIMessage` parts back to the client over an SSE connection.

### 3. AI Tools Architecture

This layer also remains unchanged. It defines the specific functions the LLM can call, which are backed by our existing Weaviate RAG system and other conference data sources.

**Key Tavus-aware Enhancement:**
- Tools can be enhanced to consider emotional context provided by the Tavus Perception layer (Raven), allowing for more empathetic and adaptive responses.

### 4. Data Integration Layer

This layer is unchanged and will be queried by the AI Tools running on the Edge.

## Data Flow Architecture

### Voice Command to Generative UI Flow (Revised)

```
User Voice Input
      ↓
Tavus CVI (WebRTC Audio Stream)
      ↓
Tavus STT Engine ("Sparrow")
      ↓
Client: useObservableEvent receives 'conversation.utterance'
      ↓
Client: useChat.sendMessage(utterance.text)
      ↓
Vercel Edge: /api/voice-chat receives request
      ↓
Vercel Edge: streamText() calls LLM + Tools
      ↓
Backend: Weaviate RAG queries
      ↓
Vercel Edge: Generates structured response (UI components + text)
      ↓
Client: useChat receives SSE stream of UI parts
      ↓
Client: MessageRenderer displays generative UI
      ↓
Client: useSendAppMessage sends text to Tavus for TTS playback
      ↓
Tavus TTS Engine
      ↓
User hears synthesized voice response
```

This revised architecture creates a powerful, decoupled system where Tavus excels at real-time voice processing and conversation management, while the Vercel AI SDK excels at server-side AI logic and streaming the resulting generative UI to the client. This approach is more robust, scalable, and leverages the best features of both platforms. 