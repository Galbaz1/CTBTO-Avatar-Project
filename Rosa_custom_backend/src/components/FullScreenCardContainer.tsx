import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardData } from '../types/cards';
import { WeatherCard } from './WeatherCard';
import { EnhancedSessionCard } from './cards/enhanced/SessionCard';
import { SpeakerCard } from './cards/enhanced/SpeakerCard';
import { TopicCard } from './cards/enhanced/TopicCard';

interface FullScreenCardContainerProps {
  cards: CardData[];
  maxCards?: number;
  onCloseWeather?: () => void;
  onCloseRag?: () => void;
}

export const FullScreenCardContainer: React.FC<FullScreenCardContainerProps> = ({ 
  cards, 
  maxCards = 4,
  onCloseWeather,
  onCloseRag
}) => {
  // Optimized logging - only log when cards actually change
  const lastCardHash = useRef<string>('');
  const currentCardHash = JSON.stringify(cards.map(c => ({ id: c.id, type: c.type })));
  
  if (currentCardHash !== lastCardHash.current) {
    const cardSummary = cards.map(c => `${c.type}(${c.id})`).join(', ');
    console.log(`🎯 Cards: [${cardSummary}] (${cards.length})`);
    console.log(`🎯 Container position: right half (50vw), top: 60px, height: calc(85vh - 60px)`);
    lastCardHash.current = currentCardHash;
  }

  // Determine layout mode based on card count and types
  const layoutMode = useMemo(() => {
    const activeCards = cards.slice(0, maxCards);
    const hasHeroCard = activeCards.some(card => card.size === 'hero');
    
    if (hasHeroCard) return 'hero';
    if (activeCards.length === 1) return 'single';
    if (activeCards.length === 2) return 'dual';
    if (activeCards.length <= 4) return 'grid';
    return 'cascade';
  }, [cards, maxCards]);

  // Right-side split layout styles (matching StickyInterface positioning)
  const containerStyles = useMemo(() => {
    const baseStyles = {
      position: 'fixed' as const,
      top: '60px', // Account for the header height
      left: '50%', // Start from middle of screen (right half)
      right: 0,
      width: '50vw', // Take up right half of screen
      height: 'calc(85vh - 60px)', // Use 85% of screen minus header, leave 15vh for sticky bar
      pointerEvents: 'none' as const,
      zIndex: 500,
    };

    // Always use single card layout
    return {
      ...baseStyles,
      padding: '16px', // Small padding for breathing room
      // Temporary debug styling to ensure container is visible
      border: cards.length > 0 ? '2px solid #10b981' : '1px dashed #d1d5db',
      background: cards.length > 0 ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
    };
  }, [layoutMode, cards.length]);

  // Position calculator - always single card taking available container space
  const getCardPosition = useMemo(() => {
    return (index: number) => {
      // Single card layout: uses full available space within the container
      return {
        pointerEvents: 'auto' as const,
        position: 'absolute' as const,
        top: '16px', // Small padding from top
        left: '16px', // Small padding from left
        width: 'calc(100% - 32px)', // Full width minus padding
        height: 'calc(100% - 32px)', // Full height minus padding
        zIndex: 1000,
      };
    };
  }, []);

  // Animation variants for smooth transitions
  const cardVariants = {
    enter: (custom: number) => ({
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        delay: custom * 0.1,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }),
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -30,
      transition: {
        duration: 0.3
      }
    }
  };

  if (cards.length === 0) {
    // Show empty container for debugging
    return (
      <div style={containerStyles}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          No cards to display
        </div>
      </div>
    );
  }

  const handleCardClose = (card: CardData) => {
    switch (card.type) {
      case 'weather':
        onCloseWeather?.();
        break;
      case 'session':
      case 'speaker':
      case 'topic':
        onCloseRag?.();
        break;
      default:
        console.log(`No close handler for card type: ${card.type}`);
        break;
    }
  };

  // Helper function to render actual card content - moved inside component for scope access
  const renderCardContent = (card: CardData, layoutMode: string) => {
    // Only log card rendering on card changes, not every render
    const compact = layoutMode === 'grid' || layoutMode === 'cascade';
    
    try {
      switch (card.type) {
      case 'weather':
        return (
          <WeatherCard
            weatherData={card.content}
            onClose={onCloseWeather}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '16px',
              fontSize: compact ? '14px' : '16px'
            }}
          />
        );
        
      case 'session':
        return (
          <EnhancedSessionCard
            session={card.content}
            compact={compact}
            showSpeakers={true}
            showVenue={true}
            showTiming={true}
            showDescription={!compact}
            onSpeakerClick={(speaker) => console.log('Speaker clicked:', speaker)}
            onClose={onCloseRag}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '16px'
            }}
          />
        );
        
      case 'speaker':
        return (
          <SpeakerCard
            speaker={card.content}
            compact={compact}
            showSessions={!compact}
            onSessionClick={(session) => console.log('Session clicked:', session)}
            onTopicClick={(topic) => console.log('Topic clicked:', topic)}
            onClose={onCloseRag}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '16px'
            }}
          />
        );
        
      case 'topic':
        return (
          <TopicCard
            topic={card.content}
            compact={compact}
            onClose={onCloseRag}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '16px'
            }}
          />
        );
        
      default:
        // Fallback for unknown card types
        console.log(`⚠️ Unknown card type: ${card.type}`, { 
          cardId: card.id, 
          hasContent: !!card.content,
          contentKeys: card.content ? Object.keys(card.content) : []
        });
        return (
          <div style={{
            background: `linear-gradient(135deg, ${getCardGradient(card.type)})`,
            height: '100%',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '2em', marginBottom: '16px' }}>
              {card.type.toUpperCase()} CARD
            </h2>
            <p style={{ fontSize: '1.2em', opacity: 0.9 }}>
              Full-screen layout • {layoutMode} mode
            </p>
            <p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '12px' }}>
              Card ID: {card.id}
            </p>
          </div>
        );
      }
    } catch (error) {
      console.error(`❌ Card rendering error:`, {
        cardType: card.type,
        cardId: card.id,
        error: error,
        contentPreview: card.content ? JSON.stringify(card.content).substring(0, 100) + '...' : 'No content'
      });
      
      // Return error fallback
      return (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          height: '100%',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '2em', marginBottom: '16px' }}>
            ⚠️ Card Error
          </h2>
          <p style={{ fontSize: '1.2em', opacity: 0.9 }}>
            Failed to render {card.type} card
          </p>
          <p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '12px' }}>
            Check console for details
          </p>
        </div>
      );
    }
  };

  return (
    <div style={containerStyles}>
      <AnimatePresence mode="popLayout">
        {cards.slice(0, maxCards).map((card, index) => (
          <motion.div
            key={card.id}
            custom={index}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
            style={{
              ...getCardPosition(index),
              borderRadius: '20px',
              boxShadow: layoutMode === 'hero' 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              background: 'white',
              overflow: 'hidden',
            }}
          >
            {/* Replace placeholder with actual card components */}
            <div style={{ 
              width: '100%', 
              height: '100%',
              fontSize: layoutMode === 'hero' ? '18px' : '16px',
            }}>
              {renderCardContent(card, layoutMode)}
            </div>

            {/* Close button for full-screen cards */}
            <button
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'rgba(0, 0, 0, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                pointerEvents: 'auto',
                zIndex: 1001,
              }}
              onClick={() => handleCardClose(card)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
              }}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Layout mode indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none',
        zIndex: 1001,
      }}>
        {layoutMode.toUpperCase()} LAYOUT • {cards.length} CARDS
      </div>
    </div>
  );
};

// Helper function for card-specific gradients
function getCardGradient(cardType: string): string {
  switch (cardType) {
    case 'weather':
      return '#667eea 0%, #764ba2 100%';
    case 'session':
      return '#f093fb 0%, #f5576c 100%';
    case 'speaker':
      return '#4facfe 0%, #00f2fe 100%';
    case 'topic':
      return '#43e97b 0%, #38f9d7 100%';
    case 'floor-plan':
      return '#fa709a 0%, #fee140 100%';
    case 'qr-schedule':
      return '#a8edea 0%, #fed6e3 100%';
    case 'live-status':
      return '#ff9a9e 0%, #fecfef 100%';
    default:
      return '#667eea 0%, #764ba2 100%';
  }
} 