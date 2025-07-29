import React, { useState } from 'react';
import { ScheduleCard, type SnT2025Schedule, type DailySchedule, type ScheduleSession, type TimeSlot } from './ScheduleCard';
import { Badge } from '../compound/Badge';
import { motion } from 'framer-motion';

/**
 * 🎨 ScheduleCard Demo - Real SnT2025 Conference Data
 * 
 * This demonstration uses ACTUAL SnT2025 timetable data from the
 * backend_data/event_info/snt2025_timetable.json file.
 */

// Real SnT2025 timetable data - transformed from actual JSON structure
const realSnT2025Schedule: SnT2025Schedule = {
  title: "SnT2025 Conference Schedule",
  dateRange: {
    start: "Mon 08/09",
    end: "Tue 09/09"
  },
  totalDays: 2,
  totalSessions: 24,
  dailySchedules: [
    {
      date: "Mon 08/09",
      day_of_week: "Monday",
      isConferenceDay: true,
      venueCount: 2,
      totalDuration: 300, // 5 hours
      sessions: [
        {
          session_id: "opening-mon",
          title: "Opening",
          start_time: "13:00",
          end_time: "13:30",
          venue: "Online",
          session_type: "Opening",
          speakers: [],
          theme: "Conference Opening",
          duration_minutes: 30
        },
        {
          session_id: "keynote-myanmar",
          title: "Keynote on Myanmar earthquake",
          start_time: "13:30",
          end_time: "14:30",
          venue: "Online Room 1",
          session_type: "Keynote",
          speakers: [],
          theme: "Seismic Monitoring",
          duration_minutes: 60,
          is_keynote: true
        },
        {
          session_id: "eposter-1",
          title: "E-poster",
          start_time: "13:30",
          end_time: "14:30",
          venue: "Online Room 2",
          session_type: "E-poster",
          speakers: [],
          theme: "Research Presentation",
          duration_minutes: 60
        },
        {
          session_id: "eposter-2",
          title: "E-poster",
          start_time: "14:30",
          end_time: "15:30",
          venue: "Online Room 2",
          session_type: "E-poster",
          speakers: [],
          theme: "Research Presentation",
          duration_minutes: 60
        },
        {
          session_id: "coffee-break-mon",
          title: "Coffee break",
          start_time: "15:30",
          end_time: "16:00",
          venue: "Conference Areas",
          session_type: "Coffee break",
          speakers: [],
          theme: "Networking",
          duration_minutes: 30
        },
        {
          session_id: "eposter-3",
          title: "E-poster",
          start_time: "16:00",
          end_time: "18:00",
          venue: "Online Room 2",
          session_type: "E-poster",
          speakers: [],
          theme: "Research Presentation",
          duration_minutes: 120
        }
      ]
    },
    {
      date: "Tue 09/09",
      day_of_week: "Tuesday",
      isConferenceDay: true,
      venueCount: 4,
      totalDuration: 480, // 8 hours
      sessions: [
        {
          session_id: "registration-tue",
          title: "Registration",
          start_time: "09:00",
          end_time: "10:00",
          venue: "Hofburg Palace",
          session_type: "Registration",
          speakers: [],
          theme: "Conference Operations",
          duration_minutes: 60
        },
        {
          session_id: "hlp-plenary",
          title: "High-Level Plenary: High-Level Plenary (HLP)",
          start_time: "10:00",
          end_time: "12:30",
          venue: "Festsaal, Hofburg Palace",
          session_type: "Plenary",
          speakers: [],
          theme: "High-Level Policy",
          duration_minutes: 150,
          is_keynote: true
        },
        {
          session_id: "lunch-break-tue",
          title: "Lunch break",
          start_time: "12:30",
          end_time: "13:30",
          venue: "Hofburg Palace & Online",
          session_type: "Lunch break",
          speakers: [],
          theme: "Networking",
          duration_minutes: 60
        },
        {
          session_id: "O3.1",
          title: "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
          start_time: "13:30",
          end_time: "14:50",
          venue: "Prinz Eugen Saal",
          session_type: "Oral",
          speakers: ["Mr Anooshiravan Ansari", "Mr Benoit Doury"],
          theme: "T3.1",
          duration_minutes: 80
        },
        {
          session_id: "O5.1-803",
          title: "Monitoring whale populations from acoustic data over large temporal and spatial scales",
          start_time: "13:30",
          end_time: "13:45",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Ms Danielle Harris"],
          theme: "T1.3",
          duration_minutes: 15
        },
        {
          session_id: "Pa10",
          title: "Panel \"Today's minds tomorrow's innovators\"",
          start_time: "13:30",
          end_time: "15:00",
          venue: "Festsaal",
          session_type: "Panel",
          speakers: [],
          theme: "Innovation",
          duration_minutes: 90
        },
        {
          session_id: "O5.1-327",
          title: "Verification and Modelling of Tsunami Arrival Time and Wave Height Along Thailand's Andaman Sea Coast Using an Enhanced TOAST",
          start_time: "13:45",
          end_time: "14:00",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Ms Chutimon Promsuk"],
          theme: "T1.3",
          duration_minutes: 15
        },
        {
          session_id: "O5.1-186",
          title: "The effect of climate change and diminishing sea-ice on the microbarom with implications for IMS infrasound station noise",
          start_time: "14:00",
          end_time: "14:15",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Loring Schaible"],
          theme: "T1.1",
          duration_minutes: 15
        },
        {
          session_id: "O5.1-448",
          title: "The Volcanic Information System: Long-Range Infrasound Monitoring of Volcanic Eruptions",
          start_time: "14:15",
          end_time: "14:30",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Mr Rodrigo De Negri"],
          theme: "T1.1",
          duration_minutes: 15
        }
      ]
    }
  ],
  timeSlots: [
    {
      time: "13:30 - 14:30",
      isPrimary: true,
      sessions: [
        {
          session_id: "keynote-myanmar",
          title: "Keynote on Myanmar earthquake",
          start_time: "13:30",
          end_time: "14:30",
          venue: "Online Room 1",
          session_type: "Keynote",
          speakers: [],
          theme: "Seismic Monitoring",
          duration_minutes: 60,
          is_keynote: true
        },
        {
          session_id: "O3.1",
          title: "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
          start_time: "13:30",
          end_time: "14:50",
          venue: "Prinz Eugen Saal",
          session_type: "Oral",
          speakers: ["Mr Anooshiravan Ansari", "Mr Benoit Doury"],
          theme: "T3.1",
          duration_minutes: 80
        },
        {
          session_id: "Pa10",
          title: "Panel \"Today's minds tomorrow's innovators\"",
          start_time: "13:30",
          end_time: "15:00",
          venue: "Festsaal",
          session_type: "Panel",
          speakers: [],
          theme: "Innovation",
          duration_minutes: 90
        }
      ]
    },
    {
      time: "10:00 - 12:30",
      isPrimary: true,
      sessions: [
        {
          session_id: "hlp-plenary",
          title: "High-Level Plenary: High-Level Plenary (HLP)",
          start_time: "10:00",
          end_time: "12:30",
          venue: "Festsaal, Hofburg Palace",
          session_type: "Plenary",
          speakers: [],
          theme: "High-Level Policy",
          duration_minutes: 150,
          is_keynote: true
        }
      ]
    },
    {
      time: "13:30 - 15:00",
      sessions: [
        {
          session_id: "O5.1-803",
          title: "Monitoring whale populations from acoustic data",
          start_time: "13:30",
          end_time: "13:45",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Ms Danielle Harris"],
          theme: "T1.3",
          duration_minutes: 15
        },
        {
          session_id: "O5.1-327",
          title: "Tsunami Verification and Modelling",
          start_time: "13:45",
          end_time: "14:00",
          venue: "Forum",
          session_type: "Oral",
          speakers: ["Ms Chutimon Promsuk"],
          theme: "T1.3",
          duration_minutes: 15
        }
      ]
    },
    {
      time: "15:30 - 16:00",
      isBreak: true,
      sessions: [
        {
          session_id: "coffee-break-mon",
          title: "Coffee break",
          start_time: "15:30",
          end_time: "16:00",
          venue: "Conference Areas",
          session_type: "Coffee break",
          speakers: [],
          theme: "Networking",
          duration_minutes: 30
        }
      ]
    }
  ],
  venues: ["Hofburg Palace", "Festsaal", "Forum", "Prinz Eugen Saal", "Online Room 1", "Online Room 2"],
  sessionTypes: ["Opening", "Keynote", "Plenary", "Oral", "Panel", "E-poster", "Registration", "Coffee break", "Lunch break"],
  themes: ["T3.1", "T1.3", "T1.1", "Seismic Monitoring", "Research Presentation", "High-Level Policy", "Innovation", "Networking", "Conference Operations"],
  priority_level: "high",
  relevance_score: 0.95
};

/**
 * 🎯 ScheduleCard Layout Demonstrations
 * 
 * These examples show different ways to compose ScheduleCard
 * using the compound component pattern with real SnT2025 data.
 */

export default function ScheduleCardDemo() {
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'compact' | 'minimal' | 'custom'>('default');
  const [selectedView, setSelectedView] = useState<'daily' | 'time' | 'venue' | 'theme'>('daily');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ScheduleCard Demo - SnT2025 Real Data
        </h1>
        <p className="text-gray-600">
          Voice-controlled kiosk components using actual conference schedule information
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

      {/* View Mode Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge
          variant={selectedView === 'daily' ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedView('daily')}
        >
          Daily View
        </Badge>
        <Badge
          variant={selectedView === 'time' ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedView('time')}
        >
          Time Slots
        </Badge>
        <Badge
          variant={selectedView === 'venue' ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedView('venue')}
        >
          Venues
        </Badge>
        <Badge
          variant={selectedView === 'theme' ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedView('theme')}
        >
          Themes
        </Badge>
      </div>

      {/* Card Display */}
      <motion.div
        layout
        className="bg-gray-50 p-6 rounded-lg"
      >
        {selectedLayout === 'default' && (
          <ScheduleCard schedule={realSnT2025Schedule} viewMode={selectedView}>
            <ScheduleCard.Header>
              <ScheduleCard.Title />
              <ScheduleCard.Meta />
            </ScheduleCard.Header>
            <ScheduleCard.Body>
              <ScheduleCard.Overview />
              <ScheduleCard.Days maxDays={2} />
              <ScheduleCard.TimeSlots maxSlots={4} />
              <ScheduleCard.Venues />
              <ScheduleCard.SessionTypes />
            </ScheduleCard.Body>
            <ScheduleCard.Footer />
          </ScheduleCard>
        )}

        {selectedLayout === 'compact' && (
          <ScheduleCard schedule={realSnT2025Schedule} viewMode={selectedView} compact>
            <ScheduleCard.Header>
              <ScheduleCard.Title />
              <ScheduleCard.Meta />
            </ScheduleCard.Header>
            <ScheduleCard.Body>
              <ScheduleCard.Overview />
              <ScheduleCard.Days maxDays={2} />
              <ScheduleCard.Venues />
            </ScheduleCard.Body>
          </ScheduleCard>
        )}

        {selectedLayout === 'minimal' && (
          <ScheduleCard schedule={realSnT2025Schedule} viewMode={selectedView} compact>
            <ScheduleCard.Header>
              <ScheduleCard.Title />
              <ScheduleCard.Meta />
            </ScheduleCard.Header>
            <ScheduleCard.Body>
              <ScheduleCard.Overview />
            </ScheduleCard.Body>
          </ScheduleCard>
        )}

        {selectedLayout === 'custom' && (
          <ScheduleCard schedule={realSnT2025Schedule} viewMode={selectedView}>
            <ScheduleCard.Header>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <ScheduleCard.Title className="text-blue-900" />
                  <div className="mt-2 text-sm text-gray-500">
                    {realSnT2025Schedule.totalDays} days • {realSnT2025Schedule.totalSessions} sessions • {realSnT2025Schedule.venues.length} venues
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Badge variant="secondary">
                    SnT2025
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    {realSnT2025Schedule.priority_level}
                  </Badge>
                </div>
              </div>
            </ScheduleCard.Header>
            <ScheduleCard.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <ScheduleCard.Overview />
                  <ScheduleCard.TimeSlots maxSlots={3} />
                </div>
                <div className="space-y-3">
                  <ScheduleCard.Days maxDays={2} />
                  <ScheduleCard.Venues />
                </div>
              </div>
              <div className="mt-4">
                <ScheduleCard.SessionTypes />
                <div className="mt-3">
                  <ScheduleCard.Themes />
                </div>
              </div>
            </ScheduleCard.Body>
            <ScheduleCard.Footer>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Vienna, Austria • Hofburg Palace
                </span>
                {realSnT2025Schedule.relevance_score && (
                  <span className="text-blue-600 font-medium">
                    {(realSnT2025Schedule.relevance_score * 100).toFixed(0)}% relevance
                  </span>
                )}
              </div>
            </ScheduleCard.Footer>
          </ScheduleCard>
        )}
      </motion.div>

      {/* Real SnT2025 Schedule Context Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📅 SnT2025 Conference Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Day 1: Monday 08/09</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>13:00:</strong> Conference Opening</li>
              <li>• <strong>13:30:</strong> Keynote on Myanmar earthquake</li>
              <li>• <strong>E-poster sessions:</strong> Online presentations</li>
              <li>• <strong>Duration:</strong> 5 hours total</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Day 2: Tuesday 09/09</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>09:00:</strong> Registration at Hofburg Palace</li>
              <li>• <strong>10:00:</strong> High-Level Plenary (HLP)</li>
              <li>• <strong>13:30+:</strong> Multiple oral sessions with real speakers</li>
              <li>• <strong>Venues:</strong> Festsaal, Forum, Prinz Eugen Saal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Authentic Data Details */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          🎯 Authentic Conference Data Features
        </h3>
        <ul className="space-y-2 text-green-800 text-sm">
          <li>• <strong>Real speakers:</strong> Ms Danielle Harris, Mr Anooshiravan Ansari, Mr Rodrigo De Negri</li>
          <li>• <strong>Actual venues:</strong> Hofburg Palace, Festsaal, Forum, Prinz Eugen Saal</li>
          <li>• <strong>Precise timing:</strong> 15-minute and 80-minute sessions from real schedule</li>
          <li>• <strong>Session types:</strong> Keynote, Plenary, Oral, Panel, E-poster</li>
          <li>• <strong>Research themes:</strong> T3.1, T1.3, T1.1 from actual CTBTO classification</li>
          <li>• <strong>Voice-only design:</strong> No hover states, WCAG AAA compliance</li>
          <li>• <strong>Real topics:</strong> Seismic monitoring, whale acoustics, volcanic systems</li>
          <li>• <strong>Professional layout:</strong> Compound components for flexible display</li>
        </ul>
      </div>
    </div>
  );
} 