import React, { useState, memo, useCallback } from 'react';
import { Conversation } from './cvi/components/conversation';
import { CVIProvider } from './cvi/components/cvi-provider';
import { SimpleConversationLogger } from './SimpleConversationLogger';
import { SimpleWeatherHandler } from './SimpleWeatherHandler';
import { CTBTOHandler } from './CTBTOHandler';
import { SpeakerHandler } from './SpeakerHandler';
import { ConferencePlannerHandler } from './ConferencePlannerHandler';
import { SpeakerProfile } from './SpeakerProfile';
import { SpeakerList } from './SpeakerList';
import { PersonalizedAgenda } from './PersonalizedAgenda';

interface RosaDemoProps {
  conversation: any;
  onLeave: () => void;
}

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

export const RosaDemo: React.FC<RosaDemoProps> = ({ conversation, onLeave }) => {
  const [currentContent, setCurrentContent] = useState<'welcome' | 'speakers' | 'speaker-profile' | 'agenda'>('welcome');
  const [speakerList, setSpeakerList] = useState<Speaker[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [saveHumanityMessage, setSaveHumanityMessage] = useState<string>('');
  const [agendaData, setAgendaData] = useState<PersonalizedAgendaData | null>(null);

  // Generative UI: Handle speaker data and automatically switch views
  const handleSpeakerListUpdate = useCallback((speakerData: any) => {
    console.log('🎯 Generative UI: Received speaker list:', speakerData);
    
    if (speakerData.success && speakerData.speakers && speakerData.speakers.length > 0) {
      setSpeakerList(speakerData.speakers);
      setSearchTopic(speakerData.search_topic || '');
      setSaveHumanityMessage(speakerData.save_humanity_message || '');
      
      // ✅ Generative UI: Automatically switch to speaker list view
      setCurrentContent('speakers');
      console.log('🎯 Generative UI: Auto-switched to speaker list view');
    }
  }, []);

  // 🎯 NEW: Handle personalized agenda updates
  const handleAgendaUpdate = useCallback((agendaData: PersonalizedAgendaData) => {
    console.log('🎯 Generative UI: Received personalized agenda:', agendaData);
    
    setAgendaData(agendaData);
    
    // ✅ Generative UI: Automatically switch to agenda view
    setCurrentContent('agenda');
    console.log('🎯 Generative UI: Auto-switched to agenda view');
  }, []);

  // 🎯 NEW: Handle individual speaker profile updates (from getSpeakerInfo)
  const handleSpeakerProfileUpdate = useCallback((speaker: Speaker) => {
    console.log('🎯 Generative UI: Received speaker profile:', speaker.name);
    
    setCurrentSpeaker(speaker);
    
    // ✅ Generative UI: Automatically switch to speaker profile view
    setCurrentContent('speaker-profile');
    console.log('🎯 Generative UI: Auto-switched to speaker profile view');
  }, []);

  const handleSpeakerSelect = useCallback((speaker: Speaker) => {
    setCurrentSpeaker(speaker);
    setCurrentContent('speaker-profile');
    console.log('🎯 Generative UI: Switched to speaker profile:', speaker.name);
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setCurrentContent('welcome');
    setSpeakerList([]);
    setCurrentSpeaker(null);
    setSearchTopic('');
    setSaveHumanityMessage('');
    setAgendaData(null);
    console.log('🎯 Generative UI: Returned to welcome view');
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentContent('speakers');
    setCurrentSpeaker(null);
    console.log('🎯 Generative UI: Returned to speaker list view');
  }, []);

  // Content data for the right panel with dynamic switching
  const contentData: Record<string, { title: string; content: React.ReactElement }> = {
    welcome: {
      title: 'CTBTO SnT 2025',
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
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome to SnT 2025
            </h1>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#475569',
              margin: '0 0 12px 0'
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
          
          {/* 🎯 NEW: Quick Planning Prompt */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              🤖 Get Your Personalized Agenda
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9 }}>
              Tell Rosa your interests and available time - she'll create a custom conference plan
            </p>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              💬 Try: "Create an agenda for nuclear monitoring" or "I have 4 hours for technical sessions"
            </div>
          </div>
        </div>
      )
    },
    speakers: {
      title: "Conference Speakers",
      content: speakerList.length > 0 ? (
        <SpeakerList
          speakers={speakerList}
          searchTopic={searchTopic}
          saveHumanityMessage={saveHumanityMessage}
          onSelectSpeaker={handleSpeakerSelect}
          onBackToWelcome={handleBackToWelcome}
        />
      ) : (
        <div>Loading speakers...</div>
      )
    },
    'speaker-profile': {
      title: currentSpeaker ? `${currentSpeaker.name} - Profile` : "Speaker Profile",
      content: currentSpeaker ? (
        <SpeakerProfile
          speaker={currentSpeaker}
          onBackToList={handleBackToList}
        />
      ) : (
        <div>No speaker selected</div>
      )
    },
    'agenda': {
      title: "Your Personalized Agenda",
      content: agendaData ? (
        <PersonalizedAgenda
          agendaData={agendaData}
          onBackToWelcome={handleBackToWelcome}
        />
      ) : (
        <div>Loading agenda...</div>
      )
    }
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
              background: 'rgba(0, 0, 0, 0.15)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          
          {/* Rosa Video Conversation */}
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
            <Conversation
              conversationUrl={conversation.conversation_url}
              onLeave={onLeave}
            />
          </div>

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
            {contentData[currentContent].content}
          </div>
        </div>
      </div>
      
      {/* Global Handlers */}
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
      />
      <SpeakerHandler
        conversationId={conversation.conversation_id}
        onSpeakerUpdate={(speakerData: any) => {
          console.log('👥 Speaker profile received in App:', speakerData);
        }}
        onSpeakerListUpdate={handleSpeakerListUpdate}
        onSpeakerProfileUpdate={handleSpeakerProfileUpdate}
      />
      <ConferencePlannerHandler
        conversationId={conversation.conversation_id}
        onAgendaUpdate={handleAgendaUpdate}
      />
    </CVIProvider>
  );
}; 