import React from 'react';
import { SessionCardData } from '../../../types';

interface EnhancedSessionCardProps {
  session: SessionCardData;
  showSpeakers?: boolean;
  showVenue?: boolean; 
  showTiming?: boolean;
  compact?: boolean;
  onSpeakerClick?: (speaker: string) => void;
  onVenueClick?: (venue: string) => void;
  onClose?: () => void;
  className?: string;
}

export const EnhancedSessionCard: React.FC<EnhancedSessionCardProps> = React.memo(({ 
  session, 
  showSpeakers = true,
  showVenue = true,
  showTiming = true,
  compact = false,
  onSpeakerClick,
  onVenueClick,
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden 
      hover:shadow-lg transition-shadow duration-200
      ${compact ? 'max-w-sm' : 'max-w-lg'} 
      ${className}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getSessionTypeIcon(session.session_type)}</span>
            <div>
              <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
                {session.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadge(session.audience_level)}`}>
                  {session.audience_level.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {session.theme}
                </span>
                {session.is_interactive && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
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
      </div>

      {/* Content */}
      <div className="p-4">
        {!compact && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {session.description}
          </p>
        )}

        {/* Timing Info */}
        {showTiming && (
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>{new Date(session.date).toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⏰</span>
              <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
              <span className="text-gray-400">({formatDuration(session.duration_minutes)})</span>
            </div>
          </div>
        )}

        {/* Venue */}
        {showVenue && (
          <div className="flex items-center space-x-2 mb-3">
            <span>📍</span>
            <button
              onClick={() => onVenueClick?.(session.venue)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {session.venue}
            </button>
          </div>
        )}

        {/* Speakers */}
        {showSpeakers && session.speakers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              {session.speakers.length === 1 ? 'Speaker:' : 'Speakers:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {session.speakers.map((speaker, index) => (
                <button
                  key={index}
                  onClick={() => onSpeakerClick?.(speaker)}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm 
                           hover:bg-blue-100 transition-colors duration-150"
                >
                  {speaker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Track Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Track: {session.track}</span>
            <span>Session: {session.session_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

EnhancedSessionCard.displayName = 'EnhancedSessionCard'; 