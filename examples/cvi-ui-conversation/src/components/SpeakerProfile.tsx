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

interface SpeakerProfileProps {
  speaker: Speaker;
  onBackToList?: () => void;
}

export const SpeakerProfile: React.FC<SpeakerProfileProps> = ({ speaker, onBackToList }) => {
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
      {onBackToList && (
        <button
          onClick={onBackToList}
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
          ← Back to List
        </button>
      )}
      
      {/* Speaker Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '48px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
        }}>
          👤
        </div>
        
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#1e293b', 
          fontSize: '28px', 
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          {speaker.name}
        </h2>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#3b82f6', 
          margin: '0 0 4px 0',
          fontWeight: '500'
        }}>
          {speaker.title}
        </p>
        
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b', 
          margin: 0,
          fontWeight: '400'
        }}>
          {speaker.organization}
        </p>
      </div>
      
      {/* Session Information */}
      <div style={{ 
        background: '#f1f5f9', 
        padding: '24px', 
        borderRadius: '16px',
        marginBottom: '32px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#1e293b', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎤 Conference Session
        </h3>
        
        <div style={{ 
          background: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {speaker.session_topic}
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🕒</span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>{speaker.session_time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>📍</span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>{speaker.session_room}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expertise Areas */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#1e293b', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Expertise Areas
        </h3>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {speaker.expertise.map((skill, index) => (
            <span
              key={index}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Biography */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#1e293b', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📄 Biography
        </h3>
        
        <div style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          lineHeight: '1.6'
        }}>
          <p style={{
            margin: 0,
            color: '#374151',
            fontSize: '14px'
          }}>
            {speaker.bio_summary}
          </p>
        </div>
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
        🌍 This expert is helping the CTBTO save humanity through nuclear test ban verification!
      </div>
    </div>
  );
}; 