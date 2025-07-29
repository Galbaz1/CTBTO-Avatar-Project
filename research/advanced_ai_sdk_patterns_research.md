# Advanced AI SDK Patterns for CTBTO Avatar

**Date:** 2025-01-29  
**Source:** Vercel AI SDK Documentation, OpenAI API Guidelines, Web Research  
**Purpose:** Advanced implementation patterns for voice-first AI interactions in CTBTO Avatar

## Executive Summary

This research consolidates advanced patterns for integrating Vercel AI SDK v5 with OpenAI Structured Outputs to create sophisticated voice-first interfaces. It focuses on streaming responses, tool calling, generative UI, and error handling specifically optimized for the CTBTO Avatar kiosk.

## 1. Advanced useChat Hook Patterns

### Streaming Voice-Optimized Configuration
```typescript
import { useChat } from 'ai/react';
import { useState, useCallback, useEffect } from 'react';

interface VoiceOptimizedChatConfig {
  sessionId: string;
  onVoiceResponse?: (response: string) => void;
  onToolCall?: (toolName: string, args: any) => void;
  voiceSettings?: {
    enableStreaming: boolean;
    chunkSize: number;
    responseDelay: number;
  };
}

export function useVoiceOptimizedChat(config: VoiceOptimizedChatConfig) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    append,
  } = useChat({
    api: '/api/voice-chat',
    id: config.sessionId,
    
    // Streaming configuration optimized for voice
    streamMode: 'text',
    
    // Handle tool calls for voice interface
    onToolCall: async (toolCall) => {
      setCurrentToolCall(toolCall.toolName);
      config.onToolCall?.(toolCall.toolName, toolCall.args);
      
      // Return tool result for continued processing
      return await handleToolExecution(toolCall);
    },
    
    // Process streaming responses for voice synthesis
    onFinish: (message) => {
      setIsProcessing(false);
      setCurrentToolCall(null);
      
      // Extract final text response for TTS
      const textResponse = extractTextFromMessage(message);
      if (textResponse) {
        config.onVoiceResponse?.(textResponse);
      }
    },
    
    // Handle errors gracefully for voice interface
    onError: (error) => {
      setIsProcessing(false);
      setCurrentToolCall(null);
      
      const errorMessage = "I apologize, but I'm having trouble processing your request. Could you please try again?";
      config.onVoiceResponse?.(errorMessage);
    },
    
    // Custom headers for session management
    headers: {
      'X-Session-ID': config.sessionId,
      'X-Voice-Interface': 'true',
      'X-Response-Format': 'voice-optimized',
    },
  });
  
  // Voice-specific message sending
  const sendVoiceMessage = useCallback(async (utterance: string) => {
    setIsProcessing(true);
    
    await append({
      role: 'user',
      content: utterance,
      metadata: {
        inputType: 'voice',
        timestamp: Date.now(),
        sessionId: config.sessionId,
      },
    });
  }, [append, config.sessionId]);
  
  return {
    messages,
    isProcessing: isProcessing || isLoading,
    currentToolCall,
    error,
    sendVoiceMessage,
    reload,
  };
}

// Helper functions
function extractTextFromMessage(message: any): string | null {
  // Extract the final text response from message parts
  for (const part of message.parts || []) {
    if (part.type === 'text') {
      return part.text;
    }
  }
  return message.content || null;
}

async function handleToolExecution(toolCall: any): Promise<any> {
  // Handle different tool types for CTBTO Avatar
  switch (toolCall.toolName) {
    case 'showSpeaker':
      return await fetchSpeakerData(toolCall.args);
    case 'showSession':
      return await fetchSessionData(toolCall.args);
    case 'searchVenue':
      return await fetchVenueData(toolCall.args);
    default:
      throw new Error(`Unknown tool: ${toolCall.toolName}`);
  }
}
```

### Progressive Message Rendering
```typescript
interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts?: MessagePart[];
  timestamp: number;
}

interface MessagePart {
  type: 'text' | 'tool-showSpeaker' | 'tool-showSession' | 'tool-searchVenue';
  state: 'input-available' | 'output-available' | 'output-error';
  text?: string;
  input?: any;
  output?: any;
  errorText?: string;
}

export function VoiceMessageRenderer({ messages }: { messages: VoiceMessage[] }) {
  return (
    <div className="voice-conversation-history" role="log" aria-live="polite">
      {messages.map((message) => (
        <VoiceMessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}

function VoiceMessageCard({ message }: { message: VoiceMessage }) {
  return (
    <article 
      className="voice-message wcag-aaa-text" 
      role="article"
      aria-labelledby={`message-${message.id}-header`}
    >
      <header id={`message-${message.id}-header`} className="sr-only">
        {message.role === 'user' ? 'Your question' : 'Rosa\'s response'}
      </header>
      
      {/* Text content */}
      {message.content && (
        <div className="message-text" aria-label="Conversation text">
          <p>{message.content}</p>
        </div>
      )}
      
      {/* Tool call results */}
      {message.parts?.map((part, index) => (
        <VoiceToolResult key={index} part={part} />
      ))}
    </article>
  );
}

function VoiceToolResult({ part }: { part: MessagePart }) {
  switch (part.type) {
    case 'tool-showSpeaker':
      return <VoiceSpeakerResult part={part} />;
    case 'tool-showSession':
      return <VoiceSessionResult part={part} />;
    case 'tool-searchVenue':
      return <VoiceVenueResult part={part} />;
    default:
      return null;
  }
}
```

## 2. OpenAI Structured Outputs Integration

### Zod Schema Definitions for CTBTO Data
```typescript
import { z } from 'zod';

// Speaker information schema
export const SpeakerSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  organization: z.string(),
  expertise: z.array(z.string()),
  biography: z.string(),
  sessions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    time: z.string(),
    venue: z.string(),
  })),
  contactInfo: z.object({
    email: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

// Session information schema
export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string(),
  sessionType: z.enum(['Technical Session', 'Workshop', 'Plenary', 'Panel Discussion']),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  venue: z.object({
    name: z.string(),
    floor: z.string(),
    capacity: z.number(),
    accessibility: z.string(),
  }),
  speakers: z.array(z.object({
    name: z.string(),
    title: z.string(),
    organization: z.string(),
  })),
  topics: z.array(z.string()),
  materials: z.array(z.object({
    type: z.enum(['slides', 'paper', 'video']),
    url: z.string(),
    title: z.string(),
  })).optional(),
});

// Search results schema
export const SearchResultSchema = z.object({
  query: z.string(),
  totalResults: z.number(),
  results: z.array(z.object({
    type: z.enum(['speaker', 'session', 'venue', 'topic']),
    relevanceScore: z.number(),
    data: z.union([SpeakerSchema, SessionSchema]),
  })),
  suggestions: z.array(z.string()).optional(),
  voiceResponse: z.string(),
});

// Voice interaction schema
export const VoiceInteractionSchema = z.object({
  utterance: z.string(),
  intent: z.enum([
    'find-speaker',
    'find-session',
    'get-directions',
    'schedule-info',
    'general-info',
    'unknown'
  ]),
  entities: z.object({
    speakerName: z.string().optional(),
    sessionTitle: z.string().optional(),
    venue: z.string().optional(),
    timeReference: z.string().optional(),
    topic: z.string().optional(),
  }),
  confidence: z.number(),
  responseType: z.enum(['informational', 'navigational', 'transactional']),
});
```

### Edge Function with Structured Tool Calling
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool, convertToOpenAITool } from 'ai';
import { z } from 'zod';

// Tool definitions with structured outputs
const showSpeaker = tool({
  description: 'Display detailed information about a conference speaker',
  parameters: z.object({
    speakerName: z.string().describe('Full name or partial name of the speaker'),
    includeSession: z.boolean().default(true).describe('Whether to include session information'),
  }),
  execute: async ({ speakerName, includeSession }) => {
    const response = await fetch(`${process.env.DATA_API_URL}/api/search/speakers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: speakerName,
        limit: 1,
        includeReferences: includeSession,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Speaker search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate with Zod schema
    const speakerData = SpeakerSchema.parse(data.results[0]?.data);
    
    return {
      speaker: speakerData,
      voiceResponse: generateSpeakerVoiceResponse(speakerData),
    };
  },
});

const showSession = tool({
  description: 'Display detailed information about a conference session',
  parameters: z.object({
    sessionQuery: z.string().describe('Session title, topic, or speaker name'),
    timeFilter: z.enum(['today', 'tomorrow', 'all']).default('all'),
  }),
  execute: async ({ sessionQuery, timeFilter }) => {
    const response = await fetch(`${process.env.DATA_API_URL}/api/search/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: sessionQuery,
        filters: timeFilter !== 'all' ? { day: timeFilter } : undefined,
        limit: 3,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Session search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate and structure the response
    const sessions = data.results.map((result: any) => 
      SessionSchema.parse(result.data)
    );
    
    return {
      sessions,
      voiceResponse: generateSessionVoiceResponse(sessions, sessionQuery),
    };
  },
});

const comprehensiveSearch = tool({
  description: 'Perform a comprehensive search across all conference information',
  parameters: z.object({
    query: z.string().describe('Natural language query about the conference'),
    responseLength: z.enum(['brief', 'detailed', 'comprehensive']).default('brief'),
  }),
  execute: async ({ query, responseLength }) => {
    const response = await fetch(`${process.env.DATA_API_URL}/api/voice/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utterance: query,
        session_id: 'edge-function-session',
        context: { responseLength },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Comprehensive search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the search results
    const searchResults = SearchResultSchema.parse(data.search_results);
    
    return {
      searchResults,
      voiceResponse: data.voice_response.summary,
    };
  },
});

// Main Edge Function handler
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const result = streamText({
      model: openai('gpt-4o'),
      system: `You are Rosa, the CTBTO SnT2025 conference assistant. You are knowledgeable, diplomatic, and helpful.

Key guidelines:
- Provide accurate information about speakers, sessions, and conference logistics
- Use tools to retrieve current information rather than relying on training data
- Keep responses conversational and suitable for voice synthesis
- If you can't find specific information, offer alternatives or ask for clarification
- Maintain a professional yet friendly tone appropriate for an international diplomatic conference

Available information:
- 774 conference speakers from around the world
- Technical sessions, workshops, and plenary sessions
- Venue information for Hofburg Palace, Vienna
- Conference schedule for September 8-12, 2025`,

      messages: convertToOpenAITool(messages),
      tools: {
        showSpeaker,
        showSession,
        comprehensiveSearch,
      },
      
      // Structured output configuration
      toolChoice: 'auto',
      maxTokens: 1000,
      temperature: 0.7,
      
      // Voice optimization settings
      streamingTimeout: 30000,
    });
    
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'I apologize, but I\'m experiencing technical difficulties. Please try your question again.',
        type: 'system_error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Voice response generators
function generateSpeakerVoiceResponse(speaker: any): string {
  const sessionCount = speaker.sessions?.length || 0;
  const sessionText = sessionCount > 0 
    ? `${speaker.name} is presenting ${sessionCount} session${sessionCount > 1 ? 's' : ''} at the conference.`
    : '';
  
  return `${speaker.name} is ${speaker.title} at ${speaker.organization}. ${speaker.expertise.slice(0, 2).join(' and ')} are among their areas of expertise. ${sessionText}`;
}

function generateSessionVoiceResponse(sessions: any[], query: string): string {
  if (sessions.length === 0) {
    return `I couldn't find any sessions matching "${query}". Would you like me to search for something else?`;
  }
  
  if (sessions.length === 1) {
    const session = sessions[0];
    return `I found "${session.title}" scheduled for ${session.startTime} in ${session.venue.name}. ${session.speakers.map((s: any) => s.name).join(' and ')} will be presenting.`;
  }
  
  return `I found ${sessions.length} sessions related to "${query}". The top result is "${sessions[0].title}" at ${sessions[0].startTime}. Would you like to hear about the others?`;
}
```

## 3. Generative UI Patterns for Voice Interfaces

### Dynamic Component Rendering
```typescript
interface VoiceGeneratedComponentProps {
  type: string;
  data: any;
  isVisible: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export function VoiceGeneratedComponent({ 
  type, 
  data, 
  isVisible,
  onVisibilityChange 
}: VoiceGeneratedComponentProps) {
  const [isAnnounced, setIsAnnounced] = useState(false);
  
  useEffect(() => {
    if (isVisible && !isAnnounced) {
      // Announce to screen readers when component becomes visible
      setIsAnnounced(true);
    }
  }, [isVisible, isAnnounced]);
  
  const renderComponent = () => {
    switch (type) {
      case 'speaker-card':
        return <VoiceSpeakerCard data={data} />;
      case 'session-list':
        return <VoiceSessionList data={data} />;
      case 'venue-info':
        return <VoiceVenueInfo data={data} />;
      case 'schedule-summary':
        return <VoiceScheduleSummary data={data} />;
      default:
        return <VoiceGenericCard data={data} />;
    }
  };
  
  return (
    <div 
      className={`voice-generated-component ${isVisible ? 'visible' : 'hidden'}`}
      aria-live="polite"
      aria-hidden={!isVisible}
      role="region"
      aria-label={`Generated ${type} information`}
    >
      {isVisible && renderComponent()}
    </div>
  );
}

// Specialized voice-first components
export function VoiceSpeakerCard({ data }: { data: any }) {
  return (
    <article 
      className="voice-speaker-card wcag-aaa-text"
      role="article"
      aria-labelledby={`speaker-${data.id}-name`}
    >
      <header>
        <h2 id={`speaker-${data.id}-name`} className="text-2xl font-bold mb-2">
          {data.name}
        </h2>
        <p className="text-lg text-gray-700" aria-label="Position and organization">
          {data.title} at {data.organization}
        </p>
      </header>
      
      <section aria-label="Areas of expertise" className="mt-4">
        <h3 className="font-semibold mb-2">Expertise:</h3>
        <ul className="list-disc list-inside">
          {data.expertise.map((area: string, index: number) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </section>
      
      {data.sessions && data.sessions.length > 0 && (
        <section aria-label="Conference sessions" className="mt-4">
          <h3 className="font-semibold mb-2">Presenting:</h3>
          <ul className="space-y-2">
            {data.sessions.map((session: any) => (
              <li key={session.id} className="border-l-4 border-blue-500 pl-3">
                <strong>{session.title}</strong>
                <br />
                <span className="text-sm text-gray-600">
                  {session.time} in {session.venue}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {data.biography && (
        <section aria-label="Biography" className="mt-4">
          <h3 className="font-semibold mb-2">About:</h3>
          <p className="text-gray-700">{data.biography}</p>
        </section>
      )}
    </article>
  );
}

export function VoiceSessionList({ data }: { data: any[] }) {
  return (
    <section 
      className="voice-session-list"
      role="region"
      aria-label="Conference sessions"
    >
      <h2 className="text-xl font-bold mb-4">
        Found {data.length} session{data.length !== 1 ? 's' : ''}
      </h2>
      
      <div className="space-y-4">
        {data.map((session, index) => (
          <article 
            key={session.id}
            className="voice-session-card border-2 border-gray-200 p-4 rounded-lg"
            role="article"
            aria-labelledby={`session-${session.id}-title`}
          >
            <header>
              <h3 id={`session-${session.id}-title`} className="text-lg font-semibold">
                {session.title}
              </h3>
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                <time dateTime={session.startTime} aria-label="Session time">
                  {new Date(session.startTime).toLocaleString()}
                </time>
                <span aria-label="Venue">{session.venue.name}</span>
                <span aria-label="Session type">{session.sessionType}</span>
              </div>
            </header>
            
            {session.speakers && session.speakers.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Speakers: </span>
                {session.speakers.map((speaker: any, i: number) => (
                  <span key={i}>
                    {speaker.name}{i < session.speakers.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
            
            {session.abstract && (
              <p className="mt-2 text-gray-700 text-sm line-clamp-3">
                {session.abstract}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
```

## 4. Error Handling and Recovery Patterns

### Graceful Error Recovery for Voice Interfaces
```typescript
interface VoiceErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  fallbackMessage?: string;
}

export class VoiceErrorBoundary extends React.Component<
  VoiceErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: VoiceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Voice interface error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="voice-error-fallback wcag-aaa-text p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-xl font-bold mb-4">
            Technical Difficulty
          </h2>
          <p className="mb-4">
            {this.props.fallbackMessage || 
             "I'm experiencing a technical issue. Please try asking your question in a different way."}
          </p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Hook for handling API errors in voice context
export function useVoiceErrorHandler() {
  const [lastError, setLastError] = useState<string | null>(null);
  
  const handleApiError = useCallback((error: any, context?: string) => {
    let userMessage: string;
    
    if (error.status === 404) {
      userMessage = "I couldn't find the information you're looking for. Could you try rephrasing your question?";
    } else if (error.status === 500) {
      userMessage = "I'm experiencing technical difficulties. Please try again in a moment.";
    } else if (error.status === 429) {
      userMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
    } else if (error.name === 'NetworkError') {
      userMessage = "I'm having trouble connecting to get the latest information. Please check your connection and try again.";
    } else {
      userMessage = `I apologize, but I encountered an issue${context ? ` while ${context}` : ''}. Could you please try again?`;
    }
    
    setLastError(userMessage);
    
    // Auto-clear error after 10 seconds
    setTimeout(() => setLastError(null), 10000);
    
    return userMessage;
  }, []);
  
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);
  
  return { lastError, handleApiError, clearError };
}

// Retry logic for API calls
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delayMs * Math.pow(2, attempt))
      );
    }
  }
  
  throw lastError!;
}
```

## 5. Performance Optimization Patterns

### Streaming Response Optimization
```typescript
interface StreamingConfig {
  chunkSize?: number;
  flushInterval?: number;
  enableCompression?: boolean;
  voiceOptimized?: boolean;
}

export class VoiceOptimizedStream {
  private chunks: string[] = [];
  private config: StreamingConfig;
  private flushTimer?: NodeJS.Timeout;
  
  constructor(config: StreamingConfig = {}) {
    this.config = {
      chunkSize: 50, // words per chunk for voice
      flushInterval: 500, // ms
      enableCompression: true,
      voiceOptimized: true,
      ...config,
    };
  }
  
  addChunk(text: string) {
    this.chunks.push(text);
    
    if (this.shouldFlush()) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.config.flushInterval);
    }
  }
  
  private shouldFlush(): boolean {
    const totalWords = this.chunks.join(' ').split(' ').length;
    return totalWords >= (this.config.chunkSize || 50);
  }
  
  private flush() {
    if (this.chunks.length === 0) return;
    
    const content = this.chunks.join(' ');
    this.chunks = [];
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    
    // Process for voice synthesis
    if (this.config.voiceOptimized) {
      return this.optimizeForVoice(content);
    }
    
    return content;
  }
  
  private optimizeForVoice(text: string): string {
    return text
      // Add natural pauses
      .replace(/\. /g, '. <break time="500ms"/> ')
      .replace(/\? /g, '? <break time="300ms"/> ')
      .replace(/! /g, '! <break time="300ms"/> ')
      // Improve pronunciation of technical terms
      .replace(/CTBTO/g, '<phoneme alphabet="ipa" ph="siː.tiː.biː.tiː.oʊ">CTBTO</phoneme>')
      .replace(/SnT2025/g, '<say-as interpret-as="characters">SnT</say-as> 2025');
  }
}

// Caching for frequently accessed data
export class VoiceResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttlMs: number = 300000) { // 5 minute default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Implementation Guidelines

### Integration with CTBTO Avatar Architecture
1. **Edge Function Setup**: Deploy the structured output Edge Function with proper error handling
2. **Frontend Integration**: Use voice-optimized useChat hook with Tavus CVI integration
3. **Component Library**: Implement voice-first generative UI components with WCAG AAA compliance
4. **Error Handling**: Set up graceful degradation and user-friendly error messages
5. **Performance**: Implement caching and streaming optimizations for <2s response times
6. **Testing**: Validate structured outputs and voice interaction flows

### Performance Targets
- **Response Latency**: <500ms for tool execution
- **Streaming**: <200ms to first chunk
- **Cache Hit Rate**: >80% for common queries
- **Error Recovery**: <2% unhandled errors
- **Voice Synthesis**: Optimized text output for natural speech

## References

- Vercel AI SDK v5 Documentation
- OpenAI Structured Outputs Guide
- CTBTO Avatar Development Plan
- Voice-First Interface Patterns Research
- WCAG AAA Accessibility Research 