import React, { useState } from 'react';
import { SessionCard, type TimetableSession } from './NewSessionCard';
import { Badge } from '../compound/Badge';
import { motion } from 'framer-motion';

/**
 * 🎨 SessionCard Demo - Showcasing Compound Component Patterns
 * 
 * This demonstration uses REAL SnT2025 session data from the actual
 * conference timetable to showcase the SessionCard's flexibility.
 */

// Real SnT2025 session data from snt2025_timetable.json
const realSnT2025Sessions: TimetableSession[] = [
  {
    session_id: "O3.1",
    title: "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
    description: "Acquisition and forwarding of continuous and segmented data; data assimilation; design of sensor systems; advanced sensors",
    start_time: "15:30",
    end_time: "17:05",
    duration: 95,
    date: "Tue 09/09",
    venue: "Forum",
    session_type: "Oral",
    speakers: ["Mr Christos Saragiotis", "Mr Ronan Le Bras"],
    theme: "T3.1",
    track: "Theme 3",
    audience_level: "technical_experts",
    day_of_week: "Tuesday",
    time_of_day: "afternoon",
    duration_minutes: 95,
    has_speakers: true,
    is_interactive: false,
    keywords: ["seismic", "hydroacoustic", "infrasound", "sensors"],
    priority_level: "high",
    relevance_score: 0.92
  },
  {
    session_id: "O3.2",
    title: "O3.2 Radionuclide Technologies and Applications",
    description: "Sampling and sample processing, data acquisition, particulate sample systems, gamma–gamma coincidence counting; new generation noble gas systems, radionuclide laboratories",
    start_time: "15:30",
    end_time: "17:05", 
    duration: 95,
    date: "Tue 09/09",
    venue: "Forum",
    session_type: "Oral",
    speakers: ["Anders Ringbom", "Nikolaus Helmut Hermanspahn"],
    theme: "T3.2",
    track: "Theme 3",
    audience_level: "technical_experts",
    day_of_week: "Tuesday",
    time_of_day: "afternoon",
    duration_minutes: 95,
    has_speakers: true,
    is_interactive: false,
    keywords: ["radionuclide", "sampling", "noble gas", "laboratories"],
    priority_level: "high",
    relevance_score: 0.89
  },
  {
    session_id: "Ke04",
    title: "Keynote on the Impact of Long-Term Shifts in Environmental Conditions on Society",
    description: "A comprehensive examination of how environmental changes affect global monitoring systems and societal structures",
    start_time: "15:30",
    end_time: "16:00",
    duration: 30,
    date: "Tue 09/09", 
    venue: "Festsaal",
    session_type: "Keynote",
    speakers: [],
    theme: "T5.1",
    track: "Theme 5",
    audience_level: "all_attendees",
    day_of_week: "Tuesday", 
    time_of_day: "afternoon",
    duration_minutes: 30,
    has_speakers: false,
    is_interactive: false,
    keywords: ["environmental", "climate", "society", "monitoring"],
    priority_level: "high",
    relevance_score: 0.95
  },
  {
    session_id: "O5.1-448",
    title: "The Volcanic Information System: Long-Range Infrasound Monitoring of Volcanic Eruptions",
    description: "Advanced monitoring techniques for volcanic activity using infrasound technology and long-range detection systems",
    start_time: "14:15",
    end_time: "14:30",
    duration: 15,
    date: "Tue 09/09",
    venue: "Forum",
    session_type: "Oral",
    speakers: ["Mr Rodrigo De Negri"],
    theme: "T1.1",
    track: "Theme 1",
    audience_level: "technical_experts",
    day_of_week: "Tuesday",
    time_of_day: "afternoon", 
    duration_minutes: 15,
    has_speakers: true,
    is_interactive: false,
    keywords: ["volcanic", "infrasound", "monitoring", "eruptions"],
    priority_level: "medium",
    relevance_score: 0.78
  },
  {
    session_id: "Pa04",
    title: "Panel on the Impact of Extreme Conditions on the CTBTO Monitoring System",
    description: "Expert panel discussion on how extreme environmental conditions affect monitoring system performance and reliability",
    start_time: "16:00",
    end_time: "17:00",
    duration: 60,
    date: "Tue 09/09",
    venue: "Festsaal", 
    session_type: "Panel",
    speakers: [],
    theme: "T4.1", 
    track: "Theme 4",
    audience_level: "all_attendees",
    day_of_week: "Tuesday",
    time_of_day: "afternoon",
    duration_minutes: 60,
    has_speakers: false,
    is_interactive: true,
    keywords: ["extreme conditions", "monitoring system", "performance", "reliability"],
    priority_level: "high",
    relevance_score: 0.87
  }
];

/**
 * 🎯 SessionCard Layout Demonstrations
 * 
 * These examples show different ways to compose SessionCard
 * using the compound component pattern.
 */

export default function SessionCardDemo() {
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'compact' | 'minimal' | 'custom'>('default');
  const [selectedSession, setSelectedSession] = useState(0);

  const currentSession = realSnT2025Sessions[selectedSession];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SessionCard Demo - SnT2025 Real Data
        </h1>
        <p className="text-gray-600">
          Voice-controlled kiosk components using actual conference data
        </p>
      </div>

      {/* Layout Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge 
          variant={selectedLayout === 'default' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLayout('default')}
        >
          Default Layout
        </Badge>
        <Badge 
          variant={selectedLayout === 'compact' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLayout('compact')}
        >
          Compact Layout
        </Badge>
        <Badge 
          variant={selectedLayout === 'minimal' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLayout('minimal')}
        >
          Minimal Layout
        </Badge>
        <Badge 
          variant={selectedLayout === 'custom' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedLayout('custom')}
        >
          Custom Layout
        </Badge>
      </div>

      {/* Session Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {realSnT2025Sessions.map((session, index) => (
          <Badge
            key={session.session_id}
            variant={selectedSession === index ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedSession(index)}
          >
            {session.session_id}
          </Badge>
        ))}
      </div>

      {/* Card Display */}
      <motion.div
        layout
        className="bg-gray-50 p-6 rounded-lg"
      >
        {selectedLayout === 'default' && (
          <SessionCard session={currentSession}>
            <SessionCard.Header>
              <SessionCard.Title />
              <SessionCard.Meta />
            </SessionCard.Header>
            <SessionCard.Body>
              <SessionCard.Description />
              <SessionCard.Speakers />
              <SessionCard.Topics />
            </SessionCard.Body>
            <SessionCard.Footer />
          </SessionCard>
        )}

        {selectedLayout === 'compact' && (
          <SessionCard session={currentSession} compact>
            <SessionCard.Header>
              <SessionCard.Title />
              <SessionCard.Meta />
            </SessionCard.Header>
            <SessionCard.Body>
              <SessionCard.Description />
              <SessionCard.Speakers />
            </SessionCard.Body>
          </SessionCard>
        )}

        {selectedLayout === 'minimal' && (
          <SessionCard session={currentSession} compact>
            <SessionCard.Header>
              <SessionCard.Title />
              <SessionCard.Meta />
            </SessionCard.Header>
          </SessionCard>
        )}

        {selectedLayout === 'custom' && (
          <SessionCard session={currentSession}>
            <SessionCard.Header>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <SessionCard.Title className="text-blue-900" />
                  <div className="mt-2 text-sm text-gray-500">
                    {currentSession.venue} • {currentSession.time_of_day}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {currentSession.session_type}
                </Badge>
              </div>
            </SessionCard.Header>
            <SessionCard.Body>
              <SessionCard.Speakers />
              <SessionCard.Description />
              <div className="pt-3">
                <SessionCard.Topics />
              </div>
            </SessionCard.Body>
            <SessionCard.Footer>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Duration: {currentSession.duration} minutes
                </span>
                {currentSession.relevance_score && (
                  <span className="text-blue-600 font-medium">
                    {(currentSession.relevance_score * 100).toFixed(0)}% relevance
                  </span>
                )}
              </div>
            </SessionCard.Footer>
          </SessionCard>
        )}
      </motion.div>

      {/* Pattern Explanation */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🎨 Voice-Only Kiosk Design Principles
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• <strong>No hover states</strong> - All interactions are voice-controlled</li>
          <li>• <strong>High contrast text</strong> - WCAG AAA compliance (7:1 ratio)</li>
          <li>• <strong>Large touch targets</strong> - 44px minimum for accessibility</li>
          <li>• <strong>Clear visual hierarchy</strong> - Easy scanning at kiosk distance</li>
          <li>• <strong>Compound components</strong> - Flexible composition for different layouts</li>
          <li>• <strong>Real SnT2025 data</strong> - Authentic conference information</li>
        </ul>
      </div>
    </div>
  );
} 