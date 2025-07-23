import React, { useEffect, useRef } from 'react';
import { useDaily, useMeetingState } from '@daily-co/daily-react';

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

  // Poll for weather data from backend when meeting is active
  useEffect(() => {
    if (!daily || meetingState !== 'joined-meeting') {
      return;
    }

    const checkForWeatherData = async () => {
      const conversationId = (window as any).currentConversationId;
      if (!conversationId) return;

      try {
        const response = await fetch(`http://localhost:8000/latest-weather/${conversationId}`);
        if (response.ok) {
          const weatherData = await response.json();
          
          // Only update if we have new weather data
          if (weatherData && weatherData.success && weatherData.location !== lastWeatherLocation.current) {
            lastWeatherLocation.current = weatherData.location;
            
            if (onWeatherUpdate) {
              onWeatherUpdate(weatherData);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for weather data:', error);
      }
    };

    // Check immediately and then every 2 seconds
    checkForWeatherData();
    const interval = setInterval(checkForWeatherData, 2000);

    return () => clearInterval(interval);
  }, [daily, onWeatherUpdate, meetingState]);

  return null; // This is a headless component
}; 