# Comprehensive Research on Tavus CVI: Hooks, Daily.co Integration, and Audio-Only Configuration

## Introduction

The Tavus Conversational Video Interface (CVI) is an advanced platform enabling real-time, multimodal interactions with AI-driven digital human replicas. It leverages WebRTC via Daily.co for video and audio streaming, integrating deeply with React applications through a suite of hooks and components. This report delves into key aspects of Tavus CVI, focusing on the `useObservableEvent` and `useSendAppMessage` hooks, Daily.co WebRTC integration, and audio-only mode configuration.

## 1. Core CVI Hooks: useObservableEvent and useSendAppMessage

Tavus CVI provides two crucial hooks for managing conversation events and messaging:

**useObservableEvent** listens for CVI app messages, mapping Daily.co `app-message` events to typed CVI interactions. It enables developers to register callbacks for various conversation events, including utterances, tool invocations, and speaking status changes. The hook signature and usage are as follows:

```js
import { useObservableEvent } from '@tavus/cvi-ui';

useObservableEvent((event) => {
  switch (event.type) {
    case 'utterance':
      // handle user or replica utterance
      break;
    case 'tool_call':
      // handle tool invocation
      break;
    // additional event types...
  }
});
```

Purpose:
- Listens for CVI app messages from the Daily.co call mapped to defined event types
- Provides type-safe handling of interactions, ensuring developers receive correctly structured event objects

Parameters:
- `callback`: Function invoked with each incoming event ([Tavus Docs](https://docs.tavus.io/sections/conversational-video-interface/component-library/hooks)).

**useSendAppMessage** returns a function to send messages conforming to the Tavus Interactions Protocol. This hook abstracts the complexity of constructing validated message payloads and dispatching them via Daily.co's `app-message` channel.

```js
import { useSendAppMessage } from '@tavus/cvi-ui';

const sendAppMessage = useSendAppMessage();

sendAppMessage({
  type: 'respond',
  content: 'Hello, how can I assist you today?'
});
```

Purpose:
- Sends conversation messages such as `echo`, `respond`, `interrupt`, and context updates
- Ensures type safety and validation of message structure

Return Value:
- Function with signature `(message: SendAppMessageProps) => void`, where `SendAppMessageProps` includes all supported interaction types and associated metadata ([Tavus Docs](https://docs.tavus.io/sections/conversational-video-interface/component-library/hooks)).

## 2. Daily.co WebRTC Integration in CVI

Tavus CVI builds on Daily.co’s prebuilt video SDK (`@daily-co/daily-js`) to handle real-time media streams. Integration points include:

### 2.1 CVIProvider Component
The `CVIProvider` component wraps the React application, supplying the Daily.co context required by CVI hooks and components:

```js
import { CVIProvider } from '@tavus/cvi-ui';

function App() {
  return (
    <CVIProvider token="<DAILY_TOKEN>">
      <YourCVIComponents />
    </CVIProvider>
  );
}
```

Features:
- Initializes Daily.co client with authentication token
- Exposes Daily React hooks (`useCall`, device hooks) and components for audio/video rendering ([Tavus Docs](https://docs.tavus.io/sections/conversational-video-interface/component-library/components)).

### 2.2 Call Lifecycle: useCVICall
Under the hood, CVI uses the `useCVICall` hook to join and manage Daily.co rooms:

```js
import { useCVICall } from '@tavus/cvi-ui';

const { joinCall, leaveCall } = useCVICall();

// Join by passing the conversation URL
joinCall('<conversation_url>');
```

This hook encapsulates:
- Room connection via Daily.co API
- State management for call status
- Proper cleanup on disconnection ([Tavus Docs](https://docs.tavus.io/sections/conversational-video-interface/component-library/hooks)).

### 2.3 Media and Device Management
Tavus CVI provides additional hooks for granular control over user media:
- `useLocalCamera`, `useLocalMicrophone`, `useLocalScreenshare`: Manage local media tracks and toggles
- `useRequestPermissions`, `useStartHaircheck`: Handle device permission prompts and initialization

These hooks internally utilize Daily.co’s device management APIs, ensuring consistent behavior across browsers.

## 3. Audio-Only Mode Configuration

Tavus CVI supports audio-only conversations for voice-first applications. This mode disables video streams while retaining advanced AI-driven perception and turn-taking via Raven and Sparrow models.

### 3.1 API Parameter
When creating a conversation via Tavus API, set the `audio_only` flag to `true`:

```bash
curl --request POST \
  --url https://tavusapi.com/v2/conversations \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '{
    "replica_id": "rfe12d8b9597",
    "persona_id": "pdced222244b",
    "audio_only": true
  }'
```

This configuration:
- Omits video tracks from the Daily.co room
- Engages Tavus’s audio processing stack, including noise suppression and voice-based AI perception ([Tavus Docs](https://docs.tavus.io/sections/conversational-video-interface/conversation/customizations/audio-only)).

### 3.2 Developer Considerations
- The CVIProvider and `useCVICall` hooks automatically detect audio-only mode by inspecting call parameters, disabling camera setups
- UI components like `AudioWave` still function, providing real-time audio level visualization for participants

## Conclusion

Tavus CVI is a robust platform marrying AI-driven digital replicas with Daily.co’s WebRTC infrastructure. The `useObservableEvent` and `useSendAppMessage` hooks form the core of interaction handling, ensuring type-safe, event-driven communication. Deep integration with Daily.co via `CVIProvider` and media hooks abstracts WebRTC complexity, while audio-only mode opens avenues for voice-centric applications. With these capabilities, developers can rapidly build sophisticated conversational experiences powered by lifelike AI. 