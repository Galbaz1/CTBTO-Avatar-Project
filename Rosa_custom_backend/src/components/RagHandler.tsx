import React, { useEffect } from 'react';
import { loggers } from '../utils/logger';

interface RagHandlerProps {
  conversationId: string;
  onRagUpdate?: (data: any) => void;
}

export const RagHandler: React.FC<RagHandlerProps> = ({ 
  conversationId, 
  onRagUpdate 
}) => {
  useEffect(() => {
    if (!conversationId || conversationId === '') {
      return;
    }
    
    // Set session ID for correlation
    loggers.connection.setSessionId(conversationId);
    loggers.connection.sessionState('RAG polling started');

    const pollRagData = async () => {
      try {
        // Silent polling - only log meaningful events
        const [sessionRes, speakerRes, topicRes] = await Promise.all([
          fetch(`http://localhost:8000/latest-session/${conversationId}`),
          fetch(`http://localhost:8000/latest-speaker/${conversationId}`),
          fetch(`http://localhost:8000/latest-topic/${conversationId}`)
        ]).catch(error => {
          loggers.connection.error(`RAG polling failed: ${error.message}`);
          return [null, null, null];
        });
        
        if (!sessionRes || !speakerRes || !topicRes) {
          return;
        }

        const [sessionData, speakerData, topicData] = await Promise.all([
          sessionRes.ok ? sessionRes.json() : null,
          speakerRes.ok ? speakerRes.json() : null,
          topicRes.ok ? topicRes.json() : null
        ]);

        // Only log when new data is found
        if (sessionData || speakerData || topicData) {
          const cardTypes = [];
          if (sessionData) cardTypes.push('session');
          if (speakerData) cardTypes.push('speaker');
          if (topicData) cardTypes.push('topic');
          
          loggers.connection.cardShow('RAG', `${cardTypes.join(', ')} cards available`);
          
          onRagUpdate?.({
            session: sessionData,
            speaker: speakerData,
            topic: topicData
          });
        }
      } catch (error) {
        loggers.connection.error(`RAG polling error: ${error.message}`);
      }
    };

        // Poll every 2 seconds (same as weather)
    const interval = setInterval(pollRagData, 2000);
    pollRagData(); // Initial poll

    return () => {
      loggers.connection.sessionState('RAG polling stopped');
      clearInterval(interval);
    };
  }, [conversationId, onRagUpdate]);

  return null; // Handler component renders nothing
}; 