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

interface WeatherHandlerProps {
  onWeatherUpdate?: (weather: WeatherData) => void;
}

// Enhanced logging utility for ROSA function calls
const logFunctionCall = (event: string, data: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const logPrefix = `🤖 ROSA ${event.toUpperCase()}`;
  const style = level === 'error' ? 'color: #ff4757; font-weight: bold;' : 
                level === 'warn' ? 'color: #ffa502; font-weight: bold;' :
                'color: #2ed573; font-weight: bold;';
  
  console.group(`%c${logPrefix} [${timestamp}]`, style);
  console.log('📋 Event Data:', data);
  console.groupEnd();
};

export const WeatherHandler: React.FC<WeatherHandlerProps> = ({ onWeatherUpdate }) => {
  const daily = useDaily();
  
  // Listen for tool calls from ROSA - following cvi-frontend-backend-tools pattern
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Log ALL app messages for debugging
    logFunctionCall('app-message-received', {
      eventType: data?.event_type,
      properties: data?.properties,
      timestamp: new Date().toISOString(),
      rawData: data
    });
    
    // Handle weather tool calls - support multiple tool names
    const isWeatherToolCall = data?.event_type === 'conversation.tool_call' && 
        (data?.properties?.name === 'getViennaWeather' || 
         data?.properties?.name === 'getWeatherAndTime');
    
    if (isWeatherToolCall) {
      
      logFunctionCall('weather-tool-call-detected', {
        toolName: data?.properties?.name,
        arguments: data?.properties?.arguments,
        conversationId: data?.conversation_id,
        fullPayload: data
      });
      
      try {
        // Parse the location from the tool call arguments (may be empty for Vienna default)
        let location = 'Vienna'; // Default to Vienna
        
        if (data.properties.arguments && data.properties.arguments !== '{}') {
          try {
            const args = JSON.parse(data.properties.arguments);
            location = args.location || 'Vienna';
            logFunctionCall('weather-arguments-parsed', {
              originalArgs: data.properties.arguments,
              parsedArgs: args,
              extractedLocation: location
            });
          } catch (e) {
            logFunctionCall('weather-arguments-parsing-failed', {
              originalArgs: data.properties.arguments,
              error: e,
              fallbackLocation: 'Vienna'
            }, 'warn');
          }
        }
        
        logFunctionCall('weather-request-starting', {
          requestedLocation: location,
          isViennaDefault: !location || location.toLowerCase().includes('vienna'),
          endpoint: !location || location.toLowerCase().includes('vienna') ? 
            'http://localhost:3001/api/weather/vienna' : 
            'http://localhost:3001/api/weather'
        });
        
        // Call appropriate weather endpoint
        let weatherData: WeatherData;
        
        if (!location || location.toLowerCase().includes('vienna')) {
          // Use Vienna default endpoint for conference location
          logFunctionCall('weather-fetching-vienna', {
            endpoint: 'http://localhost:3001/api/weather/vienna',
            reason: 'Conference default location'
          });
          
          const response = await fetch('http://localhost:3001/api/weather/vienna');
          
          if (!response.ok) {
            throw new Error(`Vienna weather service error: ${response.status}`);
          }
          
          weatherData = await response.json();
          logFunctionCall('weather-vienna-response-received', {
            weatherData,
            responseStatus: response.status,
            responseHeaders: Object.fromEntries(response.headers.entries())
          });
        } else {
          // Use custom location endpoint
          logFunctionCall('weather-fetching-custom-location', {
            location,
            endpoint: 'http://localhost:3001/api/weather',
            requestBody: { location }
          });
          
          const response = await fetch('http://localhost:3001/api/weather', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location })
          });
          
          if (!response.ok) {
            throw new Error(`Weather service error: ${response.status}`);
          }
          
          weatherData = await response.json();
          logFunctionCall('weather-custom-response-received', {
            location,
            weatherData,
            responseStatus: response.status,
            responseHeaders: Object.fromEntries(response.headers.entries())
          });
        }
        
        // Format response for ROSA - enhanced for conference context
        let rosaResponse = `Weather in ${weatherData.location}:
• Local time: ${weatherData.localTime} (${weatherData.timezone})
• Temperature: ${weatherData.temperature.celsius}°C (feels like ${weatherData.feelsLikeC}°C)
• Conditions: ${weatherData.condition}
• Wind: ${weatherData.windKph} km/h
• Humidity: ${weatherData.humidity}%
• Visibility: ${weatherData.visibility} km
${weatherData.isDay ? '☀️ Daytime' : '🌙 Nighttime'}`;

        // Add conference-specific advice for Vienna
        if (weatherData.isConferenceLocation && weatherData.conferenceWeatherAdvice) {
          rosaResponse += `\n\n🏛️ Conference advice: ${weatherData.conferenceWeatherAdvice}`;
        }

        rosaResponse += `\n\nThis information is current as of ${weatherData.localTime} local time.`;

        logFunctionCall('weather-response-formatted', {
          originalWeatherData: weatherData,
          formattedResponse: rosaResponse,
          responseLength: rosaResponse.length,
          hasConferenceAdvice: !!weatherData.conferenceWeatherAdvice
        });

        // Send response back to ROSA - following Tavus interaction protocol
        const responseMessage = {
          message_type: 'conversation',
          event_type: 'conversation.respond',
          conversation_id: data.conversation_id || 'rosa-weather',
          properties: {
            text: rosaResponse
          }
        };
        
        // Send the weather data to ROSA
        if (daily) {
          daily.sendAppMessage(responseMessage, '*');
          logFunctionCall('weather-response-sending', {
            responseMessage,
            targetConversation: data.conversation_id,
            responsePreview: rosaResponse.substring(0, 100) + '...'
          });
        } else {
          logFunctionCall('daily-not-available', {
            error: 'Daily object not available, cannot send weather response',
            responseMessage
          }, 'error');
        }
        
        // Optional: Update UI if callback provided
        if (onWeatherUpdate) {
          onWeatherUpdate(weatherData);
          logFunctionCall('weather-ui-callback-triggered', {
            callbackProvided: true,
            weatherDataSent: weatherData
          });
        }
        
        logFunctionCall('weather-tool-call-completed', {
          success: true,
          location: weatherData.location,
          temperature: weatherData.temperature.celsius,
          processingTime: 'success'
        });
        
      } catch (error) {
        logFunctionCall('weather-tool-call-error', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          originalToolCall: data,
          location: data?.properties?.arguments
        }, 'error');
        
        // Send error response to ROSA
        const errorMessage = {
          message_type: 'conversation',
          event_type: 'conversation.respond',
          conversation_id: data.conversation_id || 'rosa-weather',
          properties: {
            text: `I apologize, but I'm unable to retrieve weather information at the moment. Let me provide you with the Vienna conference location as default, or please try again with a different city name.`
          }
        };

        if (daily) {
          daily.sendAppMessage(errorMessage, '*');
          logFunctionCall('weather-error-response-sending', {
            errorMessage,
            originalError: error instanceof Error ? error.message : String(error)
          }, 'error');
        } else {
          logFunctionCall('daily-not-available', {
            error: 'Daily object not available, cannot send error response',
            errorMessage
          }, 'error');
        }
      }
    }
    
    // Log other tool calls for debugging
    if (data?.event_type === 'conversation.tool_call') {
      logFunctionCall('general-tool-call-detected', {
        toolName: data?.properties?.name,
        arguments: data?.properties?.arguments,
        conversationId: data?.conversation_id,
        timestamp: new Date().toISOString(),
        isWeatherTool: data?.properties?.name === 'getViennaWeather' || data?.properties?.name === 'getWeatherAndTime'
      });
    }
    
    // Log other conversation events for comprehensive debugging
    if (data?.event_type?.startsWith('conversation.')) {
      logFunctionCall('conversation-event', {
        eventType: data.event_type,
        properties: data.properties,
        conversationId: data.conversation_id,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Log component initialization
  useEffect(() => {
    logFunctionCall('weather-handler-initialized', {
      hasCallback: !!onWeatherUpdate,
      dailyAvailable: !!daily,
      timestamp: new Date().toISOString()
    });
    
    return () => {
      logFunctionCall('weather-handler-cleanup', {
        timestamp: new Date().toISOString()
      });
    };
  }, [onWeatherUpdate, daily]);

  return null; // This is a headless component
};

export default WeatherHandler; 