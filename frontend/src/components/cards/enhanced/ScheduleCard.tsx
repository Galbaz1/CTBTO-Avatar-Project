import React, { createContext, useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "../compound/Badge";

// === TYPES & INTERFACES ===

interface SnT2025Schedule {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalDays: number;
  totalSessions: number;
  dailySchedules: DailySchedule[];
  timeSlots: TimeSlot[];
  venues: string[];
  sessionTypes: string[];
  themes: string[];
  priority_level?: "high" | "medium" | "low";
  relevance_score?: number;
}

interface DailySchedule {
  date: string;
  day_of_week: string;
  sessions: ScheduleSession[];
  totalDuration: number;
  venueCount: number;
  isConferenceDay: boolean;
}

interface ScheduleSession {
  session_id: string;
  title: string;
  start_time: string;
  end_time: string;
  venue: string;
  session_type: string;
  speakers: string[];
  theme: string;
  duration_minutes: number;
  is_keynote?: boolean;
  audience_level?: string;
}

interface TimeSlot {
  time: string;
  sessions: ScheduleSession[];
  isBreak?: boolean;
  isPrimary?: boolean;
}

interface ScheduleCardContextValue {
  schedule: SnT2025Schedule;
  viewMode: "daily" | "time" | "venue" | "theme";
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const ScheduleCardContext = createContext<ScheduleCardContextValue | null>(
  null,
);

const useScheduleCard = () => {
  const context = useContext(ScheduleCardContext);
  if (!context) {
    throw new Error("ScheduleCard components must be used within ScheduleCard");
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

const sessionVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.02,
      duration: 0.2,
    },
  }),
};

// === MAIN COMPONENT ===

interface ScheduleCardProps {
  schedule: SnT2025Schedule;
  viewMode?: "daily" | "time" | "venue" | "theme";
  compact?: boolean;
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
}

function ScheduleCard({
  schedule,
  viewMode = "daily",
  compact = false,
  animated = true,
  className,
  children,
}: ScheduleCardProps) {
  const contextValue: ScheduleCardContextValue = {
    schedule,
    viewMode,
    compact,
    animated,
    className,
  };

  return (
    <ScheduleCardContext.Provider value={contextValue}>
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
          className,
        )}
        // Voice-only: no mouse interaction handlers
        role="article"
        aria-labelledby={`schedule-title-${schedule.title.replace(/\s+/g, "-")}`}
        aria-describedby={`schedule-description-${schedule.title.replace(/\s+/g, "-")}`}
      >
        {children}
      </motion.article>
    </ScheduleCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function ScheduleCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useScheduleCard();

  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-4", className)}
    >
      {children}
    </motion.header>
  );
}

function ScheduleCardTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { schedule, compact } = useScheduleCard();
  const displayTitle = children || schedule.title;

  return (
    <h3
      id={`schedule-title-${schedule.title.replace(/\s+/g, "-")}`}
      className={cn(
        // Large, readable fonts for kiosk environment (18px+ minimum)
        compact ? "text-lg font-semibold" : "text-xl font-bold",
        // High contrast text - WCAG AAA
        "text-gray-900",
        // Text overflow handling for long titles
        "line-clamp-2 leading-tight",
        className,
      )}
    >
      {displayTitle}
    </h3>
  );
}

function ScheduleCardMeta({ className }: { className?: string }) {
  const { schedule, compact } = useScheduleCard();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mt-2",
        compact ? "text-sm" : "text-base",
        className,
      )}
    >
      <Badge variant="secondary" className="text-xs font-medium">
        {schedule.totalDays} days
      </Badge>
      <Badge variant="outline" className="text-xs">
        {schedule.totalSessions} sessions
      </Badge>
      <Badge variant="outline" className="text-xs">
        {schedule.venues.length} venues
      </Badge>
      {schedule.priority_level && (
        <Badge variant="outline" className="text-xs">
          {schedule.priority_level} priority
        </Badge>
      )}
    </div>
  );
}

function ScheduleCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useScheduleCard();

  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("space-y-4", className)}
    >
      {children}
    </motion.div>
  );
}

function ScheduleCardOverview({ className }: { className?: string }) {
  const { schedule, compact } = useScheduleCard();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span
          className={cn(
            "font-medium",
            compact ? "text-sm" : "text-base",
            "text-gray-800",
          )}
        >
          Conference Schedule
        </span>
        <span className="text-sm text-gray-500">
          {schedule.dateRange.start} - {schedule.dateRange.end}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-blue-50 rounded-md">
          <div
            className={cn(
              "font-bold text-blue-900",
              compact ? "text-sm" : "text-base",
            )}
          >
            {schedule.totalSessions}
          </div>
          <div className="text-xs text-blue-600">Sessions</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-md">
          <div
            className={cn(
              "font-bold text-green-900",
              compact ? "text-sm" : "text-base",
            )}
          >
            {schedule.venues.length}
          </div>
          <div className="text-xs text-green-600">Venues</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-md">
          <div
            className={cn(
              "font-bold text-purple-900",
              compact ? "text-sm" : "text-base",
            )}
          >
            {schedule.sessionTypes.length}
          </div>
          <div className="text-xs text-purple-600">Types</div>
        </div>
      </div>
    </div>
  );
}

function ScheduleCardDays({
  maxDays = 3,
  className,
}: {
  maxDays?: number;
  className?: string;
}) {
  const { schedule, compact, animated } = useScheduleCard();

  const displayDays = schedule.dailySchedules.slice(0, maxDays);

  return (
    <div className={cn("space-y-3", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Daily Overview
      </h4>
      <div className="space-y-2">
        {displayDays.map((day, index) => (
          <motion.div
            key={day.date}
            variants={animated ? sessionVariants : undefined}
            custom={index}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            layout
            className={cn(
              "p-3 rounded-md border border-gray-200 bg-gray-50",
              // Voice-only: no hover effects
              "focus-within:ring-1 focus-within:ring-blue-500",
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5
                  className={cn(
                    "font-medium",
                    compact ? "text-sm" : "text-base",
                    "text-gray-900",
                  )}
                >
                  {day.day_of_week}
                </h5>
                <p className="text-xs text-gray-600">{day.date}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {day.sessions.length} sessions
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span>{Math.round(day.totalDuration / 60)}h duration</span>
              <span>•</span>
              <span>{day.venueCount} venues</span>
              {day.sessions.some((s) => s.is_keynote) && (
                <>
                  <span>•</span>
                  <Badge variant="default" className="text-xs">
                    Keynote
                  </Badge>
                </>
              )}
            </div>
          </motion.div>
        ))}
        {schedule.dailySchedules.length > maxDays && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{schedule.dailySchedules.length - maxDays} more days
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleCardTimeSlots({
  maxSlots = 4,
  className,
}: {
  maxSlots?: number;
  className?: string;
}) {
  const { schedule, compact, animated } = useScheduleCard();

  const displaySlots = schedule.timeSlots.slice(0, maxSlots);

  return (
    <div className={cn("space-y-3", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Key Time Slots
      </h4>
      <div className="space-y-2">
        {displaySlots.map((slot, index) => (
          <motion.div
            key={slot.time}
            variants={animated ? sessionVariants : undefined}
            custom={index}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            layout
            className={cn(
              "p-3 rounded-md border",
              slot.isPrimary
                ? "border-blue-200 bg-blue-50"
                : "border-gray-200 bg-gray-50",
              // Voice-only: no hover effects
              "focus-within:ring-1 focus-within:ring-blue-500",
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <h5
                className={cn(
                  "font-medium",
                  compact ? "text-sm" : "text-base",
                  slot.isPrimary ? "text-blue-900" : "text-gray-900",
                )}
              >
                {slot.time}
              </h5>
              <Badge
                variant={slot.isPrimary ? "default" : "outline"}
                className="text-xs"
              >
                {slot.sessions.length} sessions
              </Badge>
            </div>
            <div className="text-xs text-gray-600">
              {slot.sessions.map((s) => s.venue).join(", ")}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScheduleCardVenues({ className }: { className?: string }) {
  const { schedule, compact } = useScheduleCard();

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Conference Venues
      </h4>
      <div className="flex flex-wrap gap-2">
        {schedule.venues.map((venue, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              // Clear, accessible colors - no hover states
              "bg-green-50 text-green-700 border-green-200",
            )}
          >
            {venue}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ScheduleCardSessionTypes({ className }: { className?: string }) {
  const { schedule, compact } = useScheduleCard();

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Session Types
      </h4>
      <div className="flex flex-wrap gap-2">
        {schedule.sessionTypes.map((type, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              // Clear, accessible colors - no hover states
              "bg-purple-50 text-purple-700 border-purple-200",
            )}
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ScheduleCardThemes({ className }: { className?: string }) {
  const { schedule, compact } = useScheduleCard();

  if (!schedule.themes || schedule.themes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Research Themes
      </h4>
      <div className="flex flex-wrap gap-2">
        {schedule.themes.slice(0, compact ? 4 : 8).map((theme, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              // Clear, accessible colors - no hover states
              "bg-blue-50 text-blue-700 border-blue-200",
            )}
          >
            {theme}
          </Badge>
        ))}
        {schedule.themes.length > (compact ? 4 : 8) && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
            +{schedule.themes.length - (compact ? 4 : 8)} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function ScheduleCardFooter({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { schedule, animated } = useScheduleCard();

  const defaultFooter = (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>
          {schedule.dateRange.start} - {schedule.dateRange.end}
        </span>
        {schedule.priority_level && (
          <Badge variant="outline" size="sm">
            {schedule.priority_level} priority
          </Badge>
        )}
      </div>
      {schedule.relevance_score && (
        <div className="text-xs text-gray-400">
          Relevance: {(schedule.relevance_score * 100).toFixed(0)}%
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

ScheduleCard.Header = ScheduleCardHeader;
ScheduleCard.Title = ScheduleCardTitle;
ScheduleCard.Meta = ScheduleCardMeta;
ScheduleCard.Body = ScheduleCardBody;
ScheduleCard.Overview = ScheduleCardOverview;
ScheduleCard.Days = ScheduleCardDays;
ScheduleCard.TimeSlots = ScheduleCardTimeSlots;
ScheduleCard.Venues = ScheduleCardVenues;
ScheduleCard.SessionTypes = ScheduleCardSessionTypes;
ScheduleCard.Themes = ScheduleCardThemes;
ScheduleCard.Footer = ScheduleCardFooter;

// === PRESET LAYOUTS ===

function ScheduleCardDefault({
  schedule,
  className,
}: {
  schedule: SnT2025Schedule;
  className?: string;
}) {
  return (
    <ScheduleCard schedule={schedule} className={className}>
      <ScheduleCard.Header>
        <ScheduleCard.Title />
        <ScheduleCard.Meta />
      </ScheduleCard.Header>
      <ScheduleCard.Body>
        <ScheduleCard.Overview />
        <ScheduleCard.Days maxDays={3} />
        <ScheduleCard.TimeSlots maxSlots={4} />
        <ScheduleCard.Venues />
      </ScheduleCard.Body>
      <ScheduleCard.Footer />
    </ScheduleCard>
  );
}

function ScheduleCardCompact({
  schedule,
  className,
}: {
  schedule: SnT2025Schedule;
  className?: string;
}) {
  return (
    <ScheduleCard schedule={schedule} compact className={className}>
      <ScheduleCard.Header>
        <ScheduleCard.Title />
        <ScheduleCard.Meta />
      </ScheduleCard.Header>
      <ScheduleCard.Body>
        <ScheduleCard.Overview />
        <ScheduleCard.Days maxDays={2} />
        <ScheduleCard.Venues />
      </ScheduleCard.Body>
    </ScheduleCard>
  );
}

function ScheduleCardMinimal({
  schedule,
  className,
}: {
  schedule: SnT2025Schedule;
  className?: string;
}) {
  return (
    <ScheduleCard schedule={schedule} compact className={className}>
      <ScheduleCard.Header>
        <ScheduleCard.Title />
        <ScheduleCard.Meta />
      </ScheduleCard.Header>
      <ScheduleCard.Body>
        <ScheduleCard.Overview />
      </ScheduleCard.Body>
    </ScheduleCard>
  );
}

// === EXPORTS ===

export {
  ScheduleCard,
  ScheduleCardDefault,
  ScheduleCardCompact,
  ScheduleCardMinimal,
  type SnT2025Schedule,
  type DailySchedule,
  type ScheduleSession,
  type TimeSlot,
};

export default ScheduleCard;
