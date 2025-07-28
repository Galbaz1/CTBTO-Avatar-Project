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
    console.log('🔧 CardLayerManager useMemo triggered:', { 
      hasRagData: !!ragData, 
      hasSession: !!ragData?.session,
      sessionKeys: ragData?.session ? Object.keys(ragData.session) : null
    });
    
    if (!ragData?.session) return null;
    
    const sessionData = ragData.session.card_data || ragData.session;
    console.log('🔧 SessionData for mapping:', { 
      hasCardData: !!ragData.session.card_data,
      sessionDataKeys: Object.keys(sessionData),
      hasMetadata: !!sessionData.metadata
    });
    
    // Map the nested metadata structure to the flat structure expected by EnhancedSessionCard
    const mapped = {
      session_id: sessionData.metadata?.session_id || sessionData.id,
      title: sessionData.title || sessionData.metadata?.title,
      description: sessionData.metadata?.description || sessionData.content,
      start_time: sessionData.metadata?.start_time,
      end_time: sessionData.metadata?.end_time,
      duration: sessionData.metadata?.duration_minutes,
      date: sessionData.metadata?.date,
      venue: sessionData.metadata?.venue,
      session_type: sessionData.metadata?.session_type,
      speakers: sessionData.metadata?.speakers || [],
      theme: sessionData.metadata?.theme,
      track: sessionData.metadata?.track,
      audience_level: sessionData.metadata?.audience_level,
      day_of_week: sessionData.metadata?.day_of_week,
      time_of_day: sessionData.metadata?.time_of_day,
      duration_minutes: sessionData.metadata?.duration_minutes,
      has_speakers: sessionData.metadata?.has_speakers,
      is_interactive: sessionData.metadata?.is_interactive,
      is_social: sessionData.metadata?.is_social,
      is_technical: sessionData.metadata?.is_technical,
      speaker_count: sessionData.metadata?.speaker_count,
      related_topics: sessionData.metadata?.related_topics,
      search_keywords: sessionData.metadata?.search_keywords
    };
    
    console.log('🔧 Mapped session result:', { 
      hasTitle: !!mapped.title,
      hasVenue: !!mapped.venue,
      sessionId: mapped.session_id
    });
    
    return mapped;
  }, [ragData?.session, ragData?.session?.card_data]); // Add more specific dependency

  // Calculate active cards to prevent overlapping
  const activeCards = [];
  if (showWeatherCard && weatherData) activeCards.push('weather');
  if (showRagCards && mappedSessionData) activeCards.push('session');
  if (showRagCards && ragData?.speaker) activeCards.push('speaker');
  if (showRagCards && ragData?.topic) activeCards.push('topic');
  
  console.log('🔧 Card rendering state:', {
    showRagCards,
    hasMappedSessionData: !!mappedSessionData,
    hasTopicData: !!ragData?.topic,
    activeCards: activeCards.length,
    cardTypes: activeCards
  });

  // Professional card positioning system
  const getCardPosition = (cardType: string, index: number) => {
    const baseTop = 80;
    const baseRight = 20;
    const cardWidth = 350;
    const cardSpacing = 20;
    
    console.log('🔧 Getting position for card:', { cardType, index, baseTop, baseRight });
    
    // Intelligent cascading layout
    switch (activeCards.length) {
      case 1:
        // Single card - prime position
        return { top: `${baseTop}px`, right: `${baseRight}px` };
      
      case 2:
        // Two cards - side by side
        if (index === 0) return { top: `${baseTop}px`, right: `${baseRight}px` };
        return { top: `${baseTop}px`, right: `${baseRight + cardWidth + cardSpacing}px` };
      
      case 3:
        // Three cards - cascade pattern
        if (index === 0) return { top: `${baseTop}px`, right: `${baseRight}px` };
        if (index === 1) return { top: `${baseTop + 60}px`, right: `${baseRight + (cardWidth * 0.6)}px` };
        return { top: `${baseTop + 120}px`, right: `${baseRight + (cardWidth * 1.2)}px` };
      
      default:
        // Fallback for many cards
        return { 
          top: `${baseTop + (index * 50)}px`, 
          right: `${baseRight + (index * (cardWidth * 0.3))}px` 
        };
    }
  };

  // Debug logging for session card rendering
  if (showRagCards && mappedSessionData) {
    const sessionPosition = getCardPosition('session', activeCards.indexOf('session'));
    console.log('🔧 RENDERING SESSION CARD:', { 
      position: sessionPosition,
      mappedSessionData: !!mappedSessionData,
      sessionTitle: mappedSessionData?.title
    });
  }

  return (
    <>
      {/* Weather Card - Contextual, always first priority */}
      {showWeatherCard && weatherData && (
        <div style={{
          position: 'fixed',
          ...getCardPosition('weather', 0),
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
      
      {/* Session Card - High priority conference content */}
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
      
      {/* Speaker Card - Conference content */}
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
      
      {/* Topic Card - Thematic conference content */}
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
      
      {/* Professional overlay for many cards */}
      {activeCards.length > 2 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
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