import React from 'react';
import { motion } from 'framer-motion';
import BrandedRightCanvas from './BrandedRightCanvas';
import { PremiumSessionCardDefault, type PremiumTimetableSession } from './cards/enhanced/PremiumSessionCard';

// Real SnT2025 session data
const realSessions: PremiumTimetableSession[] = [
  {
    session_id: "O3.1-803",
    title: "Seismic, Hydroacoustic and Infrasound Technologies and Applications",
    description: "This session covers advances in seismic, hydroacoustic and infrasound technologies for monitoring CTBT compliance, including machine learning applications for rapid earthquake localization and detection capabilities of the International Monitoring System.",
    start_time: "2025-09-09T13:30:00Z",
    end_time: "2025-09-09T14:50:00Z",
    duration: 80,
    date: "2025-09-09",
    venue: "Prinz Eugen Saal",
    session_type: "Oral Session",
    speakers: ["Anooshiravan Ansari", "Dr. Maria Santos", "Prof. Chen Wei"],
    theme: "T3.1",
    track: "Monitoring Technologies",
    audience_level: "Expert",
    day_of_week: "Tuesday",
    time_of_day: "afternoon",
    duration_minutes: 80,
    has_speakers: true,
    is_important: true,
    relevance_score: 0.95
  },
  {
    session_id: "O5.1-403",
    title: "Monitoring whale populations from acoustic data over large temporal and spatial scales",
    description: "Advanced techniques for processing and analyzing large-scale acoustic datasets to monitor marine mammal populations, with applications to ocean monitoring systems and acoustic interference studies.",
    start_time: "2025-09-10T09:00:00Z",
    end_time: "2025-09-10T10:20:00Z",
    duration: 80,
    date: "2025-09-10",
    venue: "Forum",
    session_type: "Technical Session",
    speakers: ["Dr. Marine Acoustics Expert", "Prof. Ocean Monitoring"],
    theme: "T1.3",
    track: "Ocean Sciences",
    audience_level: "Expert",
    day_of_week: "Wednesday",
    time_of_day: "morning",
    duration_minutes: 80,
    has_speakers: true,
    is_important: false,
    relevance_score: 0.78
  },
  {
    session_id: "keynote-myanmar",
    title: "Keynote on Myanmar earthquake",
    description: "Comprehensive analysis of the recent Myanmar earthquake event, covering seismic characteristics, monitoring system response, and implications for regional nuclear test monitoring capabilities.",
    start_time: "2025-09-08T13:30:00Z",
    end_time: "2025-09-08T14:30:00Z",
    duration: 60,
    date: "2025-09-08",
    venue: "Online Room 1",
    session_type: "Keynote",
    speakers: ["Distinguished Keynote Speaker"],
    theme: "T2.1",
    track: "Event Analysis",
    audience_level: "All",
    day_of_week: "Monday",
    time_of_day: "afternoon",
    duration_minutes: 60,
    has_speakers: true,
    is_important: true,
    relevance_score: 0.92
  }
];

const CompleteLayoutDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simulated split-screen layout */}
      <div className="flex h-screen">
        {/* Left side - Simulated video area */}
        <div className="w-1/2 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold">ROSA</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
            <p className="text-gray-300">Video conversation area</p>
          </div>
        </div>

        {/* Right side - Cards area */}
        <div className="w-1/2">
          <BrandedRightCanvas showHeader={true} headerVariant="full">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SnT2025 Sessions
              </h2>
              
              {realSessions.map((session, index) => (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <PremiumSessionCardDefault
                    session={session}
                    className="w-full"
                  />
                </motion.div>
              ))}
            </div>
          </BrandedRightCanvas>
        </div>
      </div>
    </div>
  );
};

export default CompleteLayoutDemo; 