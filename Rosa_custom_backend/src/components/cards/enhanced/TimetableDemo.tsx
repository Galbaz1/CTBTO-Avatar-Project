import React, { useState, useEffect } from 'react';
import {
  EnhancedSessionCard,
  SpeakerCard,
  TopicCard,
  VenueCard,
  ScheduleCard,
  TimetableProcessor,
  type TimetableData,
  type SessionCardData,
  type SpeakerCardData,
  type VenueCardData,
  type TopicCardData,
  type ScheduleCardData
} from './index';

// Import the actual timetable data
// import timetableData from '../../backend/backend_data/timetable.json';

interface TimetableDemoProps {
  timetableData: TimetableData;
}

export const TimetableDemo: React.FC<TimetableDemoProps> = ({ timetableData }) => {
  const [processor, setProcessor] = useState<TimetableProcessor | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'sessions' | 'speakers' | 'venues' | 'topics' | 'schedule'>('overview');
  const [selectedCard, setSelectedCard] = useState<{
    type: string;
    data: any;
  } | null>(null);

  // Initialize processor
  useEffect(() => {
    if (timetableData) {
      setProcessor(new TimetableProcessor(timetableData));
    }
  }, [timetableData]);

  if (!processor) {
    return <div className="p-6 text-center">Loading timetable data...</div>;
  }

  // Get processed data
  const sessions = timetableData.entries.slice(0, 5); // Show first 5 sessions
  const speakers = processor.getAllSpeakers().slice(0, 5); // Top 5 speakers by session count
  const venues = processor.getAllVenues().slice(0, 5); // Top 5 venues by session count
  const topics = processor.getAllTopics().slice(0, 5); // Top 5 topics by session count
  const schedule = processor.getScheduleData();
  const stats = processor.getOverallStats();

  // Navigation
  const views = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'sessions', label: '📅 Sessions', icon: '📅' },
    { id: 'speakers', label: '👤 Speakers', icon: '👤' },
    { id: 'venues', label: '📍 Venues', icon: '📍' },
    { id: 'topics', label: '🏷️ Topics', icon: '🏷️' },
    { id: 'schedule', label: '⏰ Schedule', icon: '⏰' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">CTBT: Science and Technology Conference 2025</h2>
        <p className="text-blue-100">Comprehensive conference management with AI-powered card intelligence</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{stats.uniqueSpeakers}</div>
          <div className="text-sm text-gray-600">Speakers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueVenues}</div>
          <div className="text-sm text-gray-600">Venues</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">{stats.uniqueThemes}</div>
          <div className="text-sm text-gray-600">Topics</div>
        </div>
      </div>

      {/* Featured Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Featured Session */}
        {sessions[0] && (
          <div>
            <h3 className="text-lg font-semibold mb-3">🎤 Featured Session</h3>
            <EnhancedSessionCard
              session={sessions[0]}
              compact={true}
              onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
              onVenueClick={(venue) => setSelectedCard({ type: 'venue', data: venues.find(v => v.name === venue) })}
              onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
            />
          </div>
        )}

        {/* Featured Speaker */}
        {speakers[0] && (
          <div>
            <h3 className="text-lg font-semibold mb-3">⭐ Top Speaker</h3>
            <SpeakerCard
              speaker={speakers[0]}
              compact={true}
              showSessions={true}
              onSessionClick={(sessionId) => {
                const session = processor.getSessionById(sessionId);
                if (session) setSelectedCard({ type: 'session', data: session });
              }}
              onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🔥 Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {views.slice(1).map(view => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id as any)}
              className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-1">{view.icon}</div>
              <div className="text-sm font-medium">{view.label.replace(/^[^\s]+ /, '')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📅 Conference Sessions</h2>
      <div className="grid grid-cols-1 gap-6">
        {sessions.map((session, index) => (
          <EnhancedSessionCard
            key={session.session_id}
            session={session}
            onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
            onVenueClick={(venue) => setSelectedCard({ type: 'venue', data: venues.find(v => v.name === venue) })}
            onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
          />
        ))}
      </div>
    </div>
  );

  const renderSpeakers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">👤 Conference Speakers</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {speakers.map((speaker, index) => (
          <SpeakerCard
            key={speaker.name}
            speaker={speaker}
            onSessionClick={(sessionId) => {
              const session = processor.getSessionById(sessionId);
              if (session) setSelectedCard({ type: 'session', data: session });
            }}
            onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
          />
        ))}
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📍 Conference Venues</h2>
      <div className="grid grid-cols-1 gap-6">
        {venues.map((venue, index) => (
          <VenueCard
            key={venue.name}
            venue={venue}
            groupByDay={true}
            onSessionClick={(sessionId) => {
              const session = processor.getSessionById(sessionId);
              if (session) setSelectedCard({ type: 'session', data: session });
            }}
            onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
          />
        ))}
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🏷️ Conference Topics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topics.map((topic, index) => (
          <TopicCard
            key={topic.theme}
            topic={topic}
            maxSessions={3}
            onSessionClick={(sessionId) => {
              const session = processor.getSessionById(sessionId);
              if (session) setSelectedCard({ type: 'session', data: session });
            }}
            onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
            onTopicClick={(relatedTopic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === relatedTopic) })}
            onDeepDive={(theme) => alert(`Deep dive into ${theme} - Would navigate to detailed topic view`)}
          />
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⏰ Conference Schedule</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScheduleCard
          schedule={schedule}
          viewMode="day"
          onSessionClick={(sessionId) => {
            const session = processor.getSessionById(sessionId);
            if (session) setSelectedCard({ type: 'session', data: session });
          }}
          onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
          onVenueClick={(venue) => setSelectedCard({ type: 'venue', data: venues.find(v => v.name === venue) })}
        />
        <ScheduleCard
          schedule={schedule}
          viewMode="type"
          compact={true}
          onSessionClick={(sessionId) => {
            const session = processor.getSessionById(sessionId);
            if (session) setSelectedCard({ type: 'session', data: session });
          }}
          onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
          onVenueClick={(venue) => setSelectedCard({ type: 'venue', data: venues.find(v => v.name === venue) })}
        />
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview': return renderOverview();
      case 'sessions': return renderSessions();
      case 'speakers': return renderSpeakers();
      case 'venues': return renderVenues();
      case 'topics': return renderTopics();
      case 'schedule': return renderSchedule();
      default: return renderOverview();
    }
  };

  const renderSelectedCard = () => {
    if (!selectedCard) return null;

    const { type, data } = selectedCard;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          {type === 'session' && (
            <EnhancedSessionCard
              session={data}
              onClose={() => setSelectedCard(null)}
              onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
              onVenueClick={(venue) => setSelectedCard({ type: 'venue', data: venues.find(v => v.name === venue) })}
              onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
            />
          )}
          {type === 'speaker' && data && (
            <SpeakerCard
              speaker={data}
              onClose={() => setSelectedCard(null)}
              onSessionClick={(sessionId) => {
                const session = processor.getSessionById(sessionId);
                if (session) setSelectedCard({ type: 'session', data: session });
              }}
              onTopicClick={(topic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === topic) })}
            />
          )}
          {type === 'venue' && data && (
            <VenueCard
              venue={data}
              onClose={() => setSelectedCard(null)}
              onSessionClick={(sessionId) => {
                const session = processor.getSessionById(sessionId);
                if (session) setSelectedCard({ type: 'session', data: session });
              }}
              onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
            />
          )}
          {type === 'topic' && data && (
            <TopicCard
              topic={data}
              onClose={() => setSelectedCard(null)}
              onSessionClick={(sessionId) => {
                const session = processor.getSessionById(sessionId);
                if (session) setSelectedCard({ type: 'session', data: session });
              }}
              onSpeakerClick={(speaker) => setSelectedCard({ type: 'speaker', data: speakers.find(s => s.name === speaker) })}
              onTopicClick={(relatedTopic) => setSelectedCard({ type: 'topic', data: topics.find(t => t.theme === relatedTopic) })}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Conference Card System</h1>
            </div>
            <div className="flex items-center space-x-4">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === view.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCurrentView()}
      </main>

      {/* Modal for selected cards */}
      {renderSelectedCard()}
    </div>
  );
};

export default TimetableDemo; 