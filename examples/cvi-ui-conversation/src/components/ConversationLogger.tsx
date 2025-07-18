import { useEffect } from 'react';
import { useDailyEvent, useMeetingState, useParticipantIds, useDaily } from '@daily-co/daily-react';

interface ConversationLoggerProps {
  conversationId?: string;
  enabled?: boolean;
}

// Enhanced logging utility with color coding and timestamps
const createLogger = (category: string, color: string) => {
  return {
    info: (event: string, data?: any) => {
      console.group(`%c🔍 ${category.toUpperCase()} - ${event.toUpperCase()} [${new Date().toISOString()}]`, 
        `color: ${color}; font-weight: bold;`);
      if (data) console.log('📋 Data:', data);
      console.groupEnd();
    },
    warn: (event: string, data?: any) => {
      console.group(`%c⚠️ ${category.toUpperCase()} WARNING - ${event.toUpperCase()} [${new Date().toISOString()}]`, 
        'color: #ffa502; font-weight: bold;');
      if (data) console.log('📋 Data:', data);
      console.groupEnd();
    },
    error: (event: string, data?: any) => {
      console.group(`%c❌ ${category.toUpperCase()} ERROR - ${event.toUpperCase()} [${new Date().toISOString()}]`, 
        'color: #ff4757; font-weight: bold;');
      if (data) console.log('📋 Data:', data);
      console.groupEnd();
    }
  };
};

// Category-specific loggers
const loggers = {
  connection: createLogger('connection', '#3742fa'),
  conversation: createLogger('conversation', '#2ed573'),
  toolCall: createLogger('tool-call', '#ff6b6b'),
  participant: createLogger('participant', '#5f27cd'),
  audio: createLogger('audio', '#00d2d3'),
  video: createLogger('video', '#ff9ff3'),
  error: createLogger('error', '#ff4757'),
  general: createLogger('general', '#54a0ff')
};

export const ConversationLogger: React.FC<ConversationLoggerProps> = ({ 
  conversationId, 
  enabled = true 
}) => {
  const meetingState = useMeetingState();
  const participantIds = useParticipantIds();
  const daily = useDaily();

  // Don't log if disabled
  if (!enabled) return null;

  // Log meeting state changes
  useEffect(() => {
    loggers.connection.info('meeting-state-changed', {
      newState: meetingState,
      conversationId,
      timestamp: new Date().toISOString()
    });
  }, [meetingState, conversationId]);

  // Log participant changes
  useEffect(() => {
    const participantDetails = participantIds.map(id => {
      const participant = daily?.participants()[id];
      return {
        sessionId: id,
        userName: participant?.user_name,
        local: participant?.local,
        owner: participant?.owner,
        userId: participant?.user_id,
        permissions: participant?.permissions,
        tracks: {
          audio: participant?.tracks?.audio?.state,
          video: participant?.tracks?.video?.state,
          screenVideo: participant?.tracks?.screenVideo?.state
        }
      };
    });

    loggers.participant.info('participants-updated', {
      participantCount: participantIds.length,
      participantIds,
      participants: participantDetails,
      conversationId
    });
  }, [participantIds, daily, conversationId]);

  // Listen for all app messages (tool calls, etc.)
  useDailyEvent('app-message', (event: any) => {
    const data = event.data;
    
    loggers.general.info('app-message-received', {
      eventType: data?.event_type,
      messageType: data?.message_type,
      properties: data?.properties,
      conversationId: data?.conversation_id || conversationId,
      fromParticipant: event.fromId,
      rawData: data
    });

    // Specific logging for tool calls
    if (data?.event_type === 'conversation.tool_call') {
      loggers.toolCall.info('function-call-received', {
        toolName: data.properties?.name,
        arguments: data.properties?.arguments,
        argumentsParsed: (() => {
          try {
            return JSON.parse(data.properties?.arguments || '{}');
          } catch {
            return 'Failed to parse arguments';
          }
        })(),
        conversationId: data.conversation_id,
        fromParticipant: event.fromId,
        timestamp: new Date().toISOString()
      });
    }

    // Log conversation responses
    if (data?.event_type === 'conversation.respond') {
      loggers.conversation.info('response-sent', {
        responseText: data.properties?.text,
        responseLength: data.properties?.text?.length,
        conversationId: data.conversation_id,
        timestamp: new Date().toISOString()
      });
    }

    // Log replica events
    if (data?.event_type?.startsWith('conversation.replica.')) {
      loggers.conversation.info('replica-event', {
        eventType: data.event_type,
        properties: data.properties,
        conversationId: data.conversation_id,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Listen for participant events
  useDailyEvent('participant-joined', (event) => {
    loggers.participant.info('participant-joined', {
      participant: {
        sessionId: event.participant.session_id,
        userName: event.participant.user_name,
        userId: event.participant.user_id,
        local: event.participant.local,
        owner: event.participant.owner
      },
      conversationId
    });
  });

  useDailyEvent('participant-left', (event) => {
    loggers.participant.info('participant-left', {
      participant: {
        sessionId: event.participant.session_id,
        userName: event.participant.user_name,
        userId: event.participant.user_id,
        reason: event.reason
      },
      conversationId
    });
  });

  // Listen for track events
  useDailyEvent('track-started', (event) => {
    loggers.audio.info('track-started', {
      participant: event.participant?.session_id,
      participantUserId: event.participant?.user_id,
      track: {
        kind: event.track?.kind,
        enabled: event.track?.enabled,
        id: event.track?.id
      },
      conversationId
    });
  });

  useDailyEvent('track-stopped', (event) => {
    loggers.audio.info('track-stopped', {
      participant: event.participant?.session_id,
      participantUserId: event.participant?.user_id,
      track: {
        kind: event.track?.kind,
        id: event.track?.id
      },
      conversationId
    });
  });

  // Listen for error events
  useDailyEvent('error', (event) => {
    loggers.error.error('daily-error', {
      error: event.error,
      errorMsg: event.errorMsg,
      details: event.details,
      conversationId
    });
  });

  // Listen for network events
  useDailyEvent('network-quality-change', (event) => {
    loggers.connection.info('network-quality-changed', {
      quality: event.quality,
      participant: event.participant?.session_id,
      participantUserId: event.participant?.user_id,
      conversationId
    });
  });

  // Listen for recording events
  useDailyEvent('recording-started', (event) => {
    loggers.general.info('recording-started', {
      recordingId: event.recordingId,
      conversationId
    });
  });

  useDailyEvent('recording-stopped', (event) => {
    loggers.general.info('recording-stopped', {
      recordingId: event.recordingId,
      conversationId
    });
  });

  // Listen for speaking events (useful for tracking when ROSA is speaking)
  useDailyEvent('active-speaker-change', (event) => {
    loggers.conversation.info('active-speaker-changed', {
      activeSpeaker: event.activeSpeaker,
      conversationId
    });
  });

  // Listen for call object events
  useDailyEvent('joined-meeting', (event) => {
    loggers.connection.info('meeting-joined', {
      participants: event.participants,
      conversationId
    });
  });

  useDailyEvent('left-meeting', (event) => {
    loggers.connection.info('meeting-left', {
      reason: event.reason,
      conversationId
    });
  });

  // Log component lifecycle
  useEffect(() => {
    loggers.general.info('conversation-logger-initialized', {
      conversationId,
      enabled,
      participantCount: participantIds.length,
      meetingState,
      timestamp: new Date().toISOString()
    });

    return () => {
      loggers.general.info('conversation-logger-cleanup', {
        conversationId,
        timestamp: new Date().toISOString()
      });
    };
  }, [conversationId, enabled, participantIds.length, meetingState]);

  return null; // This is a headless component
};

export default ConversationLogger; 