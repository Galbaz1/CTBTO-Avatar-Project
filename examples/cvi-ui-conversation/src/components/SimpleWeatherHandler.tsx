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
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Only handle weather tool calls
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
        const weatherData = await response.json();
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${weatherData.error || response.statusText}`);
        }

        weatherLog.success(weatherData);

        // Call UI callback if provided
        if (onWeatherUpdate) {
          onWeatherUpdate(weatherData);
        }

        // Format response for ROSA
        const formattedResponse = [
          `Weather in ${weatherData.location}:`,
          `• Current time: ${weatherData.localTime} (${weatherData.timezone})`,
          `• Temperature: ${weatherData.temperature.celsius}°C (${weatherData.temperature.fahrenheit}°F)`,
          `• Condition: ${weatherData.condition}`,
          `• Feels like: ${weatherData.feelsLikeC}°C`,
          `• Humidity: ${weatherData.humidity}%`,
          `• Wind: ${weatherData.windKph} km/h`,
          `• Visibility: ${weatherData.visibility} km`,
          weatherData.conferenceWeatherAdvice || '',
          `This information is current as of ${weatherData.localTime} local time.`
        ].filter(Boolean).join('\n');

        // Send response back to ROSA using correct Tavus format
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

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown weather error';
        weatherLog.error(errorMessage);
        
        // Send error response to ROSA
        if (daily) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.respond',
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