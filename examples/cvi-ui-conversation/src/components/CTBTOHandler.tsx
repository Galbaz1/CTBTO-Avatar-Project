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

// 🎯 REMOVED: SpeakerData interface - now handled by dedicated SpeakerHandler

interface CTBTOHandlerProps {
  onCTBTOUpdate?: (data: CTBTOData) => void;
  // 🎯 REMOVED: onSpeakerUpdate - now handled by dedicated SpeakerHandler
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

export const CTBTOHandler: React.FC<CTBTOHandlerProps> = ({ onCTBTOUpdate, conversationId }) => {
  const daily = useDaily();
  
  // Listen for CTBTO tool calls only - following SimpleWeatherHandler pattern
  // 🚀 SPECULATIVE INFERENCE COMPATIBLE: Event handling optimized for volatile inference_id
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Handle CTBTO tool calls - support multiple CTBTO tools
    // Note: With speculative_inference enabled, inference_id changes frequently during speech
    // We rely on event_type and tool name for routing, not inference_id correlation
    const isCTBTOToolCall = data?.event_type === 'conversation.tool_call' && 
        (data?.properties?.name === 'getCTBTOInfo' || 
         data?.properties?.name === 'getCTBTOInformation');
    
    // 🎯 REMOVED: Speaker handling moved to dedicated SpeakerHandler
    // The CTBTOHandler now only handles CTBTO-specific information queries
    
    if (isCTBTOToolCall) {
      try {
        // Parse the topic from the tool call arguments
        let topic = 'CTBTO nuclear verification'; // Default topic
        let language = 'en';
        
        // Robust argument parsing for speculative inference environments
        if (data.properties.arguments && data.properties.arguments !== '{}') {
          try {
            const args = JSON.parse(data.properties.arguments);
            topic = args.topic || args.question || topic;
            language = args.language || 'en';
          } catch (e) {
            console.warn('CTBTO args parsing failed:', e);
            // Continue with defaults - speculative inference may send partial args
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
  });

  return null; // This is a headless component
}; 