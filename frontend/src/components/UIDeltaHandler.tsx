import React, { useState } from "react";
import { produce } from "immer";
import { useSSE } from "../hooks/useSSE";
import type { ConferenceRAGData } from "../types/tavus-cvi-ui";

/**
 * JSON Patch operation for UI delta updates
 */
interface DeltaOperation {
  /** JSON Patch operation type */
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  /** JSON Pointer path to the target location */
  path: string;
  /** Value for add/replace operations */
  value?: ConferenceRAGData[keyof ConferenceRAGData];
  /** Source path for move/copy operations */
  from?: string;
}

/**
 * Response containing delta operations from the backend
 */
interface DeltaResponse {
  /** Array of JSON Patch operations */
  deltas: DeltaOperation[];
  /** Session identifier for correlation */
  session_id: string;
  /** Error message if delta processing failed */
  error?: string;
}

/**
 * Current state of all conference cards
 */
interface CardState {
  latest_session?: ConferenceRAGData["session"];
  latest_speaker?: ConferenceRAGData["speaker"];
  latest_topic?: ConferenceRAGData["topic"];
  latest_venue?: ConferenceRAGData["venue"];
}

/**
 * Props for the UIDeltaHandler component
 */
interface UIDeltaHandlerProps {
  /** Current meeting state */
  meetingState: string;
  /** Conversation ID for SSE endpoint */
  conversationId: string | null;
  /** Callback when card data is updated */
  onCardUpdate: (cardData: unknown, cardType: string) => void;
}

/**
 * Statistics about delta operations processed
 */
interface DeltaStats {
  /** Total number of deltas processed in this session */
  totalDeltas: number;
  /** Number of deltas in the last batch */
  lastDeltaCount: number;
  /** Types of cards updated in the last operation */
  lastUpdateType: string;
}

/**
 * UIDeltaHandler - Real-time UI delta processor via Server-Sent Events
 *
 * This component processes JSON Patch operations received via SSE to update
 * conference card data in real-time. It applies delta operations sequentially
 * and triggers UI updates for affected card types.
 *
 * @param props - Component props
 * @returns JSX element with debug info (development mode) or null
 *
 * @example
 * ```tsx
 * <UIDeltaHandler
 *   meetingState={currentMeetingState}
 *   conversationId={sessionId}
 *   onCardUpdate={(data, type) => updateCard(data, type)}
 * />
 * ```
 */
export const UIDeltaHandler: React.FC<UIDeltaHandlerProps> = ({
  conversationId,
  onCardUpdate,
  meetingState,
}) => {
  const [cardState, setCardState] = useState<CardState>({});
  const [deltaStats, setDeltaStats] = useState<DeltaStats>({
    totalDeltas: 0,
    lastDeltaCount: 0,
    lastUpdateType: "",
  });

  const applyDelta = (
    operation: DeltaOperation,
    currentState: CardState,
  ): CardState => {
    /**
     * Apply a single delta operation to the card state using immer
     * Supports JSON Patch-style operations for granular updates
     */
    return produce(currentState, (draft) => {
      const pathParts = operation.path.split("/").filter(Boolean);

      if (pathParts.length === 0) return;

      try {
        switch (operation.op) {
          case "replace":
            if (pathParts.length === 1) {
              // Full card replacement
              const cardType = pathParts[0] as keyof CardState;
              (draft as any)[cardType] = operation.value;
            } else if (pathParts.length === 2) {
              // Property-level update (micro-update)
              const cardType = pathParts[0] as keyof CardState;
              const property = pathParts[1];

              if (draft[cardType]) {
                (draft[cardType] as Record<string, unknown>)[property] =
                  operation.value;
              }
            }
            break;

          case "add":
            if (pathParts.length === 1) {
              // Root-level add (initial card insertion)
              const cardType = pathParts[0] as keyof CardState;
              (draft as any)[cardType] = operation.value;
            } else if (pathParts.length === 2) {
              // Nested add – typically array push (e.g., speakers array)
              const cardType = pathParts[0] as keyof CardState;
              const property = pathParts[1];

              if (draft[cardType]) {
                const currentValue = (
                  draft[cardType] as Record<string, unknown>
                )[property];
                if (Array.isArray(currentValue)) {
                  currentValue.push(operation.value);
                } else {
                  (draft[cardType] as Record<string, unknown>)[property] =
                    operation.value;
                }
              } else {
                // If the parent card doesn’t exist yet, create it with the property
                draft[cardType] = {
                  [property]: Array.isArray(operation.value)
                    ? [...operation.value]
                    : operation.value,
                } as any;
              }
            }
            break;

          case "remove":
            // Handle removals
            if (pathParts.length === 1) {
              const cardType = pathParts[0] as keyof CardState;
              delete draft[cardType];
            } else {
              const cardType = pathParts[0] as keyof CardState;
              const property = pathParts[1];
              if (draft[cardType] && typeof draft[cardType] === "object") {
                delete (draft[cardType] as Record<string, unknown>)[property];
              }
            }
            break;
        }

        console.log(`🔄 Applied ${operation.op} to ${operation.path}`);
      } catch (error) {
        console.error(
          `❌ Failed to apply delta ${operation.op} to ${operation.path}:`,
          error,
        );
      }
    });
  };

  const processDeltaResponse = async (deltaResponse: DeltaResponse) => {
    /**
     * Process a batch of delta operations and trigger UI updates
     */
    if (!deltaResponse.deltas || deltaResponse.deltas.length === 0) {
      return;
    }

    console.log(
      `🔄 Processing ${deltaResponse.deltas.length} delta operations`,
    );

    let newState = cardState;
    const cardTypesUpdated = new Set<string>();

    // Apply all deltas sequentially
    for (const delta of deltaResponse.deltas) {
      newState = applyDelta(delta, newState);

      // Track which card types were updated for notifications
      const cardType = delta.path.split("/")[1];
      if (cardType) {
        cardTypesUpdated.add(cardType);
      }
    }

    // Update state once after all deltas are applied
    setCardState(newState);
    setDeltaStats({
      totalDeltas: deltaStats.totalDeltas + deltaResponse.deltas.length,
      lastDeltaCount: deltaResponse.deltas.length,
      lastUpdateType: Array.from(cardTypesUpdated).join(", "),
    });

    // Machine-readable logging for AI agents
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[UIDELTA]",
        JSON.stringify({
          ts: Date.now(),
          session: deltaResponse.session_id,
          ops: deltaResponse.deltas.map((d) => ({ op: d.op, path: d.path })),
          cardTypes: Array.from(cardTypesUpdated),
        }),
      );
    }

    // Notify parent component of updates for each card type
    for (const cardType of cardTypesUpdated) {
      const cardData = (newState as any)[cardType];
      if (cardData) {
        onCardUpdate(cardData, cardType.replace("latest_", ""));
      }
    }
  };

  // Establish SSE stream when in meeting
  const sseUrl =
    meetingState === "joined-meeting" && conversationId
      ? `http://localhost:8000/sse/ui-delta/${conversationId}`
      : null;

  useSSE<DeltaResponse>(sseUrl, async (deltaResponse) => {
    if (deltaResponse.error) {
      console.error("❌ Delta SSE error:", deltaResponse.error);
      return;
    }
    await processDeltaResponse(deltaResponse);
  });

  // Debug info (remove in production)
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          right: "10px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "10px",
          zIndex: 9999,
        }}
      >
        <div>🔄 Delta Handler Active</div>
        <div>Session: {conversationId}</div>
        <div>State: {meetingState}</div>
        <div>Total Deltas: {deltaStats.totalDeltas}</div>
        <div>
          Last Update: {deltaStats.lastDeltaCount} ops (
          {deltaStats.lastUpdateType})
        </div>
        <div>Cards: {Object.keys(cardState).length}</div>
      </div>
    );
  }

  return null; // Handler component - no visual output
};

export default UIDeltaHandler;
