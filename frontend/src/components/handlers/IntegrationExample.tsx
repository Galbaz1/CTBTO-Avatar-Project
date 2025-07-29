import React, { useState, useCallback } from "react";
import { UIDeltaHandler } from "../UIDeltaHandler";
import { HandlerIntegrationManager } from "./HandlerIntegrationManager";

interface IntegrationExampleProps {
  conversationId: string;
  meetingState: string;
}

/**
 * Integration Example: Multi-Handler Architecture
 *
 * This component demonstrates how to orchestrate multiple handlers:
 *    - UIDeltaHandler (real-time card updates via SSE)
 *    - HandlerIntegrationManager (routing updates to specific handlers)
 *
 * The setup follows the voice-first patterns established in the development plan,
 * with handlers working independently while coordinating through shared state.
 */
export const IntegrationExample: React.FC<IntegrationExampleProps> = ({
  conversationId,
}) => {
  // State for different handler patterns
  const [deltaCards, setDeltaCards] = useState<any>({});
  const [specificCards, setSpecificCards] = useState<any>({});

  // Handler callbacks
  const handleDeltaUpdate = useCallback((cardData: any, cardType: string) => {
    console.log("🎯 Delta update received:", cardType, cardData);
    setDeltaCards((_prev: any) => ({
      ..._prev,
      [cardType]: cardData,
    }));
  }, []);

  const handleSpecificCardUpdate = useCallback(
    (cardData: any, cardType: string) => {
      console.log("🎴 Specific card update received:", cardType, cardData);
      setSpecificCards((_prev: any) => ({
        ..._prev,
        [cardType]: cardData,
      }));
    },
    [],
  );

  if (!conversationId) {
    return <div>Conversation ID not provided.</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>🎯 Rosa Handler Integration Architecture</h2>

      {/* PATTERN 1: UIDeltaHandler - Phase 1 Micro-Updates */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #4CAF50",
          borderRadius: "8px",
        }}
      >
        <h3>🔄 UIDeltaHandler (Phase 1 - NEW PATTERN)</h3>
        <p>
          Handles micro-updates via JSON Patch operations from /latest-ui-delta/
          {conversationId}
        </p>
        <UIDeltaHandler
          conversationId={conversationId}
          onCardUpdate={handleDeltaUpdate}
          meetingState={""} // meetingState is no longer passed
        />
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <strong>Delta Cards:</strong>{" "}
          {Object.keys(deltaCards).join(", ") || "None"}
        </div>
      </section>

      {/* PATTERN 2: Individual Card Handlers - Phase 4 Specific Polling */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #2196F3",
          borderRadius: "8px",
        }}
      >
        <h3>📊 Individual Card Handlers (Phase 4 - SPECIFIC PATTERN)</h3>
        <p>
          Specific handlers for each card type, coordinated through
          HandlerIntegrationManager
        </p>
        <HandlerIntegrationManager
          conversationId={conversationId}
          meetingState={""} // meetingState is no longer passed
          onCardUpdate={handleSpecificCardUpdate}
          enabledHandlers={{
            session: true,
            speaker: true,
            topic: true,
            venue: true,
          }}
        />
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <strong>Specific Cards:</strong>{" "}
          {Object.keys(specificCards).join(", ") || "None"}
        </div>
      </section>

      {/* PATTERN 3: Legacy Tool Handlers - Maintained for Compatibility */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "2px solid #FF9800",
          borderRadius: "8px",
        }}
      >
        <h3>🌤️ Legacy Tool Handlers (COMPATIBILITY)</h3>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f5f5f5",
            margin: "10px 0",
          }}
        >
          <h3>Handler Integration Status</h3>
          <p>🎯 UIDeltaHandler: {JSON.stringify(deltaCards)}</p>
          <p>🎴 Specific Handler Cards: {JSON.stringify(specificCards)}</p>

          <hr />

          <p>
            🏗️ Individual card handlers managed by HandlerIntegrationManager
          </p>
        </div>
      </section>

      {/* Architecture Summary */}
      <section
        style={{
          padding: "15px",
          border: "2px solid #9C27B0",
          borderRadius: "8px",
        }}
      >
        <h3>🏗️ Architecture Summary</h3>
        <ul style={{ lineHeight: "1.6" }}>
          <li>
            <strong>UIDeltaHandler:</strong> AI-driven micro-updates,
            animations, Phase 1 delta system
          </li>
          <li>
            <strong>Individual Handlers:</strong> Tool-specific data, direct
            endpoints, coordinated polling
          </li>
          <li>
            <strong>Legacy Handlers:</strong> Existing tools (weather,
            conference), maintained compatibility
          </li>
        </ul>
        <p>
          <strong>Key Insight:</strong> All three patterns can coexist. They
          serve different architectural needs.
        </p>
      </section>
    </div>
  );
};
