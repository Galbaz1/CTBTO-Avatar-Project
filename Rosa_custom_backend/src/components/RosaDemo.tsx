import React, { useState, useCallback } from 'react';
import { Conversation } from './cvi/components/conversation';
import { CVIProvider } from './cvi/components/cvi-provider';
import { SimpleConversationLogger } from './SimpleConversationLogger';
import { SimpleConferenceHandler } from './SimpleConferenceHandler';
import { SpeakerCard } from './SpeakerCard';
import { SessionCard } from './SessionCard';

interface RosaDemoProps {
  conversation: any;
  onLeave: () => void;
}

// Enhanced content types - includes conference functionality
type ContentType = 'welcome' | 'info' | 'loading' | 'speaker' | 'session' | 'schedule';

interface ContentState {
  type: ContentType;
  data?: any;
  timestamp: number;
}

export const RosaDemo: React.FC<RosaDemoProps> = ({ conversation, onLeave }) => {
  const [currentContent, setCurrentContent] = useState<ContentState>({
    type: 'welcome',
    timestamp: Date.now()
  });

  // Conference content handlers
  const handleSpeakerUpdate = useCallback((speaker: any) => {
    console.log('🎤 Speaker update received:', speaker);
    setCurrentContent({
      type: 'speaker',
      data: speaker,
      timestamp: Date.now()
    });
  }, []);

  const handleSessionUpdate = useCallback((session: any) => {
    console.log('📅 Session update received:', session);
    setCurrentContent({
      type: 'session',
      data: session,
      timestamp: Date.now()
    });
  }, []);

  const handleScheduleUpdate = useCallback((schedule: any) => {
    console.log('📊 Schedule update received:', schedule);
    setCurrentContent({
      type: 'schedule',
      data: schedule,
      timestamp: Date.now()
    });
  }, []);

  const handleContentClose = useCallback(() => {
    setCurrentContent({
      type: 'welcome',
      timestamp: Date.now()
    });
  }, []);

  // Optimized content renderer - clean and extensible
  const renderContent = useCallback((content: ContentState) => {
    switch (content.type) {
      case 'welcome':
        return (
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '20px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
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
                AI Conference Assistant
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#64748b', 
                margin: 0,
                fontWeight: '400'
              }}>
                Your intelligent guide for conferences and events
              </p>
            </div>
            
            <div style={{ 
              background: '#f8fafc', 
              padding: '32px', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                margin: '0 0 24px 0', 
                color: '#334155', 
                fontSize: '20px',
                fontWeight: '600'
              }}>
                What Rosa Can Help With
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {[
                  '🎤 Speaker Information',
                  '🗺️ Venue Navigation', 
                  '📅 Schedule Planning',
                  '🔍 Session Discovery',
                  '📱 Contact Exchange'
                ].map((feature, index) => (
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
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                🗣️ Just Ask Rosa
              </h4>
              <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>
                Start a conversation to get personalized assistance
              </p>
            </div>
          </div>
        );
        
      case 'loading':
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Rosa is thinking...
            </p>
          </div>
        );
        
      case 'info':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: '#334155', marginBottom: '16px' }}>
              Information Display
            </h3>
            <p style={{ color: '#64748b' }}>
              Dynamic content will appear here based on your conversation with Rosa.
            </p>
            {content.data && (
              <pre style={{ 
                background: '#f8fafc', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(content.data, null, 2)}
              </pre>
            )}
          </div>
        );

      case 'speaker':
        return content.data ? (
          <SpeakerCard 
            speaker={content.data}
            onClose={handleContentClose}
            className="fade-in"
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            Speaker information not available
          </div>
        );

      case 'session':
        return content.data ? (
          <SessionCard 
            session={content.data}
            onClose={handleContentClose}
            onSpeakerClick={(speakerId) => {
              console.log('Speaker clicked:', speakerId);
              // Could trigger a speaker lookup here
            }}
            className="fade-in"
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            Session information not available
          </div>
        );

      case 'schedule':
        return content.data ? (
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              {/* Close button */}
              <button
                onClick={handleContentClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#64748b'
                }}
              >
                ×
              </button>

              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                📅 Conference Schedule
              </h2>

              {content.data.sessions && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#334155',
                    margin: '0 0 12px 0'
                  }}>
                    Sessions
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}>
                    {content.data.sessions.map((session: any, index: number) => (
                      <div 
                        key={session.id || index}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {session.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          display: 'flex',
                          gap: '12px'
                        }}>
                          <span>👤 {session.speaker}</span>
                          <span>🕒 {session.time}</span>
                          <span>📍 {session.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTBTO message */}
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#92400e',
                  margin: '0',
                  fontWeight: '600'
                }}>
                  🌍 The CTBTO is going to save humanity through nuclear verification
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            Schedule information not available
          </div>
        );
        
      default:
        return <div>Unknown content type</div>;
    }
  }, [handleContentClose]);

  return (
    <CVIProvider key={conversation.conversation_id}>
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        zIndex: 1000,
      }}>
        {/* Left Panel - Rosa Avatar */}
        <div style={{
          height: '100vh',
          backgroundImage: `url('/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#2563eb',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Subtle overlay for better contrast */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.1)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          
          {/* Rosa Conversation */}
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            width: '100%', 
            height: '100%' 
          }}>
            <Conversation
              conversationUrl={conversation.conversation_url}
              onLeave={onLeave}
            />
          </div>
        </div>

        {/* Right Panel - Dynamic Content */}
        <div style={{
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 75%, #f8fafc 100%)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            overflow: 'auto',
            display: 'flex',
            alignItems: currentContent.type === 'welcome' ? 'center' : 'flex-start'
          }}>
            {renderContent(currentContent)}
          </div>
        </div>
      </div>
      
      {/* Global Handlers - Optimized for our backend */}
      <SimpleConversationLogger 
        conversationId={conversation.conversation_id}
        enabled={true}
      />
      
      {/* Simple Conference Handler - parses Rosa's responses for conference content */}
      <SimpleConferenceHandler
        conversationId={conversation.conversation_id}
        onSpeakerUpdate={handleSpeakerUpdate}
        onSessionUpdate={handleSessionUpdate}
        onScheduleUpdate={handleScheduleUpdate}
      />
      
      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Optimized conversation container styling */
        .rosa-portrait-container div[class*="container"] {
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          background: transparent !important;
          max-height: none !important;
          aspect-ratio: none !important;
        }
        
        .rosa-portrait-container video,
        .rosa-portrait-container canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 0 !important;
        }
        
        /* Self-view removed - no camera needed */
        
        /* Clean footer controls - no camera, simplified layout */
        .rosa-portrait-container div[class*="footer"] {
          position: absolute !important;
          bottom: 20px !important;
          left: 20px !important;
          right: 20px !important;
          z-index: 10 !important;
          background: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 16px !important;
          padding: 12px 20px !important;
        }
      `}</style>
    </CVIProvider>
  );
}; 