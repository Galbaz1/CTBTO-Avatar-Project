"use client";

import React, { useState, useCallback } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { TavusVoiceWrapper } from "./core/TavusVoiceWrapper";
import { MessageRenderer } from "./MessageRenderer";

/**
 * Props for the VoiceFirstKiosk component
 */
interface VoiceFirstKioskProps {
  /** URL for the Tavus conversation to join */
  conversationUrl: string | null;
  /** Unique session identifier */
  sessionId: string;
}

/**
 * VoiceFirstKiosk - Main voice-first interface component
 *
 * This component orchestrates the complete voice-first experience by:
 * - Managing AI chat conversation via Vercel AI SDK
 * - Integrating with Tavus CVI for voice input/output
 * - Rendering dynamic UI components based on AI responses
 * - Maintaining conversation state and message history
 *
 * The component follows voice-first principles with no interactive UI elements,
 * relying entirely on voice commands for user interaction.
 *
 * @param props - Component props
 * @returns JSX element with the complete voice interface
 *
 * @example
 * ```tsx
 * <VoiceFirstKiosk
 *   conversationUrl="https://tavus.io/conversations/123"
 *   sessionId="session_abc123"
 * />
 * ```
 */
export function VoiceFirstKiosk({
  conversationUrl,
  sessionId,
}: VoiceFirstKioskProps) {
  const { messages, sendMessage, status } = useChat({
    id: sessionId,
    maxSteps: 2,
  });

  const [lastAssistantReply, setLastAssistantReply] = useState<string | null>(
    null,
  );

  // Handle user utterances from Tavus
  const handleUtterance = useCallback(
    (utterance: string) => {
      sendMessage({ text: utterance });
    },
    [sendMessage],
  );

  // Extract most recent assistant text message for TTS
  React.useEffect(() => {
    const last = messages[messages.length - 1] as UIMessage | undefined;
    if (last && last.role === "assistant") {
      const textPart = (last.parts || []).find((p) => p.type === "text");
      if (textPart) setLastAssistantReply((textPart as any).text);
    }
  }, [messages]);

  return (
    <TavusVoiceWrapper
      conversationUrl={conversationUrl}
      onUtterance={handleUtterance}
      reply={lastAssistantReply}
    >
      <div className="p-4 max-w-3xl mx-auto">
        {status === "streaming" && <p aria-live="assertive">Thinking…</p>}
        <MessageRenderer messages={messages} />
      </div>
    </TavusVoiceWrapper>
  );
}
