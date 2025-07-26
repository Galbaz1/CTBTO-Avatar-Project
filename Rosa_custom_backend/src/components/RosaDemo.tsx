import React, { useState, useCallback, useRef } from 'react';
import { createConversation, endConversation } from '../api';
import { CVIProvider } from './cvi/components/cvi-provider';
import { Conversation } from './cvi/components/conversation';
import { ConferenceHandler } from './ConferenceHandler';
import { WeatherHandler } from './WeatherHandler';
import { RagHandler } from './RagHandler';

type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting';

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

export const RosaDemo: React.FC = () => {
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Weather UI state
  const [currentContent, setCurrentContent] = useState<'welcome' | 'weather' | 'rag'>('welcome');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  // RAG UI state
  const [ragData, setRagData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchingFor, setSearchingFor] = useState<string>('');
  
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
    // Only log meaningful state changes
    if (currentContent !== 'weather') {
      console.log('🌤️ Weather card displayed:', weather.location);
      
      // ⏱️ TIMING: Weather card displayed
      const { timingTracker } = require('../utils/timingTracker');
      timingTracker.recordCardDisplayed(conversationId || '', 'weather');
    }
    
    setWeatherData(weather);
    setCurrentContent('weather');
  }, [currentContent, conversationId]);

  // Handle RAG updates from the RagHandler  
  const handleRagUpdate = useCallback((ragUpdate: any) => {
    // Only log when cards are actually displayed
    const cardTypes = [];
    if (ragUpdate.session) cardTypes.push('session');
    if (ragUpdate.speaker) cardTypes.push('speaker'); 
    if (ragUpdate.topic) cardTypes.push('topic');
    
    if (cardTypes.length > 0) {
      console.log('🎴 RAG cards displayed:', cardTypes.join(', '));
      
      // ⏱️ TIMING: Cards displayed
      const { timingTracker } = require('../utils/timingTracker');
      timingTracker.recordCardDisplayed(conversationId || '', cardTypes.join(', '));
      
      // Clear searching state when cards arrive
      setIsSearching(false);
      setSearchingFor('');
    }
    
    setRagData(ragUpdate);
    setCurrentContent('rag');
  }, [conversationId]);

  // Monitor conversation for RAG trigger keywords
  const handleConversationMessage = useCallback((message: string, isFromUser: boolean) => {
    if (!isFromUser) return; // Only monitor user messages
    
    const ragKeywords = [
      'sessions', 'speakers', 'conference', 'workshop', 'presentation',
      'schedule', 'when', 'where', 'who', 'what sessions', 'tell me about',
      'find', 'show me', 'interested in', 'looking for', 'quantum', 'nuclear',
      'seismology', 'monitoring', 'verification', 'ctbto', 'detection'
    ];
    
    const messageWords = message.toLowerCase();
    const hasRagKeywords = ragKeywords.some(keyword => messageWords.includes(keyword));
    
    if (hasRagKeywords) {
      console.log('🔍 Detected potential RAG query, showing loading...');
      setIsSearching(true);
      setSearchingFor(getSearchContext(message));
      
      // Auto-clear after 20 seconds if no results
      setTimeout(() => {
        setIsSearching(false);
        setSearchingFor('');
      }, 20000);
    }
  }, []);
  
  // Extract search context from user message
  const getSearchContext = (message: string): string => {
    const messageWords = message.toLowerCase();
    
    if (messageWords.includes('session')) return 'relevant sessions';
    if (messageWords.includes('speaker')) return 'speakers';
    if (messageWords.includes('schedule')) return 'schedule information';
    if (messageWords.includes('workshop')) return 'workshops';
    if (messageWords.includes('quantum')) return 'quantum technology sessions';
    if (messageWords.includes('nuclear')) return 'nuclear verification content';
    if (messageWords.includes('seismology')) return 'seismology sessions';
    
    return 'conference information';
  };

  const handleBackToWelcome = useCallback(() => {
    setCurrentContent('welcome');
    setWeatherData(null);
    setRagData(null);
    setIsSearching(false);
    setSearchingFor('');
  }, []);

  // Searching indicator component
  const SearchingIndicator = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Animated search icon */}
        <div style={{
          fontSize: '3rem',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          🔍
        </div>
        
        <h3 style={{
          color: 'white',
          margin: '0 0 15px 0',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Searching for {searchingFor}
        </h3>
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1rem',
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          Rosa is analyzing the conference database to find the most relevant information for you.
        </div>
        
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          } 
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  // Content for right panel
  const contentData: Record<string, { title: string; content: React.ReactElement }> = {
    welcome: {
      title: 'Rosa AI Assistant',
      content: (
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#1e293b',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome to Rosa
            </h1>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#475569',
              margin: '0 0 12px 0'
            }}>
              Enhanced with Weather Intelligence
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748b', 
              margin: 0,
              fontWeight: '400'
            }}>
              CTBTO Science and Technology Conference Assistant<br/>
              Vienna International Centre
            </p>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '12px' }}>
            <h3 style={{ 
              margin: '0 0 24px 0', 
              color: '#334155', 
              fontSize: '20px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              What Rosa Can Help With
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {[
                'CTBTO Conference Information',
                'Weather Updates & Forecasts', 
                'Nuclear Verification Topics',
                'Technical Questions',
                'Logistical Support'
              ].map((topic, index) => (
                <div key={index} style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#475569',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              🌤️ Try the Weather Feature
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9 }}>
              Ask Rosa about weather in any city and see the generative UI in action
            </p>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              💬 Try: "What's the weather in Vienna?" or "How's the weather in London today?"
            </div>
          </div>
        </div>
      )
    },
    weather: {
      title: `Weather Information`,
      content: weatherData ? (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Back button */}
          <button
            onClick={handleBackToWelcome}
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              color: '#667eea',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Welcome
          </button>

          {/* Large weather display */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {weatherData.icon === 'partly-cloudy' ? '⛅' : 
               weatherData.icon === 'sunny' ? '☀️' : 
               weatherData.icon === 'cloudy' ? '☁️' : 
               weatherData.icon === 'rainy' ? '🌧️' : 
               weatherData.icon === 'snowy' ? '❄️' : 
               weatherData.icon === 'stormy' ? '⛈️' : '🌤️'}
            </div>
            
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              margin: '0 0 8px 0' 
            }}>
              {weatherData.temperature}°C
            </h2>
            
            <h3 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              margin: '0 0 16px 0' 
            }}>
              {weatherData.location}
            </h3>
            
            <p style={{ 
              fontSize: '18px', 
              margin: '0', 
              opacity: 0.9,
              textTransform: 'capitalize'
            }}>
              {weatherData.description}
            </p>
          </div>

          {/* Weather details grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💧</div>
              <h4 style={{ 
                fontSize: '14px', 
                color: '#64748b', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 8px 0'
              }}>
                Humidity
              </h4>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0'
              }}>
                {weatherData.humidity}%
              </p>
            </div>
            
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💨</div>
              <h4 style={{ 
                fontSize: '14px', 
                color: '#64748b', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 8px 0'
              }}>
                Wind Speed
              </h4>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0'
              }}>
                {weatherData.windSpeed} km/h
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#667eea',
              margin: '0',
              fontWeight: '600'
            }}>
              🤖 Weather data provided by Rosa AI Assistant
            </p>
          </div>
        </div>
      ) : (
        <div>Loading weather data...</div>
      )
    },
    rag: {
      title: 'Conference Information',
      content: ragData ? (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Back button */}
          <button
            onClick={handleBackToWelcome}
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              color: '#667eea',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Welcome
          </button>

          {/* Display RAG cards */}
          {ragData.session && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '32px',
              borderRadius: '16px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>📅 Recommended Session</h3>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{ragData.session.card_data?.title || 'Session Found'}</h4>
              <p style={{ margin: 0, opacity: 0.9 }}>{ragData.session.display_reason}</p>
            </div>
          )}

          {ragData.speaker && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '24px',
              borderRadius: '16px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>👤 Featured Speaker</h3>
              <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>{ragData.speaker.card_data?.name || 'Speaker Found'}</h4>
              <p style={{ margin: 0, color: '#64748b' }}>{ragData.speaker.display_reason}</p>
            </div>
          )}

          {ragData.topic && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '24px',
              borderRadius: '16px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>🏷️ Related Topic</h3>
              <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>{ragData.topic.card_data?.theme || 'Topic Found'}</h4>
              <p style={{ margin: 0, color: '#64748b' }}>{ragData.topic.display_reason}</p>
            </div>
          )}
        </div>
      ) : (
        <div>Loading conference data...</div>
      )
    }
  };

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
            🤖 Rosa AI Assistant
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            margin: '0'
          }}>
            Enhanced with Weather Intelligence & Generative UI
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
            🎤 Voice-Only: Ask about CTBTO or weather: "What's the weather in Vienna?"
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
                  🎯 Split Screen Interface
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
              <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🔄</div>
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
              ❌ {error}
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
              onMessage={handleConversationMessage}
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

        {/* Right Panel - Dynamic Content */}
        <div
          style={{
            width: '50vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ flex: 1, padding: '30px 20px 40px 20px', overflow: 'auto' }}>
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
            {isSearching ? <SearchingIndicator /> : contentData[currentContent].content}
          </div>
        </div>
      </div>
      
      {/* Global Handlers - Always Active */}
      <WeatherHandler onWeatherUpdate={handleWeatherUpdate} />
      <RagHandler 
        conversationId={conversationId || ''} 
        onRagUpdate={handleRagUpdate} 
      />
      <ConferenceHandler
        conversationId={conversationId || ''}
        onSpeakerUpdate={(speaker) => console.log('Speaker:', speaker)}
        onSessionUpdate={(session) => console.log('Session:', session)}
        onScheduleUpdate={(schedule) => console.log('Schedule:', schedule)}
      />
    </CVIProvider>
  );
}; 