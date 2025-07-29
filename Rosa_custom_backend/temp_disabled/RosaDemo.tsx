import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createConversation, endConversation } from '../api';
import { CVIProvider } from './cvi/components/cvi-provider';
import { Conversation } from './cvi/components/conversation';
import { ConferenceHandler } from './ConferenceHandler';
import { WeatherHandler } from './WeatherHandler';
import { UIDeltaHandler } from './UIDeltaHandler'; // 🆕 PHASE 1: Replace RagHandler
// import { CardLayerManager } from './CardLayerManager'; // Unused in current implementation
import { FullScreenCardContainer } from './FullScreenCardContainer';
import type { WeatherData } from '../types/cards';
import { StickyInterface } from './StickyInterface';
import { timingTracker } from '../utils/timingTracker';

type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting';

// WeatherData interface moved to ../types/cards.ts

export const RosaDemo: React.FC = () => {
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Content UI state  
  const [currentContent, setCurrentContent] = useState<'welcome' | 'weather' | 'rag'>('welcome');
  const [isSearching, setIsSearching] = useState(false);
  const [searchingFor, setSearchingFor] = useState<string>('');
  
  // Floating Cards State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showWeatherCard, setShowWeatherCard] = useState(false);
  const [ragData, setRagData] = useState<any>(null);
  const [showRagCards, setShowRagCards] = useState(false);
  
  // Reference for tracking current conversation URL (for backend integration)
  const currentConversationRef = useRef<string | null>(null);

  const handleStartConversation = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (!apiKey) {
        throw new Error('Tavus API key not found in environment variables');
      }

      const conversation = await createConversation(apiKey);
      console.log('Created conversation:', conversation);
      setConversationUrl(conversation.conversation_url);
      setConversationId(conversation.conversation_id); // Set the state!
      
      // Store conversation ID globally for WeatherHandler
      (window as any).currentConversationId = conversation.conversation_id;
      console.log('🔍 Stored conversation ID globally:', conversation.conversation_id);
      
      // Register the session with backend
      try {
        const sessionId = conversation.conversation_id;
        const registrationData = {
          conversation_id: sessionId,
          conversation_url: conversation.conversation_url
        };
        console.log('📝 Registering session with backend:', registrationData);
        
        const response = await fetch('http://localhost:8000/connect-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });
        
        if (response.ok) {
          console.log('✅ Session registered with backend');
        } else {
          console.error('❌ Failed to register session:', response.status);
        }
      } catch (error) {
        console.error('❌ Error registering session:', error);
      }
      
      setStatus('connected');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      setStatus('idle');
    }
  }, []);

  const handleEndConversation = useCallback(async () => {
    if (!conversationId) return;

    setStatus('disconnecting');

    try {
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (!apiKey) {
        throw new Error('Tavus API key not found in environment variables');
      }

      await endConversation(conversationId, apiKey);
      console.log(`✅ Rosa conversation ended: ${conversationId}`);
      setConversationId(null);
      setConversationUrl(null);
      currentConversationRef.current = null;
      setStatus('idle');
      
      // Reset weather UI state
      setCurrentContent('welcome');
      setWeatherData(null);
    } catch (error) {
      console.error('Failed to end conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to end conversation');
      setStatus('idle');
    }
  }, [conversationId]);

  // Handle weather updates from the WeatherHandler
  const handleWeatherUpdate = useCallback((weather: WeatherData) => {
    console.log('🌤️ Weather card displayed:', weather.location);
    
    // ⏱️ TIMING: Weather card displayed
    timingTracker.recordCardDisplayed(conversationId || '', 'weather');
    
    setWeatherData(weather);
    setShowWeatherCard(true); // Show floating card
  }, [conversationId]);

  // Handle RAG updates from the RagHandler  
  const handleRagUpdate = useCallback((ragUpdate: any) => {
    const cardTypes = [];
    if (ragUpdate.session) cardTypes.push('session');
    if (ragUpdate.speaker) cardTypes.push('speaker'); 
    if (ragUpdate.topic) cardTypes.push('topic');
    
    if (cardTypes.length > 0) {
      console.log('🎴 RAG cards displayed:', cardTypes.join(', '));
      
      // ⏱️ TIMING: Cards displayed
      timingTracker.recordCardDisplayed(conversationId || '', cardTypes.join(', '));
      
      // Clear searching state when cards arrive
      setIsSearching(false);
      setSearchingFor('');
      
      setRagData(ragUpdate);
      setShowRagCards(true); // Show floating cards
    }
  }, [conversationId]);

  // Cache for deduplicating logs
  const lastSessionDataHash = useRef<string>('');
  const lastCardArrayHash = useRef<string>('');

  // Generate cards to display
  const cards = useMemo(() => {
    const cardArray: any[] = [];
          
    // RAG cards (most recent) take priority over weather
    if (showRagCards && ragData?.session) {
      const sessionData = ragData.session;
      
      // Only log session processing when data actually changes
      const sessionDataHash = JSON.stringify(sessionData);
      if (sessionDataHash !== lastSessionDataHash.current) {
        const sessionTitle = sessionData.card_data?.title || sessionData.card_data?.metadata?.title || 'Unknown Session';
        console.log(`🔍 New session: "${sessionTitle}" (${sessionData.card_data?.metadata?.session_type || 'Unknown Type'})`);
        lastSessionDataHash.current = sessionDataHash;
      }
      
      // Transform backend card_data structure to SessionCard format
      const sessionContent = sessionData.card_data ? {
        // Extract session properties from metadata
        session_id: sessionData.card_data.metadata?.session_id || sessionData.card_data.id,
        title: sessionData.card_data.title || sessionData.card_data.metadata?.title,
        description: sessionData.card_data.metadata?.description || sessionData.card_data.content,
        start_time: sessionData.card_data.metadata?.start_time,
        end_time: sessionData.card_data.metadata?.end_time,
        duration_minutes: sessionData.card_data.metadata?.duration_minutes,
        date: sessionData.card_data.metadata?.date,
        venue: sessionData.card_data.metadata?.venue,
        session_type: sessionData.card_data.metadata?.session_type,
        speakers: sessionData.card_data.metadata?.speakers || [],
        theme: sessionData.card_data.metadata?.theme,
        track: sessionData.card_data.metadata?.track,
        audience_level: sessionData.card_data.metadata?.audience_level,
        day_of_week: sessionData.card_data.metadata?.day_of_week,
        time_of_day: sessionData.card_data.metadata?.time_of_day,
        has_speakers: sessionData.card_data.metadata?.has_speakers,
        is_interactive: sessionData.card_data.metadata?.is_interactive,
        is_social: sessionData.card_data.metadata?.is_social,
        is_technical: sessionData.card_data.metadata?.is_technical,
        speaker_count: sessionData.card_data.metadata?.speaker_count,
        related_topics: sessionData.card_data.metadata?.related_topics,
        practical_info: sessionData.card_data.metadata?.practical_info
      } : sessionData;
       
      const cardArray = [{
        id: sessionContent.session_id || 'current-session-card',
        type: 'session',
        content: sessionContent,
        size: 'full'
      }];
      
      // Only log card array when it actually changes
      const cardArrayHash = JSON.stringify(cardArray.map(c => ({ id: c.id, type: c.type, title: c.content?.title })));
      if (cardArrayHash !== lastCardArrayHash.current) {
        console.log(`🎯 Session card ready: "${sessionContent.title}" @ ${sessionContent.venue}`);
        lastCardArrayHash.current = cardArrayHash;
      }
      
      // Do not return here; continue to allow speaker/topic cards to be pushed
    }
    
    // Speaker cards
    if (showRagCards && ragData?.speaker) {
      // Handle both wrapped and direct speaker data formats
      const speakerData = ragData.speaker.card_data || ragData.speaker;
      
      if (speakerData && speakerData.name) {
        const speakerCard = {
          id: 'current-speaker-card',
          type: 'speaker',
          content: speakerData,
          size: 'full'
        };
        cardArray.push(speakerCard);
      }
    }
    
    // Topic cards
    if (showRagCards && ragData?.topic) {
      const topicCard = {
        id: 'current-topic-card',
        type: 'topic',
        content: ragData.topic,
        size: 'full'
      };
      cardArray.push(topicCard);
    }

    // Weather card (lower priority)
    if (showWeatherCard && weatherData) {
      const weatherCard = {
        id: 'weather-card',
        type: 'weather',
        content: weatherData,
        size: 'full'
      };
      cardArray.push(weatherCard);
    }
    
    return cardArray;
  }, [showRagCards, ragData, showWeatherCard, weatherData]);


  // Show welcome screen when not connected
  if (status !== 'connected' || !conversationUrl) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Rosa - S&T 2025 Host
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            margin: '0'
          }}>
            CTBTO Science & Technology Conference 2025
          </p>
          <div style={{
            marginTop: '10px',
            fontSize: '0.9rem',
            opacity: 0.8,
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            Ask about sessions, speakers, or conference details
          </div>
        </div>

        {/* Main content area */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Controls when not in conversation */}
          {status === 'idle' && (
            <div style={{ 
              padding: '40px',
              textAlign: 'center'
            }}>
              <button
                onClick={handleStartConversation}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                🎤 Start Voice Conversation with Rosa
              </button>
              
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#334155'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                  Split Screen Interface
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', opacity: 0.8 }}>
                  Rosa responds with voice + generative UI on split screen • No camera needed
                </p>
              </div>
            </div>
          )}

          {/* Status indicators */}
          {status === 'connecting' && (
            <div style={{ 
              padding: '40px',
              textAlign: 'center',
              color: '#667eea'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: '600' }}>Connecting...</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                Connecting to Rosa...
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '16px',
              margin: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              Error: {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: '0' }}>
            🌍 Rosa - Your Voice-Only CTBTO & Weather AI Assistant
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
            Enhanced with Split Screen Generative UI • Powered by Tavus & Daily.co
          </p>
        </div>
      </div>
    );
  }

  // Split screen layout when connected
  return (
    <CVIProvider key={conversationId}>
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Left Panel - Rosa Video */}
        <div
          className="rosa-portrait-container"
          style={{
            width: '50vw',
            height: '100vh',
            backgroundImage: `url('/background.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#667eea',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Semi-transparent overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.15)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          
          {/* Rosa Video Conversation */}
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={handleEndConversation}
            />
          </div>

          {/* CSS for left panel video styling */}
          <style>{`
            /* Force the conversation container to fill the entire left panel and remove its background */
            .rosa-portrait-container div[class*="container"] {
              width: 100% !important;
              height: 100% !important;
              border-radius: 0 !important;
              position: relative !important;
              background: transparent !important;
              max-height: none !important;
              aspect-ratio: none !important;
              animation: none !important;
            }
            
            /* Ensure video container fills the space */
            .rosa-portrait-container div[class*="videoContainer"] {
              width: 100% !important;
              height: 100% !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
            }
            
            /* Main video container styling */
            .rosa-portrait-container div[class*="mainVideoContainer"] {
              width: 100% !important;
              height: 100% !important;
              border-radius: 0 !important;
              background: transparent !important;
            }
            
            /* Main video element - fills entire left panel */
            .rosa-portrait-container video,
            .rosa-portrait-container canvas {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              border-radius: 0 !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
            }
            
            /* Self-view (user camera) positioning */
            .rosa-portrait-container div[class*="selfViewContainer"] {
              position: absolute !important;
              bottom: 20px !important;
              right: 20px !important;
              width: 120px !important;
              height: 80px !important;
              z-index: 10 !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
              border: 2px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            /* Footer controls styling */
            .rosa-portrait-container div[class*="footer"] {
              position: absolute !important;
              bottom: 20px !important;
              left: 20px !important;
              right: 140px !important;
              z-index: 10 !important;
              background: rgba(0, 0, 0, 0.5) !important;
              backdrop-filter: blur(20px) !important;
              border-radius: 16px !important;
              padding: 12px 20px !important;
            }
            
            .rosa-portrait-container div[class*="footerControls"] {
              justify-content: center !important;
              gap: 16px !important;
            }
            
            /* Leave button styling */
            .rosa-portrait-container button[class*="leaveButton"] {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
              border: none !important;
              padding: 12px !important;
              border-radius: 12px !important;
              color: white !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
            }
            
            .rosa-portrait-container button[class*="leaveButton"]:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
            }
            
            /* Waiting container (when connecting) */
            .rosa-portrait-container div[class*="waitingContainer"] {
              background: transparent !important;
              color: white !important;
              width: 100% !important;
              height: 100% !important;
            }
          `}</style>
        </div>

        {/* Right Panel - Transparent for Cards */}
        <div
          style={{
            width: '50vw',
            height: '100vh',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Debug info for content rendering */}
          {import.meta.env.DEV && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              zIndex: 999,
              fontFamily: 'monospace'
            }}>
              <div>📋 Content: {currentContent}</div>
              <div>🌤️ Weather: {weatherData ? 'Available' : 'None'}</div>
              <div>🔍 RAG: {ragData ? 'Available' : 'None'}</div>
              <div>📍 Location: {weatherData?.location || 'N/A'}</div>
            </div>
          )}
          
          {/* Minimal status indicator when searching */}
          {isSearching && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(102, 126, 234, 0.95)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '16px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              zIndex: 900
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                Searching for {searchingFor}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Global Handlers - Always Active */}
      <WeatherHandler 
        conversationId={conversationId || ''} 
        onWeatherUpdate={handleWeatherUpdate} 
      />
      <UIDeltaHandler 
        conversationId={conversationId || ''} 
        onCardUpdate={handleRagUpdate}
        meetingState={status}
      />
      <ConferenceHandler
        conversationId={conversationId || ''}
        onSpeakerUpdate={(speaker) => console.log('Speaker:', speaker)}
        onSessionUpdate={(session) => console.log('Session:', session)}
        onScheduleUpdate={(schedule) => console.log('Schedule:', schedule)}
      />
      
      {/* Phase 1: Full-Screen Conversation Canvas + Sticky Interface */}
      {/* Single card system - most recent card replaces previous */}
      <FullScreenCardContainer
        cards={cards}
        maxCards={1}
        onCloseWeather={() => setShowWeatherCard(false)}
        onCloseRag={() => setShowRagCards(false)}
      />

      {/* Phase 1: Sticky Interface MVP - Bottom 15vh */}
      <StickyInterface
        meetingState={status}
        conversationId={conversationId || undefined}
        isUserSpeaking={false} // TODO: Connect to real microphone state
        isRosaSpeaking={false} // TODO: Connect to Rosa speaking state
      />
    </CVIProvider>
  );
}; 