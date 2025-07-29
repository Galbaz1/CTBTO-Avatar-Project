// @ts-nocheck
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
  // Support multiple session cards - map array or single session
  const mappedSessionCards = useMemo(() => {
    if (!ragData?.session) return [];
    
    // Check if session data is an array (multiple cards) or single card
    const sessionArray = Array.isArray(ragData.session) ? ragData.session : [ragData.session];
    
    return sessionArray.map((sessionItem: any, index: number) => {
      const sessionData = sessionItem.card_data || sessionItem;
      
      // Map the nested metadata structure to the flat structure expected by EnhancedSessionCard
      return {
        cardIndex: index,
        session_id: sessionData.metadata?.session_id || sessionData.session_id || sessionData.id || `session-${index}`,
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
    });
  }, [ragData?.session]);

  // Memoize active cards calculation with multiple session support
  const activeCards = useMemo(() => {
    const cards = [];
    if (showWeatherCard && weatherData) cards.push({ type: 'weather', index: 0 });
    
    // Add multiple session cards
    if (showRagCards && mappedSessionCards.length > 0) {
      mappedSessionCards.forEach((_: any, index: number) => {
        cards.push({ type: 'session', index });
      });
    }
    
    if (showRagCards && ragData?.speaker) cards.push({ type: 'speaker', index: 0 });
    if (showRagCards && ragData?.topic) cards.push({ type: 'topic', index: 0 });
    return cards;
  }, [showWeatherCard, weatherData, showRagCards, mappedSessionCards, ragData?.speaker, ragData?.topic]);

  // Enhanced card positioning system with side-by-side and grid layouts
  const getCardPosition = useMemo(() => {
    return (cardIndex: number) => {
      const baseTop = 80;
      const baseRight = 20;
      const cardWidth = 350;
      const cardHeight = 200;
      const gap = 20;
      
      // Calculate total cards
      const totalCards = activeCards.length;
      
      if (totalCards === 1) {
        // Single card - center right
        return { top: `${baseTop}px`, right: `${baseRight}px` };
      } else if (totalCards === 2) {
        // Two cards - side by side
        return cardIndex === 0 
          ? { top: `${baseTop}px`, right: `${baseRight + cardWidth + gap}px` }
          : { top: `${baseTop}px`, right: `${baseRight}px` };
      } else if (totalCards <= 4) {
        // 3-4 cards - 2x2 grid
        const row = Math.floor(cardIndex / 2);
        const col = cardIndex % 2;
        return {
          top: `${baseTop + (row * (cardHeight + gap))}px`,
          right: `${baseRight + (col * (cardWidth + gap))}px`
        };
      } else {
        // 5+ cards - vertical stack with slight offset
        return {
          top: `${baseTop + (cardIndex * 160)}px`,
          right: `${baseRight + (cardIndex % 3) * 30}px`
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
          ...getCardPosition(activeCards.findIndex(card => card.type === 'weather')),
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
      
      {/* Multiple Session Cards */}
      {showRagCards && mappedSessionCards.map((sessionData: any, sessionIndex: number) => {
        const cardIndex = activeCards.findIndex(card => card.type === 'session' && card.index === sessionIndex);
        return (
          <div
            key={`session-${sessionData.session_id}-${sessionIndex}`}
            style={{
              position: 'fixed',
              ...getCardPosition(cardIndex),
              zIndex: 999 - sessionIndex, // Stack z-index properly
              maxWidth: '350px',
              transition: 'all 0.3s ease-out'
            }}
          >
            <EnhancedSessionCard
              session={sessionData}
              onClose={() => {
                // Close specific session card
                console.log(`🗑️ Closing session card ${sessionIndex}`);
                onCloseRag();
              }}
              compact={true}
            />
          </div>
        );
      })}
      
      {/* Speaker Card */}
      {showRagCards && ragData?.speaker && (
        <div style={{
          position: 'fixed',
          ...getCardPosition(activeCards.findIndex(card => card.type === 'speaker')),
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
                onClose={() => {
                  console.log('🗑️ Closing speaker card');
                  onCloseRag();
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Topic Card */}
      {showRagCards && ragData?.topic && (
        <div style={{
          position: 'fixed',
          ...getCardPosition(activeCards.findIndex(card => card.type === 'topic')),
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
                onClose={() => {
                  console.log('🗑️ Closing topic card');
                  onCloseRag();
                }}
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