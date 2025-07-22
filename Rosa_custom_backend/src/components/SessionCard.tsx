import React from 'react';

interface SessionInfo {
  id: string;
  title: string;
  speaker: string;
  speaker_id: string;
  time: string;
  date: string;
  room: string;
  type: string;
  topics: string[];
  description: string;
  capacity: number;
  registration_required: boolean;
}

interface SessionCardProps {
  session: SessionInfo;
  onClose?: () => void;
  onSpeakerClick?: (speakerId: string) => void;
  className?: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onClose, 
  onSpeakerClick,
  className = '' 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keynote': return '🎤';
      case 'technical': return '🔬';
      case 'workshop': return '🛠️';
      case 'networking': return '☕';
      default: return '📅';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'keynote': return '#dc2626'; // red-600
      case 'technical': return '#2563eb'; // blue-600
      case 'workshop': return '#059669'; // emerald-600
      case 'networking': return '#7c3aed'; // violet-600
      default: return '#64748b'; // slate-500
    }
  };

  const handleSpeakerClick = () => {
    if (onSpeakerClick && session.speaker_id) {
      onSpeakerClick(session.speaker_id);
    }
  };

  return (
    <div className={`session-card ${className}`} style={{
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

      {/* Session type badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: getTypeColor(session.type),
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {getTypeIcon(session.type)} {session.type}
      </div>

      {/* Registration required badge */}
      {session.registration_required && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '16px',
          background: '#f59e0b',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: '600'
        }}>
          Registration Required
        </div>
      )}

      {/* Header */}
      <div style={{ 
        marginTop: '50px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 12px 0',
          lineHeight: '1.3'
        }}>
          {session.title}
        </h2>
        
        {/* Speaker */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <button
            onClick={handleSpeakerClick}
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              cursor: onSpeakerClick ? 'pointer' : 'default',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: onSpeakerClick ? '#2563eb' : '#475569',
              fontWeight: '600',
              textDecoration: onSpeakerClick ? 'underline' : 'none'
            }}>
              👤 {session.speaker}
              {onSpeakerClick && <span style={{ fontSize: '12px' }}>→</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Session details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Time
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#1e293b',
            margin: '0',
            fontWeight: '600'
          }}>
            🕒 {session.time}
          </p>
        </div>
        <div>
          <h3 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Location
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#1e293b',
            margin: '0',
            fontWeight: '600'
          }}>
            📍 {session.room}
          </p>
        </div>
      </div>

      {/* Topics */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Topics
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {session.topics.map((topic, index) => (
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
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Description
        </h3>
        <p style={{
          fontSize: '13px',
          color: '#475569',
          lineHeight: '1.5',
          margin: '0'
        }}>
          {session.description}
        </p>
      </div>

      {/* Capacity */}
      <div style={{
        background: '#f1f5f9',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '600'
          }}>
            Capacity
          </span>
          <span style={{
            fontSize: '14px',
            color: '#1e293b',
            fontWeight: '600'
          }}>
            👥 {session.capacity} seats
          </span>
        </div>
      </div>

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
  );
}; 