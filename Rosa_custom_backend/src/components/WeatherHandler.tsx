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
  conversationId: string;
  onWeatherUpdate?: (weatherData: WeatherData) => void;
}

export const WeatherHandler: React.FC<WeatherHandlerProps> = ({ conversationId, onWeatherUpdate }) => {
  const daily = useDaily();
  const meetingState = useMeetingState();
  const lastWeatherLocation = useRef<string>('');

  // Poll for weather data from backend when meeting is active
  useEffect(() => {
    if (!daily || meetingState !== 'connected' || !conversationId) {
      return;
    }

    const checkForWeatherData = async () => {

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
  }, [daily, onWeatherUpdate, meetingState, conversationId]);

  return null; // This is a headless component
}; 