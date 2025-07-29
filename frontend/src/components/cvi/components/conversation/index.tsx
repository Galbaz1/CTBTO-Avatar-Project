import React, { useEffect } from "react";
import {
  DailyAudio,
  DailyVideo,
  useDevices,
  useLocalSessionId,
  useMeetingState,
  useScreenVideoTrack,
  useVideoTrack,
} from "@daily-co/daily-react";
import { MicSelectBtn, ScreenShareButton } from "../device-select";
import { useReplicaIDs } from "../../hooks/use-replica-ids";
import { useCVICall } from "../../hooks/use-cvi-call";
import { WebGLGreenScreenVideo } from "../webgl-green-screen-video";

import styles from "./conversation.module.css";

interface ConversationProps {
  onLeave: () => void;
  conversationUrl: string;
}

// Camera preview components removed - no camera needed

const MainVideo = React.memo(() => {
  const replicaIds = useReplicaIDs();
  const localId = useLocalSessionId();
  const videoState = useVideoTrack(replicaIds[0]);
  const screenVideoState = useScreenVideoTrack(localId);
  const isScreenSharing = !screenVideoState.isOff;
  // This is one-to-one call, so we can use the first replica id
  const replicaId = replicaIds[0];

  // Standard green screen preset - optimized and working perfectly
  const standardGreenScreenParams = {
    keyColor: [0.0, 1.0, 0.0] as [number, number, number],
    similarity: 0.4,
    smoothness: 0.08,
    spill: 0.15,
    disableGreenScreen: false,
  };

  if (!replicaId) {
    return (
      <div className={styles.waitingContainer}>
        <p>Connecting...</p>
      </div>
    );
  }

  // Use green screen for Rosa's video (replica), regular video for screen sharing
  return (
    <div
      className={`${styles.mainVideoContainer} ${isScreenSharing ? styles.mainVideoContainerScreenSharing : ""}`}
    >
      {isScreenSharing ? (
        <DailyVideo
          automirror
          sessionId={localId}
          type="screenVideo"
          className={`${styles.mainVideo} ${styles.mainVideoScreenSharing}`}
        />
      ) : (
        <WebGLGreenScreenVideo
          sessionId={replicaId}
          className={`${styles.mainVideo} ${videoState.isOff ? styles.mainVideoHidden : ""}`}
          keyColor={standardGreenScreenParams.keyColor}
          similarity={standardGreenScreenParams.similarity}
          smoothness={standardGreenScreenParams.smoothness}
          spill={standardGreenScreenParams.spill}
          disableGreenScreen={standardGreenScreenParams.disableGreenScreen}
          onVideoLoad={() => console.log("✅ Green screen video loaded")}
        />
      )}
    </div>
  );
});

export const Conversation = React.memo(
  ({ onLeave, conversationUrl }: ConversationProps) => {
    const { joinCall } = useCVICall();
    const meetingState = useMeetingState();
    const { hasMicError } = useDevices();

    useEffect(() => {
      if (meetingState === "error") {
        onLeave();
      }
    }, [meetingState, onLeave]);

    // Initialize call when conversation is available
    useEffect(() => {
      joinCall({ url: conversationUrl });
    }, [conversationUrl, joinCall]);

    return (
      <div className={styles.container}>
        <div className={styles.videoContainer}>
          {hasMicError && (
            <div className={styles.errorContainer}>
              <p>
                Microphone access denied. Please check your settings and try
                again.
              </p>
            </div>
          )}

          {/* Main video */}
          <div className={styles.mainVideoContainer}>
            <MainVideo />
          </div>

          {/* Self view removed - no camera needed */}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerControls}>
            <MicSelectBtn />
            <ScreenShareButton />
            {/* Leave button removed for voice-first UX */}
          </div>
        </div>

        <DailyAudio />
      </div>
    );
  },
);
