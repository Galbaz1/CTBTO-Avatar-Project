// Enhanced Card Components - Complete Suite for Timetable Data
export { SessionCard } from './SessionCard'; // Compound component implementation
export { SpeakerCard } from './SpeakerCard'; // New compound component implementation
export { TopicCard } from './TopicCard'; // New compound component implementation
export { VenueCard } from './VenueCard'; // New compound component implementation
export { ScheduleCard } from './ScheduleCard';

// Utility for processing timetable.json data
export { 
  TimetableProcessor,
  type TimetableEntry,
  type TimetableData,
  type SessionCardData,
  type SpeakerCardData,
  type VenueCardData,
  type TopicCardData,
  type ScheduleCardData
} from './TimetableProcessor';

// Complete card suite exports - using proper type imports
export type {
  TimetableEntry as Session,
  SpeakerCardData as Speaker,
  VenueCardData as Venue,
  TopicCardData as Topic,
  ScheduleCardData as Schedule
} from './TimetableProcessor';

// New compound component types
export type { TimetableSession } from './SessionCard';
export type { SnT2025Speaker } from './SpeakerCard';
export type { SnT2025Topic } from './TopicCard';
export type { SnT2025Venue } from './VenueCard'; 