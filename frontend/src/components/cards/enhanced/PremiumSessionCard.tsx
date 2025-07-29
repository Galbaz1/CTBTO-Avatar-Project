import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Building } from "lucide-react";

// === TYPES & INTERFACES ===

interface PremiumTimetableSession {
  session_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  date: string;
  venue: string;
  session_type: string;
  speakers: string[];
  theme: string;
  track: string;
  audience_level: string;
  day_of_week: string;
  time_of_day: string;
  duration_minutes: number;
  has_speakers: boolean;
  is_important: boolean;
  relevance_score: number;
}

// === SOPHISTICATED ANIMATION SYSTEM ===

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
    },
  },
};

// === UTILITY FUNCTIONS ===

const formatTime = (timeString: string) => {
  try {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return timeString;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getSessionTypeColor = (sessionType: string) => {
  const type = sessionType.toLowerCase();
  if (type.includes("keynote"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  if (type.includes("panel"))
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (type.includes("technical"))
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (type.includes("workshop"))
    return "bg-purple-100 text-purple-800 border-purple-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const getThemeColor = (theme: string) => {
  const themeNum = theme.match(/T(\d+)/)?.[1];
  const colors = [
    "bg-red-100 text-red-700",
    "bg-orange-100 text-orange-700",
    "bg-yellow-100 text-yellow-700",
    "bg-green-100 text-green-700",
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
  ];
  return (
    colors[parseInt(themeNum || "0") % colors.length] ||
    "bg-gray-100 text-gray-700"
  );
};

// === MAIN COMPONENT ===

interface PremiumSessionCardProps {
  session: PremiumTimetableSession;
  size?: "compact" | "default" | "full";
  showActions?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PremiumSessionCardDefault: React.FC<PremiumSessionCardProps> = ({
  session,
  className,
}) => {
  const relevancePercent = Math.round((session.relevance_score || 0) * 100);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full", className)}
    >
      <Card
        className={cn(
          // === CORE LAYOUT ===
          "relative overflow-hidden",
          "border border-gray-200/60",
          "transition-all duration-200 ease-out",

          // === CTBTO PROFESSIONAL STYLING ===
          "bg-white",
        )}
      >
        {/* === CTBTO HEADER WITH LOGO === */}
        <div
          className={cn(
            "h-1.5 w-full",
            "bg-gradient-to-r from-[#204054] via-[#2A5469] to-[#7FCDCD]", // CTBTO brand gradient
          )}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle
                className={cn(
                  "text-lg font-semibold text-gray-900 leading-tight",
                  "line-clamp-2",
                )}
              >
                {session.title}
              </CardTitle>

              {/* Session Type & Theme Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 font-medium",
                    getSessionTypeColor(session.session_type),
                  )}
                >
                  {session.session_type}
                </Badge>

                {session.theme && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-1 font-medium",
                      getThemeColor(session.theme),
                    )}
                  >
                    {session.theme}
                  </Badge>
                )}
              </div>
            </div>

            {/* CTBTO Logo Area */}
            <div className="flex flex-col items-end gap-1">
              <div
                className={cn(
                  "w-8 h-6 rounded-sm",
                  "bg-gradient-to-br from-[#7FCDCD] to-[#5BB5B5]", // CTBTO seafoam
                  "flex items-center justify-center",
                  "text-[10px] font-bold text-white",
                  "shadow-sm",
                )}
              >
                CTBTO
              </div>
              {session.relevance_score && (
                <span className="text-xs text-gray-500 font-medium">
                  {relevancePercent}% match
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Description */}
          {session.description && (
            <CardDescription
              className={cn(
                "text-sm text-gray-600 leading-relaxed mb-4",
                "line-clamp-3",
              )}
            >
              {session.description}
            </CardDescription>
          )}

          {/* Session Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#204054]" />
              <div>
                <div className="font-medium text-gray-900">
                  {formatDate(session.date)}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(session.start_time)} -{" "}
                  {formatTime(session.end_time)}
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-[#7FCDCD]" />
              <div>
                <div className="font-medium text-gray-900">
                  {session.venue || "TBA"}
                </div>
                <div className="text-gray-600">
                  {session.duration_minutes
                    ? `${session.duration_minutes}min`
                    : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Speakers */}
          {session.speakers && session.speakers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#204054]" />
                <span className="text-sm font-medium text-gray-900">
                  Speakers ({session.speakers.length})
                </span>
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">
                {session.speakers.join(", ")}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer with CTBTO Branding */}
        <CardFooter
          className={cn(
            "pt-3 border-t border-gray-100",
            "bg-gradient-to-r from-gray-50/50 to-[#E6F3F3]/30", // Subtle CTBTO seafoam
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">SnT2025 Conference</div>
            <div className="text-xs font-medium text-[#204054]">
              Session {session.session_id}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// === EXPORTS ===

export const PremiumSessionCard = PremiumSessionCardDefault;
export type { PremiumTimetableSession };
