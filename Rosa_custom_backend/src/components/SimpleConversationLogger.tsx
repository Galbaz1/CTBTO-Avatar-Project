import { useEffect, useRef } from 'react';
import { useDailyEvent, useMeetingState } from '@daily-co/daily-react';
import { loggers } from '../utils/logger';

interface SimpleConversationLoggerProps {
  conversationId?: string;
  enabled?: boolean;
}

// Enhanced logger instance for conversation tracking
const conversationLogger = loggers.conversation;

export const SimpleConversationLogger: React.FC<SimpleConversationLoggerProps> = ({ 
  conversationId, 
  enabled = true 
}) => {
  const meetingState = useMeetingState();
  const lastUtteranceRef = useRef<string>('');
  const isUserSpeakingRef = useRef<boolean>(false);

  if (!enabled) return null;

  // Log important connection status changes only
  useEffect(() => {
    if (meetingState === 'joined-meeting') {
      simpleLog.status('Connected to ROSA', 'info');
    } else if (meetingState === 'left-meeting') {
      simpleLog.status('Disconnected from ROSA', 'info');
    } else if (meetingState === 'error') {
      simpleLog.status('Connection error', 'error');
    }
  }, [meetingState]);

  // Listen for conversation events - focus on actual content
  useDailyEvent('app-message', (event: any) => {
    const data = event.data;
    
    // Track who's speaking to better identify message source
    if (data?.event_type === 'conversation.user.started_speaking') {
      isUserSpeakingRef.current = true;
    } else if (data?.event_type === 'conversation.user.stopped_speaking') {
      isUserSpeakingRef.current = false;
    } else if (data?.event_type === 'conversation.replica.started_speaking') {
      isUserSpeakingRef.current = false;
    }
    
    // Extract actual conversation text from utterances
    if (data?.event_type === 'conversation.utterance') {
      const text = data.properties?.speech; // ✅ Fixed: Use 'speech' instead of 'text'
      const role = data.properties?.role;   // ✅ Use provided role instead of guessing
      
      if (text && text !== lastUtteranceRef.current && text.length > 3) {
        lastUtteranceRef.current = text;
        
        // Use the provided role to identify speaker
        if (role === 'user') {
          conversationLogger.user(text);
        } else if (role === 'replica') {
          conversationLogger.assistant(text);
        }
      }
    }

    // Also capture conversation.respond events (our tool responses)
    if (data?.event_type === 'conversation.respond' && data.properties?.text) {
      const text = data.properties.text;
      if (text !== lastUtteranceRef.current) {
        lastUtteranceRef.current = text;
        conversationLogger.assistant(text);
      }
    }

    // Log tool calls with essential details
    if (data?.event_type === 'conversation.tool_call') {
      const toolName = data.properties?.name;
      const args = data.properties?.arguments;
      conversationLogger.toolCall(toolName, args);
    }

    // Log errors
    if (data?.event_type?.includes('error')) {
      conversationLogger.error(`Conversation error: ${data.event_type}`);
    }
  });

  // Initialize
  useEffect(() => {
    if (conversationId && enabled) {
      // Set session ID for correlation with backend logs
      conversationLogger.setSessionId(conversationId);
      
      console.clear(); // Clear previous logs for fresh start
      conversationLogger.sessionState('started');
      console.log('%c💡 Enhanced Logging - Session Correlated with Backend', 
        'color: #ffa502; font-style: italic;');
      console.log(''); // Empty line
    }

    return () => {
      if (conversationId) {
        conversationLogger.sessionState('ended');
        conversationLogger.setSessionId(null);
      }
    };
  }, [conversationId, enabled]);

  return null;
}; 