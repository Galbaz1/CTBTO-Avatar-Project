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
  onSpeakerUpdate?: (speakerData: any) => void;
  onSpeakerListUpdate?: (speakerData: any) => void;
  onSpeakerProfileUpdate?: (speakerData: SpeakerData) => void; // 🎯 NEW: For individual speaker profile switching
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
  onSpeakerProfileUpdate, 
  conversationId 
}) => {
  const daily = useDaily();
  
  // Listen for Rosa's tool calls - following CTBTOHandler pattern exactly
  useDailyEvent('app-message', async (event: any) => {
    try {
      const data = event.data;
      
      // Handle speaker tool calls - following CTBTOHandler pattern
      const isFindSpeakersCall = data?.event_type === 'conversation.tool_call' && 
          data?.properties?.name === 'findSpeakers';
      
      const isGetSpeakerInfoCall = data?.event_type === 'conversation.tool_call' && 
          data?.properties?.name === 'getSpeakerInfo';
      
      if (!isFindSpeakersCall && !isGetSpeakerInfoCall) {
        return;
      }
      
      // Parse arguments - following CTBTOHandler pattern
      let topic = '';
      let speakerId = '';
      let language = 'en';
      
      if (data.properties.arguments && data.properties.arguments !== '{}') {
        try {
          const args = JSON.parse(data.properties.arguments);
          topic = args.topic || '';
          speakerId = args.speaker_id || '';
          language = args.language || 'en';
        } catch (e) {
          console.warn('Speaker args parsing failed:', e);
        }
      }
      
      // Handle findSpeakers tool call
      if (isFindSpeakersCall) {
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
              language: language
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
          
          // Send formatted response back to Rosa - following CTBTOHandler format
          if (daily && conversationId) {
            const speakersList = data.speakers.map(s => 
              `${s.name} (${s.title}) - Session: "${s.session_topic}" at ${s.session_time} in ${s.session_room}`
            ).join('\n');
            
            const formattedResponse = data.success 
              ? `Found ${data.speakers.length} speaker(s) for "${topic}":\n\n${speakersList}\n\n${data.save_humanity_message}`
              : `No speakers found for "${topic}". Please try a different topic or ask about specific expertise areas.`;
            
            await daily.sendAppMessage({
              message_type: 'conversation',
              event_type: 'conversation.echo',
              conversation_id: conversationId,
              properties: {
                text: formattedResponse
              }
            }, '*');
          }
          
        } catch (error) {
          speakerLog.error('findSpeakers', String(error));
          
          // Send error response back to Rosa - following CTBTOHandler format
          if (daily && conversationId) {
            await daily.sendAppMessage({
              message_type: 'conversation',
              event_type: 'conversation.echo',
              conversation_id: conversationId,
              properties: {
                text: `I apologize, but I encountered an error searching for speakers about "${topic}". Please try again or ask about different topics.`
              }
            }, '*');
          }
        }
      }
      
      // Handle getSpeakerInfo tool call
      if (isGetSpeakerInfoCall) {
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
            
            // 🎯 NEW: Trigger speaker profile UI switch
            if (onSpeakerProfileUpdate) {
              onSpeakerProfileUpdate(data.speaker);
            }
            
            // Send formatted response back to Rosa - following CTBTOHandler format
            if (daily && conversationId) {
              const speaker = data.speaker;
              const formattedResponse = `${speaker.name} - ${speaker.title} at ${speaker.organization}\n\nSession: "${speaker.session.topic}"\nTime: ${speaker.session.time} in ${speaker.session.room}\n\nExpertise: ${speaker.expertise.join(', ')}\n\n${speaker.bio_summary}\n\n${data.save_humanity_message}`;
              
              await daily.sendAppMessage({
                message_type: 'conversation',
                event_type: 'conversation.echo',
                conversation_id: conversationId,
                properties: {
                  text: formattedResponse
                }
              }, '*');
            }
          } else {
            // Send not found response - following CTBTOHandler format
            if (daily && conversationId) {
              await daily.sendAppMessage({
                message_type: 'conversation',
                event_type: 'conversation.echo',
                conversation_id: conversationId,
                properties: {
                  text: `I couldn't find information about speaker "${speakerId}". Please check the speaker name or ID.`
                }
              }, '*');
            }
          }
          
        } catch (error) {
          speakerLog.error('getSpeakerInfo', String(error));
          
          // Send error response back to Rosa - following CTBTOHandler format
          if (daily && conversationId) {
            await daily.sendAppMessage({
              message_type: 'conversation',
              event_type: 'conversation.echo',
              conversation_id: conversationId,
              properties: {
                text: `I apologize, but I encountered an error retrieving information about "${speakerId}". Please try again.`
              }
            }, '*');
          }
        }
      }
      
    } catch (error) {
      console.error('Speaker handler error:', error);
    }
  });
  
  return null; // This is an event handler component, no UI needed
}; 