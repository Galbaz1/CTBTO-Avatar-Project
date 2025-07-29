import React, { createContext, useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "../compound/Badge";

// === TYPES & INTERFACES ===

interface SnT2025Venue {
  name: string;
  location: string;
  floor: "ground" | "upper";
  description: string;
  capacity?: number;
  facilities: string[];
  color_coding?: string;
  sessions: VenueSession[];
  sessionCount: number;
  sessionTypes: string[];
  speakerCount: number;
  dailySchedule: DailySchedule[];
  utilization_rate?: number;
  accessibility?: string;
  priority_level?: "high" | "medium" | "low";
  relevance_score?: number;
}

interface VenueSession {
  session_id: string;
  title: string;
  time: string;
  date: string;
  session_type: string;
  speakers: string[];
  theme: string;
  duration: number;
}

interface DailySchedule {
  date: string;
  sessions: VenueSession[];
  sessionCount: number;
  utilization_hours: number;
}

interface VenueCardContextValue {
  venue: SnT2025Venue;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const VenueCardContext = createContext<VenueCardContextValue | null>(null);

const useVenueCard = () => {
  const context = useContext(VenueCardContext);
  if (!context) {
    throw new Error("VenueCard components must be used within VenueCard");
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

const scheduleVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
};

// === MAIN COMPONENT ===

interface VenueCardProps {
  venue: SnT2025Venue;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
}

function VenueCard({
  venue,
  compact = false,
  animated = true,
  className,
  children,
}: VenueCardProps) {
  const contextValue: VenueCardContextValue = {
    venue,
    compact,
    animated,
    className,
  };

  return (
    <VenueCardContext.Provider value={contextValue}>
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
          "focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2",
          // Responsive sizing for kiosk displays
          compact ? "p-4" : "p-6",
          className,
        )}
        // Voice-only: no mouse interaction handlers
        role="article"
        aria-labelledby={`venue-title-${venue.name.replace(/\s+/g, "-")}`}
        aria-describedby={`venue-description-${venue.name.replace(/\s+/g, "-")}`}
      >
        {children}
      </motion.article>
    </VenueCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function VenueCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useVenueCard();

  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-4", className)}
    >
      {children}
    </motion.header>
  );
}

function VenueCardTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { venue, compact } = useVenueCard();
  const displayTitle = children || venue.name;

  return (
    <h3
      id={`venue-title-${venue.name.replace(/\s+/g, "-")}`}
      className={cn(
        // Large, readable fonts for kiosk environment (18px+ minimum)
        compact ? "text-lg font-semibold" : "text-xl font-bold",
        // High contrast text - WCAG AAA
        "text-gray-900",
        // Text overflow handling for long titles
        "line-clamp-1 leading-tight",
        className,
      )}
    >
      {displayTitle}
    </h3>
  );
}

function VenueCardMeta({ className }: { className?: string }) {
  const { venue, compact } = useVenueCard();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mt-2",
        compact ? "text-sm" : "text-base",
        className,
      )}
    >
      <Badge variant="secondary" className="text-xs font-medium">
        {venue.floor} floor
      </Badge>
      <Badge variant="outline" className="text-xs">
        {venue.location}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {venue.sessionCount} sessions
      </Badge>
      {venue.capacity && (
        <Badge variant="outline" className="text-xs">
          {venue.capacity} capacity
        </Badge>
      )}
      {venue.color_coding && (
        <Badge variant="default" className="text-xs">
          {venue.color_coding}
        </Badge>
      )}
    </div>
  );
}

function VenueCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { animated } = useVenueCard();

  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("space-y-3", className)}
    >
      {children}
    </motion.div>
  );
}

function VenueCardDescription({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { venue, compact } = useVenueCard();
  const displayDescription = children || venue.description;

  return (
    <p
      id={`venue-description-${venue.name.replace(/\s+/g, "-")}`}
      className={cn(
        // Readable text size for kiosk
        compact ? "text-sm" : "text-base",
        // High contrast - WCAG AAA
        "text-gray-700",
        // Handle long descriptions
        "line-clamp-2 leading-relaxed",
        className,
      )}
    >
      {displayDescription}
    </p>
  );
}

function VenueCardFacilities({ className }: { className?: string }) {
  const { venue, compact } = useVenueCard();

  if (!venue.facilities || venue.facilities.length === 0) {
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
        Facilities
      </h4>
      <div className="flex flex-wrap gap-1">
        {venue.facilities.slice(0, compact ? 3 : 6).map((facility, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              compact ? "text-xs px-2 py-1" : "text-sm px-2 py-1",
              // Clear, accessible colors - no hover states
              "bg-green-50 text-green-700 border-green-200",
            )}
          >
            {facility}
          </Badge>
        ))}
        {venue.facilities.length > (compact ? 3 : 6) && (
          <Badge
            variant="outline"
            className={cn(
              compact ? "text-xs" : "text-sm",
              "bg-gray-50 text-gray-600 border-gray-300",
            )}
          >
            +{venue.facilities.length - (compact ? 3 : 6)} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function VenueCardUtilization({ className }: { className?: string }) {
  const { venue, compact } = useVenueCard();

  if (!venue.utilization_rate && !venue.dailySchedule?.length) {
    return null;
  }

  const utilizationColor =
    venue.utilization_rate && venue.utilization_rate > 0.8
      ? "bg-red-50 text-red-700 border-red-200"
      : venue.utilization_rate && venue.utilization_rate > 0.6
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Utilization
      </h4>
      <div className="flex items-center gap-2">
        {venue.utilization_rate && (
          <Badge
            variant="outline"
            className={cn(compact ? "text-xs" : "text-sm", utilizationColor)}
          >
            {(venue.utilization_rate * 100).toFixed(0)}% utilized
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {venue.sessionTypes.join(", ")}
        </Badge>
      </div>
    </div>
  );
}

function VenueCardSchedule({
  maxDays = 2,
  className,
}: {
  maxDays?: number;
  className?: string;
}) {
  const { venue, compact, animated } = useVenueCard();

  if (!venue.dailySchedule || venue.dailySchedule.length === 0) {
    return null;
  }

  const displayDays = venue.dailySchedule.slice(0, maxDays);

  return (
    <div className={cn("space-y-2", className)}>
      <h4
        className={cn(
          "font-medium",
          compact ? "text-sm" : "text-base",
          "text-gray-800",
        )}
      >
        Daily Schedule
      </h4>
      <div className="space-y-2">
        {displayDays.map((day, index) => (
          <motion.div
            key={day.date}
            variants={animated ? scheduleVariants : undefined}
            custom={index}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            layout
            className={cn(
              "p-3 rounded-md border border-gray-200 bg-gray-50",
              // Voice-only: no hover effects
              "focus-within:ring-1 focus-within:ring-green-500",
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <h5
                className={cn(
                  "font-medium",
                  compact ? "text-xs" : "text-sm",
                  "text-gray-900",
                )}
              >
                {day.date}
              </h5>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {day.sessionCount} sessions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {day.utilization_hours}h
                </Badge>
              </div>
            </div>
            {day.sessions
              .slice(0, compact ? 2 : 3)
              .map((session, _sessionIndex) => (
                <div
                  key={session.session_id}
                  className="text-xs text-gray-600 mb-1"
                >
                  <span className="font-medium">{session.time}</span>
                  <span className="mx-2">•</span>
                  <span className="line-clamp-1">{session.title}</span>
                </div>
              ))}
            {day.sessions.length > (compact ? 2 : 3) && (
              <div className="text-xs text-gray-500">
                +{day.sessions.length - (compact ? 2 : 3)} more sessions
              </div>
            )}
          </motion.div>
        ))}
        {venue.dailySchedule.length > maxDays && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{venue.dailySchedule.length - maxDays} more days
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCardAccessibility({ className }: { className?: string }) {
  const { venue, compact } = useVenueCard();

  if (!venue.accessibility) {
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
        Accessibility
      </h4>
      <p
        className={cn(
          compact ? "text-xs" : "text-sm",
          "text-gray-600 leading-relaxed",
        )}
      >
        {venue.accessibility}
      </p>
    </div>
  );
}

function VenueCardFooter({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { venue, animated } = useVenueCard();

  const defaultFooter = (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{venue.speakerCount} speakers</span>
        {venue.priority_level && (
          <Badge variant="outline" size="sm">
            {venue.priority_level} priority
          </Badge>
        )}
      </div>
      {venue.relevance_score && (
        <div className="text-xs text-gray-400">
          Relevance: {(venue.relevance_score * 100).toFixed(0)}%
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

VenueCard.Header = VenueCardHeader;
VenueCard.Title = VenueCardTitle;
VenueCard.Meta = VenueCardMeta;
VenueCard.Body = VenueCardBody;
VenueCard.Description = VenueCardDescription;
VenueCard.Facilities = VenueCardFacilities;
VenueCard.Utilization = VenueCardUtilization;
VenueCard.Schedule = VenueCardSchedule;
VenueCard.Accessibility = VenueCardAccessibility;
VenueCard.Footer = VenueCardFooter;

// === PRESET LAYOUTS ===

function VenueCardDefault({
  venue,
  className,
}: {
  venue: SnT2025Venue;
  className?: string;
}) {
  return (
    <VenueCard venue={venue} className={className}>
      <VenueCard.Header>
        <VenueCard.Title />
        <VenueCard.Meta />
      </VenueCard.Header>
      <VenueCard.Body>
        <VenueCard.Description />
        <VenueCard.Facilities />
        <VenueCard.Utilization />
        <VenueCard.Schedule maxDays={2} />
        <VenueCard.Accessibility />
      </VenueCard.Body>
      <VenueCard.Footer />
    </VenueCard>
  );
}

function VenueCardCompact({
  venue,
  className,
}: {
  venue: SnT2025Venue;
  className?: string;
}) {
  return (
    <VenueCard venue={venue} compact className={className}>
      <VenueCard.Header>
        <VenueCard.Title />
        <VenueCard.Meta />
      </VenueCard.Header>
      <VenueCard.Body>
        <VenueCard.Description />
        <VenueCard.Facilities />
        <VenueCard.Utilization />
      </VenueCard.Body>
    </VenueCard>
  );
}

function VenueCardMinimal({
  venue,
  className,
}: {
  venue: SnT2025Venue;
  className?: string;
}) {
  return (
    <VenueCard venue={venue} compact className={className}>
      <VenueCard.Header>
        <VenueCard.Title />
        <VenueCard.Meta />
      </VenueCard.Header>
      <VenueCard.Body>
        <VenueCard.Facilities />
      </VenueCard.Body>
    </VenueCard>
  );
}

// === EXPORTS ===

export {
  VenueCard,
  VenueCardDefault,
  VenueCardCompact,
  VenueCardMinimal,
  type SnT2025Venue,
  type VenueSession,
  type DailySchedule,
};

export default VenueCard;
