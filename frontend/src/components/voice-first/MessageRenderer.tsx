"use client";

import { type UIMessage } from "@ai-sdk/react";
import { VoiceSpeakerCard } from "./cards/VoiceSpeakerCard";

interface MessageRendererProps {
  messages: UIMessage[];
}

export function MessageRenderer({ messages }: MessageRendererProps) {
  return (
    <div>
      {messages.map((msg) => (
        <div
          key={msg.id}
          role="group"
          aria-live="polite"
          className="space-y-2 mb-6"
        >
          <p>{msg.role === "user" ? "User:" : "Assistant:"}</p>
          {msg.parts?.map((part, idx) => {
            // Basic text part rendering
            if ((part as any).type === "text") {
              return <p key={idx}>{(part as any).text}</p>;
            }
            // Render speaker card if tool result
            if (
              (part as any).toolName === "showSpeaker" &&
              (part as any).result
            ) {
              return <VoiceSpeakerCard key={idx} data={(part as any).result} />;
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
