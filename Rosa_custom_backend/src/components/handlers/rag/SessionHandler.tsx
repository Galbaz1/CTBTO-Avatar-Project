import React, { useEffect } from 'react';
import { SessionCardData } from '../../../types';

interface SessionHandlerProps {
  meetingState: string;
  conversationId: string;
  onSessionUpdate: (data: SessionCardData) => void;
}

export const SessionHandler: React.FC<SessionHandlerProps> = ({
  meetingState,
  conversationId,
  onSessionUpdate
}) => {
  useEffect(() => {
    if (meetingState !== 'joined-meeting') return;

    let lastSessionData: SessionCardData | null = null;

    const pollSessionData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/latest-session/${conversationId}`);
        if (response.ok) {
          const sessionData = await response.json();
          
          // Only update if data has changed (deep comparison for session data)
          if (sessionData && JSON.stringify(sessionData) !== JSON.stringify(lastSessionData)) {
            lastSessionData = sessionData;
            onSessionUpdate(sessionData);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch session data:', error);
      }
    };

    // Start polling every 2 seconds (exact weather pattern)
    const interval = setInterval(pollSessionData, 2000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [meetingState, conversationId, onSessionUpdate]);

  // This component doesn't render anything - it's just a data handler
  return null;
}; 