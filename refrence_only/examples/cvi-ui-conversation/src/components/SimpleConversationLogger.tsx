import { useEffect, useRef } from 'react';
import { useDailyEvent, useMeetingState } from '@daily-co/daily-react';

interface SimpleConversationLoggerProps {
  conversationId?: string;
  enabled?: boolean;
}

// Simple, focused logging utility
const simpleLog = {
  conversation: (speaker: 'User' | 'ROSA', text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = speaker === 'User' ? '👤' : '🤖';
    const color = speaker === 'User' ? '#3742fa' : '#2ed573';
    
    console.log(`%c${emoji} ${speaker} [${timestamp}]:`, `color: ${color}; font-weight: bold; font-size: 14px;`);
    console.log(`%c"${text}"`, `color: ${color}; font-style: italic; margin-left: 20px;`);
    console.log(''); // Empty line for readability
  },

  toolCall: (toolName: string, args: any, success?: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = success === undefined ? '' : success ? ' ✅' : ' ❌';
    
    console.group(`%c🔧 Tool Call [${timestamp}]${status}`, 'color: #ff6b6b; font-weight: bold;');
    console.log(`Function: ${toolName}`);
    if (args) {
      try {
        const parsed = typeof args === 'string' ? JSON.parse(args) : args;
        if (parsed.location) console.log(`Location: ${parsed.location}`);
        if (parsed.response_to_user) console.log(`Context: ${parsed.response_to_user}`);
      } catch {
        console.log('Arguments:', args);
      }
    }
    console.groupEnd();
    console.log(''); // Empty line for readability
  },

  status: (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    const color = type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#54a0ff';
    
    console.log(`%c${emoji} ${message} [${timestamp}]`, `color: ${color}; font-weight: bold;`);
  }
};

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
          simpleLog.conversation('User', text);
        } else if (role === 'replica') {
          simpleLog.conversation('ROSA', text);
        }
      }
    }

    // Also capture conversation.respond events (our tool responses)
    if (data?.event_type === 'conversation.respond' && data.properties?.text) {
      const text = data.properties.text;
      if (text !== lastUtteranceRef.current) {
        lastUtteranceRef.current = text;
        simpleLog.conversation('ROSA', text);
      }
    }

    // Log tool calls with essential details
    if (data?.event_type === 'conversation.tool_call') {
      const toolName = data.properties?.name;
      const args = data.properties?.arguments;
      simpleLog.toolCall(toolName, args);
    }

    // Log errors
    if (data?.event_type?.includes('error')) {
      simpleLog.status(`Conversation error: ${data.event_type}`, 'error');
    }
  });

  // Initialize
  useEffect(() => {
    if (conversationId && enabled) {
      console.clear(); // Clear previous logs for fresh start
      simpleLog.status('🚀 ROSA Conversation Started', 'info');
      console.log('%c💡 Simple Logging Mode - Showing only: User Input, ROSA Responses, Tool Calls, Status Changes', 
        'color: #ffa502; font-style: italic;');
      console.log(''); // Empty line
    }

    return () => {
      if (conversationId) {
        simpleLog.status('📞 Conversation Ended', 'info');
      }
    };
  }, [conversationId, enabled]);

  return null;
}; 