import React from 'react';

// Speaker interface based on timetable.json aggregation
interface SpeakerSession {
  session_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  session_type: string;
  theme: string;
  track: string;
  is_keynote?: boolean;
}

interface SpeakerData {
  name: string;
  sessions: SpeakerSession[];
  totalSessions: number;
  tracks: string[];
  themes: string[];
  bio?: string;
  organization?: string;
  expertise?: string[];
}

interface SpeakerCardProps {
  speaker: SpeakerData;
  compact?: boolean;
  showSessions?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onTopicClick?: (topic: string) => void;
  onClose?: () => void;
  className?: string;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = React.memo(({
  speaker,
  compact = false,
  showSessions = true,
  onSessionClick,
  onTopicClick,
  onClose,
  className = ''
}) => {
  const getSpeakerIcon = (name: string) => {
    // Extract title/role for appropriate icon
    if (name.includes('Prof.') || name.includes('Professor')) return '👨‍🏫';
    if (name.includes('Dr.')) return '👨‍⚕️';
    if (name.includes('Ambassador')) return '🏛️';
    if (name.includes('CEO') || name.includes('CTO')) return '👔';
    if (name.includes('Col.')) return '🎖️';
    return '👤';
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'Keynote': return '🎤';
      case 'Panel Discussion': return '👥';
      case 'Technical Session': return '🔬';
      case 'Workshop': return '🛠️';
      case 'Lightning Talks': return '⚡';
      default: return '📋';
    }
  };

  const getTrackColor = (track: string) => {
    const colors = {
      'Technology': 'bg-cyan-100 text-cyan-800',
      'Innovation': 'bg-orange-100 text-orange-800',
      'Training': 'bg-indigo-100 text-indigo-800',
      'Policy': 'bg-red-100 text-red-800',
      'Social': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[track as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isKeynote = speaker.sessions.some(session => session.session_type === 'Keynote');
  const uniqueTracks = [...new Set(speaker.sessions.map(s => s.track))];
  const uniqueThemes = [...new Set(speaker.sessions.map(s => s.theme))];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${compact ? 'p-3' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getSpeakerIcon(speaker.name)}</span>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
              {speaker.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {isKeynote && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                  🎤 Keynote Speaker
                </span>
              )}
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {speaker.totalSessions} session{speaker.totalSessions !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Speaker Info */}
      {!compact && (
        <div className="mb-4">
          {speaker.organization && (
            <p className="text-sm text-gray-600 mb-2">
              🏢 {speaker.organization}
            </p>
          )}
          {speaker.bio && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {speaker.bio}
            </p>
          )}
        </div>
      )}

      {/* Expertise Areas */}
      {uniqueThemes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            🎯 Expertise Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueThemes.map((theme, index) => (
              <button
                key={index}
                onClick={() => onTopicClick?.(theme)}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tracks */}
      {uniqueTracks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            📊 Conference Tracks
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueTracks.map((track, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(track)}`}
              >
                {track}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {showSessions && speaker.sessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            📅 Speaking Sessions
          </h4>
          <div className="space-y-3">
            {speaker.sessions.map((session, index) => (
              <div
                key={index}
                onClick={() => onSessionClick?.(session.session_id)}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getSessionTypeIcon(session.session_type)}</span>
                      <h5 className="font-medium text-gray-900 text-sm">
                        {session.title}
                      </h5>
                      {session.session_type === 'Keynote' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Keynote
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>📅 {formatDate(session.date)}</span>
                      <span>⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                      <span>📍 {session.venue}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(session.track)}`}>
                    {session.track}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTopicClick?.(session.theme);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    🏷️ {session.theme}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{speaker.sessions.length}</p>
            <p className="text-xs text-gray-600">Sessions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{uniqueThemes.length}</p>
            <p className="text-xs text-gray-600">Topics</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{uniqueTracks.length}</p>
            <p className="text-xs text-gray-600">Tracks</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SpeakerCard.displayName = 'SpeakerCard'; 