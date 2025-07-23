import React, { useEffect, useRef } from 'react';
import { useDailyEvent, useDaily, useMeetingState } from '@daily-co/daily-react';

interface WeatherData {
  location: string;
  country?: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  success: boolean;
}

interface WeatherHandlerProps {
  onWeatherUpdate?: (weatherData: WeatherData) => void;
}

export const WeatherHandler: React.FC<WeatherHandlerProps> = ({ onWeatherUpdate }) => {
  const daily = useDaily();
  const meetingState = useMeetingState();
  const lastWeatherLocation = useRef<string>('');

  // Since we're using a custom backend with OpenAI function calling,
  // we need to poll for weather data instead of waiting for Tavus tool calls
  useEffect(() => {
    console.log('🔍 WeatherHandler polling setup:', {
      dailyAvailable: !!daily,
      meetingState: meetingState,
      conversationId: (window as any).currentConversationId
    });

    if (!daily || meetingState !== 'joined-meeting') {
      console.log('⏸️ Polling not started:', {
        reason: !daily ? 'No daily instance' : `Meeting state: ${meetingState}`
      });
      return;
    }

    const checkForWeatherData = async () => {
      const conversationId = (window as any).currentConversationId;
      console.log('🔍 Checking for weather data with conversation ID:', conversationId);
      
      if (!conversationId) {
        console.log('⚠️ No conversation ID available for polling');
        return;
      }

      try {
        const url = `http://localhost:8000/latest-weather/${conversationId}`;
        console.log('🌐 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const weatherData = await response.json();
          console.log('📦 Weather data received:', weatherData);
          
          // Only update if we have new weather data
          if (weatherData && weatherData.success && weatherData.location !== lastWeatherLocation.current) {
            console.log('🌤️ New weather data detected:', weatherData);
            lastWeatherLocation.current = weatherData.location;
            
            if (onWeatherUpdate) {
              console.log('🎯 Calling onWeatherUpdate callback');
              onWeatherUpdate(weatherData);
              console.log('✅ UI updated with weather data');
            } else {
              console.log('⚠️ No onWeatherUpdate callback provided');
            }
          } else if (weatherData && weatherData.success) {
            console.log('ℹ️ Same weather location, skipping update:', weatherData.location);
          } else {
            console.log('❌ Weather data not successful:', weatherData);
          }
        } else {
          console.log('❌ Failed to fetch weather data:', response.status);
        }
      } catch (error) {
        console.error('❌ Error checking for weather data:', error);
      }
    };

    console.log('🚀 Starting weather data polling...');
    // Check immediately and then every 2 seconds
    checkForWeatherData();
    const interval = setInterval(checkForWeatherData, 2000);

    return () => {
      console.log('🛑 Stopping weather data polling');
      clearInterval(interval);
    };
  }, [daily, onWeatherUpdate, meetingState]);

  // Still listen for app messages in case we switch to Tavus tool calling later
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Log all events for debugging
    if (data?.event_type) {
      console.log('📱 WeatherHandler: app-message received', {
        eventType: data.event_type,
        toolName: data?.properties?.name,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle weather tool calls (for future Tavus integration)
    if (data?.event_type === 'conversation.tool_call' && 
        data?.properties?.name === 'get_weather') {
      
      console.log('🛠️ Weather tool call detected!', {
        toolName: data.properties.name,
        arguments: data.properties.arguments,
        conversationId: data.conversation_id
      });
      
      try {
        // Parse the location from the tool call arguments
        let location = 'Vienna'; // Default to Vienna
        
        if (data.properties.arguments) {
          try {
            const args = JSON.parse(data.properties.arguments);
            location = args.location || 'Vienna';
            console.log('📍 Parsed location:', location);
          } catch (e) {
            console.error('Failed to parse arguments:', e);
          }
        }
        
        // Get conversation ID from window or event
        const conversationId = data.conversation_id || (window as any).currentConversationId;
        
        if (!conversationId) {
          console.error('❌ No conversation ID available');
          return;
        }
        
        // Fetch weather data from our backend
        console.log('🌤️ Fetching weather data from backend...');
        const response = await fetch(`http://localhost:8000/latest-weather/${conversationId}`);
        
        if (response.ok) {
          const weatherData = await response.json();
          console.log('✅ Weather data received:', weatherData);
          
          if (weatherData && weatherData.success) {
            // Format weather response for ROSA
            const weatherResponse = `Current weather in ${weatherData.location}:
🌡️ Temperature: ${weatherData.temperature}°C
☁️ Condition: ${weatherData.condition}
💧 Humidity: ${weatherData.humidity}%
💨 Wind Speed: ${weatherData.windSpeed} km/h`;

            console.log('📢 Sending weather response to ROSA via echo');
            
            // Send response back to ROSA using conversation.echo
            if (daily) {
              await daily.sendAppMessage({
                message_type: 'conversation',
                event_type: 'conversation.echo',
                conversation_id: conversationId,
                properties: {
                  text: weatherResponse
                }
              }, '*');
              console.log('✅ Weather echo sent');
            }
            
            // Update UI if callback provided
            if (onWeatherUpdate) {
              onWeatherUpdate(weatherData);
              console.log('✅ UI callback triggered');
            }
          } else {
            console.error('❌ Weather data not successful:', weatherData);
          }
        } else {
          console.error('❌ Failed to fetch weather data:', response.status);
        }
        
      } catch (error) {
        console.error('❌ Error handling weather tool call:', error);
        
        // Send error response to ROSA
        const conversationId = data.conversation_id || (window as any).currentConversationId;
        if (daily && conversationId) {
          await daily.sendAppMessage({
            message_type: 'conversation',
            event_type: 'conversation.echo',
            conversation_id: conversationId,
            properties: {
              text: `I apologize, but I'm unable to retrieve weather information at the moment. Please try again later.`
            }
          }, '*');
        }
      }
    }
  });

  // Log component lifecycle
  useEffect(() => {
    console.log('🌤️ WeatherHandler mounted', {
      dailyAvailable: !!daily,
      hasCallback: !!onWeatherUpdate
    });
    
    return () => {
      console.log('🌤️ WeatherHandler unmounted');
    };
  }, [daily, onWeatherUpdate]);

  return null; // This is a headless component
}; 