import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '../compound/Badge';

// === TYPES & INTERFACES ===

interface PremiumTimetableSession {
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
  priority_level?: 'high' | 'medium' | 'low';
  relevance_score?: number;
  theme_code?: string; // e.g., "T1.1", "T2.3"
  scientific_field?: 'physics' | 'chemistry' | 'technology' | 'policy';
  capacity?: number;
  registration_required?: boolean;
}

interface PremiumSessionCardContextValue {
  session: PremiumTimetableSession;
  variant?: 'default' | 'compact' | 'hero' | 'keynote';
  animated?: boolean;
  className?: string;
}

// === CONTEXT ===

const PremiumSessionCardContext = createContext<PremiumSessionCardContextValue | null>(null);

const usePremiumSessionCard = () => {
  const context = useContext(PremiumSessionCardContext);
  if (!context) {
    throw new Error('PremiumSessionCard components must be used within PremiumSessionCard');
  }
  return context;
};

// === SOPHISTICATED ANIMATION SYSTEM ===

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 32,
    scale: 0.96,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.8,
      staggerChildren: 0.08,
    }
  },
  focus: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

// === UTILITY FUNCTIONS ===

const getThemeColor = (field?: string) => {
  switch (field) {
    case 'physics': return 'science-physics';
    case 'chemistry': return 'science-chemistry';
    case 'technology': return 'science-technology';
    case 'policy': return 'science-policy';
    default: return 'ctbto-navy';
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'conference-500';
  }
};

// === MAIN COMPONENT ===

interface PremiumSessionCardProps {
  session: PremiumTimetableSession;
  variant?: 'default' | 'compact' | 'hero' | 'keynote';
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
}

function PremiumSessionCard({ 
  session, 
  variant = 'default',
  animated = true, 
  className,
  children 
}: PremiumSessionCardProps) {
  const contextValue: PremiumSessionCardContextValue = {
    session,
    variant,
    animated,
    className
  };

  const isKeynote = session.session_type?.toLowerCase().includes('keynote');
  const isHighPriority = session.priority_level === 'high';

  return (
    <PremiumSessionCardContext.Provider value={contextValue}>
      <motion.article
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        whileFocus={animated ? "focus" : undefined}
        layout
        className={cn(
          // === BASE PREMIUM CARD STYLING ===
          "relative overflow-hidden",
          "bg-ctbto-card", // Gradient background from design tokens
          "border border-ctbto/20",
          "shadow-ctbto", // CTBTO-branded shadow
          
          // === SOPHISTICATED BORDER RADIUS ===
          variant === 'hero' ? 'rounded-display' : 
          variant === 'keynote' ? 'rounded-premium' : 'rounded-card',
          
          // === PREMIUM TYPOGRAPHY ===
          "font-primary", // Verdana as per CTBTO guidelines
          "text-ctbto-contrast",
          
          // === VARIANT-SPECIFIC SIZING ===
          variant === 'hero' ? 'p-8' :
          variant === 'compact' ? 'p-4' : 'p-6',
          
          // === KEYNOTE SPECIAL STYLING ===
          isKeynote && "ring-2 ring-science-keynote/20 bg-gradient-to-br from-white via-red-50/30 to-orange-50/20",
          
          // === HIGH PRIORITY ACCENT ===
          isHighPriority && "border-l-4 border-l-priority-high",
          
          // === ACCESSIBILITY ===
          "focus:outline-none focus:ring-2 focus:ring-ctbto-navy focus:ring-offset-2",
          "focus:ring-offset-white",
          
          className
        )}
        role="article"
        aria-labelledby={`session-title-${session.session_id}`}
        aria-describedby={`session-description-${session.session_id}`}
        tabIndex={0}
      >
        {/* === PREMIUM BACKGROUND EFFECTS === */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-conference-50/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-ctbto-seafoam/10 to-transparent pointer-events-none" />
        
        {/* === KEYNOTE ACCENT RIBBON === */}
        {isKeynote && (
          <div className="absolute top-4 -right-8 rotate-45 bg-science-keynote text-white text-kiosk-xs px-8 py-1 shadow-lg">
            KEYNOTE
          </div>
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.article>
    </PremiumSessionCardContext.Provider>
  );
}

// === COMPOUND COMPONENTS ===

function PremiumSessionCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  const { animated } = usePremiumSessionCard();
  
  return (
    <motion.header
      variants={animated ? contentVariants : undefined}
      className={cn("mb-6", className)}
    >
      {children}
    </motion.header>
  );
}

function PremiumSessionCardTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { session, variant } = usePremiumSessionCard();
  const displayTitle = children || session.title;
  
  return (
    <h2
      id={`session-title-${session.session_id}`}
      className={cn(
        // === SOPHISTICATED TYPOGRAPHY ===
        "font-display font-bold text-conference-900",
        "leading-tight tracking-tight",
        "mb-3",
        
        // === VARIANT-SPECIFIC SIZING ===
        variant === 'hero' ? 'text-kiosk-3xl' :
        variant === 'compact' ? 'text-kiosk-lg' : 'text-kiosk-xl',
        
        // === TEXT HANDLING ===
        variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3',
        
        className
      )}
    >
      {displayTitle}
    </h2>
  );
}

function PremiumSessionCardMeta({ className }: { className?: string }) {
  const { session, variant, animated } = usePremiumSessionCard();
  
  const badges = [
    { label: session.session_type, variant: 'default', color: getThemeColor(session.scientific_field) },
    { label: session.theme_code || session.theme, variant: 'outline', color: 'conference-600' },
    { label: `${session.duration_minutes}min`, variant: 'secondary', color: 'conference-500' },
    session.priority_level && { label: session.priority_level, variant: 'outline', color: getPriorityColor(session.priority_level) },
  ].filter(Boolean);
  
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 mb-4",
      className
    )}>
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          variants={animated ? badgeVariants : undefined}
          custom={index}
        >
          <Badge
            variant={badge.variant as any}
            className={cn(
              "text-kiosk-xs font-medium px-3 py-1",
              `bg-${badge.color}/10 text-${badge.color} border-${badge.color}/20`
            )}
          >
            {badge.label}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}

function PremiumSessionCardDescription({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { session, variant } = usePremiumSessionCard();
  const displayDescription = children || session.description;
  
  if (!displayDescription) return null;
  
  return (
    <p
      id={`session-description-${session.session_id}`}
      className={cn(
        // === PROFESSIONAL TYPOGRAPHY ===
        "text-conference-700 font-medium leading-relaxed",
        
        // === VARIANT-SPECIFIC SIZING ===
        variant === 'hero' ? 'text-kiosk-base' :
        variant === 'compact' ? 'text-kiosk-sm' : 'text-kiosk-sm',
        
        // === TEXT HANDLING ===
        variant === 'compact' ? 'line-clamp-2' : 'line-clamp-4',
        
        "mb-5",
        className
      )}
    >
      {displayDescription}
    </p>
  );
}

function PremiumSessionCardDetails({ className }: { className?: string }) {
  const { session, variant, animated } = usePremiumSessionCard();
  
  const details = [
    { icon: '📅', label: 'Date', value: session.date },
    { icon: '⏰', label: 'Time', value: `${session.start_time} - ${session.end_time}` },
    { icon: '📍', label: 'Venue', value: session.venue },
    { icon: '👥', label: 'Audience', value: session.audience_level },
  ];
  
  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn(
        "grid grid-cols-1 gap-3 mb-6",
        variant !== 'compact' && "sm:grid-cols-2",
        className
      )}
    >
      {details.map((detail, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-conference-50/80 rounded-lg border border-conference-200/60"
        >
          <span className="text-lg" role="img" aria-hidden="true">
            {detail.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-kiosk-xs text-conference-600 font-medium">
              {detail.label}
            </div>
            <div className="text-kiosk-sm font-semibold text-conference-800 truncate">
              {detail.value}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function PremiumSessionCardSpeakers({ maxSpeakers = 3, className }: { maxSpeakers?: number; className?: string }) {
  const { session, variant, animated } = usePremiumSessionCard();
  
  if (!session.speakers || session.speakers.length === 0) return null;
  
  const displaySpeakers = session.speakers.slice(0, maxSpeakers);
  const remainingCount = session.speakers.length - maxSpeakers;
  
  return (
    <motion.div
      variants={animated ? contentVariants : undefined}
      className={cn("mb-6", className)}
    >
      <h4 className="text-kiosk-sm font-semibold text-conference-800 mb-3">
        Speakers ({session.speakers.length})
      </h4>
      <div className="space-y-2">
        {displaySpeakers.map((speaker, index) => (
          <motion.div
            key={index}
            variants={animated ? badgeVariants : undefined}
            custom={index}
            className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-conference-200/40 shadow-professional"
          >
            {/* Speaker Avatar Placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-ctbto-navy to-ctbto-seafoam rounded-full flex items-center justify-center text-white font-bold text-sm">
              {speaker.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-kiosk-sm font-semibold text-conference-900 truncate">
                {speaker}
              </div>
            </div>
          </motion.div>
        ))}
        {remainingCount > 0 && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-kiosk-xs">
              +{remainingCount} more speaker{remainingCount > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PremiumSessionCardFooter({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { session, animated } = usePremiumSessionCard();
  
  const defaultFooter = (
    <div className="flex items-center justify-between pt-4 border-t border-conference-200/60">
      <div className="flex items-center gap-4">
        {session.relevance_score && (
          <div className="text-kiosk-xs text-conference-600">
            Relevance: <span className="font-semibold">{(session.relevance_score * 100).toFixed(0)}%</span>
          </div>
        )}
        {session.is_interactive && (
          <Badge variant="outline" className="text-kiosk-xs bg-science-technology/10 text-science-technology border-science-technology/20">
            Interactive
          </Badge>
        )}
      </div>
      {session.registration_required && (
        <Badge variant="default" className="text-kiosk-xs bg-priority-medium text-white">
          Registration Required
        </Badge>
      )}
    </div>
  );
  
  return (
    <motion.footer
      variants={animated ? contentVariants : undefined}
      className={cn("mt-6", className)}
    >
      {children || defaultFooter}
    </motion.footer>
  );
}

// === COMPOUND COMPONENT ASSIGNMENT ===

PremiumSessionCard.Header = PremiumSessionCardHeader;
PremiumSessionCard.Title = PremiumSessionCardTitle;
PremiumSessionCard.Meta = PremiumSessionCardMeta;
PremiumSessionCard.Description = PremiumSessionCardDescription;
PremiumSessionCard.Details = PremiumSessionCardDetails;
PremiumSessionCard.Speakers = PremiumSessionCardSpeakers;
PremiumSessionCard.Footer = PremiumSessionCardFooter;

// === PRESET LAYOUTS ===

function PremiumSessionCardDefault({ session, className }: { session: PremiumTimetableSession; className?: string }) {
  return (
    <PremiumSessionCard session={session} variant="default" className={className}>
      <PremiumSessionCard.Header>
        <PremiumSessionCard.Title />
        <PremiumSessionCard.Meta />
      </PremiumSessionCard.Header>
      <PremiumSessionCard.Description />
      <PremiumSessionCard.Details />
      <PremiumSessionCard.Speakers maxSpeakers={3} />
      <PremiumSessionCard.Footer />
    </PremiumSessionCard>
  );
}

function PremiumSessionCardHero({ session, className }: { session: PremiumTimetableSession; className?: string }) {
  return (
    <PremiumSessionCard session={session} variant="hero" className={className}>
      <PremiumSessionCard.Header>
        <PremiumSessionCard.Title />
        <PremiumSessionCard.Meta />
      </PremiumSessionCard.Header>
      <PremiumSessionCard.Description />
      <PremiumSessionCard.Details />
      <PremiumSessionCard.Speakers maxSpeakers={5} />
      <PremiumSessionCard.Footer />
    </PremiumSessionCard>
  );
}

function PremiumSessionCardCompact({ session, className }: { session: PremiumTimetableSession; className?: string }) {
  return (
    <PremiumSessionCard session={session} variant="compact" className={className}>
      <PremiumSessionCard.Header>
        <PremiumSessionCard.Title />
        <PremiumSessionCard.Meta />
      </PremiumSessionCard.Header>
      <PremiumSessionCard.Description />
      <PremiumSessionCard.Details />
      <PremiumSessionCard.Footer />
    </PremiumSessionCard>
  );
}

// === EXPORTS ===

export {
  PremiumSessionCard,
  PremiumSessionCardDefault,
  PremiumSessionCardHero,
  PremiumSessionCardCompact,
  type PremiumTimetableSession
};

export default PremiumSessionCard; 