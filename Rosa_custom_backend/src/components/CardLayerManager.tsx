import React, { useMemo } from 'react';
import { WeatherCard } from './WeatherCard';
import { EnhancedSessionCard, SpeakerCard, TopicCard } from './cards/enhanced';

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

interface CardLayerManagerProps {
  weatherData: WeatherData | null;
  showWeatherCard: boolean;
  onCloseWeather: () => void;
  ragData: any;
  showRagCards: boolean;
  onCloseRag: () => void;
}

export const CardLayerManager: React.FC<CardLayerManagerProps> = ({
  weatherData,
  showWeatherCard,
  onCloseWeather,
  ragData,
  showRagCards,
  onCloseRag
}) => {
  // Memoize the session data mapping to prevent infinite re-renders
  const mappedSessionData = useMemo(() => {
    if (!ragData?.session) return null;
    
    const sessionData = ragData.session.card_data || ragData.session;
    
    // Map the nested metadata structure to the flat structure expected by EnhancedSessionCard
    return {
      session_id: sessionData.metadata?.session_id || sessionData.session_id || sessionData.id,
      title: sessionData.title || sessionData.metadata?.title,
      description: sessionData.metadata?.description || sessionData.content || sessionData.description,
      start_time: sessionData.metadata?.start_time || sessionData.start_time,
      end_time: sessionData.metadata?.end_time || sessionData.end_time,
      duration: sessionData.metadata?.duration_minutes || sessionData.duration_minutes,
      date: sessionData.metadata?.date || sessionData.date,
      venue: sessionData.metadata?.venue || sessionData.venue,
      session_type: sessionData.metadata?.session_type || sessionData.session_type,
      speakers: sessionData.metadata?.speakers || sessionData.speakers || [],
      theme: sessionData.metadata?.theme || sessionData.theme,
      track: sessionData.metadata?.track || sessionData.track,
      audience_level: sessionData.metadata?.audience_level || sessionData.audience_level,
      day_of_week: sessionData.metadata?.day_of_week || sessionData.day_of_week,
      time_of_day: sessionData.metadata?.time_of_day || sessionData.time_of_day,
      duration_minutes: sessionData.metadata?.duration_minutes || sessionData.duration_minutes,
      has_speakers: sessionData.metadata?.has_speakers || sessionData.has_speakers,
      is_interactive: sessionData.metadata?.is_interactive || sessionData.is_interactive,
      is_social: sessionData.metadata?.is_social || sessionData.is_social,
      is_technical: sessionData.metadata?.is_technical || sessionData.is_technical,
      speaker_count: sessionData.metadata?.speaker_count || sessionData.speaker_count,
      related_topics: sessionData.metadata?.related_topics || sessionData.related_topics,
      search_keywords: sessionData.metadata?.search_keywords || sessionData.search_keywords
    };
  }, [ragData?.session]);

  // Memoize active cards calculation
  const activeCards = useMemo(() => {
    const cards = [];
    if (showWeatherCard && weatherData) cards.push('weather');
    if (showRagCards && mappedSessionData) cards.push('session');
    if (showRagCards && ragData?.speaker) cards.push('speaker');
    if (showRagCards && ragData?.topic) cards.push('topic');
    return cards;
  }, [showWeatherCard, weatherData, showRagCards, mappedSessionData, ragData?.speaker, ragData?.topic]);

  // Professional card positioning system, now more robust
  const getCardPosition = useMemo(() => {
    return (cardType: string, index: number) => {
      const baseTop = 80;
      // Position from the right edge for better consistency across screen sizes
      const baseRight = 20;
      
      // Intelligent cascading layout
      switch (activeCards.length) {
        case 1:
          return { top: `${baseTop}px`, right: `${baseRight}px` };
        case 2:
          if (index === 0) return { top: `${baseTop}px`, right: `${baseRight}px` };
          return { top: `${baseTop + 220}px`, right: `${baseRight}px` };
        case 3:
          if (index === 0) return { top: `${baseTop}px`, right: `${baseRight}px` };
          if (index === 1) return { top: `${baseTop + 200}px`, right: `${baseRight + 30}px` };
          return { top: `${baseTop + 400}px`, right: `${baseRight + 60}px` };
        default:
          return { 
            top: `${baseTop + (index * 180)}px`, 
            right: `${baseRight + (index * 20)}px` 
          };
      }
    };
  }, [activeCards.length]);

  return (
    <>
      {/* Weather Card */}
      {showWeatherCard && weatherData && (
        <div style={{
          position: 'fixed',
          ...getCardPosition('weather', activeCards.indexOf('weather')),
          zIndex: 1000,
          maxWidth: '350px',
          transition: 'all 0.3s ease-out'
        }}>
          <WeatherCard 
            weatherData={weatherData}
            isVisible={true}
            onClose={onCloseWeather}
          />
        </div>
      )}
      
      {/* Session Card */}
      {showRagCards && mappedSessionData && (
        <div style={{
          position: 'fixed',
          ...getCardPosition('session', activeCards.indexOf('session')),
          zIndex: 999,
          maxWidth: '350px',
          transition: 'all 0.3s ease-out'
        }}>
          <EnhancedSessionCard
            session={mappedSessionData}
            onClose={onCloseRag}
            compact={true}
          />
        </div>
      )}
      
      {/* Speaker Card */}
      {showRagCards && ragData?.speaker && (
        <div style={{
          position: 'fixed',
          ...getCardPosition('speaker', activeCards.indexOf('speaker')),
          zIndex: 998,
          maxWidth: '350px',
          transition: 'all 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            borderRadius: '16px',
            padding: '2px',
            boxShadow: '0 10px 25px -5px rgba(118, 75, 162, 0.3)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
              <SpeakerCard
                speaker={ragData.speaker.card_data || ragData.speaker}
                onClose={onCloseRag}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Topic Card */}
      {showRagCards && ragData?.topic && (
        <div style={{
          position: 'fixed',
          ...getCardPosition('topic', activeCards.indexOf('topic')),
          zIndex: 997,
          maxWidth: '350px',
          transition: 'all 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '2px',
            boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
              <TopicCard
                topic={ragData.topic.card_data || ragData.topic}
                compact={true}
                maxSessions={3}
                showSessions={true}
                onClose={onCloseRag}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Active Cards Overlay */}
      {activeCards.length > 2 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px', // Position in right panel
          background: 'rgba(102, 126, 234, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 1001,
          backdropFilter: 'blur(10px)'
        }}>
          {activeCards.length} Active Cards
        </div>
      )}
    </>
  );
}; 