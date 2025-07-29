/**
 * TypeScript definitions for Tavus CVI interactions
 * Based on research/tavus_cvi_research.md patterns
 */

/**
 * Base structure for all CVI events
 */
export interface CVIEvent {
  event_type: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

/**
 * User or replica utterance event
 */
export interface CVIUtteranceEvent extends CVIEvent {
  event_type: "conversation.utterance";
  properties: {
    speech: string;
    speaker: "user" | "replica";
    confidence?: number;
  };
}

/**
 * Tool call invocation event
 */
export interface CVIToolCallEvent extends CVIEvent {
  event_type: "conversation.tool_call";
  properties: {
    tool_name: string;
    arguments: Record<string, any>;
    call_id: string;
  };
}

/**
 * Speaking status change event
 */
export interface CVISpeakingEvent extends CVIEvent {
  event_type: "conversation.speaking";
  properties: {
    is_speaking: boolean;
    speaker: "user" | "replica";
  };
}

/**
 * Union type for all possible CVI events
 */
export type CVIEventUnion =
  | CVIUtteranceEvent
  | CVIToolCallEvent
  | CVISpeakingEvent;

/**
 * Properties for sending app messages to CVI
 */
export interface SendAppMessageProps {
  message_type: "conversation";
  event_type:
    | "conversation.respond"
    | "conversation.echo"
    | "conversation.interrupt";
  properties: {
    text: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Conference data types for RAG updates
 */
export interface ConferenceRAGData {
  session?: ConferenceSession;
  speaker?: ConferenceSpeaker;
  topic?: ConferenceTopic;
  venue?: ConferenceVenue;
}

export interface ConferenceSession {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  speakers: string[];
  venue_id?: string;
}

export interface ConferenceSpeaker {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  biography?: string;
  expertise: string[];
  sessions: string[];
}

export interface ConferenceTopic {
  id: string;
  name: string;
  description?: string;
  category: string;
  keywords: string[];
}

export interface ConferenceVenue {
  id: string;
  name: string;
  floor?: string;
  capacity?: number;
  accessibility?: string;
  location_description?: string;
}
