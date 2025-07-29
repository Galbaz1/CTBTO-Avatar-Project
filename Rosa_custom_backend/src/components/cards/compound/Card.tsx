import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardContextType = {
  compact: boolean;
};

const CardContext = createContext<CardContextType | undefined>(undefined);

const useCard = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCard must be used within a Card component');
  }
  return context;
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  style?: React.CSSProperties;
};

/**
 * 🆕 PHASE 1: Enhanced Card with sophisticated layout animations
 * Supports micro-updates and delta-driven state changes
 */
const cardVariants: any = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  updated: {
    scale: [1, 1.02, 1],
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const Card = ({ children, className, compact = false, style }: CardProps) => {
  return (
    <CardContext.Provider value={{ compact }}>
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        className={cn(
          'bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden',
          compact ? 'p-3' : 'p-5',
          className
        )}
        style={style}
      >
        {children}
      </motion.div>
    </CardContext.Provider>
  );
};

// --- Compound Components ---

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

const Header = ({ children, className }: CardHeaderProps) => (
  <motion.div 
    className={cn('flex justify-between items-start mb-3', className)}
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    {children}
  </motion.div>
);

type CardTitleProps = {
    children: React.ReactNode;
    className?: string;
  };
  
const Title = ({ children, className }: CardTitleProps) => {
    const { compact } = useCard();
    return (
        <motion.h3 
          className={cn('font-bold text-gray-900', compact ? 'text-base' : 'text-lg', className)}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
        {children}
        </motion.h3>
    );
};

type CardBodyProps = {
    children: React.ReactNode;
    className?: string;
};

const Body = ({ children, className }: CardBodyProps) => (
    <motion.div 
      className={cn('space-y-3', className)}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, staggerChildren: 0.05 }}
    >
      {children}
    </motion.div>
);

type CardFooterProps = {
    children: React.ReactNode;
    className?: string;
};

const Footer = ({ children, className }: CardFooterProps) => (
  <motion.div 
    className={cn('mt-4 pt-3 border-t border-gray-100', className)}
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    {children}
  </motion.div>
);

// --- Assigning Compound Components ---
Card.Header = Header;
Card.Title = Title;
Card.Body = Body;
Card.Footer = Footer;

export { Card, useCard }; 