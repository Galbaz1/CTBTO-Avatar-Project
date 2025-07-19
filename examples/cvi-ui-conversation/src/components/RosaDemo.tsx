import React, { useState, memo, useRef, useCallback } from 'react';
import { Conversation } from './cvi/components/conversation';
import { CVIProvider } from './cvi/components/cvi-provider';
import { SimpleConversationLogger } from './SimpleConversationLogger';
import { SimpleWeatherHandler } from './SimpleWeatherHandler';
import { CTBTOHandler } from './CTBTOHandler';
import { SpeakerHandler } from './SpeakerHandler';
import { useLocalSessionId, useAudioLevelObserver, useActiveSpeakerId } from '@daily-co/daily-react';

interface RosaDemoProps {
  conversation: any;
  onLeave: () => void;
  costSavingMode?: boolean; // ✅ New prop for audio-only mode
}

// ✅ Enhanced Audio Wave Visualization using Daily's audio level observer
const EnhancedAudioWave: React.FC<{ conversationId: string }> = memo(({ conversationId }) => {
  const localSessionId = useLocalSessionId();
  const activeSpeakerId = useActiveSpeakerId();
  const isUserSpeaking = activeSpeakerId === localSessionId;
  
  // Refs for the 5 bars
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const bar4Ref = useRef<HTMLDivElement>(null);
  const bar5Ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // Use Daily's audio level observer for accurate audio detection
  useAudioLevelObserver(
    localSessionId || '',
    useCallback((volume) => {
      // Cancel any pending animation frame to prevent accumulation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame to batch DOM updates for smooth performance
      animationFrameRef.current = requestAnimationFrame(() => {
        const scaledVolume = Number(Math.max(0.01, volume).toFixed(2));
        
        if (bar1Ref.current && bar2Ref.current && bar3Ref.current && bar4Ref.current && bar5Ref.current) {
          // Different scaling for each bar to create a more dynamic wave pattern
          const minHeight = 8;
          const maxHeight = 32;
          
          // Create varied heights based on volume with different multipliers
          const heights = [
            Math.min(maxHeight, minHeight + (scaledVolume * 30)), // Bar 1: moderate
            Math.min(maxHeight, minHeight + (scaledVolume * 45)), // Bar 2: higher
            Math.min(maxHeight, minHeight + (scaledVolume * 60)), // Bar 3: highest (center)
            Math.min(maxHeight, minHeight + (scaledVolume * 45)), // Bar 4: higher
            Math.min(maxHeight, minHeight + (scaledVolume * 30)), // Bar 5: moderate
          ];
          
          bar1Ref.current.style.height = `${heights[0]}px`;
          bar2Ref.current.style.height = `${heights[1]}px`;
          bar3Ref.current.style.height = `${heights[2]}px`;
          bar4Ref.current.style.height = `${heights[3]}px`;
          bar5Ref.current.style.height = `${heights[4]}px`;
        }
      });
    }, [])
  );

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '50%',
      display: 'flex',
      alignItems: 'end',
      gap: '6px',
      zIndex: 3,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '16px 24px',
      borderRadius: '30px',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      willChange: 'transform',
      transform: 'translateX(-50%) translateZ(0)' // Hardware acceleration
    }}>
      {/* Speaking Status Indicator */}
      <div style={{
        fontSize: '12px',
        color: 'white',
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '500'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          background: isUserSpeaking ? '#22c55e' : '#6b7280',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          boxShadow: isUserSpeaking ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none'
        }}></div>
        {isUserSpeaking ? 'Speaking...' : 'Listening'}
      </div>
      
      {/* Enhanced 5-Bar Audio Visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '3px',
        height: '32px'
      }}>
        {[bar1Ref, bar2Ref, bar3Ref, bar4Ref, bar5Ref].map((ref, i) => (
          <div
            key={i}
            ref={ref}
            style={{
              width: '4px',
              height: '8px', // Minimum height
              background: isUserSpeaking 
                ? `linear-gradient(180deg, #22c55e 0%, #16a34a 100%)`
                : `linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)`,
              borderRadius: '2px',
              transition: 'height 200ms ease-out, background 0.3s ease',
              opacity: isUserSpeaking ? 1 : 0.7,
              willChange: 'height',
              transform: 'translateZ(0)', // Hardware acceleration
              boxShadow: isUserSpeaking ? '0 0 4px rgba(34, 197, 94, 0.4)' : 'none'
            }}
          />
        ))}
      </div>
      
      {/* Microphone Icon */}
      <div style={{
        marginLeft: '8px',
        fontSize: '14px',
        opacity: 0.8,
        color: 'white'
      }}>
        🎤
      </div>
    </div>
  );
});

EnhancedAudioWave.displayName = 'EnhancedAudioWave';

// ✅ Static Rosa Avatar Component for Cost-Saving Mode
const StaticRosaAvatar: React.FC<{ 
  conversationUrl: string; 
  onLeave: () => void;
  conversationId: string;
}> = ({ conversationUrl, onLeave, conversationId }) => {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Static Rosa Image */}
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '85%',
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {/* Rosa Status Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          Rosa - Audio Mode
        </div>
        
        {/* Cost Savings Badge */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
          💰 Cost Optimized
        </div>
      </div>

      {/* Hidden Audio-Only Conversation Component */}
      <div style={{ display: 'none' }}>
        <Conversation
          conversationUrl={conversationUrl}
          onLeave={onLeave}
        />
      </div>

      {/* ✅ Enhanced Audio Wave Visualizer using Daily's audio level observer */}
      <EnhancedAudioWave conversationId={conversationId} />

      {/* ✅ Add Conversation Logging and Handlers (Hidden but Active) */}
      <div style={{ display: 'none' }}>
        <SimpleConversationLogger 
          conversationId={conversationId}
          enabled={true}
        />
        <SimpleWeatherHandler 
          conversationId={conversationId}
          onWeatherUpdate={(weather: any) => {
            console.log('🌤️ Weather update in audio-only mode:', weather);
          }} 
        />
        <CTBTOHandler
          conversationId={conversationId}
          onCTBTOUpdate={(ctbtoData: any) => {
            console.log('🏛️ CTBTO update in audio-only mode:', ctbtoData);
          }}
          onSpeakerUpdate={(speakerData: any) => {
            console.log('👤 Speaker update in audio-only mode:', speakerData);
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export const RosaDemo: React.FC<RosaDemoProps> = ({ 
  conversation, 
  onLeave, 
  costSavingMode = false
}) => {
  const [currentContent, setCurrentContent] = useState<'welcome'>('welcome');

  // Sample content for Rosa's split-screen interface
  const contentData = {
    welcome: {
      title: "Welcome to CTBTO SnT 2025",
      content: (
        <div style={{ 
          margin: '0 60px',
          padding: '60px 40px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(255,255,255,0.95) 100%)',
          border: '1px solid rgba(225, 232, 237, 0.5)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle inner glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
            borderRadius: '24px',
            pointerEvents: 'none'
          }}></div>
          
          {/* ✅ Cost Saving Mode Indicator */}
          {costSavingMode && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              zIndex: 10
            }}>
              💰 Audio-Only Mode - Cost Optimized
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#2563eb', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              🏛️
            </div>
            <h2 style={{ 
              margin: 0, 
              color: '#1e293b', 
              fontSize: '28px', 
              fontWeight: '600',
              letterSpacing: '-0.5px',
              marginBottom: '12px'
            }}>
              Comprehensive Nuclear-Test-Ban Treaty Organization
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748b', 
              margin: 0,
              fontWeight: '400'
            }}>
              Science and Technology Conference 2025<br/>
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
              Conference Focus Areas
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {[
                'Nuclear Verification Technologies',
                'Seismic Monitoring Systems', 
                'Radionuclide Detection',
                'Hydroacoustic Monitoring',
                'International Monitoring System'
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
        </div>
      )
    }
    // Add other content data sections here if needed
  };

  return (
    <CVIProvider key={conversation.conversation_id}>
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
        {/* Left Panel - Avatar (Video or Static) */}
        <div
          className="rosa-portrait-container"
          style={{
            width: '50vw',
            height: '100vh',
            backgroundImage: `url('/background.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#2563eb',
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
              background: costSavingMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.15)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          
          {/* ✅ Conditional Rendering: Static Rosa or Live Video */}
          {costSavingMode ? (
            <StaticRosaAvatar 
              conversationUrl={conversation.conversation_url}
              onLeave={onLeave}
              conversationId={conversation.conversation_id}
            />
          ) : (
            <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
              <Conversation
                conversationUrl={conversation.conversation_url}
                onLeave={onLeave}
              />
            </div>
          )}

          {/* Existing styles for video mode */}
          <style>{`
            /* Global reset to eliminate browser margins */
            body, html, #root, main {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            
            /* Avatar container sizing (perfect, don't change) */
            .rosa-portrait-container div[class*="container"] {
              aspect-ratio: unset !important;
              max-height: none !important;
              height: 100vh !important;
              width: 100% !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              background-color: transparent !important;
            }
            
            /* Video containers */
            .rosa-portrait-container div[class*="videoContainer"],
            .rosa-portrait-container div[class*="mainVideoContainer"] {
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              background-color: transparent !important;
            }
            
            /* Video element */
            .rosa-portrait-container div[class*="mainVideo"] {
              aspect-ratio: unset !important;
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              background: transparent !important;
            }
            
            /* Canvas element - ensure transparency */
            .rosa-portrait-container canvas {
              aspect-ratio: unset !important;
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
              background-color: transparent !important;
              mix-blend-mode: screen !important;
            }
            
            /* Remove all grey backgrounds from CVI components */
            .rosa-portrait-container div {
              background-color: transparent !important;
              background: transparent !important;
            }
            
            /* Target specific grey backgrounds */
            .rosa-portrait-container div[style*="background-color: rgb(55, 65, 81)"],
            .rosa-portrait-container div[style*="background-color: #374151"],
            .rosa-portrait-container div[style*="background: rgb(55, 65, 81)"],
            .rosa-portrait-container div[style*="background: #374151"] {
              background-color: transparent !important;
              background: transparent !important;
            }
            
            /* Control buttons as floating overlay */
            .rosa-portrait-container div[class*="footer"] {
              position: absolute !important;
              bottom: 20px !important;
              left: 20px !important;
              background: transparent !important;
              border-radius: 12px !important;
              padding: 12px !important;
              z-index: 200 !important;
              backdrop-filter: none !important;
              box-shadow: none !important;
            }
            
            /* Style the control buttons */
            .rosa-portrait-container div[class*="footerControls"] {
              gap: 8px !important;
            }
            
            /* Hide ghost audio wave visualization */
            .rosa-portrait-container div[class*="audioWave"],
            .rosa-portrait-container div[class*="waveContainer"] {
              display: none !important;
            }
            
            /* Hide user camera preview since avatar won't see user */
            .rosa-portrait-container div[class*="previewVideo"],
            .rosa-portrait-container div[class*="selfView"] {
              display: none !important;
            }
            
            /* Hide device selection dropdowns (mic/camera device pickers) */
            .rosa-portrait-container div[class*="deviceSelect"],
            .rosa-portrait-container div[class*="device-select"] {
              display: none !important;
            }
          `}</style>
        </div>

        {/* Right Panel - Simple content for now */}
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
            {contentData[currentContent].content}
          </div>
        </div>
      </div>
      
      {/* ✅ Add Global Handlers for Full Video Mode */}
      {!costSavingMode && (
        <>
          <SimpleConversationLogger 
            conversationId={conversation.conversation_id}
            enabled={true}
          />
          <SimpleWeatherHandler 
            conversationId={conversation.conversation_id}
            onWeatherUpdate={(weather: any) => {
              console.log('🌤️ Weather update received in App:', weather);
            }} 
          />
          <CTBTOHandler
            conversationId={conversation.conversation_id}
            onCTBTOUpdate={(ctbtoData: any) => {
              console.log('🏛️ CTBTO update received in App:', ctbtoData);
            }}
            onSpeakerUpdate={(speakerData: any) => {
              console.log('👤 Speaker update received in App:', speakerData);
            }}
          />
          <SpeakerHandler
            conversationId={conversation.conversation_id}
            onSpeakerUpdate={(speakerData: any) => {
              console.log('👥 Speaker profile received in App:', speakerData);
            }}
            onSpeakerListUpdate={(speakerListData: any) => {
              console.log('📋 Speaker list received in App:', speakerListData);
            }}
          />
        </>
      )}
    </CVIProvider>
  );
}; 