import React, { useRef } from "react";
import type { SpeakerCardData } from "../../cards/enhanced/TimetableProcessor";
import { useSSE } from "../../../hooks/useSSE";

interface SpeakerHandlerProps {
  meetingState: string;
  conversationId: string;
  onSpeakerUpdate: (speakerData: SpeakerCardData) => void;
}

export const SpeakerHandler: React.FC<SpeakerHandlerProps> = ({
  meetingState,
  conversationId,
  onSpeakerUpdate,
}) => {
  const sseUrl =
    meetingState === "joined-meeting"
      ? `http://localhost:8000/sse/speaker/${conversationId}`
      : null;
  const lastSpeakerDataRef = useRef<SpeakerCardData | null>(null);

  useSSE<SpeakerCardData>(sseUrl, (speakerData) => {
    if (
      speakerData &&
      JSON.stringify(speakerData) !== JSON.stringify(lastSpeakerDataRef.current)
    ) {
      lastSpeakerDataRef.current = speakerData;
      onSpeakerUpdate(speakerData);
    }
  });

  return null;
};
