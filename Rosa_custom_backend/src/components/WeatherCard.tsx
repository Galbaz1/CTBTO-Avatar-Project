import React from 'react';

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

interface WeatherCardProps {
  weatherData: WeatherData | null;
  isVisible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const getWeatherIcon = (icon: string) => {
  const iconMap: { [key: string]: string } = {
    sunny: '☀️',
    clear: '🌙',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️',
    foggy: '🌫️'
  };
  return iconMap[icon] || '☀️';
};

const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-600 rounded animate-pulse ${className}`} />
);

export const WeatherCard: React.FC<WeatherCardProps> = ({ 
  weatherData, 
  isVisible, 
  onClose,
  isLoading = false
}) => {
  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '320px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        zIndex: 1000,
        animation: 'fadeInSlide 0.3s ease-out'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#64748b',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          {weatherData?.location ? `Weather in ${weatherData.location}` : 
            isLoading ? <LoadingSkeleton className="h-5 w-48 mx-auto" /> : 'Weather Information'}
        </h3>
        
        {weatherData?.country && (
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '0',
            fontWeight: '500'
          }}>
            {weatherData.country}
          </p>
        )}
      </div>

      {/* Main weather display */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>
          {weatherData?.icon ? getWeatherIcon(weatherData.icon) : 
            isLoading ? <LoadingSkeleton className="h-12 w-12 mx-auto rounded-full" /> : '🌤️'}
        </div>
        
        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '4px'
        }}>
          {weatherData?.temperature !== undefined ? `${weatherData.temperature}°C` : 
            isLoading ? <LoadingSkeleton className="h-8 w-16 mx-auto" /> : '--°C'}
        </div>
        
        <div style={{
          fontSize: '14px',
          color: '#64748b',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>
          {weatherData?.description || 
            (isLoading ? <LoadingSkeleton className="h-4 w-24 mx-auto" /> : 'Loading...')}
        </div>
      </div>

      {/* Weather details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Humidity
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {weatherData?.humidity !== undefined ? `${weatherData.humidity}%` : 
              isLoading ? <LoadingSkeleton className="h-4 w-10 mx-auto" /> : '--%'}
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Wind
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {weatherData?.windSpeed !== undefined ? `${weatherData.windSpeed} km/h` : 
              isLoading ? <LoadingSkeleton className="h-4 w-12 mx-auto" /> : '-- km/h'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '8px 12px',
        background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
        borderRadius: '8px',
        border: '1px solid #a78bfa'
      }}>
        <p style={{
          fontSize: '11px',
          color: '#5b21b6',
          margin: '0',
          fontWeight: '600'
        }}>
          🤖 Powered by Rosa AI
        </p>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeInSlide {
          0% { 
            opacity: 0; 
            transform: translateX(100px) translateY(-20px) scale(0.9);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}; 