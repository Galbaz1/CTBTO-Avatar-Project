import React from "react";
import { motion } from "framer-motion";
import {
  PremiumSessionCardDefault,
  type PremiumTimetableSession,
} from "./PremiumSessionCard";
import { SpeakerCardDefault, type SnT2025Speaker } from "./SpeakerCard";
import { Badge } from "../compound/Badge";

// Real SnT2025 session data
const realSession: PremiumTimetableSession = {
  session_id: "O3.1-803",
  title: "Seismic, Hydroacoustic and Infrasound Technologies and Applications",
  description:
    "This session covers advances in seismic, hydroacoustic and infrasound technologies for monitoring CTBT compliance, including machine learning applications for rapid earthquake localization and detection capabilities of the International Monitoring System.",
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
  relevance_score: 0.95,
};

// Real SnT2025 speaker data
const realSpeaker: SnT2025Speaker = {
  name: "Anooshiravan Ansari",
  title: "Associate Professor in Seismology",
  organization:
    "International Institute of Earthquake Engineering and Seismology (IIEES)",
  country: "Iran",
  bio: "Vice President of Research and Postgraduate Studies specializing in seismic hazard modeling, signal processing, and CTBTO International Monitoring System evaluation",
  expertise: [
    "Seismic Hazard and Ground‐Motion Modeling",
    "Signal Processing and Noise Reduction",
    "Machine Learning for Seismic Location",
    "CTBTO International Monitoring System (IMS) evaluation",
  ],
  sessions: [
    {
      session_id: "O3.1-803",
      title:
        "Seismic, Hydroacoustic and Infrasound Technologies and Applications",
      time: "13:30",
      date: "2025-09-09",
      venue: "Prinz Eugen Saal",
      session_type: "Oral Session",
      theme: "T3.1",
      duration: 80,
    },
  ],
  sessionCount: 1,
  themes: ["T3.1"],
  venues: ["Prinz Eugen Saal"],
  sessionTypes: ["Oral Session"],
  totalDuration: 80,
  isKeynote: false,
  experience_level: "expert",
  priority_level: "high",
  relevance_score: 0.95,
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface DesignShowcaseProps {
  className?: string;
}

export const DesignShowcase: React.FC<DesignShowcaseProps> = ({
  className,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-8 p-6 ${className}`}
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          SnT2025 Conference Cards
        </h2>
        <p className="text-gray-600 mb-6">
          Professional card designs for the CTBT Science & Technology Conference
          2025
        </p>
      </motion.div>

      {/* Session Card Showcase */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Session Cards</h3>
          <Badge variant="outline" className="text-xs">
            Real SnT2025 Data
          </Badge>
        </div>

        <div className="max-w-2xl">
          <PremiumSessionCardDefault session={realSession} className="w-full" />
        </div>
      </motion.div>

      {/* Speaker Card Showcase */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Speaker Cards</h3>
          <Badge variant="outline" className="text-xs">
            Real SnT2025 Speakers
          </Badge>
        </div>

        <div className="max-w-2xl">
          <SpeakerCardDefault speaker={realSpeaker} className="w-full" />
        </div>
      </motion.div>

      {/* CTBTO Branding Info */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-6 bg-gradient-to-br from-[#204054] to-[#7FCDCD] rounded flex items-center justify-center text-white text-xs font-bold">
            CTBTO
          </div>
          <h4 className="font-semibold text-gray-900">Design System</h4>
        </div>
        <p className="text-sm text-gray-600">
          Cards follow CTBTO brand guidelines with seafoam green (#7FCDCD) and
          navy blue (#204054) color scheme, professional typography, and clean
          layouts optimized for the kiosk environment.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default DesignShowcase;
