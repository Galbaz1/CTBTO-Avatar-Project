import React from 'react';

// Venue session interface based on timetable.json
interface VenueSession {
  session_id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
  day_of_week: string;
  time_of_day: string;
  session_type: string;
  speakers: string[];
  theme: string;
  track: string;
  duration_minutes: number;
  is_interactive: boolean;
  is_technical: boolean;
  audience_level: string;
}

interface VenueData {
  name: string;
  sessions: VenueSession[];
  totalSessions: number;
  sessionTypes: string[];
  tracks: string[];
  capacity?: number;
  location?: string;
  facilities?: string[];
  description?: string;
}

interface VenueCardProps {
  venue: VenueData;
  compact?: boolean;
  showSessions?: boolean;
  groupByDay?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onSpeakerClick?: (speaker: string) => void;
  onClose?: () => void;
  className?: string;
}

export const VenueCard: React.FC<VenueCardProps> = React.memo(({
  venue,
  compact = false,
  showSessions = true,
  groupByDay = true,
  onSessionClick,
  onSpeakerClick,
  onClose,
  className = ''
}) => {
  const getVenueIcon = (venueName: string) => {
    // Venue-specific icons based on common venue names
    if (venueName.includes('Festsaal')) return '🏛️';
    if (venueName.includes('Forum')) return '🎭';
    if (venueName.includes('Conference Room')) return '🏢';
    if (venueName.includes('Computer Lab') || venueName.includes('Lab')) return '💻';
    if (venueName.includes('Training')) return '📚';
    if (venueName.includes('Exhibition') || venueName.includes('Hall')) return '🖼️';
    if (venueName.includes('Dining') || venueName.includes('Restaurant')) return '🍽️';
    if (venueName.includes('Wintergarten') || venueName.includes('Garden')) return '🌿';
    if (venueName.includes('Banquet')) return '🎉';
    if (venueName.includes('Cultural')) return '🎨';
    if (venueName.includes('Simulation')) return '🎯';
    if (venueName.includes('Planning')) return '📋';
    if (venueName.includes('Innovation')) return '💡';
    if (venueName.includes('Lobby')) return '🚪';
    if (venueName.includes('Café')) return '☕';
    return '📍';
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'Keynote': return '🎤';
      case 'Panel Discussion': return '👥';
      case 'Technical Session': return '🔬';
      case 'Workshop': return '🛠️';
      case 'Lightning Talks': return '⚡';
      case 'Break': return '☕';
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
      'General': 'bg-gray-100 text-gray-800',
      'Modeling': 'bg-teal-100 text-teal-800',
      'Assessment': 'bg-emerald-100 text-emerald-800',
      'Ethics': 'bg-violet-100 text-violet-800'
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

  // Group sessions by day if requested
  const groupedSessions = groupByDay 
    ? venue.sessions.reduce((groups, session) => {
        const day = session.day_of_week;
        if (!groups[day]) groups[day] = [];
        groups[day].push(session);
        return groups;
      }, {} as Record<string, VenueSession[]>)
    : { 'All Sessions': venue.sessions };

  // Sort sessions within each group by time
  Object.keys(groupedSessions).forEach(day => {
    groupedSessions[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const uniqueSessionTypes = [...new Set(venue.sessions.map(s => s.session_type))];
  const uniqueTracks = [...new Set(venue.sessions.map(s => s.track))];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${compact ? 'p-3' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getVenueIcon(venue.name)}</span>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
              {venue.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {venue.totalSessions} session{venue.totalSessions !== 1 ? 's' : ''}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {uniqueSessionTypes.length} type{uniqueSessionTypes.length !== 1 ? 's' : ''}
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

      {/* Venue Info */}
      {!compact && (
        <div className="mb-4">
          {venue.location && (
            <p className="text-sm text-gray-600 mb-2">
              🗺️ {venue.location}
            </p>
          )}
          {venue.capacity && (
            <p className="text-sm text-gray-600 mb-2">
              👥 Capacity: {venue.capacity} people
            </p>
          )}
          {venue.description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {venue.description}
            </p>
          )}
          {venue.facilities && venue.facilities.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">🔧 Facilities</h4>
              <div className="flex flex-wrap gap-1">
                {venue.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Types */}
      {uniqueSessionTypes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            📋 Session Types
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueSessionTypes.map((type, index) => (
              <span
                key={index}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm"
              >
                <span>{getSessionTypeIcon(type)}</span>
                <span>{type}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conference Tracks */}
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
      {showSessions && venue.sessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            📅 Scheduled Sessions
          </h4>
          <div className="space-y-4">
            {Object.entries(groupedSessions).map(([day, sessions]) => (
              <div key={day}>
                {groupByDay && (
                  <h5 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                    {day}
                  </h5>
                )}
                <div className="space-y-2">
                  {sessions.map((session, index) => (
                    <div
                      key={index}
                      onClick={() => onSessionClick?.(session.session_id)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getSessionTypeIcon(session.session_type)}</span>
                            <h6 className="font-medium text-gray-900 text-sm">
                              {session.title}
                            </h6>
                            {session.is_interactive && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Interactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                            <span>📅 {formatDate(session.date)}</span>
                            <span>⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                            <span>⏱️ {session.duration_minutes}min</span>
                          </div>
                          
                          {/* Speakers */}
                          {session.speakers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {session.speakers.map((speaker, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSpeakerClick?.(speaker);
                                  }}
                                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                                >
                                  {speaker}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(session.track)}`}>
                          {session.track}
                        </span>
                        <span className="text-xs text-purple-600">
                          🏷️ {session.theme}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{venue.sessions.length}</p>
            <p className="text-xs text-gray-600">Sessions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{uniqueSessionTypes.length}</p>
            <p className="text-xs text-gray-600">Types</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{uniqueTracks.length}</p>
            <p className="text-xs text-gray-600">Tracks</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {venue.sessions.filter(s => s.is_interactive).length}
            </p>
            <p className="text-xs text-gray-600">Interactive</p>
          </div>
        </div>
      </div>
    </div>
  );
});

VenueCard.displayName = 'VenueCard'; 