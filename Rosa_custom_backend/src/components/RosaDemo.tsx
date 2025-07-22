import React, { useState, useCallback } from 'react';
import { Conversation } from './cvi/components/conversation';
import { CVIProvider } from './cvi/components/cvi-provider';
import { SimpleConversationLogger } from './SimpleConversationLogger';

interface RosaDemoProps {
  conversation: any;
  onLeave: () => void;
}

// Optimized content types - start simple and expand
type ContentType = 'welcome' | 'info' | 'loading';

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
        
      default:
        return <div>Unknown content type</div>;
    }
  }, []);

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
      
      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        /* Self-view optimization */
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
        
        /* Clean footer controls */
        .rosa-portrait-container div[class*="footer"] {
          position: absolute !important;
          bottom: 20px !important;
          left: 20px !important;
          right: 140px !important;
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