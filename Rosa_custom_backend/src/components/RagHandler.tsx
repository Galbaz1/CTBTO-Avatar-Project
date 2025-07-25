import React, { useEffect } from 'react';

interface RagHandlerProps {
  conversationId: string;
  onRagUpdate?: (data: any) => void;
}

export const RagHandler: React.FC<RagHandlerProps> = ({ 
  conversationId, 
  onRagUpdate 
}) => {
  useEffect(() => {
    console.log('🔍 RagHandler effect triggered with conversationId:', conversationId);
    
    if (!conversationId || conversationId === '') {
      console.log('❌ RagHandler: No conversationId, skipping polling');
      return;
    }
    
    console.log('✅ RagHandler: Starting polling for conversationId:', conversationId);

    const pollRagData = async () => {
      try {
        console.log('🔍 RagHandler: Polling RAG endpoints for:', conversationId);
        
        // Poll all RAG endpoints
        const [sessionRes, speakerRes, topicRes] = await Promise.all([
          fetch(`http://localhost:8000/latest-session/${conversationId}`),
          fetch(`http://localhost:8000/latest-speaker/${conversationId}`),
          fetch(`http://localhost:8000/latest-topic/${conversationId}`)
        ]).catch(error => {
          console.error('❌ RagHandler: Failed to fetch:', error);
          return [null, null, null];
        });
        
        if (!sessionRes || !speakerRes || !topicRes) {
          return;
        }

        console.log('🔍 RagHandler: Response status:', {
          session: sessionRes.status,
          speaker: speakerRes.status, 
          topic: topicRes.status
        });

        const [sessionData, speakerData, topicData] = await Promise.all([
          sessionRes.ok ? sessionRes.json() : null,
          speakerRes.ok ? speakerRes.json() : null,
          topicRes.ok ? topicRes.json() : null
        ]);

        console.log('🔍 RagHandler: Parsed data:', {
          session: sessionData,
          speaker: speakerData,
          topic: topicData
        });
        
        // Add endpoint URLs for debugging
        console.log('🔍 RagHandler: Polled endpoints:', {
          session: `http://localhost:8000/latest-session/${conversationId}`,
          speaker: `http://localhost:8000/latest-speaker/${conversationId}`,
          topic: `http://localhost:8000/latest-topic/${conversationId}`
        });

        // If any data found, trigger update
        if (sessionData || speakerData || topicData) {
          console.log('🔍 RagHandler: Triggering RAG update!');
          onRagUpdate?.({
            session: sessionData,
            speaker: speakerData,
            topic: topicData
          });
        }
      } catch (error) {
        console.error('❌ RAG polling error:', error);
      }
    };

        // Poll every 2 seconds (same as weather)
    const interval = setInterval(pollRagData, 2000);
    pollRagData(); // Initial poll

    return () => {
      console.log('🔍 RagHandler: Cleaning up polling for:', conversationId);
      clearInterval(interval);
    };
  }, [conversationId, onRagUpdate]);

  return null; // Handler component renders nothing
}; 