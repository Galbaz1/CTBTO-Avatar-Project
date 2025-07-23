export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: 'active' | 'ended' | 'error';
  conversation_url: string;
  replica_id: string | null;
  persona_id: string | null;
  created_at: string;
};

// Enhanced Card Data Types
export interface SessionCardData {
  session_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  date: string;
  venue: string;
  speakers: string[];
  theme: string;
  track: string;
  session_type: string;
  duration_minutes: number;
  audience_level: string;
  is_interactive: boolean;
  is_technical: boolean;
}

export interface SpeakerCardData {
  speaker_name: string;
  sessions: SessionCardData[];
  total_sessions: number;
  expertise_areas: string[];
  speaker_type: "keynote" | "panelist" | "technical" | "workshop";
}

export interface TopicCardData {
  theme: string;
  description: string;
  related_sessions: SessionCardData[];
  session_count: number;
  tracks: string[];
  expertise_level: "beginner" | "intermediate" | "expert" | "all";
}

// RAG Search Results
export interface RAGSearchResults {
  sessions: SessionCardData[];
  speakers: SpeakerCardData[];
  topics: TopicCardData[];
  query: string;
  total_results: number;
}
