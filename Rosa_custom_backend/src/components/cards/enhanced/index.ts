// Enhanced Card Components - Complete Suite for Timetable Data
export { EnhancedSessionCard } from './SessionCard';
export { SessionCard } from './NewSessionCard'; // New compound component implementation
export { SpeakerCard } from './SpeakerCard'; // New compound component implementation
export { TopicCard } from './TopicCard'; // New compound component implementation
export { VenueCard } from './VenueCard'; // New compound component implementation
export { ScheduleCard } from './ScheduleCard';

// Demo Components
// Demo components temporarily disabled for build
// export { default as SessionCardDemo } from './SessionCardDemo';
// export { default as SpeakerCardDemo } from './SpeakerCardDemo';
// export { default as TopicCardDemo } from './TopicCardDemo';
// export { default as VenueCardDemo } from './VenueCardDemo';

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
export type { TimetableSession } from './NewSessionCard';
export type { SnT2025Speaker } from './SpeakerCard';
export type { SnT2025Topic } from './TopicCard';
export type { SnT2025Venue } from './VenueCard'; 