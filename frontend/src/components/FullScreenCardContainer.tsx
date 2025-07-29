// @ts-nocheck
import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BrandedRightCanvas, { BrandedCardContainer, useResponsiveHeader } from './BrandedRightCanvas';

// === TYPES ===

export interface CardData {
  id: string;
  type: 'session' | 'speaker' | 'venue' | 'topic' | 'weather' | 'schedule';
  size?: 'small' | 'medium' | 'large' | 'hero';
  data: any;
  component: React.ComponentType<any>;
  priority?: number;
  timestamp?: number;
}

interface FullScreenCardContainerProps {
  cards: CardData[];
  maxCards?: number;
  onCloseWeather?: () => void;
  onCloseRag?: () => void;
  className?: string;
  showHeader?: boolean;
}

// === ANIMATION VARIANTS ===

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const cardItemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

// === LAYOUT CALCULATOR ===

const useCardLayout = (cards: CardData[], maxCards: number) => {
  return useMemo(() => {
    const activeCards = cards.slice(0, maxCards);
    const hasHeroCard = activeCards.some(card => card.size === 'hero');
    
    // Determine layout variant
    let layoutVariant: 'single' | 'grid' | 'stack';
    
    if (hasHeroCard || activeCards.length === 1) {
      layoutVariant = 'single';
    } else if (activeCards.length === 2) {
      layoutVariant = 'grid';
    } else {
      layoutVariant = 'stack';
    }
    
    return {
      layoutVariant,
      activeCards,
      hasHeroCard
    };
  }, [cards, maxCards]);
};

// === MAIN COMPONENT ===

export const FullScreenCardContainer: React.FC<FullScreenCardContainerProps> = ({
  cards, 
  maxCards = 4,
  onCloseWeather,
  onCloseRag,
  className,
  showHeader = true
}) => {
  // Optimized logging - only log when cards actually change
  const lastCardHash = useRef<string>('');
  const currentCardHash = JSON.stringify(cards.map(c => ({ id: c.id, type: c.type })));
  
  if (currentCardHash !== lastCardHash.current) {
    const cardSummary = cards.map(c => `${c.type}(${c.id})`).join(', ');
    console.log(`🎯 Cards: [${cardSummary}] (${cards.length})`);
    console.log(`🎯 Using BrandedRightCanvas layout with professional header`);
    
    // Machine-readable logging for AI agents
    if (process.env.NODE_ENV === 'development') {
      cards.forEach(card => {
        console.log('[CARD_RENDER]', JSON.stringify({
          type: card.type,
          id: card.id,
          size: card.size,
          timestamp: Date.now()
        }));
      });
    }
    
    lastCardHash.current = currentCardHash;
  }

  // Calculate layout
  const { layoutVariant, activeCards, hasHeroCard } = useCardLayout(cards, maxCards);
  
  // Get responsive header variant
  const headerVariant = useResponsiveHeader();

  // Don't render if no cards
  if (activeCards.length === 0) {
    return (
      <BrandedRightCanvas 
        showHeader={showHeader} 
        headerVariant={headerVariant}
        className={className}
      >
        <BrandedCardContainer variant="single">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 bg-conference-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-conference-400 text-3xl">💬</span>
            </div>
            <h3 className="text-kiosk-lg font-semibold text-conference-700 mb-3">
              Ready to Help
            </h3>
            <p className="text-kiosk-sm text-conference-600 max-w-md">
              Ask me about sessions, speakers, venues, or anything about the SnT2025 conference.
            </p>
          </motion.div>
        </BrandedCardContainer>
      </BrandedRightCanvas>
    );
  }

  return (
    <BrandedRightCanvas 
      showHeader={showHeader} 
      headerVariant={headerVariant}
      className={className}
    >
      <BrandedCardContainer variant={layoutVariant}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`layout-${layoutVariant}-${activeCards.length}`}
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "w-full h-full",
              // Layout-specific classes
              layoutVariant === 'single' && "flex items-center justify-center",
              layoutVariant === 'grid' && "grid grid-cols-1 lg:grid-cols-2 gap-6",
              layoutVariant === 'stack' && "flex flex-col gap-4 overflow-y-auto"
            )}
          >
            {activeCards.map((card, index) => {
              const CardComponent = card.component;
              
              return (
                <motion.div
                  key={card.id}
                  variants={cardItemVariants}
                  layout
                  className={cn(
                    // Base card wrapper styling
                    "relative",
                    
                    // Size-based styling
                    card.size === 'hero' && "col-span-full",
                    
                    // Layout-specific sizing
                    layoutVariant === 'single' && "w-full max-w-4xl",
                    layoutVariant === 'grid' && "w-full",
                    layoutVariant === 'stack' && "w-full flex-shrink-0",
                    
                    // Professional card styling
                    "premium-card-base"
                  )}
                  style={{
                    // Dynamic sizing based on layout
                    ...(layoutVariant === 'single' && {
                      maxHeight: hasHeroCard ? '90%' : '80%'
                    }),
                    ...(layoutVariant === 'stack' && {
                      minHeight: '300px',
                      maxHeight: '500px'
                    })
                  }}
                >
                  {/* Card Content */}
                  <div className="relative w-full h-full overflow-hidden">
                    <CardComponent 
                      {...card.data} 
                      onClose={() => {
                        // Handle specific card closures
                        if (card.type === 'weather' && onCloseWeather) {
                          onCloseWeather();
                        } else if (onCloseRag) {
                          onCloseRag();
                        }
                      }}
                      compact={layoutVariant === 'stack'}
                      variant={hasHeroCard ? 'hero' : 'default'}
                    />
                  </div>
                  
                  {/* Card Index Indicator (for debugging in development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-ctbto-navy/80 text-white text-xs rounded-full flex items-center justify-center font-bold z-10">
                      {index + 1}
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {/* Loading placeholder for additional cards */}
            {cards.length > maxCards && (
              <motion.div
                variants={cardItemVariants}
                className="premium-card-base p-6 bg-conference-50/50 border-dashed border-2 border-conference-300 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-conference-400 text-2xl mb-2">⏳</div>
                  <p className="text-kiosk-sm text-conference-600">
                    +{cards.length - maxCards} more cards available
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </BrandedCardContainer>
    </BrandedRightCanvas>
  );
};

export default FullScreenCardContainer; 