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

export const RosaDemo: React.FC = () => {
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [, setError] = useState<string | null>(null);

  // Floating Cards State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showWeatherCard, setShowWeatherCard] = useState(false);
  const [ragData, setRagData] = useState<any>(null);
  const [showRagCards, setShowRagCards] = useState(false);

  // Reference for tracking current conversation URL (for backend integration)
  const currentConversationRef = useRef<string | null>(null);

  const [_currentContent, setCurrentContent] = useState<'welcome' | 'weather' | 'rag'>('welcome');
  const [_isSearching, setIsSearching] = useState(false);
  const [_searchingFor, setSearchingFor] = useState<string>('');

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
      setConversationId(conversation.conversation_id);

      // Store conversation ID globally for WeatherHandler
      (window as any).currentConversationId = conversation.conversation_id;
      console.log('🔍 Stored conversation ID globally:', conversation.conversation_id);

      // Register the session with backend
      try {
        const sessionId = conversation.conversation_id;
        const registrationData = {
          conversation_id: sessionId,
          conversation_url: conversation.conversation_url,
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
  const handleWeatherUpdate = useCallback(
    (weather: WeatherData) => {
      console.log('🌤️ Weather card displayed:', weather.location);
      timingTracker.recordCardDisplayed(conversationId || '', 'weather');
      setWeatherData(weather);
      setShowWeatherCard(true);
    },
    [conversationId]
  );

  // Handle RAG card updates (UIDeltaHandler delivers cardData + cardType)
  const handleRagUpdate = useCallback(
    (cardData: any, cardType: string) => {
      if (!cardType) return;

      // Merge new card data into ragData state keyed by cardType (session / speaker / topic)
      setRagData((prev: any) => ({ ...prev, [cardType]: cardData }));

      // Analytics & UI flags
      timingTracker.recordCardDisplayed(conversationId || '', cardType);
      setIsSearching(false);
      setSearchingFor('');
      setShowRagCards(true);

      console.log(`🎴 RAG card displayed: ${cardType}`);
    },
    [conversationId]
  );

  const lastSessionDataHash = useRef<string>('');
  const lastCardArrayHash = useRef<string>('');

  const cards = useMemo(() => {
    const cardArray: any[] = [];

    if (showRagCards && ragData?.session) {
      const sessionData = ragData.session;
      const sessionDataHash = JSON.stringify(sessionData);
      if (sessionDataHash !== lastSessionDataHash.current) {
        const sessionTitle =
          sessionData.card_data?.title || sessionData.card_data?.metadata?.title || 'Unknown Session';
        console.log(`🔍 New session: "${sessionTitle}" (${sessionData.card_data?.metadata?.session_type || 'Unknown Type'})`);
        lastSessionDataHash.current = sessionDataHash;
      }

      // Use the backend-transformed data directly (it's now properly formatted)
      const sessionContent = sessionData.card_data || sessionData;

      cardArray.push({
        id: sessionContent.session_id || 'current-session-card',
        type: 'session',
        content: sessionContent,
        size: 'full',
      });

      const cardArrayHash = JSON.stringify(cardArray.map((c) => ({ id: c.id, type: c.type, title: c.content?.title })));
      if (cardArrayHash !== lastCardArrayHash.current) {
        console.log(`🎯 Session card ready: "${sessionContent.title}" @ ${sessionContent.venue}`);
        lastCardArrayHash.current = cardArrayHash;
      }
    }

    if (showRagCards && ragData?.speaker) {
      const speakerData = ragData.speaker.card_data || ragData.speaker;
      if (speakerData && speakerData.name) {
        cardArray.push({
          id: 'current-speaker-card',
          type: 'speaker',
          content: speakerData,
          size: 'full',
        });
      }
    }

    if (showRagCards && ragData?.topic) {
      cardArray.push({
        id: 'current-topic-card',
        type: 'topic',
        content: ragData.topic,
        size: 'full',
      });
    }

    if (showWeatherCard && weatherData) {
      cardArray.push({
        id: 'weather-card',
        type: 'weather',
        content: weatherData,
        size: 'full',
      });
    }

    return cardArray;
  }, [showRagCards, ragData, showWeatherCard, weatherData]);

  // WELCOME UI
  if (status !== 'connected' || !conversationUrl) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Add minimal welcome message */}
        <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Rosa - S&T 2025 Host
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>CTBTO Science & Technology Conference 2025</p>
        </div>
        {status === 'idle' && (
          <button
            onClick={handleStartConversation}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '200px',
            }}
          >
            🎤 Start Voice Conversation with Rosa
          </button>
        )}
      </div>
    );
  }

  // CONNECTED UI
  return (
    <CVIProvider key={conversationId || undefined}>
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
        {/* LEFT PANEL - Rosa Video */}
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
          {/* overlay */}
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
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
            <Conversation conversationUrl={conversationUrl} onLeave={handleEndConversation} />
          </div>
        </div>
        {/* RIGHT PANEL */}
        <div
          style={{
            width: '50vw',
            height: '100vh',
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden',
          }}
        />
      </div>

      {/* Handlers & UI */}
      <WeatherHandler conversationId={conversationId || ''} onWeatherUpdate={handleWeatherUpdate} />
      <UIDeltaHandler
        conversationId={conversationId || ''}
        onCardUpdate={handleRagUpdate}
        meetingState={status === 'connected' ? 'joined-meeting' : status}
      />
      <ConferenceHandler
        conversationId={conversationId || ''}
        onSpeakerUpdate={(speaker) => console.log('Speaker:', speaker)}
        onSessionUpdate={(session) => console.log('Session:', session)}
        onScheduleUpdate={(schedule) => console.log('Schedule:', schedule)}
      />

      <FullScreenCardContainer cards={cards} maxCards={1} onCloseWeather={() => setShowWeatherCard(false)} onCloseRag={() => setShowRagCards(false)} />
      <StickyInterface meetingState={status} conversationId={conversationId || undefined} isUserSpeaking={false} isRosaSpeaking={false} />
    </CVIProvider>
  );
}; 