// === ENHANCED CARD SYSTEM ===
// Professional CTBTO-branded cards with premium design

export { SessionCard } from "./SessionCard";
export {
  SpeakerCard,
  SpeakerCardDefault,
  SpeakerCardCompact,
  SpeakerCardMinimal,
} from "./SpeakerCard";
export {
  PremiumSessionCard,
  PremiumSessionCardDefault,
  type PremiumTimetableSession,
} from "./PremiumSessionCard";
export { TopicCard } from "./TopicCard";
export { VenueCard } from "./VenueCard";
export { ScheduleCard } from "./ScheduleCard";

// === DESIGN SYSTEM SHOWCASE ===
export { default as DesignShowcase } from "./DesignShowcase";

// === COMPOUND COMPONENTS ===
export { Badge } from "../compound/Badge";
export { Card } from "../compound/Card";

// Utility for processing timetable.json data
export {
  TimetableProcessor,
  type TimetableEntry,
  type TimetableData,
  type SessionCardData,
  type SpeakerCardData,
  type VenueCardData,
  type TopicCardData,
  type ScheduleCardData,
} from "./TimetableProcessor";

// Complete card suite exports - using proper type imports
export type {
  TimetableEntry as Session,
  SpeakerCardData as Speaker,
  VenueCardData as Venue,
  TopicCardData as Topic,
  ScheduleCardData as Schedule,
} from "./TimetableProcessor";

// New compound component types - remove duplicates
export type { TimetableSession } from "./SessionCard";
export type { SnT2025Speaker } from "./SpeakerCard";
export type { SnT2025Topic } from "./TopicCard";
export type { SnT2025Venue } from "./VenueCard";
