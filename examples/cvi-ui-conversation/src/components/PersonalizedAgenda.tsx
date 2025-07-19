import React from 'react';

interface AgendaSession {
  id: string;
  title: string;
  speaker: string;
  time: string;
  room: string;
  type: 'keynote' | 'technical' | 'networking' | 'policy';
  relevance_score: number;
}

interface PersonalizedAgendaData {
  user_interests: string;
  time_commitment: string;
  sessions: AgendaSession[];
  total_duration: string;
  qr_code_url: string;
  export_links: {
    pdf: string;
    ical: string;
  };
}

interface PersonalizedAgendaProps {
  agendaData: PersonalizedAgendaData;
  onBackToWelcome: () => void;
}

export const PersonalizedAgenda: React.FC<PersonalizedAgendaProps> = ({ 
  agendaData, 
  onBackToWelcome 
}) => {
  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'keynote': return '#dc2626';
      case 'technical': return '#2563eb';
      case 'networking': return '#059669';
      case 'policy': return '#7c3aed';
      default: return '#64748b';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'keynote': return '🎯';
      case 'technical': return '🔬';
      case 'networking': return '🤝';
      case 'policy': return '📋';
      default: return '📅';
    }
  };

  return (
    <div style={{ 
      margin: '0 40px',
      padding: '40px 30px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(255,255,255,0.95) 100%)',
      border: '1px solid rgba(225, 232, 237, 0.5)',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      minHeight: '500px',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <button
          onClick={onBackToWelcome}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#2563eb',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ← Back to Welcome
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            margin: 0, 
            color: '#1e293b', 
            fontSize: '24px', 
            fontWeight: '700'
          }}>
            Your Personalized Agenda
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#64748b', 
            fontSize: '14px'
          }}>
            {agendaData.total_duration} • Based on: {agendaData.user_interests}
          </p>
        </div>
        
        <div style={{ width: '120px' }} /> {/* Spacer for center alignment */}
      </div>

      {/* Privacy Notice */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '24px',
        fontSize: '12px',
        color: '#065f46',
        fontWeight: '500'
      }}>
        🔒 Privacy: No personal data stored. This agenda expires when you leave.
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sessions List */}
        <div style={{ flex: 2 }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#334155', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Recommended Sessions ({agendaData.sessions.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {agendaData.sessions.map((session, index) => (
              <div key={session.id} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                {/* Session Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: getSessionTypeColor(session.type),
                  color: 'white',
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {session.type}
                </div>
                
                {/* Time */}
                <div style={{
                  fontSize: '14px',
                  color: '#059669',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {getSessionTypeIcon(session.type)} {session.time}
                </div>
                
                {/* Title */}
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  lineHeight: '1.3'
                }}>
                  {session.title}
                </h4>
                
                {/* Speaker & Room */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  <span>👤 {session.speaker}</span>
                  <span>📍 {session.room}</span>
                </div>
                
                {/* Relevance Score */}
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#7c3aed',
                  fontWeight: '500'
                }}>
                  {Math.round(session.relevance_score * 100)}% match for your interests
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Panel */}
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#334155', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Export & Share
          </h3>
          
          {/* QR Code */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: `url(${agendaData.qr_code_url})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              margin: '0 auto 12px auto',
              border: '2px solid #f1f5f9',
              borderRadius: '8px'
            }} />
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Scan for mobile agenda
            </p>
          </div>
          
          {/* Export Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a
              href={agendaData.export_links.pdf}
              style={{
                display: 'block',
                background: '#dc2626',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              📄 Download PDF
            </a>
            
            <a
              href={agendaData.export_links.ical}
              style={{
                display: 'block',
                background: '#2563eb',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              📅 Add to Calendar
            </a>
          </div>
          
          {/* Feedback */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '12px',
              color: '#475569',
              fontWeight: '500'
            }}>
              How useful is this agenda?
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['👍', '👎', '🤷'].map((emoji, i) => (
                <button
                  key={i}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 