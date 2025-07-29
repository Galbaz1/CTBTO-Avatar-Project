import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// === TYPES ===

interface BrandedRightCanvasProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerVariant?: 'full' | 'compact' | 'minimal';
}

interface CanvasHeaderProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

// === ANIMATION VARIANTS ===

const canvasVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// === HEADER COMPONENT ===

const CanvasHeader: React.FC<CanvasHeaderProps> = ({ 
  variant = 'full',
  className 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (variant === 'minimal') {
    return (
      <motion.header
        variants={headerVariants}
        className={cn(
          "flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-conference-200/60",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ctbto-navy rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-kiosk-sm font-semibold text-conference-900">Rosa</span>
        </div>
        <div className="text-kiosk-xs text-conference-600 font-medium">
          {formatTime(currentTime)}
        </div>
      </motion.header>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.header
        variants={headerVariants}
        className={cn(
          "p-6 bg-ctbto-card border-b border-ctbto/10",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* CTBTO Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ctbto-navy rounded-xl flex items-center justify-center shadow-ctbto">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <div className="text-kiosk-sm font-bold text-conference-900">CTBTO</div>
                <div className="text-kiosk-xs text-conference-600">SnT2025</div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-kiosk-sm font-semibold text-conference-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-kiosk-xs text-conference-600">
              Vienna, Austria
            </div>
          </div>
        </div>
      </motion.header>
    );
  }

  // Full header variant
  return (
    <motion.header
      variants={headerVariants}
      className={cn(
        "relative overflow-hidden bg-ctbto-card border-b border-ctbto/10",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-ctbto-navy/5 via-transparent to-ctbto-seafoam/5" />
      
      {/* Main Header Content */}
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          {/* Left: CTBTO Branding */}
          <div className="flex items-center gap-6">
            {/* CTBTO Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-ctbto-navy rounded-2xl flex items-center justify-center shadow-ctbto">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <div>
                <h1 className="text-kiosk-lg font-bold text-conference-900 leading-tight">
                  CTBTO
                </h1>
                <p className="text-kiosk-xs text-conference-600 font-medium">
                  Preparatory Commission
                </p>
              </div>
            </div>
            
            {/* Separator */}
            <div className="w-px h-12 bg-conference-300" />
            
            {/* SnT2025 Conference Branding */}
            <div>
              <h2 className="text-kiosk-base font-bold text-conference-900 mb-1">
                SnT2025
              </h2>
              <p className="text-kiosk-xs text-conference-600 mb-1">
                Science & Technology Conference
              </p>
              <p className="text-kiosk-xs text-conference-500">
                8-12 September 2025 • Hofburg Palace, Vienna
              </p>
            </div>
          </div>
          
          {/* Right: Time & Location */}
          <div className="text-right">
            <div className="text-kiosk-xl font-bold text-conference-900 mb-1">
              {formatTime(currentTime)}
            </div>
            <div className="text-kiosk-sm text-conference-600 mb-2">
              {formatDate(currentTime)}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 bg-ctbto-seafoam rounded-full animate-pulse" />
              <span className="text-kiosk-xs text-conference-600 font-medium">
                Live in Vienna
              </span>
            </div>
          </div>
        </div>
        
        {/* Conference Status Bar */}
        <div className="flex items-center justify-between p-4 bg-conference-50/80 rounded-xl border border-conference-200/60">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-science-physics rounded-full" />
              <span className="text-kiosk-xs font-medium text-conference-700">
                Conference Day 1
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-science-chemistry rounded-full" />
              <span className="text-kiosk-xs font-medium text-conference-700">
                1000+ Participants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-science-technology rounded-full" />
              <span className="text-kiosk-xs font-medium text-conference-700">
                50+ Sessions
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-kiosk-xs text-conference-600">Rosa Assistant</span>
            <div className="w-2 h-2 bg-ctbto-seafoam rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// === MAIN CANVAS COMPONENT ===

const BrandedRightCanvas: React.FC<BrandedRightCanvasProps> = ({
  children,
  className,
  showHeader = true,
  headerVariant = 'full'
}) => {
  return (
    <motion.div
      variants={canvasVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // === CORE LAYOUT ===
        "fixed top-0 right-0",
        "w-1/2 h-screen", // Right half of screen, full height
        "z-[100]", // Below sticky interface (z-2000)
        
        // === BACKGROUND ===
        "bg-gradient-to-br from-conference-50 via-white to-ctbto-seafoam/5",
        
        // === LAYOUT STRUCTURE ===
        "flex flex-col",
        
        className
      )}
    >
      {/* === HEADER SECTION === */}
      <AnimatePresence>
        {showHeader && (
          <CanvasHeader variant={headerVariant} />
        )}
      </AnimatePresence>
      
      {/* === CONTENT AREA === */}
      <motion.div
        variants={contentVariants}
        className={cn(
          // === CORE POSITIONING ===
          "flex-1 relative overflow-hidden",
          
          // === SPACING FOR STICKY BAR ===
          "pb-[15vh]", // Reserve space for sticky bottom bar
          
          // === CONTENT POSITIONING ===
          "flex flex-col",
        )}
      >
        {/* Content Container */}
        <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute inset-0 p-6">
            {children}
          </div>
        </div>
        
        {/* Gradient Fade for Sticky Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
      </motion.div>
    </motion.div>
  );
};

// === CARD CONTAINER WRAPPER === 

interface BrandedCardContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'single' | 'grid' | 'stack';
}

const BrandedCardContainer: React.FC<BrandedCardContainerProps> = ({
  children,
  className,
  variant = 'single'
}) => {
  return (
    <div
      className={cn(
        // === BASE LAYOUT ===
        "w-full h-full relative",
        
        // === VARIANT LAYOUTS ===
        variant === 'single' && "flex items-center justify-center p-4",
        variant === 'grid' && "grid grid-cols-1 lg:grid-cols-2 gap-6 p-6",
        variant === 'stack' && "flex flex-col gap-4 p-4 overflow-y-auto",
        
        className
      )}
    >
      {children}
    </div>
  );
};

// === RESPONSIVE HEADER VARIANTS ===

const useResponsiveHeader = () => {
  const [headerVariant, setHeaderVariant] = useState<'full' | 'compact' | 'minimal'>('full');

  useEffect(() => {
    const updateHeaderVariant = () => {
      const width = window.innerWidth;
      if (width < 1024) {
        setHeaderVariant('minimal');
      } else if (width < 1280) {
        setHeaderVariant('compact');
      } else {
        setHeaderVariant('full');
      }
    };

    updateHeaderVariant();
    window.addEventListener('resize', updateHeaderVariant);
    
    return () => window.removeEventListener('resize', updateHeaderVariant);
  }, []);

  return headerVariant;
};

// === EXPORTS ===

export {
  BrandedRightCanvas,
  BrandedCardContainer,
  CanvasHeader,
  useResponsiveHeader
};

export default BrandedRightCanvas; 