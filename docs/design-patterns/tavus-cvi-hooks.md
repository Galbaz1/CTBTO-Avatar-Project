React Component Library
Hooks
See what hooks Tavus supports for managing video calls, media controls, participant management, and conversation events.

### 🔧 Core Call Management

#### useCVICall
Essential hook for joining and leaving video calls.

```bash
npx @tavus/cvi-ui@latest add use-cvi-call
```

Description
Code
A React hook that provides comprehensive call management functionality for video conversations. This hook handles the core lifecycle of video calls, including connection establishment, room joining, and proper cleanup when leaving calls.

Purpose:
*   Manages call join/leave operations with proper state management
*   Handles connection lifecycle and cleanup
*   Provides simple interface for call control

Return Values:
*   `joinCall(function)`: Function to join a call by URL - handles Daily.co room connection
*   `leaveCall(function)`: Function to leave the current call - properly disconnects and cleans up resources

#### useStartHaircheck
A React hook that manages device permissions and camera initialization for the hair-check component.

```bash
npx @tavus/cvi-ui@latest add use-start-haircheck
```

Description
Code
A React hook that manages device permissions and camera initialization for the hair-check component.

Purpose:
*   Monitors device permission states
*   Starts camera and microphone when appropriate
*   Provides permission state for UI conditional rendering
*   Handles permission request flow

Return Values:
*   `isPermissionsPrompt(boolean)`: Browser is prompting for device permission
*   `isPermissionsLoading(boolean)`: Permissions are being processed or camera is initializing
*   `isPermissionsGranted(boolean)`: Device permission granted
*   `isPermissionsDenied(boolean)`: Device permission denied
*   `requestPermissions(function)`: Function to request camera and microphone permissions

### 🎥 Media Controls

#### useLocalCamera
A React hook that provides local camera state and toggle functionality.

```bash
npx @tavus/cvi-ui@latest add use-local-camera
```

Description
Code
A React hook that provides local camera state and toggle functionality.

Purpose:
*   Manages local camera state (on/off)
*   Tracks camera permission and ready state

Return Values:
*   `onToggleCamera(function)`: Function to toggle camera on/off
*   `isCamReady(boolean)`: Camera permission is granted and ready
*   `isCamMuted(boolean)`: Camera is currently turned off
*   `localSessionId(string)`: Local session ID

#### useLocalMicrophone
A React hook that provides local microphone state and toggle functionality.

```bash
npx @tavus/cvi-ui@latest add use-local-microphone
```

Description
Code
A React hook that provides local microphone state and toggle functionality.

Purpose:
*   Manages local microphone state (on/off)
*   Tracks microphone permission and ready state

Return Values:
*   `onToggleMicrophone(function)`: Function to toggle microphone on/off
*   `isMicReady(boolean)`: Microphone permission is granted and ready
*   `isMicMuted(boolean)`: Microphone is currently turned off
*   `localSessionId(string)`: Local session ID

#### useLocalScreenshare
A React hook that provides local screen sharing state and toggle functionality.

```bash
npx @tavus/cvi-ui@latest add use-local-screenshare
```

Description
Code
A React hook that provides local screen sharing state and toggle functionality.

Purpose:
*   Manages screen sharing state (on/off)
*   Provides screen sharing toggle function
*   Handles screen share start/stop with optimized display media options

Return Values:
*   `onToggleScreenshare(function)`: Function to toggle screen sharing on/off
*   `isScreenSharing(boolean)`: Whether screen sharing is currently active
*   `localSessionId(string)`: Local session ID

Display Media Options:When starting screen share, the hook uses the following optimized settings:
*   Audio: Disabled (`false`)
*   Self Browser Surface: Excluded
*   Surface Switching: Included
*   Video Resolution: 1920x1080

#### useRequestPermissions
A React hook that requests camera and microphone permissions with optimized audio processing settings.

```bash
npx @tavus/cvi-ui@latest add use-request-permissions
```

Description
Code
A React hook that requests camera and microphone permissions with optimized audio processing settings.

Purpose:
*   Requests camera and microphone permissions from the user
*   Starts camera and audio with specific configuration
*   Applies noise cancellation audio processing
*   Provides a clean interface for permission requests

Return Values:
*   `requestPermissions(function)`: Function to request camera and microphone permissions

Configuration:When requesting permissions, the hook uses the following settings:
*   Video: Started on (`startVideoOff: false`)
*   Audio: Started on (`startAudioOff: false`)
*   Audio Source: Default system audio input
*   Audio Processing: Noise cancellation enabled

### 👥 Participant Management

#### useReplicaIDs
A React hook that returns the IDs of all Tavus replica participants in a call.

```bash
npx @tavus/cvi-ui@latest add use-replica-ids
```

Description
Code
A React hook that returns the IDs of all Tavus replica participants in a call.

Purpose:
*   Filters and returns participant IDs where `user_id` includes ‘tavus-replica’

Return Value:
*   `string[]`— Array of replica participant IDs

#### useRemoteParticipantIDs
A React hook that returns the IDs of all remote participants in a call.

```bash
npx @tavus/cvi-ui@latest add use-remote-participant-ids
```

Description
Code
A React hook that returns the IDs of all remote participants in a call.

Purpose:
*   Returns participant IDs for all remote participants (excluding local user)

Return Value:
*   `string[]`— Array of remote participant IDs

### 💬 Conversation & Events

#### useObservableEvent
A React hook that listens for CVI app messages and provides a callback mechanism for handling various conversation events.

```bash
npx @tavus/cvi-ui@latest add cvi-events-hooks
```

Description
Code
A React hook that listens for CVI app messages and provides a callback mechanism for handling various conversation events.

Purpose:
*   Listens for app messages from the Daily.co call mapped to CVI events
*   Handles various conversation event types (utterances, tool calls, speaking events, etc.)
*   Provides type-safe event handling for CVI interactions

Parameters:
*   `callback(function)`: Function called when app messages are received

Event Types:This hook handles all CVI conversation events. For detailed information about each event type, see the Tavus Interactions Protocol Documentation.

#### useSendAppMessage
A React hook that provides a function to send CVI app messages to other participants in the call.

```bash
npx @tavus/cvi-ui@latest add cvi-events-hooks
```

Description
Code
A React hook that provides a function to send CVI app messages to other participants in the call.

Purpose:
*   Sends various types of conversation messages to the CVI system
*   Supports echo, respond, interrupt, and context management messages
*   Provides type-safe message sending with proper validation
*   Enables real-time communication with Tavus replicas and conversation management

Return Value:
*   `(message: SendAppMessageProps) => void` - Function that sends the message when called

Message Types:This hook supports all CVI interaction types. For detailed information about each interaction type and their properties, see the Tavus Interactions Protocol Documentation. 