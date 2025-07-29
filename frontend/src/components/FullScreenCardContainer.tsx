// @ts-nocheck
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import BrandedRightCanvas from "./BrandedRightCanvas";

// === TYPES ===

export interface CardData {
  id: string;
  type: "session" | "speaker" | "venue" | "topic" | "weather" | "schedule";
  size?: "small" | "medium" | "large" | "hero";
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
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const cardItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// === LAYOUT CALCULATOR ===

const useCardLayout = (cards: CardData[], maxCards: number) => {
  return React.useMemo(() => {
    const activeCards = cards.slice(0, maxCards);
    const hasHeroCard = activeCards.some((card) => card.size === "hero");

    // Determine layout variant based on card count and types
    let layoutVariant: "single" | "grid" | "stack" = "single";

    if (activeCards.length === 0) {
      layoutVariant = "single";
    } else if (activeCards.length === 1) {
      layoutVariant = "single";
    } else if (activeCards.length <= 4) {
      layoutVariant = "stack";
    } else {
      layoutVariant = "grid";
    }

    // Grid configuration for responsive layouts
    const gridConfig = {
      columns: activeCards.length <= 2 ? 1 : 2,
      gap: hasHeroCard ? "gap-8" : "gap-6",
      sizing: hasHeroCard ? "auto-rows-fr" : "auto-rows-max",
    };

    return {
      layoutVariant,
      activeCards,
      hasHeroCard,
      gridConfig,
    };
  }, [cards, maxCards]);
};

// === MAIN COMPONENT ===

export const FullScreenCardContainer: React.FC<
  FullScreenCardContainerProps
> = ({
  cards,
  maxCards = 4,
  onCloseWeather,
  onCloseRag,
  className,
  showHeader = true,
}) => {
  // Optimized logging - only log when cards actually change
  const lastCardHash = useRef<string>("");
  const currentCardHash = JSON.stringify(
    cards.map((c) => ({ id: c.id, type: c.type })),
  );

  if (currentCardHash !== lastCardHash.current) {
    const cardSummary = cards.map((c) => `${c.type}(${c.id})`).join(", ");
    console.log(`🎯 Cards: [${cardSummary}] (${cards.length})`);
    console.log(`🎯 Using BrandedRightCanvas layout with professional header`);

    // Enhanced debugging for card visibility issues
    console.log(
      `🔧 [DEBUG] Cards data:`,
      cards.map((c) => ({
        id: c.id,
        type: c.type,
        component: c.component,
      })),
    );
    lastCardHash.current = currentCardHash;
  }

  // Get card layout configuration
  const { layoutVariant, activeCards, hasHeroCard, gridConfig } = useCardLayout(
    cards,
    maxCards,
  );

  // Log card render events
  cards.forEach((card) => {
    console.log(
      `[CARD_RENDER]`,
      JSON.stringify({
        type: card.type,
        id: card.id,
        size: card.size,
        timestamp: Date.now(),
      }),
    );
  });

  return (
    <BrandedRightCanvas
      showHeader={showHeader}
      headerVariant="full"
      className={className}
    >
      {/* Simple debug indicator - less intrusive */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          🚨 CARDS DEBUG: {cards.length} cards
        </div>
      )}

      {/* Cards Container */}
      <div className="flex flex-col gap-4 h-full overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activeCards.map((card, index) => {
            const CardComponent = getCardComponent(card.type);

            if (!CardComponent) {
              console.warn(`❌ No component found for card type: ${card.type}`);
              return (
                <div
                  key={card.id}
                  className="p-4 border border-red-300 bg-red-50 rounded-lg"
                >
                  <p className="text-red-600 text-sm">
                    Missing component for card type: {card.type}
                  </p>
                </div>
              );
            }

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                  delay: index * 0.1,
                }}
                className="w-full"
              >
                <CardComponent
                  key={`${card.type}-${card.id}`}
                  {...(card.data || {})}
                  onClose={
                    card.type === "weather" ? onCloseWeather : onCloseRag
                  }
                  className="w-full"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </BrandedRightCanvas>
  );
};

export default FullScreenCardContainer;
