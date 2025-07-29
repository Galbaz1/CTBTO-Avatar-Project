React Component Library
Blocks
High-level component compositions that combine multiple UI elements into complete interface layouts

### Conversation block
The Conversation component provides a complete video chat interface for one-to-one conversations with AI replicas.

```bash
npx @tavus/cvi-ui@latest add conversation-01
```

The `Conversation` component provides a complete video chat interface for one-to-one conversations with AI replicas, featuring main video display, self-view preview, and integrated controls.

Features:
*   Main Video Display: Large video area showing the AI replica or screen share
*   Self-View Preview: Small preview window showing local camera feed
*   Screen Sharing Support: Automatic switching between replica video and screen share
*   Device Controls: Integrated microphone, camera, and screen share controls
*   Error Handling: Graceful handling of camera/microphone permission errors
*   Responsive Layout: Adaptive design for different screen sizes

Props:
*   `conversationUrl(string)`: Daily.co room URL for joining
*   `onLeave(function)`: Callback when user leaves the conversation

### Hair Check
The HairCheck component provides a pre-call interface for users to test and configure their audio/video devices before joining a video chat.

```bash
npx @tavus/cvi-ui@latest add hair-check-01
```

The `HairCheck` component provides a pre-call interface for users to test and configure their audio/video devices before joining a video chat.

Features:
*   Device Testing: Live preview of camera feed with mirror effect
*   Permission Management: Handles camera and microphone permission requests
*   Device Controls: Integrated microphone and camera controls
*   Join Interface: Call-to-action button to join the video chat
*   Responsive Design: Works on both desktop and mobile devices

Props:
*   `isJoinBtnLoading(boolean)`: Shows loading state on join button
*   `onJoin(function)`: Callback when user clicks join
*   `onCancel(function, optional)`: Callback when user cancels 