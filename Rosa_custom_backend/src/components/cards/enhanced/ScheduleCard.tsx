import React, { useMemo } from 'react';

// Schedule session interface based on timetable.json
interface ScheduleSession {
  session_id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
  day_of_week: string;
  time_of_day: string;
  venue: string;
  session_type: string;
  speakers: string[];
  theme: string;
  track: string;
  duration_minutes: number;
  is_interactive: boolean;
  is_technical: boolean;
  is_social: boolean;
  audience_level: string;
}

interface ScheduleData {
  title: string;
  sessions: ScheduleSession[];
  dateRange?: {
    start: string;
    end: string;
  };
  totalDays?: number;
  totalSessions: number;
}

interface ScheduleCardProps {
  schedule: ScheduleData;
  viewMode?: 'day' | 'time' | 'type' | 'track';
  compact?: boolean;
  showToday?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onSpeakerClick?: (speaker: string) => void;
  onVenueClick?: (venue: string) => void;
  onClose?: () => void;
  className?: string;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = React.memo(({
  schedule,
  viewMode = 'day',
  compact = false,
  showToday = true,
  onSessionClick,
  onSpeakerClick,
  onVenueClick,
  onClose,
  className = ''
}) => {
  const getScheduleIcon = () => {
    switch (viewMode) {
      case 'day': return '📅';
      case 'time': return '⏰';
      case 'type': return '📋';
      case 'track': return '📊';
      default: return '📅';
    }
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

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      default: return '⏰';
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
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group sessions based on view mode
  const groupedSessions = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return schedule.sessions.reduce((groups, session) => {
          const day = session.day_of_week;
          if (!groups[day]) groups[day] = [];
          groups[day].push(session);
          return groups;
        }, {} as Record<string, ScheduleSession[]>);

      case 'time':
        return schedule.sessions.reduce((groups, session) => {
          const timeOfDay = session.time_of_day;
          if (!groups[timeOfDay]) groups[timeOfDay] = [];
          groups[timeOfDay].push(session);
          return groups;
        }, {} as Record<string, ScheduleSession[]>);

      case 'type':
        return schedule.sessions.reduce((groups, session) => {
          const type = session.session_type;
          if (!groups[type]) groups[type] = [];
          groups[type].push(session);
          return groups;
        }, {} as Record<string, ScheduleSession[]>);

      case 'track':
        return schedule.sessions.reduce((groups, session) => {
          const track = session.track;
          if (!groups[track]) groups[track] = [];
          groups[track].push(session);
          return groups;
        }, {} as Record<string, ScheduleSession[]>);

      default:
        return { 'All Sessions': schedule.sessions };
    }
  }, [schedule.sessions, viewMode]);

  // Sort sessions within each group
  Object.keys(groupedSessions).forEach(group => {
    groupedSessions[group].sort((a, b) => {
      // Primary sort by date, then by time
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  });

  // Calculate stats
  const totalSessions = schedule.sessions.length;
  const interactiveSessions = schedule.sessions.filter(s => s.is_interactive).length;
  const technicalSessions = schedule.sessions.filter(s => s.is_technical).length;
  const socialSessions = schedule.sessions.filter(s => s.is_social).length;

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${compact ? 'p-3' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getScheduleIcon()}</span>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
              {schedule.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {totalSessions} sessions
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                View: {viewMode}
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

      {/* Date Range */}
      {schedule.dateRange && !compact && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            📅 Conference Dates
          </p>
          <p className="text-sm text-gray-600">
            {formatDate(schedule.dateRange.start)} - {formatDate(schedule.dateRange.end)}
          </p>
          {schedule.totalDays && (
            <p className="text-xs text-gray-500 mt-1">
              {schedule.totalDays} days total
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-4 grid grid-cols-4 gap-3 text-center">
        <div className="p-2 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-900">{totalSessions}</p>
          <p className="text-xs text-blue-600">Total</p>
        </div>
        <div className="p-2 bg-yellow-50 rounded-lg">
          <p className="text-lg font-bold text-yellow-900">{interactiveSessions}</p>
          <p className="text-xs text-yellow-600">Interactive</p>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <p className="text-lg font-bold text-purple-900">{technicalSessions}</p>
          <p className="text-xs text-purple-600">Technical</p>
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-900">{socialSessions}</p>
          <p className="text-xs text-green-600">Social</p>
        </div>
      </div>

      {/* Grouped Sessions */}
      <div className="space-y-4">
        {Object.entries(groupedSessions).map(([groupName, sessions]) => (
          <div key={groupName}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                {viewMode === 'time' && <span>{getTimeOfDayIcon(groupName)}</span>}
                {viewMode === 'type' && <span>{getSessionTypeIcon(groupName)}</span>}
                <span className="capitalize">{groupName}</span>
                <span className="text-xs text-gray-500">({sessions.length})</span>
              </h4>
            </div>

            <div className="space-y-2">
              {sessions.slice(0, compact ? 3 : sessions.length).map((session, index) => (
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
                        {session.is_interactive && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Interactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                        <span>📅 {formatDate(session.date)}</span>
                        <span>⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVenueClick?.(session.venue);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📍 {session.venue}
                        </button>
                      </div>

                      {/* Speakers */}
                      {session.speakers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {session.speakers.slice(0, 3).map((speaker, idx) => (
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
                          {session.speakers.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{session.speakers.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(session.track)}`}>
                      {session.track}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-purple-600">
                        🏷️ {session.theme}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.duration_minutes}min
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {compact && sessions.length > 3 && (
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    ... and {sessions.length - 3} more sessions
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
        View mode: {viewMode} • {Object.keys(groupedSessions).length} groups • {totalSessions} total sessions
      </div>
    </div>
  );
});

ScheduleCard.displayName = 'ScheduleCard'; 