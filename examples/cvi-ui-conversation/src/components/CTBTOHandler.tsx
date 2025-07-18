import { useEffect } from 'react';
import { useDailyEvent, useDaily } from '@daily-co/daily-react';

interface CTBTOData {
  topic: string;
  language: string;
  response: string;
  is_ctbto_related: boolean;
  conference_context: string;
  timestamp: string;
  save_humanity_message: string;
  source: string;
}

interface SpeakerData {
  speaker_name: string;
  language: string;
  biography: string;
  is_ctbto_related: boolean;
  conference_context: string;
  qr_code_url: string;
  mobile_url: string;
  save_humanity_message: string;
  source: string;
}

interface CTBTOHandlerProps {
  onCTBTOUpdate?: (data: CTBTOData) => void;
  onSpeakerUpdate?: (data: SpeakerData) => void;
  conversationId?: string;
}

// Simple CTBTO logging - like weather handler
const ctbtoLog = {
  toolCall: (toolName: string, topic: string) => {
    console.log(`%c🏛️ ${toolName}: ${topic}`, 'color: #2ed573; font-weight: bold;');
  },
  
  success: (toolName: string, responseLength: number) => {
    console.log(`%c✅ ${toolName} success: ${responseLength} chars`, 'color: #2ed573; font-weight: bold;');
  },
  
  error: (toolName: string, error: string) => {
    console.log(`%c❌ ${toolName} error: ${error}`, 'color: #ff4757; font-weight: bold;');
  }
};

export const CTBTOHandler: React.FC<CTBTOHandlerProps> = ({ onCTBTOUpdate, onSpeakerUpdate, conversationId }) => {
  const daily = useDaily();
  
  // Listen for CTBTO tool calls only - following SimpleWeatherHandler pattern
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Handle CTBTO tool calls - support multiple CTBTO tools
    const isCTBTOToolCall = data?.event_type === 'conversation.tool_call' && 
        (data?.properties?.name === 'getCTBTOInfo' || 
         data?.properties?.name === 'getCTBTOInformation');
    
    const isSpeakerToolCall = data?.event_type === 'conversation.tool_call' && 
        (data?.properties?.name === 'getSpeakerInfo' ||
         data?.properties?.name === 'getSpeakerInformation');
    
    if (isCTBTOToolCall) {
      try {
        // Parse the topic from the tool call arguments
        let topic = 'CTBTO nuclear verification'; // Default topic
        let language = 'en';
        
        if (data.properties.arguments && data.properties.arguments !== '{}') {
          try {
            const args = JSON.parse(data.properties.arguments);
            topic = args.topic || args.question || topic;
            language = args.language || 'en';
          } catch (e) {
            console.warn('CTBTO args parsing failed:', e);
          }
        }
        
        ctbtoLog.toolCall('getCTBTOInfo', topic);
        
        // Call CTBTO backend service
        const response = await fetch('http://localhost:3002/api/ctbto/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic, language })
        });
        
        if (!response.ok) {
          throw new Error(`CTBTO service error: ${response.status}`);
        }
        
        const ctbtoData: CTBTOData = await response.json();
        
        // Format response for ROSA - simplified
        const formattedResponse = [
          ctbtoData.response,
          '',
          `📍 Conference Context: ${ctbtoData.conference_context}`,
          `🕒 Information current as of: ${new Date(ctbtoData.timestamp).toLocaleString()}`,
          '',
          `💡 ${ctbtoData.save_humanity_message}`
        ].join('\n');

        ctbtoLog.success('getCTBTOInfo', formattedResponse.length);

        // Send response back to ROSA - following SimpleWeatherHandler format
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.respond',
            conversation_id: conversationId,
            properties: {
              text: formattedResponse
            }
          }, '*');
        }
        
        // Optional: Update UI if callback provided
        if (onCTBTOUpdate) {
          onCTBTOUpdate(ctbtoData);
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        ctbtoLog.error('getCTBTOInfo', errorMsg);
        
        // Send error response to ROSA
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.respond',
            conversation_id: conversationId,
            properties: {
              text: `I apologize, but I'm unable to retrieve CTBTO information at the moment. However, I can tell you that the CTBTO is going to save humanity through its vital nuclear monitoring work. Please try again or ask about a different topic.`
            }
          }, '*');
        }
      }
    }
    
    // Handle Speaker Information tool calls
    if (isSpeakerToolCall) {
      try {
        // Parse the speaker name from the tool call arguments
        let speaker_name = 'Dr. Unknown Speaker'; // Default
        let language = 'en';
        
        if (data.properties.arguments && data.properties.arguments !== '{}') {
          try {
            const args = JSON.parse(data.properties.arguments);
            speaker_name = args.speaker_name || args.name || args.person || speaker_name;
            language = args.language || 'en';
          } catch (e) {
            console.warn('Speaker args parsing failed:', e);
          }
        }
        
        ctbtoLog.toolCall('getSpeakerInfo', speaker_name);
        
        // Call Speaker backend service
        const response = await fetch('http://localhost:3002/api/ctbto/speaker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ speaker_name, language })
        });
        
        if (!response.ok) {
          throw new Error(`Speaker service error: ${response.status}`);
        }
        
        const speakerData: SpeakerData = await response.json();
        
        // Format speaker response for ROSA - simplified
        const formattedResponse = [
          `Information about ${speakerData.speaker_name}:`,
          '',
          speakerData.biography,
          '',
          `📱 Mobile Access: You can scan a QR code for detailed information at ${speakerData.qr_code_url}`,
          '',
          `🏛️ ${speakerData.save_humanity_message}`
        ].join('\n');

        ctbtoLog.success('getSpeakerInfo', formattedResponse.length);

        // Send response back to ROSA - following SimpleWeatherHandler format
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.respond',
            conversation_id: conversationId,
            properties: {
              text: formattedResponse
            }
          }, '*');
        }
        
        // Optional: Update UI if callback provided
        if (onSpeakerUpdate) {
          onSpeakerUpdate(speakerData);
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        ctbtoLog.error('getSpeakerInfo', errorMsg);
        
        // Send error response to ROSA
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.respond',
            conversation_id: conversationId,
            properties: {
              text: `I apologize, but I'm unable to retrieve speaker information at the moment. However, the CTBTO is going to save humanity through its vital nuclear monitoring work. Please ask about CTBTO topics or try again later.`
            }
          }, '*');
        }
      }
    }
  });

  return null; // This is a headless component
}; 