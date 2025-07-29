import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumSessionCard, PremiumSessionCardDefault, PremiumSessionCardHero, PremiumSessionCardCompact, type PremiumTimetableSession } from './PremiumSessionCard';
import { SpeakerCard, SpeakerCardDefault, type SnT2025Speaker } from './SpeakerCard';
import { Badge } from '../compound/Badge';

// === SAMPLE DATA ===

const sampleSession: PremiumTimetableSession = {
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
};

const sampleSpeaker: SnT2025Speaker = {
  name: "Dr. Elena Rodriguez",
  title: "Senior Nuclear Physicist",
  organization: "CTBTO Preparatory Commission",
  country: "Austria",
  bio: "Dr. Rodriguez is a leading expert in nuclear detection technologies with over 15 years of experience in developing advanced monitoring systems for the CTBT verification regime.",
  expertise: ["Nuclear Physics", "Seismic Analysis", "AI Detection Systems", "Radionuclide Monitoring"],
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
    }
  ],
  sessionCount: 3,
  themes: ["T1.1", "T1.2", "T2.1"],
  venues: ["Festsaal", "Prinz Eugen Saal"],
  sessionTypes: ["Keynote", "Panel Discussion", "Workshop"],
  totalDuration: 240,
  isKeynote: true,
  research_areas: ["Nuclear Detection", "Signal Processing"],
  experience_level: "expert",
  priority_level: "high",
  relevance_score: 0.98
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// === DESIGN SHOWCASE COMPONENT ===

export default function DesignShowcase() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-conference-50 via-white to-ctbto-seafoam/5 p-8"
    >
      {/* === HEADER SECTION === */}
      <motion.header 
        variants={sectionVariants}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-ctbto-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <div>
            <h1 className="text-kiosk-3xl font-display font-bold text-conference-900 leading-tight">
              Rosa Kiosk Design System
            </h1>
            <p className="text-kiosk-base text-conference-600 font-medium">
              World-Class CTBTO Conference Experience
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge className="badge-ctbto-primary text-kiosk-xs">
            CTBTO Branded
          </Badge>
          <Badge className="badge-ctbto-accent text-kiosk-xs">
            WCAG AAA Compliant
          </Badge>
          <Badge className="badge-science-technology text-kiosk-xs">
            Kiosk Optimized
          </Badge>
          <Badge className="badge-science-physics text-kiosk-xs">
            Professional Design
          </Badge>
        </div>
      </motion.header>

      {/* === DESIGN PRINCIPLES GRID === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          Design Principles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "CTBTO Brand",
              description: "Official colors, typography, and visual identity",
              icon: "🎨",
              accent: "ctbto-navy"
            },
            {
              title: "Accessibility",
              description: "WCAG AAA contrast, voice navigation, kiosk-friendly",
              icon: "♿",
              accent: "science-chemistry"
            },
            {
              title: "Professional",
              description: "Scientific conferences deserve sophisticated design",
              icon: "⭐",
              accent: "science-technology"
            },
            {
              title: "Performance",
              description: "Smooth animations, optimized for touch screens",
              icon: "⚡",
              accent: "science-physics"
            }
          ].map((principle, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              className="premium-card-base p-6 text-center group"
            >
              <div className="text-4xl mb-4">{principle.icon}</div>
              <h3 className="text-kiosk-lg font-bold text-conference-900 mb-2">
                {principle.title}
              </h3>
              <p className="text-kiosk-sm text-conference-700 leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === COLOR SYSTEM SHOWCASE === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          CTBTO Brand Colors
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="premium-card-base p-6">
            <div className="w-full h-24 bg-ctbto-navy rounded-lg mb-4 flex items-center justify-center text-white font-bold">
              #204054
            </div>
            <h3 className="text-kiosk-lg font-bold text-conference-900 mb-2">CTBTO Navy</h3>
            <p className="text-kiosk-sm text-conference-700">Official CTBTO header color - authoritative and professional</p>
          </div>
          
          <div className="premium-card-base p-6">
            <div className="w-full h-24 bg-ctbto-seafoam rounded-lg mb-4 flex items-center justify-center text-conference-900 font-bold">
              #7DD3C0
            </div>
            <h3 className="text-kiosk-lg font-bold text-conference-900 mb-2">CTBTO Seafoam</h3>
            <p className="text-kiosk-sm text-conference-700">Special accent color for highlights and interactive elements</p>
          </div>
          
          <div className="premium-card-base p-6">
            <div className="w-full h-24 bg-ctbto-charcoal rounded-lg mb-4 flex items-center justify-center text-white font-bold">
              #1A1A1A
            </div>
            <h3 className="text-kiosk-lg font-bold text-conference-900 mb-2">High Contrast</h3>
            <p className="text-kiosk-sm text-conference-700">WCAG AAA compliant text color for maximum readability</p>
          </div>
        </div>
      </motion.section>

      {/* === CARD VARIANTS SHOWCASE === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          Premium Card Variants
        </h2>
        
        <div className="space-y-12 max-w-6xl mx-auto">
          {/* Hero Card */}
          <div>
            <h3 className="text-kiosk-xl font-bold text-conference-900 mb-6 text-center">
              Hero Card - Maximum Impact
            </h3>
            <PremiumSessionCardHero 
              session={sampleSession} 
              className="max-w-4xl mx-auto"
            />
          </div>
          
          {/* Default Cards Grid */}
          <div>
            <h3 className="text-kiosk-xl font-bold text-conference-900 mb-6 text-center">
              Standard Layout - Information Rich
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumSessionCardDefault session={sampleSession} />
              <SpeakerCardDefault speaker={sampleSpeaker} />
            </div>
          </div>
          
          {/* Compact Cards */}
          <div>
            <h3 className="text-kiosk-xl font-bold text-conference-900 mb-6 text-center">
              Compact Layout - Essential Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PremiumSessionCardCompact session={sampleSession} />
              <PremiumSessionCardCompact session={{
                ...sampleSession,
                session_id: "S002",
                title: "Seismic Data Analysis with Machine Learning",
                session_type: "Workshop",
                scientific_field: "technology",
                priority_level: "medium",
                is_interactive: true
              }} />
              <PremiumSessionCardCompact session={{
                ...sampleSession,
                session_id: "S003",
                title: "International Policy and CTBT Implementation",
                session_type: "Panel Discussion",
                scientific_field: "policy",
                priority_level: "low",
                is_interactive: false
              }} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* === SCIENTIFIC FIELD COLOR CODING === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          Scientific Field Color Coding
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { field: "Physics", color: "science-physics", description: "Seismic monitoring, detection systems" },
            { field: "Chemistry", color: "science-chemistry", description: "Radionuclide analysis, atmospheric monitoring" },
            { field: "Technology", color: "science-technology", description: "AI systems, data processing, software" },
            { field: "Policy", color: "science-policy", description: "International relations, treaty implementation" }
          ].map((item, index) => (
            <div key={index} className="premium-card-base p-6 text-center">
              <div className={`w-full h-16 bg-${item.color}/20 border-2 border-${item.color}/40 rounded-lg mb-4 flex items-center justify-center`}>
                <div className={`w-8 h-8 bg-${item.color} rounded-full`}></div>
              </div>
              <h3 className="text-kiosk-lg font-bold text-conference-900 mb-2">
                {item.field}
              </h3>
              <p className="text-kiosk-sm text-conference-700">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* === SPECIAL FEATURES === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          Special Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Keynote Card */}
          <div className="keynote-card p-6">
            <div className="relative z-20">
              <h3 className="text-kiosk-xl font-bold text-priority-high mb-4">
                Keynote Session
              </h3>
              <p className="text-kiosk-sm text-conference-700 mb-4">
                Special styling with diagonal ribbon and gradient background to highlight the most important sessions.
              </p>
              <div className="flex gap-2">
                <Badge className="badge-priority-high text-kiosk-xs">High Priority</Badge>
                <Badge className="badge-science-keynote text-kiosk-xs">Keynote</Badge>
              </div>
            </div>
          </div>
          
          {/* Glass Morphism */}
          <div className="glass-card p-6">
            <h3 className="text-kiosk-xl font-bold text-conference-900 mb-4">
              Glass Morphism
            </h3>
            <p className="text-kiosk-sm text-conference-700 mb-4">
              Modern glass effect with backdrop blur and translucent backgrounds for premium feel.
            </p>
            <div className="flex gap-2">
              <Badge className="badge-ctbto-accent text-kiosk-xs">Modern</Badge>
              <Badge className="badge-science-technology text-kiosk-xs">Premium</Badge>
            </div>
          </div>
        </div>
      </motion.section>

      {/* === ACCESSIBILITY FEATURES === */}
      <motion.section 
        variants={sectionVariants}
        className="mb-16"
      >
        <h2 className="text-kiosk-2xl font-display font-bold text-conference-900 text-center mb-12">
          Accessibility Excellence
        </h2>
        
        <div className="premium-card-base p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-kiosk-lg font-bold text-conference-900 mb-4 flex items-center gap-2">
                <span>♿</span> WCAG AAA Compliance
              </h3>
              <ul className="space-y-2 text-kiosk-sm text-conference-700">
                <li>• 7:1 contrast ratio for all text</li>
                <li>• Semantic HTML structure</li>
                <li>• Screen reader compatibility</li>
                <li>• Focus management for voice control</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-kiosk-lg font-bold text-conference-900 mb-4 flex items-center gap-2">
                <span>📱</span> Kiosk Optimization
              </h3>
              <ul className="space-y-2 text-kiosk-sm text-conference-700">
                <li>• 18px minimum font size</li>
                <li>• 44px minimum touch targets</li>
                <li>• Standing user considerations</li>
                <li>• Voice-only navigation support</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* === FOOTER === */}
      <motion.footer 
        variants={sectionVariants}
        className="text-center py-12 border-t border-conference-200"
      >
        <div className="mb-6">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-ctbto-primary rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-kiosk-lg font-bold text-conference-900">
              CTBTO Preparatory Commission
            </span>
          </div>
        </div>
        <p className="text-kiosk-sm text-conference-600 max-w-2xl mx-auto">
          Rosa Kiosk Design System - Professional, accessible, and branded UI components 
          for the SnT2025 Science and Technology Conference. Built with modern web standards 
          and CTBTO design guidelines.
        </p>
      </motion.footer>
    </motion.div>
  );
} 