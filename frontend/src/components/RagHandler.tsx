import React, { useCallback } from "react";
import { useSSE } from "../hooks/useSSE";
import type { ConferenceRAGData } from "../types/tavus-cvi-ui";

/**
 * Props for the RagHandler component
 */
interface RagHandlerProps {
  /** Unique conversation identifier for SSE endpoint */
  conversationId: string;
  /** Callback function when RAG data is updated via SSE */
  onRagUpdate?: (data: ConferenceRAGData) => void;
}

/**
 * RagHandler - Server-Sent Events handler for conference RAG data
 *
 * This component establishes an SSE connection to receive real-time updates
 * for conference-related data including speakers, sessions, topics, and venues.
 * It replaces the previous polling mechanism with efficient SSE streaming.
 *
 * @param props - Component props
 * @returns null (handler component with no visual output)
 *
 * @example
 * ```tsx
 * <RagHandler
 *   conversationId={sessionId}
 *   onRagUpdate={(data) => setConferenceData(data)}
 * />
 * ```
 */
export const RagHandler: React.FC<RagHandlerProps> = ({
  conversationId,
  onRagUpdate,
}) => {
  const handleRagMessage = useCallback(
    (data: ConferenceRAGData) => {
      if (!data) return;
      onRagUpdate?.(data);
    },
    [onRagUpdate],
  );

  const sseUrl = conversationId
    ? `http://localhost:8000/sse/rag/${conversationId}`
    : null;

  useSSE(sseUrl, handleRagMessage);

  return null; // Handler component renders nothing
};
