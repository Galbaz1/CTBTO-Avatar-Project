import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// === ANIMATION VARIANTS ===
const canvasVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: 50,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// === HEADER COMPONENT ===
interface BrandedHeaderProps {
  variant: 'minimal' | 'full';
}

const BrandedHeader: React.FC<BrandedHeaderProps> = ({ variant }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className={cn(
      "flex items-center justify-between",
      "px-6 py-4",
      "bg-white border-b border-gray-200/60"
    )}
  >
    {/* CTBTO Branding */}
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-7 rounded-md",
        "bg-gradient-to-br from-[#204054] to-[#7FCDCD]",
        "flex items-center justify-center",
        "text-white font-bold text-xs",
        "shadow-sm"
      )}>
        CTBTO
      </div>
      
      {variant === 'full' && (
        <div>
          <h1 className="text-lg font-semibold text-[#204054]">
            SnT2025
          </h1>
          <p className="text-xs text-gray-600">
            Conference Assistant
          </p>
        </div>
      )}
    </div>

    {/* Status Indicator */}
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-[#7FCDCD] rounded-full animate-pulse" />
      <span className="text-xs text-gray-500 font-medium">Active</span>
    </div>
  </motion.div>
);

// === MAIN COMPONENT ===
interface BrandedRightCanvasProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerVariant?: 'minimal' | 'full';
}

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
        // === CONTAINER LAYOUT ===
        "h-full w-full", // Fill parent container completely
        "flex flex-col",
        
        // === CTBTO PROFESSIONAL STYLING ===
        "bg-gradient-to-br from-white via-[#F8FFFE] to-[#E6F3F3]/20", // Subtle CTBTO seafoam gradient
        
        // === ELEGANT BORDERS ===
        "border-l-2 border-[#7FCDCD]/30", // CTBTO seafoam border
        
        // === SUBTLE SHADOWS ===
        "shadow-lg shadow-gray-200/40",
        
        // === MINIMAL DEBUG (remove after testing) ===
        process.env.NODE_ENV === 'development' && [
          "ring-1 ring-[#7FCDCD]/20"
        ],
        
        className
      )}
    >
      {/* CTBTO Header */}
      {showHeader && (
        <BrandedHeader variant={headerVariant} />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 relative",
        "overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      )}>
        {/* Content Container */}
        <div className={cn(
          "h-full w-full",
          "p-4",
          "flex flex-col gap-4"
        )}>
          {children}
        </div>

        {/* Subtle Bottom Gradient Fade */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0",
          "h-8 pointer-events-none",
          "bg-gradient-to-t from-white/60 to-transparent"
        )} />
      </div>

      {/* CTBTO Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className={cn(
          "px-6 py-3",
          "border-t border-gray-200/60",
          "bg-gradient-to-r from-[#F8FFFE] to-[#E6F3F3]/40", // Subtle CTBTO branding
          "flex items-center justify-center"
        )}
      >
        <div className="text-xs text-gray-500 text-center">
          <span className="font-medium text-[#204054]">CTBTO</span> 
          {' • '}
          <span>Preparatory Commission</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BrandedRightCanvas; 