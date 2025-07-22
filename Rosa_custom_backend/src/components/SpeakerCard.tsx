import React from 'react';

interface SpeakerInfo {
  id: string;
  name: string;
  title: string;
  organization: string;
  session: string;
  time: string;
  room: string;
  expertise: string[];
  biography: string;
  relevance: string;
  type: string;
}

interface SpeakerCardProps {
  speaker: SpeakerInfo;
  onClose?: () => void;
  className?: string;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ 
  speaker, 
  onClose, 
  className = '' 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keynote': return '🎤';
      case 'technical': return '🔬';
      default: return '👤';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'keynote': return '#dc2626'; // red-600
      case 'technical': return '#2563eb'; // blue-600
      default: return '#64748b'; // slate-500
    }
  };

  return (
    <div className={`speaker-card ${className}`} style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      maxWidth: '500px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
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
            color: '#64748b',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
        >
          ×
        </button>
      )}

      {/* Speaker type badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: getTypeColor(speaker.type),
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {getTypeIcon(speaker.type)} {speaker.type}
      </div>

      {/* Header */}
      <div style={{ 
        marginTop: '40px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          {speaker.name}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#2563eb',
          fontWeight: '600',
          margin: '0 0 4px 0'
        }}>
          {speaker.title}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: '0'
        }}>
          {speaker.organization}
        </p>
      </div>

      {/* Session info */}
      <div style={{
        background: '#f1f5f9',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#334155',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎤 Presenting
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#475569',
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          {speaker.session}
        </p>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <span>🕒 {speaker.time}</span>
          <span>📍 {speaker.room}</span>
        </div>
      </div>

      {/* Expertise */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#334155',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Expertise
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {speaker.expertise.map((skill, index) => (
            <span
              key={index}
              style={{
                background: '#dbeafe',
                color: '#1e40af',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Biography */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#334155',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Biography
        </h3>
        <p style={{
          fontSize: '13px',
          color: '#475569',
          lineHeight: '1.5',
          margin: '0'
        }}>
          {speaker.biography}
        </p>
      </div>

      {/* Conference relevance */}
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        borderRadius: '8px',
        padding: '12px',
        borderLeft: '4px solid #2563eb'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#1e40af',
          margin: '0',
          fontStyle: 'italic',
          fontWeight: '500'
        }}>
          💡 {speaker.relevance}
        </p>
      </div>

      {/* CTBTO message */}
      <div style={{
        marginTop: '16px',
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
  );
}; 