import React, { useRef } from "react";
import type { TimetableEntry as SessionCardData } from "../../cards/enhanced/TimetableProcessor";
import { useSSE } from "../../../hooks/useSSE";

interface SessionHandlerProps {
  meetingState: string;
  conversationId: string;
  onSessionUpdate: (data: SessionCardData) => void;
}

export const SessionHandler: React.FC<SessionHandlerProps> = ({
  meetingState,
  conversationId,
  onSessionUpdate,
}) => {
  const sseUrl =
    meetingState === "joined-meeting"
      ? `http://localhost:8000/sse/session/${conversationId}`
      : null;
  const lastSessionDataRef = useRef<SessionCardData | null>(null);

  useSSE<SessionCardData>(sseUrl, (sessionData) => {
    if (
      sessionData &&
      JSON.stringify(sessionData) !== JSON.stringify(lastSessionDataRef.current)
    ) {
      lastSessionDataRef.current = sessionData;
      onSessionUpdate(sessionData);
    }
  });

  // This component doesn't render anything
  return null;
};
