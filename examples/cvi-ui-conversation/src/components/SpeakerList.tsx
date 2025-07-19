import React from 'react';

interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  photo_url: string;
  session_topic: string;
  session_time: string;
  session_room: string;
  expertise: string[];
  bio_summary: string;
}

interface SpeakerListProps {
  speakers: Speaker[];
  searchTopic: string;
  saveHumanityMessage: string;
  onSelectSpeaker: (speaker: Speaker) => void;
  onBackToWelcome: () => void;
}

export const SpeakerList: React.FC<SpeakerListProps> = ({ 
  speakers, 
  searchTopic, 
  saveHumanityMessage, 
  onSelectSpeaker, 
  onBackToWelcome 
}) => {
  return (
    <div style={{ 
      margin: '0 60px',
      padding: '60px 40px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(255,255,255,0.95) 100%)',
      border: '1px solid rgba(225, 232, 237, 0.5)',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      minHeight: '500px',
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
      
      {/* Back Button */}
      <button
        onClick={onBackToWelcome}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '8px 16px',
          color: '#3b82f6',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10
        }}
      >
        ← Back to Welcome
      </button>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          fontSize: '32px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
        }}>
          👥
        </div>
        
        <h2 style={{ 
          margin: '0 0 12px 0', 
          color: '#1e293b', 
          fontSize: '28px', 
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          Conference Speakers
        </h2>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#64748b', 
          margin: '0 0 8px 0',
          fontWeight: '400'
        }}>
          Found {speakers.length} speaker{speakers.length !== 1 ? 's' : ''} for "{searchTopic}"
        </p>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0,
          fontStyle: 'italic'
        }}>
          Click any speaker for detailed profile
        </p>
      </div>
      
      {/* Speaker Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: speakers.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            onClick={() => onSelectSpeaker(speaker)}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {/* Speaker Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                marginRight: '12px',
                flexShrink: 0
              }}>
                👤
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#1e293b',
                  fontSize: '16px',
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {speaker.name}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {speaker.title}
                </p>
              </div>
            </div>
            
            {/* Session Info */}
            <div style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <p style={{
                margin: '0 0 8px 0',
                color: '#374151',
                fontSize: '13px',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {speaker.session_topic}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                <span>🕒 {speaker.session_time}</span>
                <span>📍 {speaker.session_room}</span>
              </div>
            </div>
            
            {/* Top Expertise Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {speaker.expertise.slice(0, 2).map((skill, index) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
              {speaker.expertise.length > 2 && (
                <span style={{
                  color: '#6b7280',
                  fontSize: '10px',
                  padding: '2px 4px'
                }}>
                  +{speaker.expertise.length - 2} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* CTBTO Message */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '16px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
      }}>
        🌍 {saveHumanityMessage}
      </div>
    </div>
  );
}; 