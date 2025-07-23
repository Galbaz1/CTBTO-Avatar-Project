'use client';

import React from 'react';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

interface WeatherCardProps {
  data: Partial<WeatherData>;
  isLoading?: boolean;
}

const getWeatherIcon = (icon: string) => {
  const iconMap: { [key: string]: string } = {
    sunny: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️',
  };
  return iconMap[icon] || '☀️';
};

const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-600 rounded animate-pulse ${className}`} />
);

export function WeatherCard({ data, isLoading = false }: WeatherCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto mb-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
          {data.location ? `Weather in ${data.location}` : 
            isLoading ? <LoadingSkeleton className="h-6 w-48 mx-auto" /> : 'Weather Information'}
        </h3>
        <div className="text-6xl mb-2">
          {data.current?.icon ? getWeatherIcon(data.current.icon) : 
            isLoading ? <LoadingSkeleton className="h-16 w-16 mx-auto rounded-full" /> : '🌤️'}
        </div>
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {data.current?.temperature !== undefined ? `${data.current.temperature}°C` : 
            isLoading ? <LoadingSkeleton className="h-8 w-16 mx-auto" /> : '--°C'}
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          {data.current?.condition || 
            (isLoading ? <LoadingSkeleton className="h-4 w-24 mx-auto" /> : 'Loading...')}
        </div>
      </div>

      {/* Current Details */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Humidity</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {data.current?.humidity !== undefined ? `${data.current.humidity}%` : 
              isLoading ? <LoadingSkeleton className="h-6 w-12 mx-auto" /> : '--%'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Wind</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {data.current?.windSpeed !== undefined ? `${data.current.windSpeed} km/h` : 
              isLoading ? <LoadingSkeleton className="h-6 w-16 mx-auto" /> : '-- km/h'}
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          5-Day Forecast
        </h4>
        <div className="space-y-2">
          {data.forecast && data.forecast.length > 0 ? (
            data.forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getWeatherIcon(day.icon)}</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {day.day}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {day.condition}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {day.high}°
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {day.low}°
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Loading skeletons for forecast
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <LoadingSkeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <LoadingSkeleton className="h-4 w-16 mb-1" />
                    <LoadingSkeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <LoadingSkeleton className="h-4 w-8 mb-1" />
                  <LoadingSkeleton className="h-3 w-6" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 