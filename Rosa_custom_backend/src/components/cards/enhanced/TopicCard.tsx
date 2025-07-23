import React from 'react';
import { TopicCardData } from '../../../types';

interface TopicCardProps {
  topic: TopicCardData;
  showSessions?: boolean;
  showTrends?: boolean;
  maxSessions?: number;
  compact?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onDeepDive?: (topic: string) => void;
  onClose?: () => void;
  className?: string;
}

export const TopicCard: React.FC<TopicCardProps> = React.memo(({
  topic,
  showSessions = true,
  showTrends = false,
  maxSessions = 3,
  compact = false,
  onSessionClick,
  onDeepDive,
  onClose,
  className = ''
}) => {
  const getTopicIcon = (theme: string) => {
    const iconMap: { [key: string]: string } = {
      'Quantum Technology': '⚛️',
      'Nuclear Monitoring': '☢️',
      'AI Ethics': '🤖',
      'Seismic Analysis': '🌍',
      'Signal Processing': '📡',
      'Data Science': '📊',
      'Innovation': '💡',
      'Policy': '📋',
      'Networking': '🤝',
      'Crisis Response': '🚨'
    };
    return iconMap[theme] || '📘';
  };

  const getExpertiseColor = (level: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'expert': 'bg-red-100 text-red-800',
      'all': 'bg-blue-100 text-blue-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const limitedSessions = topic.related_sessions.slice(0, maxSessions);

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
            <span className="text-2xl">{getTopicIcon(topic.theme)}</span>
            <div>
              <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
                {topic.theme}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpertiseColor(topic.expertise_level)}`}>
                  {topic.expertise_level}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {topic.session_count} sessions
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
      </div>

      {/* Content */}
      <div className="p-4">
        {!compact && topic.description && (
          <p className="text-gray-600 text-sm mb-4">
            {topic.description}
          </p>
        )}

        {/* Tracks */}
        {topic.tracks.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tracks:</h4>
            <div className="flex flex-wrap gap-1">
              {topic.tracks.map((track, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                >
                  {track}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Sessions */}
        {showSessions && limitedSessions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Related Sessions:
              </h4>
              {topic.session_count > maxSessions && (
                <span className="text-xs text-gray-500">
                  +{topic.session_count - maxSessions} more
                </span>
              )}
            </div>
            <div className="space-y-2">
              {limitedSessions.map((session, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onSessionClick?.(session.session_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>📍 {session.venue}</span>
                        <span>⏰ {session.start_time}</span>
                        {session.speakers.length > 0 && (
                          <span>👤 {session.speakers[0]}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 text-gray-400">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {topic.session_count} session{topic.session_count !== 1 ? 's' : ''} available
            </div>
            {onDeepDive && (
              <button
                onClick={() => onDeepDive(topic.theme)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded 
                         hover:bg-blue-700 transition-colors duration-150"
              >
                Explore Topic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TopicCard.displayName = 'TopicCard'; 