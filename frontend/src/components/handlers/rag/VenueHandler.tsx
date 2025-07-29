import React, { useRef } from "react";
import type { VenueCardData } from "../../cards/enhanced/TimetableProcessor";
import { useSSE } from "../../../hooks/useSSE";

interface VenueHandlerProps {
  meetingState: string;
  conversationId: string;
  onVenueUpdate: (venueData: VenueCardData) => void;
}

export const VenueHandler: React.FC<VenueHandlerProps> = ({
  meetingState,
  conversationId,
  onVenueUpdate,
}) => {
  const sseUrl =
    meetingState === "joined-meeting"
      ? `http://localhost:8000/sse/venue/${conversationId}`
      : null;

  const lastVenueDataRef = useRef<VenueCardData | null>(null);

  useSSE<VenueCardData>(sseUrl, (venueData) => {
    if (
      venueData &&
      JSON.stringify(venueData) !== JSON.stringify(lastVenueDataRef.current)
    ) {
      lastVenueDataRef.current = venueData;
      onVenueUpdate(venueData);
    }
  });

  // This component doesn't render anything
  return null;
};
