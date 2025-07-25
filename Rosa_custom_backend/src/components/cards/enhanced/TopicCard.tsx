import React from 'react';

// Topic session interface based on timetable.json
interface TopicSession {
  session_id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
  day_of_week: string;
  venue: string;
  session_type: string;
  speakers: string[];
  track: string;
  duration_minutes: number;
  is_interactive: boolean;
  is_technical: boolean;
  audience_level: string;
}

interface TopicData {
  theme: string;
  sessions: TopicSession[];
  totalSessions: number;
  relatedTopics?: string[];
  tracks: string[];
  speakers: string[];
  totalSpeakers: number;
  sessionTypes: string[];
  description?: string;
  expertiseLevel?: string;
  popularityScore?: number;
}

interface TopicCardProps {
  topic: TopicData;
  showSessions?: boolean;
  showSpeakers?: boolean;
  showRelated?: boolean;
  maxSessions?: number;
  compact?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onSpeakerClick?: (speaker: string) => void;
  onTopicClick?: (topic: string) => void;
  onDeepDive?: (topic: string) => void;
  onClose?: () => void;
  className?: string;
}

export const TopicCard: React.FC<TopicCardProps> = React.memo(({
  topic,
  showSessions = true,
  showSpeakers = true,
  showRelated = true,
  maxSessions = 5,
  compact = false,
  onSessionClick,
  onSpeakerClick,
  onTopicClick,
  onDeepDive,
  onClose,
  className = ''
}) => {
  const getTopicIcon = (theme: string) => {
    const iconMap: { [key: string]: string } = {
      // Technology & Innovation
      'Quantum Technology': '⚛️',
      'Nuclear Monitoring': '☢️',
      'AI Ethics': '🤖',
      'Seismic Analysis': '🌍',
      'Signal Processing': '📡',
      'Data Science': '📊',
      'Innovation': '💡',
      'Radionuclide Detection': '🔬',
      'Noble Gas Detection': '🧪',
      'Hydroacoustics': '🌊',
      'Infrasound': '🔊',
      'Waveform Analysis': '📈',
      
      // Policy & Cooperation
      'Policy': '📋',
      'Regional Cooperation': '🌐',
      'Future Challenges': '🔮',
      'CTBT History': '📚',
      'Future Vision': '🎯',
      
      // Educational & Training
      'On-Site Inspection': '🔍',
      'Student Research': '🎓',
      'Career Development': '💼',
      'Data Quality': '✅',
      'System Integration': '⚙️',
      
      // Social & Networking
      'Networking': '🤝',
      'Culture': '🎨',
      'Crisis Response': '🚨',
      'Environmental Science': '🌱',
      'Research Updates': '🔄',
      'IMS Upgrades': '🛠️',
      'Future Planning': '📅'
    };
    return iconMap[theme] || '📘';
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
      'Ethics': 'bg-violet-100 text-violet-800',
      'Collaboration': 'bg-blue-100 text-blue-800',
      'Research': 'bg-purple-100 text-purple-800',
      'Retrospective': 'bg-amber-100 text-amber-800',
      'Strategy': 'bg-slate-100 text-slate-800'
    };
    return colors[track as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const getExpertiseColor = (level: string) => {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate engagement metrics
  const interactiveSessions = topic.sessions.filter(s => s.is_interactive).length;
  const technicalSessions = topic.sessions.filter(s => s.is_technical).length;
  const uniqueTracks = [...new Set(topic.sessions.map(s => s.track))];
  const uniqueSessionTypes = [...new Set(topic.sessions.map(s => s.session_type))];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${compact ? 'p-3' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getTopicIcon(topic.theme)}</span>
          <div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
              {topic.theme}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {topic.totalSessions} session{topic.totalSessions !== 1 ? 's' : ''}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {topic.totalSpeakers} speaker{topic.totalSpeakers !== 1 ? 's' : ''}
              </span>
              {topic.popularityScore && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  🔥 Popular
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

      {/* Description */}
      {topic.description && !compact && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {topic.description}
          </p>
        </div>
      )}

      {/* Topic Stats */}
      <div className="mb-4 grid grid-cols-4 gap-3 text-center">
        <div className="p-2 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-900">{topic.totalSessions}</p>
          <p className="text-xs text-blue-600">Sessions</p>
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-900">{topic.totalSpeakers}</p>
          <p className="text-xs text-green-600">Speakers</p>
        </div>
        <div className="p-2 bg-yellow-50 rounded-lg">
          <p className="text-lg font-bold text-yellow-900">{interactiveSessions}</p>
          <p className="text-xs text-yellow-600">Interactive</p>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <p className="text-lg font-bold text-purple-900">{technicalSessions}</p>
          <p className="text-xs text-purple-600">Technical</p>
        </div>
      </div>

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

      {/* Key Speakers */}
      {showSpeakers && topic.speakers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            👤 Key Speakers
          </h4>
          <div className="flex flex-wrap gap-2">
            {topic.speakers.slice(0, compact ? 3 : 6).map((speaker, index) => (
              <button
                key={index}
                onClick={() => onSpeakerClick?.(speaker)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                {speaker}
              </button>
            ))}
            {topic.speakers.length > (compact ? 3 : 6) && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{topic.speakers.length - (compact ? 3 : 6)} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Related Topics */}
      {showRelated && topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            🔗 Related Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {topic.relatedTopics.map((relatedTopic, index) => (
              <button
                key={index}
                onClick={() => onTopicClick?.(relatedTopic)}
                className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors"
              >
                {relatedTopic.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {showSessions && topic.sessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            📅 Related Sessions
          </h4>
          <div className="space-y-2">
            {topic.sessions.slice(0, maxSessions).map((session, index) => (
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
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-1">
                      <span>📅 {formatDate(session.date)}</span>
                      <span>⏰ {formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                      <span>📍 {session.venue}</span>
                    </div>
                    
                    {/* Speakers for this session */}
                    {session.speakers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.speakers.slice(0, 2).map((speaker, idx) => (
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
                        {session.speakers.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{session.speakers.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackColor(session.track)}`}>
                    {session.track}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpertiseColor(session.audience_level)}`}>
                    {session.audience_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            
            {topic.sessions.length > maxSessions && (
              <div className="text-center">
                <button
                  onClick={() => onDeepDive?.(topic.theme)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  View all {topic.sessions.length} sessions
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deep Dive Button */}
      {onDeepDive && !compact && (
        <div className="border-t pt-3">
          <button
            onClick={() => onDeepDive(topic.theme)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors text-sm font-medium"
          >
            🔍 Explore {topic.theme} in Detail
          </button>
        </div>
      )}
    </div>
  );
});

TopicCard.displayName = 'TopicCard'; 