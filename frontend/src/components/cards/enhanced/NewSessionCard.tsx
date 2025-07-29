import React, { createContext, useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "../compound/Badge";

// === TYPES & INTERFACES ===

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
  keywords?: string[];
  priority_level?: "high" | "medium" | "low";
  relevance_score?: number;
}

interface SessionCardContextValue {
  session: TimetableSession;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const SessionCardContext = createContext<SessionCardContextValue | null>(null);

const useSessionCard = () => {
  const context = useContext(SessionCardContext);
  if (!context) {
    throw new Error("SessionCard components must be used within SessionCard");
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
    },
  },
  // Removed hover variant - not applicable for voice-only kiosk
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.2,
    },
  },
};

const speakerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.2,
    },
  }),
};

// === MAIN COMPONENT ===

interface SessionCardProps {
  session: TimetableSession;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
}

function SessionCard({
  session,
  compact = false,
  animated = true,
  className,
  children,
}: SessionCardProps) {
  const contextValue: SessionCardContextValue = {
    session,
    compact,
    animated,
    className,
  };

  return (
    <SessionCardContext.Provider value={contextValue}>
      <motion.article
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        layout
        className={cn(
          // Base card styling - optimized for kiosk visibility with enhanced contrast
          "relative rounded-lg border border-gray-300 bg-white p-6 shadow-lg",
          // WCAG AAA compliance - 7:1 contrast ratio
          "text-gray-950",
          // Enhanced focus states for voice navigation accessibility
          "focus-within:ring-4 focus-within:ring-blue-600 focus-within:ring-offset-2",
          // Professional shadow and spacing for kiosk displays
          "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
          // Responsive sizing for kiosk displays
          compact ? "p-4" : "p-6",
          className,
        )}
        // Voice-only: no mouse interaction handlers
        role="article"
        aria-labelledby={`session-title-${session.session_id}`}
        aria-describedby={`session-description-${session.session_id}`}
      >
        {children}
      </motion.article>
    </SessionCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function SessionCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useSessionCard();

  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-4", className)}
    >
      {children}
    </motion.header>
  );
}

function SessionCardTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { session, compact } = useSessionCard();
  const displayTitle = children || session.title;

  return (
    <h3
      id={`session-title-${session.session_id}`}
      className={cn(
        // Large, readable fonts for kiosk environment (18px+ minimum)
        compact ? "text-lg font-semibold" : "text-xl font-bold",
        // WCAG AAA compliance - 7:1 contrast ratio
        "text-gray-950",
        // Text overflow handling for long titles
        "line-clamp-2 leading-tight",
        className,
      )}
    >
      {displayTitle}
    </h3>
  );
}

function SessionCardMeta({ className }: { className?: string }) {
  const { session, compact } = useSessionCard();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mt-2",
        compact ? "text-sm" : "text-base",
        className,
      )}
    >
      <Badge
        variant="secondary"
        className="text-xs font-medium bg-blue-50 text-blue-800 border-blue-200"
      >
        {session.session_id}
      </Badge>
      <Badge
        variant="outline"
        className="text-xs bg-gray-50 text-gray-800 border-gray-300"
      >
        {session.venue}
      </Badge>
      <Badge
        variant="outline"
        className="text-xs bg-green-50 text-green-800 border-green-200"
      >
        {session.start_time} - {session.end_time}
      </Badge>
      {session.session_type && (
        <Badge
          variant="default"
          className="text-xs bg-purple-100 text-purple-800 border-purple-200"
        >
          {session.session_type}
        </Badge>
      )}
    </div>
  );
}

// New component for enhanced data display
function SessionCardThemes({ className }: { className?: string }) {
  const { session, compact } = useSessionCard();

  const themes = [session.theme, session.track].filter(Boolean);

  if (themes.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-semibold",
          compact ? "text-sm" : "text-base",
          "text-gray-950",
        )}
      >
        Conference Themes
      </h4>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-orange-50 text-orange-800 border-orange-200 font-medium",
            )}
          >
            {theme}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Enhanced description component with better formatting
function SessionCardDescription({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { session, compact } = useSessionCard();
  const displayDescription = children || session.description;

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-semibold",
          compact ? "text-sm" : "text-base",
          "text-gray-950",
        )}
      >
        Session Details
      </h4>
      <p
        id={`session-description-${session.session_id}`}
        className={cn(
          // Readable text size for kiosk
          compact ? "text-sm" : "text-base",
          // WCAG AAA compliance - 7:1 contrast ratio
          "text-gray-950",
          // Handle long descriptions with better line height
          "leading-relaxed",
          className,
        )}
      >
        {displayDescription}
      </p>
    </div>
  );
}

function SessionCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useSessionCard();

  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("space-y-4", className)}
    >
      {children}
    </motion.div>
  );
}

function SessionCardSpeakers({ className }: { className?: string }) {
  const { session, compact, animated } = useSessionCard();

  if (!session.speakers || session.speakers.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-semibold",
          compact ? "text-sm" : "text-base",
          "text-gray-950",
        )}
      >
        {session.speakers.length === 1 ? "Speaker" : "Speakers"} (
        {session.speakers.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {session.speakers.map((speaker, index) => (
          <motion.div
            key={speaker}
            variants={animated ? speakerVariants : undefined}
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
                "bg-blue-100 text-blue-800 border-blue-200",
              )}
            >
              {speaker}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SessionCardTopics({ className }: { className?: string }) {
  const { session, compact } = useSessionCard();

  const topics = [session.theme, session.track].filter(Boolean);

  if (topics.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-semibold",
          compact ? "text-sm" : "text-base",
          "text-gray-950",
        )}
      >
        Topics & Categories
      </h4>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-gray-50 text-gray-800 border-gray-300 font-medium",
            )}
          >
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function SessionCardFooter({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { session, animated } = useSessionCard();

  const defaultFooter = (
    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span className="font-medium">{session.duration} minutes</span>
        {session.audience_level && (
          <Badge
            variant="outline"
            size="sm"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            {session.audience_level}
          </Badge>
        )}
        {session.is_interactive && (
          <Badge
            variant="outline"
            size="sm"
            className="bg-green-100 text-green-700 border-green-200"
          >
            Interactive
          </Badge>
        )}
      </div>
      {session.relevance_score && (
        <div className="text-xs text-gray-500 font-medium">
          Relevance: {(session.relevance_score * 100).toFixed(0)}%
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

SessionCard.Header = SessionCardHeader;
SessionCard.Title = SessionCardTitle;
SessionCard.Meta = SessionCardMeta;
SessionCard.Body = SessionCardBody;
SessionCard.Description = SessionCardDescription;
SessionCard.Speakers = SessionCardSpeakers;
SessionCard.Topics = SessionCardTopics;
SessionCard.Themes = SessionCardThemes;
SessionCard.Footer = SessionCardFooter;

// === PRESET LAYOUTS ===

function SessionCardDefault({
  session,
  className,
}: {
  session: TimetableSession;
  className?: string;
}) {
  return (
    <SessionCard session={session} className={className}>
      <SessionCard.Header>
        <SessionCard.Title />
        <SessionCard.Meta />
      </SessionCard.Header>
      <SessionCard.Body>
        <SessionCard.Description />
        <SessionCard.Themes />
        <SessionCard.Speakers />
        <SessionCard.Topics />
      </SessionCard.Body>
      <SessionCard.Footer />
    </SessionCard>
  );
}

function SessionCardCompact({
  session,
  className,
}: {
  session: TimetableSession;
  className?: string;
}) {
  return (
    <SessionCard session={session} compact className={className}>
      <SessionCard.Header>
        <SessionCard.Title />
        <SessionCard.Meta />
      </SessionCard.Header>
      <SessionCard.Body>
        <SessionCard.Description />
        <SessionCard.Speakers />
      </SessionCard.Body>
    </SessionCard>
  );
}

function SessionCardMinimal({
  session,
  className,
}: {
  session: TimetableSession;
  className?: string;
}) {
  return (
    <SessionCard session={session} compact className={className}>
      <SessionCard.Header>
        <SessionCard.Title />
        <SessionCard.Meta />
      </SessionCard.Header>
    </SessionCard>
  );
}

// === EXPORTS ===

export {
  SessionCard,
  SessionCardDefault,
  SessionCardCompact,
  SessionCardMinimal,
  type TimetableSession,
};

export const NewSessionCard = SessionCardDefault;

export default SessionCard;
