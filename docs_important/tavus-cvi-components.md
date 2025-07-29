React Component Library
Components
Learn about our pre-built React components to accelerate integrating the Tavus Conversational Video Interface (CVI) into your application.

### CVI Provider
The `CVIProvider` component wraps your app with the Daily.co provider context, enabling all Daily React hooks and components to function.

```bash
npx @tavus/cvi-ui@latest add cvi-provider
```

Description
Code
The `CVIProvider` component wraps your app with the Daily.co provider context, enabling all Daily React hooks and components to function.

Features:
*   Provides Daily.co context to all child components
*   Required for using Daily React hooks and video/audio components
*   Simple wrapper for app-level integration

Props:
*   `children(ReactNode)`: Components to be wrapped by the provider

### AudioWave
The `AudioWave` component provides real-time audio level visualization for video chat participants, displaying animated bars that respond to audio input levels.

```bash
npx @tavus/cvi-ui@latest add audio-wave
```

Description
Code
The `AudioWave` component provides real-time audio level visualization for video chat participants, displaying animated bars that respond to audio input levels.

Features:
*   Real-time Audio Visualization: Three animated bars that respond to audio levels
*   Active Speaker Detection: Visual distinction between active and inactive speakers
*   Performance Optimized: Uses `requestAnimationFrame` for smooth animations
*   Responsive Design: Compact circular design that fits well in video previews
*   Audio Level Scaling: Intelligent volume scaling for consistent visual feedback

Props:
*   `id(string)`: The participant’s session ID to monitor audio levels for

### Device Select
The `device-select` module provides advanced device selection controls, including dropdowns for choosing microphones and cameras, and integrated toggle buttons.

```bash
npx @tavus/cvi-ui@latest add device-select
```

Description
Code
The `device-select` module provides advanced device selection controls, including dropdowns for choosing microphones and cameras, and integrated toggle buttons.

Exported Components:
*   `MicSelectBtn`: Microphone toggle button with device selection
*   `CameraSelectBtn`: Camera toggle button with device selection
*   `ScreenShareButton`: Button to toggle screen sharing

Features:
*   Integrated device selection and toggling
*   Dropdowns for camera/microphone selection
*   Visual state indicators and accessibility support
*   Uses Daily.co device management hooks
*   CSS modules for styling

### Media Controls
The `media-controls` module provides simple toggle buttons for microphone, camera, and screen sharing, designed for direct use in video chat interfaces.

```bash
npx @tavus/cvi-ui@latest add media-controls
```

Description
Code
The `media-controls` module provides simple toggle buttons for microphone, camera, and screen sharing, designed for direct use in video chat interfaces.

Exported Components:
*   `MicToggleButton`: Toggles microphone mute/unmute state
*   `CameraToggleButton`: Toggles camera on/off
*   `ScreenShareButton`: Toggles screen sharing on/off

Features:
*   Simple, accessible toggle buttons
*   Visual state indicators (muted, unmuted, on/off)
*   Disabled state when device is not ready
*   Uses Daily.co hooks for device state
*   CSS modules for styling 