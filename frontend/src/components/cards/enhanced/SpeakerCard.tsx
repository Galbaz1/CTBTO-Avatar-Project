import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '../compound/Badge';

// === TYPES & INTERFACES ===

interface SnT2025Speaker {
  name: string;
  title?: string;
  organization?: string;
  country?: string;
  bio?: string;
  expertise: string[];
  sessions: SpeakerSession[];
  sessionCount: number;
  themes: string[];
  venues: string[];
  sessionTypes: string[];
  totalDuration: number;
  isKeynote: boolean;
  research_areas?: string[];
  experience_level?: 'junior' | 'senior' | 'expert';
  priority_level?: 'high' | 'medium' | 'low';
  relevance_score?: number;
}

interface SpeakerSession {
  session_id: string;
  title: string;
  time: string;
  date: string;
  venue: string;
  session_type: string;
  theme: string;
  duration: number;
  co_speakers?: string[];
}

interface SpeakerCardContextValue {
  speaker: SnT2025Speaker;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const SpeakerCardContext = createContext<SpeakerCardContextValue | null>(null);

const useSpeakerCard = () => {
  const context = useContext(SpeakerCardContext);
  if (!context) {
    throw new Error('SpeakerCard components must be used within SpeakerCard');
  }
  return context;
};

// === ANIMATION VARIANTS ===

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.2
    }
  }
};

const sessionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    }
  })
};

// === MAIN COMPONENT ===

interface SpeakerCardProps {
  speaker: SnT2025Speaker;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

function SpeakerCard({ 
  speaker, 
  compact = false, 
  animated = true, 
  className,
  children 
}: SpeakerCardProps) {
  const contextValue: SpeakerCardContextValue = {
    speaker,
    compact,
    animated,
    className
  };

  return (
    <SpeakerCardContext.Provider value={contextValue}>
      <motion.article
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        layout
        className={cn(
          // Base card styling - optimized for kiosk visibility
          "relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
          // High contrast for kiosk environment - WCAG AAA compliance
          "text-gray-900",
          // Focus states for voice navigation (no hover states)
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          // Responsive sizing for kiosk displays
          compact ? "p-4" : "p-6",
          className
        )}
        // Voice-only: no mouse interaction handlers
        role="article"
        aria-labelledby={`speaker-title-${speaker.name.replace(/\s+/g, '-')}`}
        aria-describedby={`speaker-bio-${speaker.name.replace(/\s+/g, '-')}`}
      >
        {children}
      </motion.article>
    </SpeakerCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function SpeakerCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  const { animated } = useSpeakerCard();
  
  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-4", className)}
    >
      {children}
    </motion.header>
  );
}

function SpeakerCardName({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  const displayName = children || speaker.name;
  
  return (
    <h3
      id={`speaker-title-${speaker.name.replace(/\s+/g, '-')}`}
      className={cn(
        // Large, readable fonts for kiosk environment (18px+ minimum)
        compact ? "text-lg font-semibold" : "text-xl font-bold",
        // High contrast text - WCAG AAA
        "text-gray-900",
        // Text overflow handling for long names
        "line-clamp-1 leading-tight",
        className
      )}
    >
      {displayName}
    </h3>
  );
}

function SpeakerCardMeta({ className }: { className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 mt-2", 
      compact ? "text-sm" : "text-base",
      className
    )}>
      {speaker.title && (
        <Badge variant="secondary" className="text-xs font-medium">
          {speaker.title}
        </Badge>
      )}
      {speaker.organization && (
        <Badge variant="outline" className="text-xs">
          {speaker.organization}
        </Badge>
      )}
      <Badge variant="outline" className="text-xs">
        {speaker.sessionCount} sessions
      </Badge>
      {speaker.isKeynote && (
        <Badge variant="default" className="text-xs">
          Keynote Speaker
        </Badge>
      )}
      {speaker.experience_level && (
        <Badge variant="outline" className="text-xs">
          {speaker.experience_level}
        </Badge>
      )}
    </div>
  );
}

function SpeakerCardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { animated } = useSpeakerCard();
  
  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("space-y-3", className)}
    >
      {children}
    </motion.div>
  );
}

function SpeakerCardBio({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  const displayBio = children || speaker.bio;
  
  if (!displayBio) return null;
  
  return (
    <p
      id={`speaker-bio-${speaker.name.replace(/\s+/g, '-')}`}
      className={cn(
        // Readable text size for kiosk
        compact ? "text-sm" : "text-base",
        // High contrast - WCAG AAA
        "text-gray-700",
        // Handle long bios
        "line-clamp-3 leading-relaxed",
        className
      )}
    >
      {displayBio}
    </p>
  );
}

function SpeakerCardExpertise({ className }: { className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  
  if (!speaker.expertise || speaker.expertise.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Expertise
      </h4>
      <div className="flex flex-wrap gap-1">
        {speaker.expertise.slice(0, compact ? 3 : 6).map((area, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs px-2 py-1" : "text-sm px-2 py-1",
              // Clear, accessible colors - no hover states
              "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {area}
          </Badge>
        ))}
        {speaker.expertise.length > (compact ? 3 : 6) && (
          <Badge 
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-gray-50 text-gray-600 border-gray-300"
            )}
          >
            +{speaker.expertise.length - (compact ? 3 : 6)} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function SpeakerCardSessions({ maxSessions = 3, className }: { maxSessions?: number; className?: string }) {
  const { speaker, compact, animated } = useSpeakerCard();
  
  if (!speaker.sessions || speaker.sessions.length === 0) {
    return null;
  }
  
  const displaySessions = speaker.sessions.slice(0, maxSessions);
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Sessions ({speaker.sessionCount})
      </h4>
      <div className="space-y-2">
        {displaySessions.map((session, index) => (
          <motion.div
            key={session.session_id}
            variants={animated ? sessionVariants : undefined}
            custom={index}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            layout
            className={cn(
              "p-3 rounded-md border border-gray-200 bg-gray-50",
              // Voice-only: no hover effects
              "focus-within:ring-1 focus-within:ring-blue-500"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <h5 className={cn(
                "font-medium line-clamp-1",
                compact ? "text-xs" : "text-sm",
                "text-gray-900"
              )}>
                {session.title}
              </h5>
              <Badge variant="outline" className="text-xs ml-2">
                {session.session_type}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span>{session.time}</span>
              <span>•</span>
              <span>{session.venue}</span>
              <span>•</span>
              <span>{session.date}</span>
              {session.co_speakers && session.co_speakers.length > 0 && (
                <>
                  <span>•</span>
                  <span>{session.co_speakers.length} co-speaker{session.co_speakers.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
        {speaker.sessions.length > maxSessions && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{speaker.sessions.length - maxSessions} more sessions
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakerCardThemes({ className }: { className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  
  if (!speaker.themes || speaker.themes.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Research Themes
      </h4>
      <div className="flex flex-wrap gap-2">
        {speaker.themes.map((theme, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              // Clear, accessible colors - no hover states
              "bg-purple-50 text-purple-700 border-purple-200"
            )}
          >
            {theme}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function SpeakerCardVenues({ className }: { className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  
  if (!speaker.venues || speaker.venues.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Speaking Venues
      </h4>
      <div className="flex flex-wrap gap-2">
        {speaker.venues.map((venue, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              // Clear, accessible colors - no hover states
              "bg-green-50 text-green-700 border-green-200"
            )}
          >
            {venue}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function SpeakerCardStats({ className }: { className?: string }) {
  const { speaker, compact } = useSpeakerCard();
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Speaking Profile
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-blue-50 rounded-md">
          <div className={cn(
            "font-bold text-blue-900",
            compact ? "text-sm" : "text-base"
          )}>
            {speaker.sessionCount}
          </div>
          <div className="text-xs text-blue-600">Sessions</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-md">
          <div className={cn(
            "font-bold text-green-900",
            compact ? "text-sm" : "text-base"
          )}>
            {Math.round(speaker.totalDuration / 60)}h
          </div>
          <div className="text-xs text-green-600">Speaking</div>
        </div>
      </div>
    </div>
  );
}

function SpeakerCardFooter({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { speaker, animated } = useSpeakerCard();
  
  const defaultFooter = (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{speaker.sessionTypes.join(', ')}</span>
        {speaker.priority_level && (
          <Badge variant="outline" size="sm">
            {speaker.priority_level} priority
          </Badge>
        )}
      </div>
      {speaker.relevance_score && (
        <div className="text-xs text-gray-400">
          Relevance: {(speaker.relevance_score * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
  
  return (
    <motion.footer
      variants={animated ? contentVariants : undefined}
      className={cn("mt-4", className)}
    >
      {children || defaultFooter}
    </motion.footer>
  );
}

// === COMPOUND COMPONENT ASSIGNMENT ===

SpeakerCard.Header = SpeakerCardHeader;
SpeakerCard.Name = SpeakerCardName;
SpeakerCard.Meta = SpeakerCardMeta;
SpeakerCard.Body = SpeakerCardBody;
SpeakerCard.Bio = SpeakerCardBio;
SpeakerCard.Expertise = SpeakerCardExpertise;
SpeakerCard.Sessions = SpeakerCardSessions;
SpeakerCard.Themes = SpeakerCardThemes;
SpeakerCard.Venues = SpeakerCardVenues;
SpeakerCard.Stats = SpeakerCardStats;
SpeakerCard.Footer = SpeakerCardFooter;

// === PRESET LAYOUTS ===

function SpeakerCardDefault({ speaker, className }: { speaker: SnT2025Speaker; className?: string }) {
  return (
    <SpeakerCard speaker={speaker} className={className}>
      <SpeakerCard.Header>
        <SpeakerCard.Name />
        <SpeakerCard.Meta />
      </SpeakerCard.Header>
      <SpeakerCard.Body>
        <SpeakerCard.Bio />
        <SpeakerCard.Expertise />
        <SpeakerCard.Sessions maxSessions={3} />
        <SpeakerCard.Themes />
        <SpeakerCard.Stats />
      </SpeakerCard.Body>
      <SpeakerCard.Footer />
    </SpeakerCard>
  );
}

function SpeakerCardCompact({ speaker, className }: { speaker: SnT2025Speaker; className?: string }) {
  return (
    <SpeakerCard speaker={speaker} compact className={className}>
      <SpeakerCard.Header>
        <SpeakerCard.Name />
        <SpeakerCard.Meta />
      </SpeakerCard.Header>
      <SpeakerCard.Body>
        <SpeakerCard.Expertise />
        <SpeakerCard.Sessions maxSessions={2} />
        <SpeakerCard.Stats />
      </SpeakerCard.Body>
    </SpeakerCard>
  );
}

function SpeakerCardMinimal({ speaker, className }: { speaker: SnT2025Speaker; className?: string }) {
  return (
    <SpeakerCard speaker={speaker} compact className={className}>
      <SpeakerCard.Header>
        <SpeakerCard.Name />
        <SpeakerCard.Meta />
      </SpeakerCard.Header>
      <SpeakerCard.Body>
        <SpeakerCard.Expertise />
      </SpeakerCard.Body>
    </SpeakerCard>
  );
}

// === EXPORTS ===

export {
  SpeakerCard,
  SpeakerCardDefault,
  SpeakerCardCompact,
  SpeakerCardMinimal,
  type SnT2025Speaker,
  type SpeakerSession
};

export default SpeakerCard; 