import { useDailyEvent, useDaily } from '@daily-co/daily-react';

interface AgendaSession {
  id: string;
  title: string;
  speaker: string;
  time: string;
  room: string;
  type: 'keynote' | 'technical' | 'networking' | 'policy';
  relevance_score: number;
}

interface PersonalizedAgendaData {
  user_interests: string;
  time_commitment: string;
  sessions: AgendaSession[];
  total_duration: string;
  qr_code_url: string;
  export_links: {
    pdf: string;
    ical: string;
  };
}

interface ConferencePlannerHandlerProps {
  onAgendaUpdate?: (data: PersonalizedAgendaData) => void;
  conversationId?: string;
}

// Simple agenda logging - following speaker/weather pattern
const agendaLog = {
  toolCall: (interests: string, timeCommitment: string) => {
    console.log(`%c📅 createPersonalizedAgenda: ${interests} (${timeCommitment})`, 'color: #7c3aed; font-weight: bold;');
  },
  
  success: (sessionCount: number) => {
    console.log(`%c✅ createPersonalizedAgenda success: ${sessionCount} sessions`, 'color: #7c3aed; font-weight: bold;');
  },
  
  error: (error: string) => {
    console.log(`%c❌ createPersonalizedAgenda error: ${error}`, 'color: #ff4757; font-weight: bold;');
  }
};

export const ConferencePlannerHandler: React.FC<ConferencePlannerHandlerProps> = ({ 
  onAgendaUpdate, 
  conversationId 
}) => {
  const daily = useDaily();
  
  // Listen for Rosa's conference planning tool calls
  useDailyEvent('app-message', async (event: any) => {
    try {
      const data = event.data;
      
      // Handle agenda creation tool calls
      const isCreateAgendaCall = data?.event_type === 'conversation.tool_call' && 
          data?.properties?.name === 'createPersonalizedAgenda';
      
      if (!isCreateAgendaCall) {
        return;
      }
      
      // Parse arguments
      let interests = '';
      let timeAvailable = '';
      let preferences = '';
      let language = 'en';
      
      if (data.properties.arguments && data.properties.arguments !== '{}') {
        try {
          const args = JSON.parse(data.properties.arguments);
          interests = args.interests || '';
          timeAvailable = args.time_available || '';
          preferences = args.preferences || '';
          language = args.language || 'en';
        } catch (e) {
          console.error('Failed to parse agenda arguments:', e);
          return;
        }
      }
      
      if (!interests || !timeAvailable) {
        agendaLog.error('Missing required arguments: interests or time_available');
        return;
      }
      
      agendaLog.toolCall(interests, timeAvailable);
      
      try {
        // Call backend service for agenda generation
        const response = await fetch('http://localhost:3002/api/conference/create-agenda', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interests,
            time_available: timeAvailable,
            preferences,
            language,
            conversation_id: conversationId
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const agendaData: PersonalizedAgendaData = await response.json();
        
        agendaLog.success(agendaData.sessions?.length || 0);
        
        // Update UI through callback
        if (onAgendaUpdate) {
          onAgendaUpdate(agendaData);
        }
        
        // Send response back to Rosa
        if (daily) {
          const responseMessage = {
            message_type: 'conversation',
            event_type: 'conversation.echo',
            conversation_id: conversationId,
            properties: {
              text: `Created personalized agenda with ${agendaData.sessions?.length || 0} sessions based on "${interests}" for ${timeAvailable}. Agenda displayed in UI with QR code and export options.`
            }
          };
          
          daily.sendAppMessage(responseMessage, '*');
        }
        
      } catch (error) {
        agendaLog.error(error instanceof Error ? error.message : String(error));
        
        // Send error response back to Rosa
        if (daily) {
          const errorMessage = {
            message_type: 'conversation',
            event_type: 'conversation.echo',
            conversation_id: conversationId,
            properties: {
              text: 'I encountered an issue creating your agenda. Please try again or ask me to help you find specific sessions.'
            }
          };
          
          daily.sendAppMessage(errorMessage, '*');
        }
      }
      
    } catch (error) {
      console.error('ConferencePlanner handler error:', error);
    }
  });

  return null; // This is a headless component
}; 