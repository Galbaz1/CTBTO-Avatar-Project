import React from 'react';

// Enhanced interface matching timetable.json structure
interface TimetableSession {
  session_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  date: string;
  venue: string;
  session_type: string;
  speakers: string[];
  theme: string;
  track: string;
  audience_level: string;
  day_of_week: string;
  time_of_day: string;
  duration_minutes: number;
  has_speakers: boolean;
  is_interactive: boolean;
  is_social: boolean;
  is_technical: boolean;
  speaker_count: number;
  related_topics?: string[];
  search_keywords?: string[];
}

interface EnhancedSessionCardProps {
  session: TimetableSession;
  showSpeakers?: boolean;
  showVenue?: boolean; 
  showTiming?: boolean;
  showDescription?: boolean;
  compact?: boolean;
  onSpeakerClick?: (speaker: string) => void;
  onVenueClick?: (venue: string) => void;
  onTopicClick?: (topic: string) => void;
  onClose?: () => void;
  className?: string;
}

export const EnhancedSessionCard: React.FC<EnhancedSessionCardProps> = React.memo(({ 
  session, 
  showSpeakers = true,
  showVenue = true,
  showTiming = true,
  showDescription = true,
  compact = false,
  onSpeakerClick,
  onVenueClick,
  onTopicClick,
  onClose,
  className = '' 
}) => {
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

  const getAudienceBadge = (level: string) => {
    const colors = {
      'all_attendees': 'bg-green-100 text-green-800',
      'technical_experts': 'bg-blue-100 text-blue-800', 
      'researchers': 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${compact ? 'p-3' : 'p-6'} ${className}`}>
      {/* Header with close button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getSessionTypeIcon(session.session_type)}</span>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
              {session.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadge(session.audience_level)}`}>
                {session.audience_level.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(session.track)}`}>
                {session.track}
              </span>
              {session.is_interactive && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Interactive
                </span>
              )}
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

      {/* Compact Timing - Priority Info First */}
      {showTiming && (
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-900">
              📅 {formatDate(session.date)}
            </span>
            <span className="font-medium text-blue-600">
              ⏰ {formatTime(session.start_time)}
            </span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {formatDuration(session.duration_minutes)}
          </span>
        </div>
      )}

      {/* Description - Truncated and Expandable */}
      {showDescription && !compact && (
        <div className="mb-3">
          <p className="text-gray-600 text-sm leading-relaxed" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {session.description}
          </p>
        </div>
      )}

      {/* Venue Information */}
      {showVenue && (
        <div className="mb-4">
          <button
            onClick={() => onVenueClick?.(session.venue)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>📍</span>
            <span className="font-medium">{session.venue}</span>
          </button>
        </div>
      )}

      {/* Speakers */}
      {showSpeakers && session.has_speakers && session.speakers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            👤 Speakers ({session.speaker_count})
          </h4>
          <div className="flex flex-wrap gap-2">
            {session.speakers.map((speaker, index) => (
              <button
                key={index}
                onClick={() => onSpeakerClick?.(speaker)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                {speaker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme and Topics */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTopicClick?.(session.theme)}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <span>🏷️</span>
            <span className="font-medium">{session.theme}</span>
          </button>
          
          {/* Session Characteristics */}
          <div className="flex space-x-1">
            {session.is_technical && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" title="Technical Content"></span>
            )}
            {session.is_social && (
              <span className="w-2 h-2 bg-green-500 rounded-full" title="Social/Networking"></span>
            )}
            {session.is_interactive && (
              <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Interactive Session"></span>
            )}
          </div>
        </div>
      </div>

      {/* Related Topics (if available) */}
      {session.related_topics && session.related_topics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Related Topics</h4>
          <div className="flex flex-wrap gap-1">
            {session.related_topics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {topic.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Session ID (for debugging/reference) */}
      {!compact && (
        <div className="text-xs text-gray-400 border-t pt-2">
          Session ID: {session.session_id}
        </div>
      )}
    </div>
  );
});

EnhancedSessionCard.displayName = 'EnhancedSessionCard'; 