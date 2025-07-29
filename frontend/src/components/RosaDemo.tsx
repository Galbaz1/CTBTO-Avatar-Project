import React, { useState, useCallback, useMemo, useRef } from "react";
import { endConversation } from "../api";
import { CVIProvider } from "./cvi/components/cvi-provider";
import { Conversation } from "./cvi/components/conversation";
import { UIDeltaHandler } from "./UIDeltaHandler";
import { StickyInterface } from "./StickyInterface";
import { FullScreenCardContainer } from "./FullScreenCardContainer";

// Voice-first interface utilities
type CardType = "session" | "speaker" | "topic" | "venue";

type ConversationStatus = "idle" | "connecting" | "connected" | "disconnecting";

export const RosaDemo: React.FC = () => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus>("idle");
  const [ragData, setRagData] = useState<any>({});
  const [showRagCards, setShowRagCards] = useState(false);

  // Handle RAG data updates (cards)
  const handleCardUpdate = useCallback((cardData: any, cardType: string) => {
    console.log("🎯 Card update received:", cardType, cardData);

    setRagData((prev: any) => ({ ...prev, [cardType]: cardData }));
    setShowRagCards(true);
  }, []);

  const handleEndConversation = useCallback(async () => {
    setStatus("disconnecting");

    try {
      if (conversationId) {
        const apiKey = localStorage.getItem("TAVUS_API_KEY");
        if (!apiKey) {
          throw new Error("API key not found");
        }
        await endConversation(conversationId, apiKey);
        console.log("✅ Conversation ended successfully");
      }

      // Reset state
      setConversationUrl(null);
      setConversationId(null);
      setStatus("idle");
      setShowRagCards(false);
      setRagData({});
    } catch (error) {
      console.error("❌ Error ending conversation:", error);
      setStatus("idle");
    }
  }, [conversationId]);

  const lastSessionDataHash = useRef<string>("");

  const cardArray = useMemo(() => {
    const cardArray: any[] = [];

    if (showRagCards && ragData) {
      // Process each card type from ragData
      Object.entries(ragData).forEach(([cardType, cardData]) => {
        if (cardData) {
          cardArray.push({
            id: `${cardType}-card`,
            type: cardType as CardType,
            data: cardData,
            position: { x: 50, y: 50 },
            onClose: () => setShowRagCards(false),
          });
        }
      });
    }

    return cardArray;
  }, [showRagCards, ragData]);

  const currentSessionData = conversationId
    ? { conversationId, ragData }
    : null;
  const sessionDataHashCurrent = JSON.stringify(currentSessionData);

  // Only re-render if session data actually changed
  const shouldRenderSession =
    sessionDataHashCurrent !== lastSessionDataHash.current;
  if (shouldRenderSession) {
    lastSessionDataHash.current = sessionDataHashCurrent;
  }

  // WELCOME UI
  if (status !== "connected" || !conversationUrl) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {/* Add minimal welcome message */}
        <div
          style={{ textAlign: "center", marginBottom: "30px", color: "white" }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              margin: "0 0 10px 0",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Rosa - S&T 2025 Host
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9, margin: 0 }}>
            CTBTO Science & Technology Conference 2025
          </p>
        </div>
        {status === "idle" && (
          <button
            // interaction removed
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
              padding: "16px 32px",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
              minWidth: "200px",
            }}
          >
            🎤 Start Voice Conversation with Rosa
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {conversationUrl && (
        <CVIProvider>
          <Conversation
            conversationUrl={conversationUrl}
            onLeave={handleEndConversation}
          />

          <StickyInterface
            meetingState={status === "connected" ? "joined-meeting" : status}
            conversationId={conversationId || ""}
          />

          <FullScreenCardContainer cards={cardArray} />
        </CVIProvider>
      )}

      {/* Background: Conference handler integrations */}
      {/* Handlers & UI */}
      <UIDeltaHandler
        conversationId={conversationId || ""}
        onCardUpdate={handleCardUpdate}
        meetingState={status === "connected" ? "joined-meeting" : status}
      />
    </div>
  );
};
