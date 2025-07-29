import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SessionHandler, SpeakerHandler, TopicHandler, VenueHandler } from './rag';
import type { 
  TimetableEntry as SessionCardData,
  SpeakerCardData,
  TopicCardData,
  VenueCardData
} from '../cards/enhanced/TimetableProcessor';

interface HandlerStats {
  totalUpdates: number;
  lastUpdateTime: number;
  errorCount: number;
  activeHandlers: string[];
}

interface HandlerIntegrationManagerProps {
  meetingState: string;
  conversationId: string;
  onCardUpdate: (cardData: any, cardType: string) => void;
  enabledHandlers?: {
    session?: boolean;
    speaker?: boolean;
    topic?: boolean;
    venue?: boolean;
  };
}

/**
 * Handler Integration Manager - Coordinates all card handlers
 * 
 * Features:
 * - Central coordination of all card type handlers
 * - Intelligent polling state management
 * - Performance optimization with update deduplication
 * - Error handling and recovery
 * - Debug statistics for development
 */
export const HandlerIntegrationManager: React.FC<HandlerIntegrationManagerProps> = ({
  meetingState,
  conversationId,
  onCardUpdate,
  enabledHandlers = {
    session: true,
    speaker: true,
    topic: true,
    venue: true
  }
}) => {
  const [stats, setStats] = useState<HandlerStats>({
    totalUpdates: 0,
    lastUpdateTime: 0,
    errorCount: 0,
    activeHandlers: []
  });

  const lastDataRefs = useRef<{
    session?: SessionCardData;
    speaker?: SpeakerCardData;
    topic?: TopicCardData;
    venue?: VenueCardData;
  }>({});

  const errorCountRef = useRef<number>(0);

  // Update stats when handlers become active/inactive
  useEffect(() => {
    const activeHandlers = Object.entries(enabledHandlers)
      .filter(([_, enabled]) => enabled)
      .map(([handler, _]) => handler);
    
    setStats(prev => ({
      ...prev,
      activeHandlers
    }));
  }, [enabledHandlers]);

  // Centralized update handler with deduplication and stats
  const handleCardUpdate = useCallback((cardData: any, cardType: string) => {
    try {
      // Skip if data hasn't actually changed (additional layer of deduplication)
      const lastData = lastDataRefs.current[cardType as keyof typeof lastDataRefs.current];
      if (lastData && JSON.stringify(lastData) === JSON.stringify(cardData)) {
        return;
      }

      // Store the new data
      lastDataRefs.current[cardType as keyof typeof lastDataRefs.current] = cardData;

      // Update stats
      setStats(prev => ({
        ...prev,
        totalUpdates: prev.totalUpdates + 1,
        lastUpdateTime: Date.now()
      }));

      // Forward to parent handler
      onCardUpdate(cardData, cardType);

      console.log(`📊 Handler Manager: ${cardType} card updated (Total: ${stats.totalUpdates + 1})`);
    } catch (error) {
      console.error(`❌ Handler Manager error for ${cardType}:`, error);
      errorCountRef.current += 1;
      setStats(prev => ({
        ...prev,
        errorCount: errorCountRef.current
      }));
    }
  }, [onCardUpdate, stats.totalUpdates]);

  // Individual handler callbacks
  const handleSessionUpdate = useCallback((data: SessionCardData) => {
    handleCardUpdate(data, 'session');
  }, [handleCardUpdate]);

  const handleSpeakerUpdate = useCallback((data: SpeakerCardData) => {
    handleCardUpdate(data, 'speaker');
  }, [handleCardUpdate]);

  const handleTopicUpdate = useCallback((data: TopicCardData) => {
    handleCardUpdate(data, 'topic');
  }, [handleCardUpdate]);

  const handleVenueUpdate = useCallback((data: VenueCardData) => {
    handleCardUpdate(data, 'venue');
  }, [handleCardUpdate]);

  // Only render handlers that are enabled
  return (
    <>
      {/* Session Handler */}
      {enabledHandlers.session && (
        <SessionHandler
          meetingState={meetingState}
          conversationId={conversationId}
          onSessionUpdate={handleSessionUpdate}
        />
      )}

      {/* Speaker Handler */}
      {enabledHandlers.speaker && (
        <SpeakerHandler
          meetingState={meetingState}
          conversationId={conversationId}
          onSpeakerUpdate={handleSpeakerUpdate}
        />
      )}

      {/* Topic Handler */}
      {enabledHandlers.topic && (
        <TopicHandler
          meetingState={meetingState}
          conversationId={conversationId}
          onTopicUpdate={handleTopicUpdate}
        />
      )}

      {/* Venue Handler */}
      {enabledHandlers.venue && (
        <VenueHandler
          meetingState={meetingState}
          conversationId={conversationId}
          onVenueUpdate={handleVenueUpdate}
        />
      )}

      {/* Debug Statistics (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '140px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '10px',
          zIndex: 9999,
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            📊 Handler Manager Stats
          </div>
          <div>Session: {conversationId}</div>
          <div>Meeting State: {meetingState}</div>
          <div>Total Updates: {stats.totalUpdates}</div>
          <div>Errors: {stats.errorCount}</div>
          <div>Active Handlers: {stats.activeHandlers.join(', ')}</div>
          <div>Last Update: {stats.lastUpdateTime > 0 ? 
            new Date(stats.lastUpdateTime).toLocaleTimeString() : 'None'}</div>
        </div>
      )}
    </>
  );
}; 