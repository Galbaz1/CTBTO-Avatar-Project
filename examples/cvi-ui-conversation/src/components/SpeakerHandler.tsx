import { useEffect } from 'react';
import { useDailyEvent, useDaily } from '@daily-co/daily-react';

interface SpeakerData {
  id: string;
  name: string;
  title: string;
  organization: string;
  photo_url: string;
  session_topic: string;
  session_time: string;
  session_room: string;
  expertise: string[];
  bio_summary: string;
}

interface SpeakerListData {
  success: boolean;
  message: string;
  speakers: SpeakerData[];
  search_topic: string;
  save_humanity_message: string;
}

interface SpeakerHandlerProps {
  onSpeakerUpdate?: (data: SpeakerData) => void;
  onSpeakerListUpdate?: (data: SpeakerListData) => void;
  conversationId?: string;
}

// Simple speaker logging - following weather/CTBTO pattern
const speakerLog = {
  toolCall: (toolName: string, topic: string) => {
    console.log(`%c👥 ${toolName}: ${topic}`, 'color: #3742fa; font-weight: bold;');
  },
  
  success: (toolName: string, speakerCount: number) => {
    console.log(`%c✅ ${toolName} success: ${speakerCount} speakers`, 'color: #3742fa; font-weight: bold;');
  },
  
  error: (toolName: string, error: string) => {
    console.log(`%c❌ ${toolName} error: ${error}`, 'color: #ff4757; font-weight: bold;');
  }
};

export const SpeakerHandler: React.FC<SpeakerHandlerProps> = ({ 
  onSpeakerUpdate, 
  onSpeakerListUpdate, 
  conversationId 
}) => {
  const daily = useDaily();
  
  // Listen for Rosa's tool calls - following CTBTOHandler pattern exactly
  useDailyEvent('conversation.tool_call', async (event: any) => {
    try {
      const { tool_call } = event;
      
      if (!tool_call?.function?.name) {
        return;
      }
      
      const toolName = tool_call.function.name;
      const args = tool_call.function.arguments;
      
      // Handle findSpeakers tool call
      if (toolName === 'findSpeakers') {
        const topic = args?.topic || '';
        speakerLog.toolCall('findSpeakers', topic);
        
        try {
          // Call our backend API
          const response = await fetch('http://localhost:8000/api/speakers/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              topic: topic,
              language: args?.language || 'en'
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: SpeakerListData = await response.json();
          speakerLog.success('findSpeakers', data.speakers.length);
          
          // Update parent component if handler provided
          if (onSpeakerListUpdate) {
            onSpeakerListUpdate(data);
          }
          
          // Send formatted response back to Rosa
          if (daily && conversationId) {
            const speakersList = data.speakers.map(s => 
              `${s.name} (${s.title}) - Session: "${s.session_topic}" at ${s.session_time} in ${s.session_room}`
            ).join('\n');
            
            const responseMessage = data.success 
              ? `Found ${data.speakers.length} speaker(s) for "${topic}":\n\n${speakersList}\n\n${data.save_humanity_message}`
              : `No speakers found for "${topic}". Please try a different topic or ask about specific expertise areas.`;
            
            daily.sendAppMessage('speaker-search-complete', {
              tool_call_id: tool_call.id,
              response: responseMessage,
              speakers: data.speakers,
              search_topic: topic
            });
          }
          
        } catch (error) {
          speakerLog.error('findSpeakers', String(error));
          
          // Send error response back to Rosa
          if (daily && conversationId) {
            daily.sendAppMessage('speaker-search-error', {
              tool_call_id: tool_call.id,
              response: `I apologize, but I encountered an error searching for speakers about "${topic}". Please try again or ask about different topics.`,
              error: String(error)
            });
          }
        }
      }
      
      // Handle getSpeakerInfo tool call
      if (toolName === 'getSpeakerInfo') {
        const speakerId = args?.speaker_id || '';
        speakerLog.toolCall('getSpeakerInfo', speakerId);
        
        try {
          // Call our backend API
          const response = await fetch(`http://localhost:8000/api/speakers/${speakerId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          speakerLog.success('getSpeakerInfo', data.success ? 1 : 0);
          
          if (data.success && data.speaker) {
            // Update parent component if handler provided
            if (onSpeakerUpdate) {
              onSpeakerUpdate(data.speaker);
            }
            
            // Send formatted response back to Rosa
            if (daily && conversationId) {
              const speaker = data.speaker;
              const responseMessage = `${speaker.name} - ${speaker.title} at ${speaker.organization}\n\nSession: "${speaker.session.topic}"\nTime: ${speaker.session.time} in ${speaker.session.room}\n\nExpertise: ${speaker.expertise.join(', ')}\n\n${speaker.bio_summary}\n\n${data.save_humanity_message}`;
              
              daily.sendAppMessage('speaker-info-complete', {
                tool_call_id: tool_call.id,
                response: responseMessage,
                speaker: speaker
              });
            }
          } else {
            // Send not found response
            if (daily && conversationId) {
              daily.sendAppMessage('speaker-info-error', {
                tool_call_id: tool_call.id,
                response: `I couldn't find information about speaker "${speakerId}". Please check the speaker name or ID.`,
                error: data.message
              });
            }
          }
          
        } catch (error) {
          speakerLog.error('getSpeakerInfo', String(error));
          
          // Send error response back to Rosa
          if (daily && conversationId) {
            daily.sendAppMessage('speaker-info-error', {
              tool_call_id: tool_call.id,
              response: `I apologize, but I encountered an error retrieving information about "${speakerId}". Please try again.`,
              error: String(error)
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Speaker handler error:', error);
    }
  });
  
  return null; // This is an event handler component, no UI needed
}; 