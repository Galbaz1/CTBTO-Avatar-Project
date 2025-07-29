import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioWave } from './cvi/components/audio-wave';

// === TYPES ===

interface Caption {
  speaker: 'user' | 'rosa';
  text: string;
  timestamp: number;
}

interface StickyInterfaceProps {
  meetingState: string;
  conversationId?: string;
  isUserSpeaking?: boolean;
  isRosaSpeaking?: boolean;
}

// === CUSTOM HOOK FOR SESSION ID ===

const useLocalSessionId = () => {
  // Mock implementation - replace with actual session ID logic
  return 'mock-session-id';
};

// === ANIMATION VARIANTS ===

const interfaceVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

const suggestionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

// === MAIN COMPONENT ===

export const StickyInterface: React.FC<StickyInterfaceProps> = ({
  meetingState,
  conversationId: _conversationId,
  isUserSpeaking = false,
  isRosaSpeaking = false
}) => {
  const [recentCaptions, setRecentCaptions] = useState<Caption[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  
  // Get the local participant ID for the AudioWave component
  const localSessionId = useLocalSessionId();

  // Enhanced suggestions for SnT2025 Conference
  const hardCodedSuggestions = [
    "Show me today's keynote sessions",
    "Find speakers in nuclear detection",
    "What's happening in the Festsaal?",
    "Tell me about seismic monitoring",
    "Show sessions about AI and machine learning",
    "Find workshops on data analysis",
    "What networking events are available?",
    "Show me the conference schedule"
  ];

  // Rotate suggestions every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => 
        (prev + 1) % hardCodedSuggestions.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [hardCodedSuggestions.length]);

  // Mock caption simulation for Phase 1 (will be replaced with real transcription)
  useEffect(() => {
    if (isUserSpeaking) {
      const mockUserCaption: Caption = {
        speaker: 'user',
        text: 'User is speaking...',
        timestamp: Date.now()
      };
      setRecentCaptions(prev => [mockUserCaption, ...prev.slice(0, 4)]);
    }
    
    if (isRosaSpeaking) {
      const mockRosaCaption: Caption = {
        speaker: 'rosa',
        text: 'Rosa is responding...',
        timestamp: Date.now()
      };
      setRecentCaptions(prev => [mockRosaCaption, ...prev.slice(0, 4)]);
    }
  }, [isUserSpeaking, isRosaSpeaking]);

  // Only show when in meeting state
  if (meetingState !== 'connected') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={interfaceVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          // === CORE POSITIONING ===
          "fixed bottom-0 right-0",
          "w-1/2 h-[15vh]", // Right half, 15% of viewport height
          "z-[2000]", // Above everything else
          
          // === PROFESSIONAL STYLING ===
          "bg-ctbto-card",
          "border-t border-ctbto/10",
          "shadow-premium backdrop-blur-lg",
          
          // === LAYOUT ===
          "flex items-center justify-between",
          "px-8 py-4"
        )}
      >
        {/* === LEFT SECTION: USER AUDIO & CAPTIONS === */}
        <div className="flex-1 flex items-center gap-6">
          {/* User Audio Wave */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {/* Speaking Indicator */}
            <div 
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isUserSpeaking 
                  ? "bg-ctbto-seafoam shadow-lg shadow-ctbto-seafoam/40 animate-pulse" 
                  : "bg-conference-300"
              )}
            />
            
            {/* Audio Wave Visualization */}
            <div className="flex-1 h-10 flex items-center justify-center scale-150 origin-center">
              {localSessionId && <AudioWave id={localSessionId} />}
            </div>
            
            {/* User Label */}
            <span className={cn(
              "text-kiosk-xs font-semibold transition-colors duration-300",
              isUserSpeaking ? "text-ctbto-seafoam" : "text-conference-600"
            )}>
              You
            </span>
          </div>

          {/* User Captions */}
          <div className="flex-1 max-w-md">
            <AnimatePresence mode="wait">
              {recentCaptions
                .filter(caption => caption.speaker === 'user')
                .slice(0, 2)
                .map((caption, index) => (
                  <motion.div
                    key={caption.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "mb-1 transition-all duration-300",
                      index === 0 ? "text-kiosk-sm text-conference-900 font-medium" : "text-kiosk-xs text-conference-600"
                    )}
                  >
                    {caption.text}
                  </motion.div>
                ))
              }
              {recentCaptions.filter(c => c.speaker === 'user').length === 0 && (
                <div className="text-kiosk-xs text-conference-500 italic">
                  Your voice will appear here...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* === CENTER SECTION: SUGGESTION PROMPTS === */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3 px-8 max-w-sm">
          <div className="text-kiosk-xs text-conference-600 font-semibold uppercase tracking-wide">
            Try asking
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSuggestionIndex}
              variants={suggestionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                // === PROFESSIONAL BUTTON STYLING ===
                "bg-ctbto-navy text-white",
                "rounded-2xl px-6 py-3",
                "text-kiosk-sm font-medium text-center",
                "shadow-ctbto cursor-pointer select-none",
                "transition-all duration-300",
                "hover:bg-ctbto-navy/90 hover:scale-105 hover:shadow-elevated",
                "active:scale-95"
              )}
              onClick={() => {
                // TODO: Trigger voice input with suggestion
                console.log('🎤 Suggested phrase:', hardCodedSuggestions[currentSuggestionIndex]);
              }}
            >
              "{hardCodedSuggestions[currentSuggestionIndex]}"
            </motion.div>
          </AnimatePresence>

          {/* Suggestion Dots Indicator */}
          <div className="flex gap-2">
            {hardCodedSuggestions.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentSuggestionIndex 
                    ? "bg-ctbto-navy scale-125" 
                    : "bg-conference-300 hover:bg-conference-400"
                )}
                onClick={() => setCurrentSuggestionIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* === RIGHT SECTION: ROSA AUDIO & CAPTIONS === */}
        <div className="flex-1 flex items-center gap-6 justify-end">
          {/* Rosa Captions */}
          <div className="flex-1 max-w-md text-right">
            <AnimatePresence mode="wait">
              {recentCaptions
                .filter(caption => caption.speaker === 'rosa')
                .slice(0, 2)
                .map((caption, index) => (
                  <motion.div
                    key={caption.timestamp}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "mb-1 transition-all duration-300",
                      index === 0 ? "text-kiosk-sm text-conference-900 font-medium" : "text-kiosk-xs text-conference-600"
                    )}
                  >
                    {caption.text}
                  </motion.div>
                ))
              }
              {recentCaptions.filter(c => c.speaker === 'rosa').length === 0 && (
                <div className="text-kiosk-xs text-conference-500 italic">
                  Rosa's responses will appear here...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Rosa Audio Wave */}
          <div className="flex items-center gap-3 min-w-[200px] justify-end">
            {/* Rosa Label */}
            <span className={cn(
              "text-kiosk-xs font-semibold transition-colors duration-300",
              isRosaSpeaking ? "text-ctbto-navy" : "text-conference-600"
            )}>
              Rosa
            </span>
            
            {/* Audio Wave Visualization */}
            <div className="flex-1 h-10 flex items-center justify-center scale-150 origin-center">
              {/* Rosa's audio wave would go here */}
              <div className={cn(
                "w-full h-1 rounded-full transition-all duration-300",
                isRosaSpeaking 
                  ? "bg-gradient-to-r from-ctbto-navy via-ctbto-seafoam to-ctbto-navy animate-pulse"
                  : "bg-conference-200"
              )} />
            </div>
            
            {/* Speaking Indicator */}
            <div 
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isRosaSpeaking 
                  ? "bg-ctbto-navy shadow-lg shadow-ctbto-navy/40 animate-pulse" 
                  : "bg-conference-300"
              )}
            />
          </div>
        </div>

        {/* === BRANDING ELEMENT === */}
        <div className="absolute top-2 right-4 flex items-center gap-2 opacity-60">
          <div className="w-4 h-4 bg-ctbto-navy rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-kiosk-xs text-conference-600 font-medium">
            SnT2025
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 