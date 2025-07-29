import React, { useEffect } from 'react';
import type { TopicCardData } from '../../cards/enhanced/TimetableProcessor';

interface TopicHandlerProps {
  meetingState: string;
  conversationId: string;
  onTopicUpdate: (topicData: TopicCardData) => void;
}

export const TopicHandler: React.FC<TopicHandlerProps> = ({
  meetingState,
  conversationId,
  onTopicUpdate
}) => {
  useEffect(() => {
    if (meetingState !== 'joined-meeting') return;

    let lastTopicData: TopicCardData | null = null;

    const pollTopicData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/latest-topic/${conversationId}`);
        if (response.ok) {
          const topicData = await response.json();
          
          // Only update if data has changed (deep comparison for topic data)
          if (topicData && JSON.stringify(topicData) !== JSON.stringify(lastTopicData)) {
            lastTopicData = topicData;
            onTopicUpdate(topicData);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch topic data:', error);
      }
    };

    // Start polling every 2 seconds (exact weather pattern)
    const interval = setInterval(pollTopicData, 2000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [meetingState, conversationId, onTopicUpdate]);

  // This component doesn't render anything - it's just a data handler
  return null;
}; 