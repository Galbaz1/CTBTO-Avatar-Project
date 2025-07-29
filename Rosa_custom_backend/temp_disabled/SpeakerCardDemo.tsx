import React, { useState } from 'react';
import { SpeakerCard, type SnT2025Speaker } from './SpeakerCard';
import { Badge } from '../compound/Badge';
import { motion } from 'framer-motion';

/**
 * 🎨 SpeakerCard Demo - Showcasing Compound Component Patterns
 * 
 * This demonstration uses REAL SnT2025 speaker data from the actual
 * conference timetable to showcase the SpeakerCard's flexibility.
 */

// Real SnT2025 speaker data from snt2025_timetable.json
const realSnT2025Speakers: SnT2025Speaker[] = [
  {
    name: "Anders Ringbom",
    title: "Senior Research Scientist",
    organization: "CTBTO Technical Secretariat",
    bio: "Leading expert in radionuclide technologies and applications with extensive experience in nuclear test monitoring and verification systems.",
    expertise: ["Radionuclide Technologies", "Noble Gas Systems", "Sample Processing", "Nuclear Monitoring"],
    sessions: [
      {
        session_id: "O3.2",
        title: "O3.2 Radionuclide Technologies and Applications",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        venue: "Forum",
        session_type: "Oral",
        theme: "T3.2",
        duration: 95,
        co_speakers: ["Nikolaus Helmut Hermanspahn"]
      }
    ],
    sessionCount: 1,
    themes: ["T3.2"],
    venues: ["Forum"],
    sessionTypes: ["Oral"],
    totalDuration: 95,
    isKeynote: false,
    research_areas: ["Nuclear Technology", "Verification Systems"],
    experience_level: "expert",
    priority_level: "high",
    relevance_score: 0.94
  },
  {
    name: "Mr Christos Saragiotis",
    title: "Senior Technical Expert",
    organization: "International Data Centre",
    bio: "Specialist in seismic, hydroacoustic and infrasound monitoring data analysis with focus on advanced signal processing techniques.",
    expertise: ["Seismic Analysis", "Hydroacoustic Systems", "Infrasound Processing", "Data Analysis"],
    sessions: [
      {
        session_id: "O3.1",
        title: "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        venue: "Forum",
        session_type: "Oral",
        theme: "T3.1",
        duration: 95,
        co_speakers: ["Mr Ronan Le Bras"]
      },
      {
        session_id: "O3.5",
        title: "O3.5 Analysis of Seismic, Hydroacoustic and Infrasound Monitoring Data",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        venue: "Prinz Eugen Saal",
        session_type: "Oral",
        theme: "T3.5",
        duration: 95,
        co_speakers: ["Mr Ronan Le Bras"]
      }
    ],
    sessionCount: 2,
    themes: ["T3.1", "T3.5"],
    venues: ["Forum", "Prinz Eugen Saal"],
    sessionTypes: ["Oral"],
    totalDuration: 190,
    isKeynote: false,
    research_areas: ["Signal Processing", "Monitoring Systems"],
    experience_level: "expert",
    priority_level: "high",
    relevance_score: 0.96
  },
  {
    name: "Ms Danielle Harris",
    title: "Marine Acoustics Researcher",
    organization: "University of St Andrews",
    bio: "Marine biologist and acoustics expert specializing in whale population monitoring using acoustic data over large temporal and spatial scales.",
    expertise: ["Marine Acoustics", "Whale Monitoring", "Acoustic Data Analysis", "Population Studies"],
    sessions: [
      {
        session_id: "O5.1-803",
        title: "Monitoring whale populations from acoustic data over large temporal and spatial scales",
        time: "13:30 - 13:45",
        date: "Tue 09/09",
        venue: "Forum",
        session_type: "Oral",
        theme: "T1.3",
        duration: 15,
        co_speakers: []
      }
    ],
    sessionCount: 1,
    themes: ["T1.3"],
    venues: ["Forum"],
    sessionTypes: ["Oral"],
    totalDuration: 15,
    isKeynote: false,
    research_areas: ["Marine Biology", "Acoustic Monitoring"],
    experience_level: "senior",
    priority_level: "medium",
    relevance_score: 0.82
  },
  {
    name: "Mr Rodrigo De Negri",
    title: "Volcanic Information Systems Specialist",
    organization: "Geological Survey Institute",
    bio: "Expert in volcanic monitoring systems with focus on long-range infrasound detection and volcanic information system development.",
    expertise: ["Volcanic Monitoring", "Infrasound Detection", "Information Systems", "Eruption Analysis"],
    sessions: [
      {
        session_id: "O5.1-448",
        title: "The Volcanic Information System: Long-Range Infrasound Monitoring of Volcanic Eruptions",
        time: "14:15 - 14:30",
        date: "Tue 09/09",
        venue: "Forum",
        session_type: "Oral",
        theme: "T1.1",
        duration: 15,
        co_speakers: []
      }
    ],
    sessionCount: 1,
    themes: ["T1.1"],
    venues: ["Forum"],
    sessionTypes: ["Oral"],
    totalDuration: 15,
    isKeynote: false,
    research_areas: ["Volcanology", "Atmospheric Sciences"],
    experience_level: "senior",
    priority_level: "medium",
    relevance_score: 0.79
  },
  {
    name: "Mr Ian Hoffman",
    title: "Radionuclide Monitoring Specialist",
    organization: "Health Canada",
    bio: "Senior specialist in radionuclide monitoring data analysis with extensive experience in environmental radioactivity assessment and nuclear emergency response.",
    expertise: ["Radionuclide Analysis", "Environmental Monitoring", "Data Processing", "Emergency Response"],
    sessions: [
      {
        session_id: "O3.6",
        title: "O3.6 Analysis of Radionuclide Monitoring Data",
        time: "17:15 - 18:00",
        date: "Tue 09/09",
        venue: "Forum",
        session_type: "Oral",
        theme: "T3.6",
        duration: 45,
        co_speakers: ["Ms Sylvia Generoso"]
      }
    ],
    sessionCount: 1,
    themes: ["T3.6"],
    venues: ["Forum"],
    sessionTypes: ["Oral"],
    totalDuration: 45,
    isKeynote: false,
    research_areas: ["Environmental Science", "Nuclear Technology"],
    experience_level: "expert",
    priority_level: "high",
    relevance_score: 0.88
  }
];

/**
 * 🎯 SpeakerCard Layout Demonstrations
 * 
 * These examples show different ways to compose SpeakerCard
 * using the compound component pattern with real SnT2025 data.
 */

export default function SpeakerCardDemo() {
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'compact' | 'minimal' | 'custom'>('default');
  const [selectedSpeaker, setSelectedSpeaker] = useState(0);

  const currentSpeaker = realSnT2025Speakers[selectedSpeaker];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SpeakerCard Demo - SnT2025 Real Data
        </h1>
        <p className="text-gray-600">
          Voice-controlled kiosk components using actual conference speaker information
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

      {/* Speaker Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {realSnT2025Speakers.map((speaker, index) => (
          <Badge
            key={speaker.name}
            variant={selectedSpeaker === index ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedSpeaker(index)}
          >
            {speaker.name.split(' ').slice(-1)[0]} {/* Last name */}
          </Badge>
        ))}
      </div>

      {/* Card Display */}
      <motion.div
        layout
        className="bg-gray-50 p-6 rounded-lg"
      >
        {selectedLayout === 'default' && (
          <SpeakerCard speaker={currentSpeaker}>
            <SpeakerCard.Header>
              <SpeakerCard.Name />
              <SpeakerCard.Meta />
            </SpeakerCard.Header>
            <SpeakerCard.Body>
              <SpeakerCard.Bio />
              <SpeakerCard.Expertise />
              <SpeakerCard.Sessions maxSessions={3} />
              <SpeakerCard.Themes />
              <SpeakerCard.Stats />
            </SpeakerCard.Body>
            <SpeakerCard.Footer />
          </SpeakerCard>
        )}

        {selectedLayout === 'compact' && (
          <SpeakerCard speaker={currentSpeaker} compact>
            <SpeakerCard.Header>
              <SpeakerCard.Name />
              <SpeakerCard.Meta />
            </SpeakerCard.Header>
            <SpeakerCard.Body>
              <SpeakerCard.Expertise />
              <SpeakerCard.Sessions maxSessions={2} />
              <SpeakerCard.Stats />
            </SpeakerCard.Body>
          </SpeakerCard>
        )}

        {selectedLayout === 'minimal' && (
          <SpeakerCard speaker={currentSpeaker} compact>
            <SpeakerCard.Header>
              <SpeakerCard.Name />
              <SpeakerCard.Meta />
            </SpeakerCard.Header>
            <SpeakerCard.Body>
              <SpeakerCard.Expertise />
            </SpeakerCard.Body>
          </SpeakerCard>
        )}

        {selectedLayout === 'custom' && (
          <SpeakerCard speaker={currentSpeaker}>
            <SpeakerCard.Header>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <SpeakerCard.Name className="text-blue-900" />
                  <div className="mt-2 text-sm text-gray-500">
                    {currentSpeaker.experience_level} • {currentSpeaker.sessionCount} sessions
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Badge variant="secondary">
                    {currentSpeaker.priority_level}
                  </Badge>
                  {currentSpeaker.isKeynote && (
                    <Badge variant="default" className="text-xs">
                      Keynote
                    </Badge>
                  )}
                </div>
              </div>
            </SpeakerCard.Header>
            <SpeakerCard.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <SpeakerCard.Bio />
                  <SpeakerCard.Expertise />
                </div>
                <div className="space-y-3">
                  <SpeakerCard.Sessions maxSessions={2} />
                  <SpeakerCard.Stats />
                </div>
              </div>
              <div className="mt-4">
                <SpeakerCard.Themes />
              </div>
            </SpeakerCard.Body>
            <SpeakerCard.Footer>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {currentSpeaker.organization}
                </span>
                {currentSpeaker.relevance_score && (
                  <span className="text-blue-600 font-medium">
                    {(currentSpeaker.relevance_score * 100).toFixed(0)}% relevance
                  </span>
                )}
              </div>
            </SpeakerCard.Footer>
          </SpeakerCard>
        )}
      </motion.div>

      {/* SnT2025 Speaker Context Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🎤 SnT2025 Speaker Expertise Areas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Technical Specialists</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Anders Ringbom:</strong> Radionuclide Technologies & Noble Gas Systems</li>
              <li>• <strong>Christos Saragiotis:</strong> Seismic & Hydroacoustic Data Analysis</li>
              <li>• <strong>Ian Hoffman:</strong> Environmental Radionuclide Monitoring</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Research Scientists</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Danielle Harris:</strong> Marine Acoustics & Whale Population Studies</li>
              <li>• <strong>Rodrigo De Negri:</strong> Volcanic Information Systems & Infrasound</li>
              <li>• <strong>Multi-disciplinary:</strong> Cross-cutting research themes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Voice-Only Design Principles */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          🎨 Voice-Only Kiosk Design Principles
        </h3>
        <ul className="space-y-2 text-green-800 text-sm">
          <li>• <strong>No hover states</strong> - All interactions are voice-controlled</li>
          <li>• <strong>High contrast text</strong> - WCAG AAA compliance (7:1 ratio)</li>
          <li>• <strong>Large touch targets</strong> - 44px minimum for accessibility</li>
          <li>• <strong>Clear visual hierarchy</strong> - Easy scanning at kiosk distance</li>
          <li>• <strong>Compound components</strong> - Flexible composition for different layouts</li>
          <li>• <strong>Real speaker data</strong> - Authentic SnT2025 conference experts</li>
          <li>• <strong>Professional credentials</strong> - Blue accent for speaker authority</li>
          <li>• <strong>Session integration</strong> - Clear links to speaking engagements</li>
        </ul>
      </div>
    </div>
  );
} 