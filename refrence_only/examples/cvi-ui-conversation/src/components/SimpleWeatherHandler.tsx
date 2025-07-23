import { useEffect } from 'react';
import { useDailyEvent, useDaily } from '@daily-co/daily-react';

interface WeatherData {
  location: string;
  localTime: string;
  timezone: string;
  temperature: {
    celsius: number;
    fahrenheit: number;
  };
  condition: string;
  humidity: number;
  windKph: number;
  feelsLikeC: number;
  visibility: number;
  isDay: boolean;
  isConferenceLocation?: boolean;
  conferenceWeatherAdvice?: string;
}

interface SimpleWeatherHandlerProps {
  onWeatherUpdate?: (weather: WeatherData) => void;
  conversationId?: string;
}

// Simple weather logging
const weatherLog = {
  toolCall: (location: string) => {
    console.log(`%c🌤️ Getting weather for: ${location}`, 'color: #ffa502; font-weight: bold;');
  },
  
  success: (weather: WeatherData) => {
    console.log(`%c✅ Weather retrieved: ${weather.temperature.celsius}°C, ${weather.condition}`, 'color: #2ed573; font-weight: bold;');
  },
  
  error: (error: string) => {
    console.log(`%c❌ Weather error: ${error}`, 'color: #ff4757; font-weight: bold;');
  }
};

export const SimpleWeatherHandler: React.FC<SimpleWeatherHandlerProps> = ({ onWeatherUpdate, conversationId }) => {
  const daily = useDaily();
  
  // Listen for weather tool calls
  // 🚀 SPECULATIVE INFERENCE COMPATIBLE: Robust event handling for performance optimization
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Only handle weather tool calls
    // Note: With speculative_inference enabled, we focus on tool name rather than inference_id
    if (data?.event_type === 'conversation.tool_call' && data.properties?.name === 'getWeatherAndTime') {
      try {
        const args = JSON.parse(data.properties.arguments || '{}');
        const location = args.location || 'Vienna'; // Default to Vienna for conference
        
        weatherLog.toolCall(location);
        
        // Determine endpoint based on location
        const isVienna = !location || location.toLowerCase().includes('vienna') || location === 'Vienna';
        const endpoint = isVienna 
          ? 'http://localhost:3001/api/weather/vienna'
          : `http://localhost:3001/api/weather?location=${encodeURIComponent(location)}`;

        // Fetch weather data
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const weatherData = await response.json();
          
          // 🔍 DETAILED LOGGING - Show what weather service returned
          console.log('🔍 WEATHER SERVICE RAW RESPONSE:', weatherData);
          console.log('🔍 WEATHER DATA STRUCTURE:', {
            location: weatherData.location,
            temperature: weatherData.temperature?.current + '°C',
            condition: weatherData.condition,
            localTime: weatherData.localTime
          });
          
          // Format the weather response for ROSA
          const formattedResponse = [
            `🌤️ Current Weather for ${weatherData.location}:`,
            `Temperature: ${weatherData.temperature?.current}°C (feels like ${weatherData.temperature?.feels_like}°C)`,
            `Condition: ${weatherData.condition}`,
            `Wind: ${weatherData.wind?.speed} ${weatherData.wind?.direction}`,
            `Humidity: ${weatherData.humidity}`,
            `Local Time: ${weatherData.localTime} (${weatherData.timezone})`,
            '',
            `💡 ${weatherData.conference_tip}`
          ].join('\n');
          
          // 🔍 ADDITIONAL LOGGING - Show final formatted response
          console.log('🔍 WEATHER FORMATTED RESPONSE LENGTH:', formattedResponse.length);
          console.log('🔍 WEATHER FORMATTED RESPONSE PREVIEW:', formattedResponse.substring(0, 200) + '...');
          console.log('🔍 FULL WEATHER FORMATTED RESPONSE FOR ECHO:', formattedResponse);
          
          weatherLog.success('getWeatherAndTime', formattedResponse.length);

          // Send response back to ROSA
          if (daily) {
            console.log('🧪 WEATHER: Using conversation.echo');
            console.log('🧪 WEATHER WILL SEND THIS TEXT IN ECHO:', formattedResponse);
            
            await daily.sendAppMessage({
              message_type: 'conversation',
              event_type: 'conversation.echo',
              conversation_id: conversationId,
              properties: {
                text: formattedResponse
              }
            }, '*');
            console.log('📢 Weather echo sent');
            console.log('📢 WEATHER ECHO CONTENT SENT:', formattedResponse);
          }

          // Call UI callback if provided
          if (onWeatherUpdate) {
            onWeatherUpdate(weatherData);
          }

        } else {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(`Weather API error: ${errorData.error || response.statusText}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown weather error';
        weatherLog.error(errorMessage);
        
        // Send error response to ROSA
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.echo',
            conversation_id: conversationId,
            properties: {
              text: `I apologize, but I'm unable to retrieve weather information at the moment. Please try again later. Error: ${errorMessage}`
            }
          }, '*');
        }
      }
    }
  });

  return null;
}; 