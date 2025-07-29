import React, { useRef } from "react";
import type { TopicCardData } from "../../cards/enhanced/TimetableProcessor";
import { useSSE } from "../../../hooks/useSSE";

interface TopicHandlerProps {
  meetingState: string;
  conversationId: string;
  onTopicUpdate: (topicData: TopicCardData) => void;
}

export const TopicHandler: React.FC<TopicHandlerProps> = ({
  meetingState,
  conversationId,
  onTopicUpdate,
}) => {
  const sseUrl =
    meetingState === "joined-meeting"
      ? `http://localhost:8000/sse/topic/${conversationId}`
      : null;
  const lastTopicDataRef = useRef<TopicCardData | null>(null);

  useSSE<TopicCardData>(sseUrl, (topicData) => {
    if (
      topicData &&
      JSON.stringify(topicData) !== JSON.stringify(lastTopicDataRef.current)
    ) {
      lastTopicDataRef.current = topicData;
      onTopicUpdate(topicData);
    }
  });

  return null;
};
