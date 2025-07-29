import React, { useState } from 'react';
import { VenueCard, type SnT2025Venue } from './VenueCard';
import { Badge } from '../compound/Badge';
import { motion } from 'framer-motion';

/**
 * 🎨 VenueCard Demo - Showcasing Compound Component Patterns
 * 
 * This demonstration uses REAL SnT2025 venue data from Hofburg Palace
 * to showcase the VenueCard's flexibility and voice-only design.
 */

// Real SnT2025 venue data from Hofburg Palace Vienna
const realHofburgVenues: SnT2025Venue[] = [
  {
    name: "Festsaal",
    location: "Upper level, left side",
    floor: "upper",
    description: "The main presentation room for scientific program, high level plenary, and closing plenary sessions",
    capacity: 300,
    facilities: [
      "High-level plenary",
      "Scientific program",
      "Closing plenary",
      "Audio/visual equipment",
      "Stage"
    ],
    color_coding: "Red coding",
    sessions: [
      {
        session_id: "Ke04",
        title: "Keynote on the Impact of Long-Term Shifts in Environmental Conditions on Society",
        time: "15:30 - 16:00",
        date: "Tue 09/09",
        session_type: "Keynote",
        speakers: [],
        theme: "T5.1",
        duration: 30
      },
      {
        session_id: "Pa04",
        title: "Panel on the Impact of Extreme Conditions on the CTBTO Monitoring System",
        time: "16:00 - 17:00",
        date: "Tue 09/09",
        session_type: "Panel",
        speakers: [],
        theme: "T4.1",
        duration: 60
      }
    ],
    sessionCount: 2,
    sessionTypes: ["Keynote", "Panel"],
    speakerCount: 0,
    dailySchedule: [
      {
        date: "Tue 09/09",
        sessions: [
          {
            session_id: "Ke04",
            title: "Keynote on Environmental Conditions",
            time: "15:30 - 16:00",
            date: "Tue 09/09",
            session_type: "Keynote",
            speakers: [],
            theme: "T5.1",
            duration: 30
          },
          {
            session_id: "Pa04",
            title: "Panel on Extreme Conditions",
            time: "16:00 - 17:00",
            date: "Tue 09/09",
            session_type: "Panel",
            speakers: [],
            theme: "T4.1",
            duration: 60
          }
        ],
        sessionCount: 2,
        utilization_hours: 1.5
      }
    ],
    utilization_rate: 0.75,
    accessibility: "Accessible via barrier free elevator at the end of Seitenhalle",
    priority_level: "high",
    relevance_score: 0.95
  },
  {
    name: "Forum",
    location: "Ground floor, exhibitor space right side",
    floor: "ground",
    description: "Technical sessions and oral presentations venue located in the main exhibition area",
    capacity: 150,
    facilities: [
      "Technical sessions",
      "Oral presentations",
      "Audio/visual equipment",
      "Exhibition space"
    ],
    color_coding: "Blue coding",
    sessions: [
      {
        session_id: "O3.1",
        title: "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        session_type: "Oral",
        speakers: ["Mr Christos Saragiotis", "Mr Ronan Le Bras"],
        theme: "T3.1",
        duration: 95
      },
      {
        session_id: "O3.2",
        title: "O3.2 Radionuclide Technologies and Applications",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        session_type: "Oral",
        speakers: ["Anders Ringbom", "Nikolaus Helmut Hermanspahn"],
        theme: "T3.2",
        duration: 95
      }
    ],
    sessionCount: 2,
    sessionTypes: ["Oral"],
    speakerCount: 4,
    dailySchedule: [
      {
        date: "Tue 09/09",
        sessions: [
          {
            session_id: "O3.1",
            title: "Seismic, Hydroacoustic and Infrasound Technologies",
            time: "15:30 - 17:05",
            date: "Tue 09/09",
            session_type: "Oral",
            speakers: ["Mr Christos Saragiotis", "Mr Ronan Le Bras"],
            theme: "T3.1",
            duration: 95
          },
          {
            session_id: "O3.2",
            title: "Radionuclide Technologies and Applications",
            time: "15:30 - 17:05",
            date: "Tue 09/09",
            session_type: "Oral",
            speakers: ["Anders Ringbom", "Nikolaus Helmut Hermanspahn"],
            theme: "T3.2",
            duration: 95
          }
        ],
        sessionCount: 2,
        utilization_hours: 3.2
      }
    ],
    utilization_rate: 0.85,
    accessibility: "Ground floor access, near registration area",
    priority_level: "high",
    relevance_score: 0.92
  },
  {
    name: "Prinz Eugen Saal",
    location: "Ground floor, exhibitor space left side",
    floor: "ground",
    description: "Technical presentations and specialized discussions venue with dedicated audio/visual systems",
    capacity: 120,
    facilities: [
      "Technical presentations",
      "Specialized discussions",
      "Advanced A/V systems",
      "Recording capability"
    ],
    color_coding: "Green coding",
    sessions: [
      {
        session_id: "O3.5",
        title: "O3.5 Analysis of Seismic, Hydroacoustic and Infrasound Monitoring Data",
        time: "15:30 - 17:05",
        date: "Tue 09/09",
        session_type: "Oral",
        speakers: ["Mr Christos Saragiotis", "Mr Ronan Le Bras"],
        theme: "T3.5",
        duration: 95
      }
    ],
    sessionCount: 1,
    sessionTypes: ["Oral"],
    speakerCount: 2,
    dailySchedule: [
      {
        date: "Tue 09/09",
        sessions: [
          {
            session_id: "O3.5",
            title: "Analysis of Seismic, Hydroacoustic and Infrasound Monitoring Data",
            time: "15:30 - 17:05",
            date: "Tue 09/09",
            session_type: "Oral",
            speakers: ["Mr Christos Saragiotis", "Mr Ronan Le Bras"],
            theme: "T3.5",
            duration: 95
          }
        ],
        sessionCount: 1,
        utilization_hours: 1.6
      }
    ],
    utilization_rate: 0.65,
    accessibility: "Ground floor access with barrier-free entry",
    priority_level: "medium",
    relevance_score: 0.88
  },
  {
    name: "Wintergarten",
    location: "Upper level, left side",
    floor: "upper",
    description: "Presentations venue with natural lighting and garden atmosphere for specialized talks",
    capacity: 80,
    facilities: [
      "Natural lighting",
      "Garden atmosphere",
      "Specialized presentations",
      "Intimate setting"
    ],
    color_coding: "Yellow coding",
    sessions: [],
    sessionCount: 0,
    sessionTypes: [],
    speakerCount: 0,
    dailySchedule: [],
    utilization_rate: 0.0,
    accessibility: "Upper level accessible via barrier free elevator",
    priority_level: "low",
    relevance_score: 0.45
  },
  {
    name: "Zeremoniensaal",
    location: "Upper level, left side",
    floor: "upper",
    description: "E-poster area for digital poster presentations and interactive displays",
    capacity: 200,
    facilities: [
      "E-poster displays",
      "Interactive screens",
      "Digital presentations",
      "Networking space"
    ],
    color_coding: "Purple coding",
    sessions: [],
    sessionCount: 0,
    sessionTypes: ["E-poster"],
    speakerCount: 0,
    dailySchedule: [],
    utilization_rate: 0.3,
    accessibility: "Upper level accessible via barrier free elevator",
    priority_level: "medium",
    relevance_score: 0.67
  }
];

/**
 * 🎯 VenueCard Layout Demonstrations
 * 
 * These examples show different ways to compose VenueCard
 * using the compound component pattern with real Hofburg data.
 */

export default function VenueCardDemo() {
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'compact' | 'minimal' | 'custom'>('default');
  const [selectedVenue, setSelectedVenue] = useState(0);

  const currentVenue = realHofburgVenues[selectedVenue];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          VenueCard Demo - Hofburg Palace Real Data
        </h1>
        <p className="text-gray-600">
          Voice-controlled kiosk components using actual SnT2025 venue information
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

      {/* Venue Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {realHofburgVenues.map((venue, index) => (
          <Badge
            key={venue.name}
            variant={selectedVenue === index ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedVenue(index)}
          >
            {venue.name}
          </Badge>
        ))}
      </div>

      {/* Card Display */}
      <motion.div
        layout
        className="bg-gray-50 p-6 rounded-lg"
      >
        {selectedLayout === 'default' && (
          <VenueCard venue={currentVenue}>
            <VenueCard.Header>
              <VenueCard.Title />
              <VenueCard.Meta />
            </VenueCard.Header>
            <VenueCard.Body>
              <VenueCard.Description />
              <VenueCard.Facilities />
              <VenueCard.Utilization />
              <VenueCard.Schedule maxDays={2} />
              <VenueCard.Accessibility />
            </VenueCard.Body>
            <VenueCard.Footer />
          </VenueCard>
        )}

        {selectedLayout === 'compact' && (
          <VenueCard venue={currentVenue} compact>
            <VenueCard.Header>
              <VenueCard.Title />
              <VenueCard.Meta />
            </VenueCard.Header>
            <VenueCard.Body>
              <VenueCard.Description />
              <VenueCard.Facilities />
              <VenueCard.Utilization />
            </VenueCard.Body>
          </VenueCard>
        )}

        {selectedLayout === 'minimal' && (
          <VenueCard venue={currentVenue} compact>
            <VenueCard.Header>
              <VenueCard.Title />
              <VenueCard.Meta />
            </VenueCard.Header>
            <VenueCard.Body>
              <VenueCard.Facilities />
            </VenueCard.Body>
          </VenueCard>
        )}

        {selectedLayout === 'custom' && (
          <VenueCard venue={currentVenue}>
            <VenueCard.Header>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <VenueCard.Title className="text-green-900" />
                  <div className="mt-2 text-sm text-gray-500">
                    {currentVenue.floor} floor • {currentVenue.capacity} capacity
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Badge variant="secondary">
                    {currentVenue.priority_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentVenue.color_coding}
                  </Badge>
                </div>
              </div>
            </VenueCard.Header>
            <VenueCard.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <VenueCard.Description />
                  <VenueCard.Facilities />
                </div>
                <div className="space-y-3">
                  <VenueCard.Utilization />
                  <VenueCard.Schedule maxDays={1} />
                </div>
              </div>
              <VenueCard.Accessibility />
            </VenueCard.Body>
            <VenueCard.Footer>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {currentVenue.location}
                </span>
                {currentVenue.relevance_score && (
                  <span className="text-green-600 font-medium">
                    {(currentVenue.relevance_score * 100).toFixed(0)}% relevance
                  </span>
                )}
              </div>
            </VenueCard.Footer>
          </VenueCard>
        )}
      </motion.div>

      {/* Hofburg Palace Context Information */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          🏛️ Hofburg Palace Vienna Conference Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-800 mb-2">Ground Floor Venues</h4>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Forum:</strong> Technical sessions & oral presentations</li>
              <li>• <strong>Prinz Eugen Saal:</strong> Specialized technical discussions</li>
              <li>• <strong>Exhibition Space:</strong> OSI exhibition & CTBTO booths</li>
              <li>• <strong>Registration:</strong> Check-in and information desk</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-800 mb-2">Upper Level Venues</h4>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Festsaal:</strong> Main presentation room for plenaries</li>
              <li>• <strong>Wintergarten:</strong> Natural lighting presentation space</li>
              <li>• <strong>Zeremoniensaal:</strong> E-poster area with digital displays</li>
              <li>• <strong>Accessibility:</strong> Barrier-free elevator access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Voice-Only Design Principles */}
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
          <li>• <strong>Real venue data</strong> - Authentic Hofburg Palace information</li>
          <li>• <strong>Utilization indicators</strong> - Green accent for venue management</li>
          <li>• <strong>Color coding system</strong> - Matches SnT2025 program design</li>
        </ul>
      </div>
    </div>
  );
} 