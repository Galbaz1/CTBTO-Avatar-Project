import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BrandedRightCanvas, { BrandedCardContainer, useResponsiveHeader } from './BrandedRightCanvas';
import { StickyInterface } from './StickyInterface';
import { PremiumSessionCardDefault, PremiumSessionCardHero, PremiumSessionCardCompact, type PremiumTimetableSession } from './cards/enhanced/PremiumSessionCard';
import { SpeakerCardDefault, type SnT2025Speaker } from './cards/enhanced/SpeakerCard';

// === SAMPLE DATA FOR DEMO ===

const sampleSessionData: PremiumTimetableSession[] = [
  {
    session_id: "S001",
    title: "Advanced Nuclear Detection Technologies for CTBT Monitoring",
    description: "Explore cutting-edge detection methods and AI-driven analysis systems that enhance the Comprehensive Test Ban Treaty monitoring capabilities. This keynote presentation covers recent breakthroughs in seismic, hydroacoustic, and radionuclide detection systems.",
    start_time: "09:00",
    end_time: "10:30",
    duration: 90,
    date: "2025-09-08",
    venue: "Festsaal, Hofburg Palace",
    session_type: "Keynote Presentation",
    speakers: ["Dr. Elena Rodriguez", "Prof. Ahmad Hassan", "Dr. Sarah Chen"],
    theme: "Nuclear Detection Technologies",
    track: "T1.1",
    audience_level: "Expert",
    day_of_week: "Monday",
    time_of_day: "Morning",
    duration_minutes: 90,
    has_speakers: true,
    is_interactive: true,
    keywords: ["nuclear detection", "AI analysis", "seismic monitoring"],
    priority_level: "high",
    relevance_score: 0.95,
    theme_code: "T1.1",
    scientific_field: "physics",
    capacity: 500,
    registration_required: true
  },
  {
    session_id: "S002",
    title: "Machine Learning Applications in Seismic Data Analysis",
    description: "Deep learning algorithms are revolutionizing how we process and interpret seismic data for nuclear explosion detection. This technical workshop demonstrates practical implementations of neural networks in real-time monitoring systems.",
    start_time: "14:00",
    end_time: "15:30",
    duration: 90,
    date: "2025-09-08",
    venue: "Prinz Eugen Saal",
    session_type: "Technical Workshop",
    speakers: ["Dr. Michael Chen", "Prof. Sarah Kim"],
    theme: "AI and Machine Learning",
    track: "T2.1",
    audience_level: "Intermediate",
    day_of_week: "Monday",
    time_of_day: "Afternoon",
    duration_minutes: 90,
    has_speakers: true,
    is_interactive: true,
    keywords: ["machine learning", "seismic analysis", "AI"],
    priority_level: "medium",
    relevance_score: 0.88,
    theme_code: "T2.1",
    scientific_field: "technology",
    capacity: 100,
    registration_required: false
  },
  {
    session_id: "S003",
    title: "International Policy Implications of CTBT Implementation",
    description: "A comprehensive panel discussion examining the geopolitical and diplomatic challenges in achieving universal ratification of the Comprehensive Test Ban Treaty.",
    start_time: "16:00",
    end_time: "17:00",
    duration: 60,
    date: "2025-09-08",
    venue: "Conference Room A",
    session_type: "Panel Discussion",
    speakers: ["Ambassador Lisa Williams", "Dr. Roberto Martinez", "Prof. Yuki Tanaka"],
    theme: "Policy and Diplomacy",
    track: "T3.1",
    audience_level: "All Levels",
    day_of_week: "Monday",
    time_of_day: "Afternoon",
    duration_minutes: 60,
    has_speakers: true,
    is_interactive: false,
    keywords: ["policy", "diplomacy", "treaty"],
    priority_level: "low",
    relevance_score: 0.75,
    theme_code: "T3.1",
    scientific_field: "policy",
    capacity: 200,
    registration_required: false
  }
];

const sampleSpeakerData: SnT2025Speaker = {
  name: "Dr. Elena Rodriguez",
  title: "Senior Nuclear Physicist",
  organization: "CTBTO Preparatory Commission",
  country: "Austria",
  bio: "Dr. Rodriguez is a leading expert in nuclear detection technologies with over 15 years of experience in developing advanced monitoring systems for the CTBT verification regime. Her research focuses on improving the sensitivity and accuracy of radionuclide detection networks.",
  expertise: ["Nuclear Physics", "Seismic Analysis", "AI Detection Systems", "Radionuclide Monitoring", "Signal Processing"],
  sessions: [
    {
      session_id: "S001",
      title: "Advanced Nuclear Detection Technologies for CTBT Monitoring",
      time: "09:00",
      date: "2025-09-08",
      venue: "Festsaal",
      session_type: "Keynote",
      theme: "T1.1",
      duration: 90,
      co_speakers: ["Prof. Ahmad Hassan", "Dr. Sarah Chen"]
    },
    {
      session_id: "S004",
      title: "Future Developments in Monitoring Networks",
      time: "11:00",
      date: "2025-09-09",
      venue: "Prinz Eugen Saal",
      session_type: "Technical Session",
      theme: "T1.2",
      duration: 60
    }
  ],
  sessionCount: 3,
  themes: ["T1.1", "T1.2", "T2.1"],
  venues: ["Festsaal", "Prinz Eugen Saal"],
  sessionTypes: ["Keynote", "Panel Discussion", "Workshop"],
  totalDuration: 240,
  isKeynote: true,
  research_areas: ["Nuclear Detection", "Signal Processing", "Network Optimization"],
  experience_level: "expert",
  priority_level: "high",
  relevance_score: 0.98
};

// === LAYOUT VARIANTS ===

type LayoutVariant = 'hero' | 'standard' | 'grid' | 'showcase';

interface LayoutOption {
  id: LayoutVariant;
  name: string;
  description: string;
  icon: string;
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'hero',
    name: 'Hero Layout',
    description: 'Single large card with maximum impact',
    icon: '🎯'
  },
  {
    id: 'standard',
    name: 'Standard Layout',
    description: 'Information-rich single card display',
    icon: '📋'
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Multiple cards in responsive grid',
    icon: '📊'
  },
  {
    id: 'showcase',
    name: 'Mixed Showcase',
    description: 'Combination of card types and sizes',
    icon: '✨'
  }
];

// === MAIN DEMO COMPONENT ===

export default function CompleteLayoutDemo() {
  const [currentLayout, setCurrentLayout] = useState<LayoutVariant>('hero');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isRosaSpeaking, setIsRosaSpeaking] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-cycle through speaking states for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsUserSpeaking(true);
        setTimeout(() => setIsUserSpeaking(false), 2000);
      }
      if (Math.random() > 0.8) {
        setIsRosaSpeaking(true);
        setTimeout(() => setIsRosaSpeaking(false), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get responsive header variant
  const headerVariant = useResponsiveHeader();

  // Render different layouts based on selection
  const renderLayoutContent = () => {
    switch (currentLayout) {
      case 'hero':
        return (
          <BrandedCardContainer variant="single">
            <PremiumSessionCardHero 
              session={sampleSessionData[0]} 
              className="max-w-4xl"
            />
          </BrandedCardContainer>
        );

      case 'standard':
        return (
          <BrandedCardContainer variant="single">
            <PremiumSessionCardDefault session={sampleSessionData[1]} />
          </BrandedCardContainer>
        );

      case 'grid':
        return (
          <BrandedCardContainer variant="grid">
            <PremiumSessionCardCompact session={sampleSessionData[0]} />
            <PremiumSessionCardCompact session={sampleSessionData[1]} />
            <PremiumSessionCardCompact session={sampleSessionData[2]} />
            <SpeakerCardDefault speaker={sampleSpeakerData} />
          </BrandedCardContainer>
        );

      case 'showcase':
        return (
          <BrandedCardContainer variant="stack">
            <PremiumSessionCardDefault session={sampleSessionData[0]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PremiumSessionCardCompact session={sampleSessionData[1]} />
              <PremiumSessionCardCompact session={sampleSessionData[2]} />
            </div>
            <SpeakerCardDefault speaker={sampleSpeakerData} />
          </BrandedCardContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-conference-50 via-white to-ctbto-seafoam/5">
      {/* === LEFT SIDE: CONVERSATION AREA PLACEHOLDER === */}
      <div className="fixed top-0 left-0 w-1/2 h-screen bg-conference-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-conference-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-conference-100 text-3xl">🎥</span>
          </div>
          <h2 className="text-kiosk-xl font-bold text-conference-100 mb-3">
            Tavus Video Chat
          </h2>
          <p className="text-kiosk-sm text-conference-300 max-w-md">
            This area contains the Tavus CVI conversation interface with Rosa's avatar and real-time video chat capabilities.
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE: BRANDED CANVAS WITH DYNAMIC CONTENT === */}
      <BrandedRightCanvas 
        headerVariant={headerVariant}
        showHeader={true}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLayout}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="w-full h-full"
          >
            {renderLayoutContent()}
          </motion.div>
        </AnimatePresence>
      </BrandedRightCanvas>

      {/* === STICKY BOTTOM INTERFACE === */}
      <StickyInterface
        meetingState="connected"
        conversationId="demo-conversation"
        isUserSpeaking={isUserSpeaking}
        isRosaSpeaking={isRosaSpeaking}
      />

      {/* === DEMO CONTROLS (FLOATING) === */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed top-6 left-6 z-[3000]"
          >
            <div className="premium-card-base p-6 bg-white/95 backdrop-blur-sm max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-kiosk-lg font-bold text-conference-900">
                  Layout Demo
                </h3>
                <button
                  onClick={() => setShowControls(false)}
                  className="w-6 h-6 bg-conference-200 hover:bg-conference-300 rounded-full flex items-center justify-center text-conference-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                {layoutOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCurrentLayout(option.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left",
                      currentLayout === option.id
                        ? "border-ctbto-navy bg-ctbto-navy/5 text-ctbto-navy"
                        : "border-conference-200 text-conference-700 hover:border-conference-300 hover:bg-conference-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-semibold text-kiosk-sm">
                          {option.name}
                        </div>
                        <div className="text-kiosk-xs opacity-75">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-conference-200">
                <div className="text-kiosk-xs text-conference-600 mb-3 font-medium">
                  Audio Demo Controls
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsUserSpeaking(true);
                      setTimeout(() => setIsUserSpeaking(false), 2000);
                    }}
                    className="flex-1 px-3 py-2 bg-ctbto-seafoam/20 text-ctbto-seafoam border border-ctbto-seafoam/30 rounded-lg text-kiosk-xs font-medium hover:bg-ctbto-seafoam/30 transition-colors"
                  >
                    User Speak
                  </button>
                  <button
                    onClick={() => {
                      setIsRosaSpeaking(true);
                      setTimeout(() => setIsRosaSpeaking(false), 3000);
                    }}
                    className="flex-1 px-3 py-2 bg-ctbto-navy/20 text-ctbto-navy border border-ctbto-navy/30 rounded-lg text-kiosk-xs font-medium hover:bg-ctbto-navy/30 transition-colors"
                  >
                    Rosa Speak
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SHOW CONTROLS BUTTON (WHEN HIDDEN) === */}
      {!showControls && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowControls(true)}
          className="fixed top-6 left-6 z-[3000] w-12 h-12 bg-ctbto-navy text-white rounded-xl shadow-ctbto flex items-center justify-center font-bold hover:scale-105 transition-transform"
        >
          ⚙️
        </motion.button>
      )}

      {/* === RESPONSIVE INDICATOR === */}
      <div className="fixed bottom-6 left-6 z-[3000] px-3 py-2 bg-conference-900/80 text-conference-100 rounded-lg text-kiosk-xs font-medium backdrop-blur-sm">
        Header: {headerVariant} • Layout: {currentLayout}
      </div>
    </div>
  );
} 