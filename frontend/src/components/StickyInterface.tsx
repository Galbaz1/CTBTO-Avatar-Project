import React, { useState, useEffect } from 'react';
import { AudioWave } from './cvi/components/audio-wave';
import { useLocalSessionId } from '@daily-co/daily-react';

interface StickyInterfaceProps {
  meetingState: string;
  conversationId?: string;
  isUserSpeaking?: boolean;
  isRosaSpeaking?: boolean;
}

interface Caption {
  speaker: 'user' | 'rosa';
  text: string;
  timestamp: number;
}

export const StickyInterface: React.FC<StickyInterfaceProps> = ({
  meetingState,
  conversationId: _conversationId,
  isUserSpeaking = false,
  isRosaSpeaking = false
}) => {
  const [recentCaptions, setRecentCaptions] = useState<Caption[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  
  // Get the local participant ID for the AudioWave component
  const localSessionId = useLocalSessionId();

  // Static suggestions for Phase 1 MVP
  const hardCodedSuggestions = [
    "Ask about speakers",
    "Show me the schedule", 
    "What about the weather?",
    "Find sessions about AI",
    "Tell me about venues",
    "Search for workshops",
    "Show networking events",
    "What's happening now?"
  ];

  // Rotate suggestions every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => 
        (prev + 1) % hardCodedSuggestions.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [hardCodedSuggestions.length]);

  // Mock caption simulation for Phase 1 (will be replaced with real transcription)
  useEffect(() => {
    if (isUserSpeaking) {
      const mockUserCaption: Caption = {
        speaker: 'user',
        text: 'User is speaking...',
        timestamp: Date.now()
      };
      setRecentCaptions(prev => [mockUserCaption, ...prev.slice(0, 4)]);
    }
    
    if (isRosaSpeaking) {
      const mockRosaCaption: Caption = {
        speaker: 'rosa',
        text: 'Rosa is responding...',
        timestamp: Date.now()
      };
      setRecentCaptions(prev => [mockRosaCaption, ...prev.slice(0, 4)]);
    }
  }, [isUserSpeaking, isRosaSpeaking]);

  // Only show when in meeting state
  if (meetingState !== 'connected') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      right: 0,
      height: '15vh',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)',
    }}>
      
      {/* Left Section: User Audio & Captions */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* User Audio Wave */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isUserSpeaking 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : '#d1d5db',
            transition: 'all 0.3s ease',
            boxShadow: isUserSpeaking ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none',
          }} />
          
          <div style={{ 
            flex: 1, 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: 'scale(2.5)', // Scale up the small AudioWave component
            transformOrigin: 'center'
          }}>
            {localSessionId && <AudioWave id={localSessionId} />}
          </div>
          
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isUserSpeaking ? '#059669' : '#6b7280',
            transition: 'color 0.3s ease',
          }}>
            You
          </span>
        </div>

        {/* User Captions */}
        <div style={{
          flex: 1,
          minHeight: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {recentCaptions
            .filter(caption => caption.speaker === 'user')
            .slice(0, 2)
            .map((caption, index) => (
              <div
                key={caption.timestamp}
                style={{
                  fontSize: index === 0 ? '16px' : '14px',
                  color: index === 0 ? '#1f2937' : '#6b7280',
                  opacity: index === 0 ? 1 : 0.7,
                  fontWeight: index === 0 ? '500' : '400',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                }}
              >
                {caption.text}
              </div>
            ))
          }
          {recentCaptions.filter(c => c.speaker === 'user').length === 0 && (
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              fontStyle: 'italic',
            }}>
              Your voice will appear here...
            </div>
          )}
        </div>
      </div>

      {/* Center Section: Suggestion Carousel */}
      <div style={{
        flex: 0,
        minWidth: '300px',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '0 32px',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Try asking
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '12px 24px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '500',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.5s ease',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => {
          // TODO: Trigger voice input with suggestion
          console.log('🎤 Suggested phrase:', hardCodedSuggestions[currentSuggestionIndex]);
        }}
        >
          "{hardCodedSuggestions[currentSuggestionIndex]}"
        </div>

        {/* Suggestion dots indicator */}
        <div style={{
          display: 'flex',
          gap: '6px',
        }}>
          {hardCodedSuggestions.map((_, index) => (
            <div
              key={index}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: index === currentSuggestionIndex 
                  ? '#667eea' 
                  : '#d1d5db',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentSuggestionIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Right Section: Rosa Audio & Captions */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexDirection: 'row-reverse', // Mirror the left side
      }}>
        {/* Rosa Audio Wave */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
          flexDirection: 'row-reverse',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isRosaSpeaking 
              ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
              : '#d1d5db',
            transition: 'all 0.3s ease',
            boxShadow: isRosaSpeaking ? '0 0 20px rgba(139, 92, 246, 0.6)' : 'none',
          }} />
          
          <div style={{ 
            flex: 1, 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: 'scale(2.5)', // Scale up the small AudioWave component
            transformOrigin: 'center'
          }}>
            {/* For Rosa, we'll use a special ID or the conversation ID */}
            {_conversationId && <AudioWave id={`rosa-${_conversationId}`} />}
          </div>
          
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isRosaSpeaking ? '#7c3aed' : '#6b7280',
            transition: 'color 0.3s ease',
          }}>
            Rosa
          </span>
        </div>

        {/* Rosa Captions */}
        <div style={{
          flex: 1,
          minHeight: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'right',
        }}>
          {recentCaptions
            .filter(caption => caption.speaker === 'rosa')
            .slice(0, 2)
            .map((caption, index) => (
              <div
                key={caption.timestamp}
                style={{
                  fontSize: index === 0 ? '16px' : '14px',
                  color: index === 0 ? '#1f2937' : '#6b7280',
                  opacity: index === 0 ? 1 : 0.7,
                  fontWeight: index === 0 ? '500' : '400',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                }}
              >
                {caption.text}
              </div>
            ))
          }
          {recentCaptions.filter(c => c.speaker === 'rosa').length === 0 && (
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              fontStyle: 'italic',
            }}>
              Rosa's responses will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 