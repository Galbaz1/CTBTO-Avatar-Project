import React, { useEffect } from 'react';
import type { SpeakerCardData } from '../../cards/enhanced/TimetableProcessor';

interface SpeakerHandlerProps {
  meetingState: string;
  conversationId: string;
  onSpeakerUpdate: (speakerData: SpeakerCardData) => void;
}

export const SpeakerHandler: React.FC<SpeakerHandlerProps> = ({
  meetingState,
  conversationId,
  onSpeakerUpdate
}) => {
  useEffect(() => {
    if (meetingState !== 'joined-meeting') return;

    let lastSpeakerData: SpeakerCardData | null = null;

    const pollSpeakerData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/latest-speaker/${conversationId}`);
        if (response.ok) {
          const speakerData = await response.json();
          
          // Only update if data has changed (deep comparison for speaker data)
          if (speakerData && JSON.stringify(speakerData) !== JSON.stringify(lastSpeakerData)) {
            lastSpeakerData = speakerData;
            onSpeakerUpdate(speakerData);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch speaker data:', error);
      }
    };

    // Start polling every 2 seconds (exact weather pattern)
    const interval = setInterval(pollSpeakerData, 2000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [meetingState, conversationId, onSpeakerUpdate]);

  // This component doesn't render anything - it's just a data handler
  return null;
}; 