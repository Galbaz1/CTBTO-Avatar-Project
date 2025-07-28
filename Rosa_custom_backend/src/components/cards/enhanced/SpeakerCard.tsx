import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Speaker interface based on comprehensive RAG backend data structure
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
  description?: string;
  audience_level?: string;
  duration?: number;
}

interface SpeakerData {
  name: string;
  sessions: SpeakerSession[];
  totalSessions?: number;
  tracks?: string[];
  themes?: string[];
  bio?: string;
  organization?: string;
  expertise?: string[];
  image?: string;
  title?: string;
  country?: string;
  affiliation?: string;
  research_areas?: string[];
  publications?: number;
  years_experience?: number;
  specializations?: string[];
  languages?: string[];
  honors?: string[];
  current_role?: string;
}

interface SpeakerCardProps {
  speaker: SpeakerData;
  compact?: boolean;
  showSessions?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onTopicClick?: (topic: string) => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = React.memo(({
  speaker,
  compact = false,
  showSessions = true,
  onSessionClick,
  onTopicClick,
  onClose,
  className = '',
  style
}) => {
  // Smart fallback for speaker name - never show "Not available"
  const displayName = speaker?.name || speaker?.title || 'Conference Speaker';
  
  // Generate speaker initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'CS'; // Conference Speaker
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Enhanced time formatting with fallbacks
  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return time; // Return original if parsing fails
    }
  };

  // Enhanced date formatting with fallbacks
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr; // Return original if parsing fails
    }
  };

  // Enhanced session type icons with more coverage
  const getSessionIcon = (type: string) => {
    const icons = {
      'Keynote': '🎤',
      'Panel Discussion': '👥',
      'Technical Session': '🔬',
      'Workshop': '🛠️',
      'Training': '📚',
      'Lightning Talks': '⚡',
      'Presentation': '📊',
      'Tutorial': '🎓',
      'Demo': '💻',
      'Poster': '📋',
      'Break': '☕',
      'Networking': '🤝',
      'default': '📋'
    };
    return icons[type as keyof typeof icons] || icons.default;
  };

  // Professional track color system with more coverage
  const getTrackStyle = (track: string) => {
    const styles = {
      'Technology': 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
      'Innovation': 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100',
      'Training': 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100',
      'Policy': 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
      'Social': 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100',
      'General': 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100',
      'Modeling': 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100',
      'Assessment': 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100',
      'Cooperation': 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100',
      'Ethics': 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
      'Academic': 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
    };
    return styles[track as keyof typeof styles] || styles.General;
  };

  // Enhanced audience level styling
  const getAudienceLevelStyle = (level: string) => {
    const styles = {
      'all_attendees': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'technical_experts': 'bg-violet-50 text-violet-700 border border-violet-200',
      'researchers': 'bg-teal-50 text-teal-700 border border-teal-200',
      'beginners': 'bg-sky-50 text-sky-700 border border-sky-200',
      'intermediate': 'bg-amber-50 text-amber-700 border border-amber-200',
      'advanced': 'bg-red-50 text-red-700 border border-red-200'
    };
    return styles[level as keyof typeof styles] || styles.all_attendees;
  };

  // Smart session filtering and sorting
  const processedSessions = React.useMemo(() => {
    if (!speaker?.sessions) return [];
    
    return [...speaker.sessions]
      .filter(session => session?.title && session?.session_id) // Only valid sessions
      .sort((a, b) => {
        // Sort keynotes first, then by date/time
        if (a.session_type === 'Keynote' && b.session_type !== 'Keynote') return -1;
        if (b.session_type === 'Keynote' && a.session_type !== 'Keynote') return 1;
        
        // Then by date and time
        const dateA = new Date(`${a.date}T${a.start_time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.start_time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [speaker?.sessions]);

  // Intelligent data extraction with fallbacks
  const isKeynote = processedSessions.some(session => 
    session.session_type === 'Keynote' || session.is_keynote
  );

  // Smart unique extraction with deduplication
  const uniqueThemes = React.useMemo(() => {
    const themes = new Set<string>();
    
    // From sessions
    processedSessions.forEach(session => {
      if (session.theme && session.theme.trim()) themes.add(session.theme.trim());
    });
    
    // From speaker expertise/themes
    if (speaker?.themes) {
      speaker.themes.forEach(theme => {
        if (theme && theme.trim()) themes.add(theme.trim());
      });
    }
    
    // From expertise areas
    if (speaker?.expertise) {
      speaker.expertise.forEach(exp => {
        if (exp && exp.trim()) themes.add(exp.trim());
      });
    }
    
    // From research areas
    if (speaker?.research_areas) {
      speaker.research_areas.forEach(area => {
        if (area && area.trim()) themes.add(area.trim());
      });
    }
    
    return Array.from(themes).slice(0, 6); // Limit to 6 for UI
  }, [speaker, processedSessions]);

  const uniqueTracks = React.useMemo(() => {
    const tracks = new Set<string>();
    
    processedSessions.forEach(session => {
      if (session.track && session.track.trim()) tracks.add(session.track.trim());
    });
    
    if (speaker?.tracks) {
      speaker.tracks.forEach(track => {
        if (track && track.trim()) tracks.add(track.trim());
      });
    }
    
    return Array.from(tracks);
  }, [speaker, processedSessions]);

  // Smart session count with multiple sources
  const sessionCount = processedSessions.length || speaker?.totalSessions || 0;

  // Enhanced organization display with fallbacks
  const displayOrganization = speaker?.organization || speaker?.affiliation || speaker?.current_role || '';

  // Professional bio with smart truncation
  const displayBio = React.useMemo(() => {
    const bio = speaker?.bio || '';
    if (!bio) return '';
    
    // Smart truncation for compact mode
    if (compact && bio.length > 150) {
      return bio.substring(0, 147).trim() + '...';
    }
    
    return bio;
  }, [speaker?.bio, compact]);

  return (
    <motion.div 
      className={`professional-speaker-card ${className}`}
      style={{
        ...style,
        // Respect accessibility preference for reduced motion
        transition: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches 
          ? 'none' : undefined 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        // Disable animation if user prefers reduced motion
        ...(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches 
          ? { duration: 0 } : {})
      }}
    >
      {/* Professional Header Section */}
      <div className="header-section">
        {/* Close button (optional) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="Close speaker card"
          >
            ✕
          </button>
        )}

        {/* Speaker Avatar & Basic Info */}
        <div className="speaker-intro">
          {/* Professional Avatar */}
          <div className="avatar-container">
            {speaker?.image ? (
              <img
                src={speaker.image}
                alt={`${displayName} profile photo`}
                className="speaker-avatar"
                onError={(e) => {
                  // Fallback to avatar if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="avatar-fallback" 
              style={{ display: speaker?.image ? 'none' : 'flex' }}
            >
              <span className="avatar-initials">
                {getInitials(displayName)}
              </span>
            </div>
          </div>

          {/* Speaker Identity */}
          <div className="speaker-identity">
            <h1 className="speaker-name">
              {displayName}
            </h1>
            
            {displayOrganization && (
              <p className="speaker-org">
                {displayOrganization}
              </p>
            )}

            {/* Professional Status Badges */}
            <div className="status-badges">
              {isKeynote && (
                <span className="keynote-badge">
                  🎤 Keynote Speaker
                </span>
              )}
              
              {sessionCount > 0 && (
                <span className="session-count-badge">
                  {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                </span>
              )}

              {/* Country/Location badge if available */}
              {speaker?.country && (
                <span className="session-count-badge">
                  🌍 {speaker.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="content-sections">
        {/* Speaker Biography */}
        {!compact && displayBio && (
          <section className="bio-section">
            <h2 className="section-title">
              About
            </h2>
            <p className="bio-text">
              {displayBio}
            </p>
          </section>
        )}

        {/* Expertise Areas - Enhanced with multiple sources */}
        {uniqueThemes.length > 0 && (
          <section className="expertise-section">
            <h2 className="section-title">
              Expertise Areas
            </h2>
            <div className="expertise-tags">
              {uniqueThemes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => onTopicClick?.(theme)}
                  className="expertise-tag"
                  title={`Explore ${theme} topics`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Conference Tracks */}
        {uniqueTracks.length > 0 && (
          <section className="tracks-section">
            <h2 className="section-title">
              Conference Tracks
            </h2>
            <div className="track-badges">
              {uniqueTracks.map((track, index) => (
                <span
                  key={index}
                  className={`track-badge ${getTrackStyle(track)}`}
                  title={`${track} track sessions`}
                >
                  {track}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Speaking Sessions - Enhanced with better data handling */}
        {showSessions && processedSessions.length > 0 && (
          <section className="sessions-section">
            <h2 className="section-title">
              Speaking Sessions
            </h2>
            
            <div className="sessions-list">
              {processedSessions.map((session, index) => (
                <div
                  key={session.session_id || index}
                  onClick={() => onSessionClick?.(session.session_id)}
                  className="session-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSessionClick?.(session.session_id);
                    }
                  }}
                >
                  {/* Session Header */}
                  <div className="session-header">
                    <div className="session-info">
                      <span className="session-icon" role="img" aria-label={session.session_type}>
                        {getSessionIcon(session.session_type)}
                      </span>
                      <div>
                        <h3 className="session-title">
                          {session.title}
                        </h3>
                        {(session.session_type === 'Keynote' || session.is_keynote) && (
                          <span className="keynote-label">
                            Keynote
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="session-details">
                    {session.date && (
                      <div className="detail-item">
                        📅 {formatDate(session.date)}
                      </div>
                    )}
                    
                    {(session.start_time || session.end_time) && (
                      <div className="detail-item">
                        ⏰ {formatTime(session.start_time || '')} {session.end_time ? `- ${formatTime(session.end_time)}` : ''}
                      </div>
                    )}
                    
                    {session.venue && (
                      <div className="detail-item">
                        📍 {session.venue}
                      </div>
                    )}

                    {session.duration && (
                      <div className="detail-item">
                        ⌱ {session.duration} min
                      </div>
                    )}
                  </div>

                  {/* Session Meta */}
                  <div className="session-meta">
                    {session.track && (
                      <span className={`track-badge ${getTrackStyle(session.track)}`}>
                        {session.track}
                      </span>
                    )}
                    
                    {session.audience_level && (
                      <span className={`track-badge ${getAudienceLevelStyle(session.audience_level)}`}>
                        {session.audience_level.replace('_', ' ')}
                      </span>
                    )}
                    
                    {session.theme && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTopicClick?.(session.theme);
                        }}
                        className="theme-link"
                        title={`Explore ${session.theme} topic`}
                      >
                        🏷️ {session.theme}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Professional Stats Footer */}
        <footer className="stats-footer">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{sessionCount}</div>
              <div className="stat-label">Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{uniqueThemes.length}</div>
              <div className="stat-label">Topics</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{uniqueTracks.length}</div>
              <div className="stat-label">Tracks</div>
            </div>
          </div>
          
          {/* Additional stats if available */}
          {(speaker?.years_experience || speaker?.publications) && (
            <div className="stats-grid" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {speaker.years_experience && (
                <div className="stat-item">
                  <div className="stat-number">{speaker.years_experience}+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
              )}
              {speaker.publications && (
                <div className="stat-item">
                  <div className="stat-number">{speaker.publications}</div>
                  <div className="stat-label">Publications</div>
                </div>
              )}
            </div>
          )}
        </footer>
      </div>
    </motion.div>
  );
});

SpeakerCard.displayName = 'SpeakerCard'; 