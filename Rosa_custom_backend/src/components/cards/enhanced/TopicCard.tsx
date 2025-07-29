import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '../compound/Badge';

// === TYPES & INTERFACES ===

interface SnT2025Topic {
  code: string;
  title: string;
  theme: string;
  description: string;
  keywords: string[];
  sessions: TopicSession[];
  speakers: string[];
  sessionCount: number;
  speakerCount: number;
  sessionTypes: string[];
  venues: string[];
  relevance_score?: number;
  priority_level?: 'high' | 'medium' | 'low';
  expertise_level?: 'beginner' | 'intermediate' | 'expert';
}

interface TopicSession {
  session_id: string;
  title: string;
  time: string;
  venue: string;
  speakers: string[];
  session_type: string;
}

interface TopicCardContextValue {
  topic: SnT2025Topic;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const TopicCardContext = createContext<TopicCardContextValue | null>(null);

const useTopicCard = () => {
  const context = useContext(TopicCardContext);
  if (!context) {
    throw new Error('TopicCard components must be used within TopicCard');
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
  hidden: { opacity: 0, scale: 0.9 },
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

interface TopicCardProps {
  topic: SnT2025Topic;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

function TopicCard({ 
  topic, 
  compact = false, 
  animated = true, 
  className,
  children 
}: TopicCardProps) {
  const contextValue: TopicCardContextValue = {
    topic,
    compact,
    animated,
    className
  };

  return (
    <TopicCardContext.Provider value={contextValue}>
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
          "focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2",
          // Responsive sizing for kiosk displays
          compact ? "p-4" : "p-6",
          className
        )}
        // Voice-only: no mouse interaction handlers
        role="article"
        aria-labelledby={`topic-title-${topic.code}`}
        aria-describedby={`topic-description-${topic.code}`}
      >
        {children}
      </motion.article>
    </TopicCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function TopicCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  const { animated } = useTopicCard();
  
  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-4", className)}
    >
      {children}
    </motion.header>
  );
}

function TopicCardTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { topic, compact } = useTopicCard();
  const displayTitle = children || topic.title;
  
  return (
    <h3
      id={`topic-title-${topic.code}`}
      className={cn(
        // Large, readable fonts for kiosk environment (18px+ minimum)
        compact ? "text-lg font-semibold" : "text-xl font-bold",
        // High contrast text - WCAG AAA
        "text-gray-900",
        // Text overflow handling for long titles
        "line-clamp-2 leading-tight",
        className
      )}
    >
      {displayTitle}
    </h3>
  );
}

function TopicCardMeta({ className }: { className?: string }) {
  const { topic, compact } = useTopicCard();
  
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 mt-2", 
      compact ? "text-sm" : "text-base",
      className
    )}>
      <Badge variant="secondary" className="text-xs font-medium">
        {topic.code}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {topic.theme}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {topic.sessionCount} sessions
      </Badge>
      {topic.speakerCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {topic.speakerCount} speakers
        </Badge>
      )}
      {topic.expertise_level && (
        <Badge variant="default" className="text-xs">
          {topic.expertise_level}
        </Badge>
      )}
    </div>
  );
}

function TopicCardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { animated } = useTopicCard();
  
  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("space-y-3", className)}
    >
      {children}
    </motion.div>
  );
}

function TopicCardDescription({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { topic, compact } = useTopicCard();
  const displayDescription = children || topic.description;
  
  return (
    <p
      id={`topic-description-${topic.code}`}
      className={cn(
        // Readable text size for kiosk
        compact ? "text-sm" : "text-base",
        // High contrast - WCAG AAA
        "text-gray-700",
        // Handle long descriptions
        "line-clamp-3 leading-relaxed",
        className
      )}
    >
      {displayDescription}
    </p>
  );
}

function TopicCardKeywords({ className }: { className?: string }) {
  const { topic, compact } = useTopicCard();
  
  if (!topic.keywords || topic.keywords.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Keywords
      </h4>
      <div className="flex flex-wrap gap-1">
        {topic.keywords.slice(0, compact ? 4 : 8).map((keyword, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs px-2 py-1" : "text-sm px-2 py-1",
              // Clear, accessible colors - no hover states
              "bg-purple-50 text-purple-700 border-purple-200"
            )}
          >
            {keyword}
          </Badge>
        ))}
        {topic.keywords.length > (compact ? 4 : 8) && (
          <Badge 
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-gray-50 text-gray-600 border-gray-300"
            )}
          >
            +{topic.keywords.length - (compact ? 4 : 8)} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function TopicCardSessions({ maxSessions = 3, className }: { maxSessions?: number; className?: string }) {
  const { topic, compact, animated } = useTopicCard();
  
  if (!topic.sessions || topic.sessions.length === 0) {
    return null;
  }
  
  const displaySessions = topic.sessions.slice(0, maxSessions);
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Sessions ({topic.sessionCount})
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
              "focus-within:ring-1 focus-within:ring-purple-500"
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
              {session.speakers.length > 0 && (
                <>
                  <span>•</span>
                  <span>{session.speakers.length} speaker{session.speakers.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
        {topic.sessions.length > maxSessions && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{topic.sessions.length - maxSessions} more sessions
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCardSpeakers({ maxSpeakers = 6, className }: { maxSpeakers?: number; className?: string }) {
  const { topic, compact, animated } = useTopicCard();
  
  if (!topic.speakers || topic.speakers.length === 0) {
    return null;
  }
  
  const displaySpeakers = topic.speakers.slice(0, maxSpeakers);
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Key Speakers ({topic.speakerCount})
      </h4>
      <div className="flex flex-wrap gap-2">
        {displaySpeakers.map((speaker, index) => (
          <motion.div
            key={speaker}
            variants={animated ? sessionVariants : undefined}
            custom={index}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            layout
          >
            <Badge 
              variant="secondary"
              className={cn(
                "font-medium",
                compact ? "text-xs px-2 py-1" : "text-sm px-3 py-1",
                // No hover effects - voice-only interaction
                "bg-blue-50 text-blue-700 border-blue-200"
              )}
            >
              {speaker}
            </Badge>
          </motion.div>
        ))}
        {topic.speakers.length > maxSpeakers && (
          <Badge 
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-gray-50 text-gray-600"
            )}
          >
            +{topic.speakers.length - maxSpeakers} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function TopicCardVenues({ className }: { className?: string }) {
  const { topic, compact } = useTopicCard();
  
  if (!topic.venues || topic.venues.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className={cn(
        "font-medium",
        compact ? "text-sm" : "text-base",
        "text-gray-800"
      )}>
        Venues
      </h4>
      <div className="flex flex-wrap gap-2">
        {topic.venues.map((venue, index) => (
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

function TopicCardFooter({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { topic, animated } = useTopicCard();
  
  const defaultFooter = (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{topic.sessionTypes.join(', ')}</span>
        {topic.priority_level && (
          <Badge variant="outline" size="sm">
            {topic.priority_level} priority
          </Badge>
        )}
      </div>
      {topic.relevance_score && (
        <div className="text-xs text-gray-400">
          Relevance: {(topic.relevance_score * 100).toFixed(0)}%
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

TopicCard.Header = TopicCardHeader;
TopicCard.Title = TopicCardTitle;
TopicCard.Meta = TopicCardMeta;
TopicCard.Body = TopicCardBody;
TopicCard.Description = TopicCardDescription;
TopicCard.Keywords = TopicCardKeywords;
TopicCard.Sessions = TopicCardSessions;
TopicCard.Speakers = TopicCardSpeakers;
TopicCard.Venues = TopicCardVenues;
TopicCard.Footer = TopicCardFooter;

// === PRESET LAYOUTS ===

function TopicCardDefault({ topic, className }: { topic: SnT2025Topic; className?: string }) {
  return (
    <TopicCard topic={topic} className={className}>
      <TopicCard.Header>
        <TopicCard.Title />
        <TopicCard.Meta />
      </TopicCard.Header>
      <TopicCard.Body>
        <TopicCard.Description />
        <TopicCard.Keywords />
        <TopicCard.Sessions maxSessions={3} />
        <TopicCard.Speakers maxSpeakers={4} />
        <TopicCard.Venues />
      </TopicCard.Body>
      <TopicCard.Footer />
    </TopicCard>
  );
}

function TopicCardCompact({ topic, className }: { topic: SnT2025Topic; className?: string }) {
  return (
    <TopicCard topic={topic} compact className={className}>
      <TopicCard.Header>
        <TopicCard.Title />
        <TopicCard.Meta />
      </TopicCard.Header>
      <TopicCard.Body>
        <TopicCard.Description />
        <TopicCard.Keywords />
        <TopicCard.Sessions maxSessions={2} />
      </TopicCard.Body>
    </TopicCard>
  );
}

function TopicCardMinimal({ topic, className }: { topic: SnT2025Topic; className?: string }) {
  return (
    <TopicCard topic={topic} compact className={className}>
      <TopicCard.Header>
        <TopicCard.Title />
        <TopicCard.Meta />
      </TopicCard.Header>
      <TopicCard.Body>
        <TopicCard.Keywords />
      </TopicCard.Body>
    </TopicCard>
  );
}

// === EXPORTS ===

export {
  TopicCard,
  TopicCardDefault,
  TopicCardCompact,
  TopicCardMinimal,
  type SnT2025Topic,
  type TopicSession
};

export default TopicCard; 