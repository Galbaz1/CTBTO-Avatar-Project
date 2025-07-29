"use client";
import { type ReactNode, useEffect } from "react";
import type {
  CVIEventUnion,
  SendAppMessageProps,
} from "../../../types/tavus-cvi-ui";

// Mock Tavus CVI implementations for voice-first kiosk
// These would be replaced with actual @tavus/cvi-react imports in production

/**
 * Mock implementation of Tavus CVI call management hook
 * @returns Object with joinCall and leaveCall functions
 */
function useCVICall() {
  return {
    /**
     * Join a CVI conversation call
     * @param options - Call options containing the conversation URL
     */
    joinCall: ({ url }: { url: string }) => {
      console.log("Mock: Joining CVI call with URL:", url);
    },
    /**
     * Leave the current CVI call
     */
    leaveCall: () => {
      console.log("Mock: Leaving CVI call");
    },
  };
}

/**
 * Mock implementation of Tavus CVI event observer hook
 * @param callback - Function to handle incoming CVI events
 */
function useObservableEvent(callback: (event: CVIEventUnion) => void) {
  useEffect(() => {
    // Mock event listener - in production this would listen to actual CVI events
    console.log("Mock: Registered CVI event observer");
    return () => {
      console.log("Mock: Unregistered CVI event observer");
    };
  }, [callback]);
}

/**
 * Mock implementation of Tavus CVI message sending hook
 * @returns Function to send app messages to CVI
 */
function useSendAppMessage() {
  return (message: SendAppMessageProps) => {
    console.log("Mock: Sending CVI app message:", message);
  };
}

/**
 * Mock CVI Provider component
 * @param children - React children to wrap with CVI context
 * @returns JSX element wrapping children
 */
function CVIProvider({ children }: { children: ReactNode }) {
  console.log("Mock: CVI Provider initialized");
  return <>{children}</>;
}

/**
 * Props for the TavusVoiceWrapper component
 */
export interface TavusVoiceWrapperProps {
  /** URL for the Tavus conversation to join */
  conversationUrl: string | null;
  /** Callback function when user speaks */
  onUtterance: (text: string) => void;
  /** Text reply for the avatar to speak */
  reply?: string | null;
  /** React children to render within the CVI provider */
  children?: ReactNode;
}

/**
 * TavusVoiceWrapper - Voice-first wrapper component for Tavus CVI integration
 *
 * This component serves as the primary interface between the voice-first kiosk
 * and Tavus Conversational Video Interface (CVI). It handles:
 * - Joining/leaving CVI conversations
 * - Listening for user utterances via voice recognition
 * - Sending AI-generated replies to the avatar for text-to-speech
 *
 * @param props - Component props
 * @returns JSX element with CVI provider wrapping children
 *
 * @example
 * ```tsx
 * <TavusVoiceWrapper
 *   conversationUrl="https://tavus.io/conversations/123"
 *   onUtterance={(text) => handleUserSpeech(text)}
 *   reply={aiGeneratedReply}
 * >
 *   <VoiceFirstInterface />
 * </TavusVoiceWrapper>
 * ```
 */
export function TavusVoiceWrapper({
  conversationUrl,
  onUtterance,
  reply,
  children,
}: TavusVoiceWrapperProps) {
  const { joinCall, leaveCall } = useCVICall();
  const sendAppMessage = useSendAppMessage();

  // Join or leave the CVI call when the URL changes
  useEffect(() => {
    if (conversationUrl) {
      joinCall({ url: conversationUrl });
    }
    return () => {
      leaveCall();
    };
  }, [conversationUrl, joinCall, leaveCall]);

  // Listen for user utterances coming from Tavus CVI
  useObservableEvent((event: CVIEventUnion) => {
    if (
      event.event_type === "conversation.utterance" &&
      event.properties?.speech
    ) {
      onUtterance(event.properties.speech as string);
    }
  });

  // Send the assistant reply back so the avatar will speak it
  useEffect(() => {
    if (reply) {
      sendAppMessage({
        message_type: "conversation",
        event_type: "conversation.respond",
        properties: { text: reply },
      });
    }
  }, [reply, sendAppMessage]);

  return <CVIProvider>{children}</CVIProvider>;
}
