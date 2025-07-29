# Voice-First Interface Patterns for Vercel AI SDK v5

## Overview

Voice-first interfaces represent a paradigm shift from traditional touch/click interactions to purely conversational user experiences. This document outlines patterns and best practices for implementing voice-first applications using Vercel AI SDK v5.

## Research Sources

- Medium: "Voice-First Interfaces: Designing for Conversational UX"
- Vercel Templates: Swift AI Voice Assistant, Hume AI Empathic Voice Interface
- Official AI SDK v5 generative UI documentation
- Accessibility and UX research

## Core Principles

### 1. Conversation Over Commands

**Traditional Approach:**
```
"Click the weather button"
"Scroll down to see more"
"Tap on the session card"
```

**Voice-First Approach:**
```
"What's the weather in Vienna?"
"Show me upcoming sessions"
"Tell me about the speaker presentation"
```

### 2. Non-Interactive UI Generation

Voice-first UIs should generate components without requiring user interaction:

```typescript
// BAD: Interactive components
<WeatherCard onClick={handleClick} onClose={handleClose} />

// GOOD: Pure display components
<WeatherCard temperature={22} condition="sunny" location="Vienna" />
```

### 3. State Through Voice, Not Clicks

UI state changes happen through voice commands, not user interactions:

```typescript
// Voice command: "Show me the next session"
// Result: AI generates new SessionCard component
// No buttons, no scroll, no click handlers
```

## Voice-First Implementation Patterns

### 1. Tool-Based Component Generation

Use AI SDK v5 tools to generate components based on voice input:

```typescript
export const sessionTool = createTool({
  description: 'Display session information for CTBTO conference',
  inputSchema: z.object({
    sessionId: z.string().optional(),
    speakerName: z.string().optional(),
    topic: z.string().optional(),
  }),
  execute: async function({ sessionId, speakerName, topic }) {
    // Query backend based on voice input parameters
    const session = await getSessionData({ sessionId, speakerName, topic });
    return {
      title: session.title,
      speaker: session.speaker,
      time: session.scheduledTime,
      location: session.room,
      description: session.abstract
    };
  },
});
```

### 2. Semantic Component Structure

Components should be structured for accessibility and voice navigation:

```typescript
export const VoiceFirstSessionCard = ({ session }: SessionProps) => {
  return (
    <article 
      role="article"
      aria-labelledby={`session-${session.id}-title`}
      aria-describedby={`session-${session.id}-details`}
    >
      <header>
        <h2 id={`session-${session.id}-title`}>{session.title}</h2>
        <p aria-label="Speaker">{session.speaker}</p>
      </header>
      <div id={`session-${session.id}-details`}>
        <time aria-label="Session time">{session.time}</time>
        <p aria-label="Location">{session.location}</p>
        <p aria-label="Description">{session.description}</p>
      </div>
    </article>
  );
};
```

### 3. Voice State Management

Implement voice-controlled state transitions:

```typescript
export const voiceNavigationTool = createTool({
  description: 'Navigate conference content based on voice commands',
  inputSchema: z.object({
    action: z.enum(['next', 'previous', 'filter', 'search']),
    context: z.string().describe('Current context or search terms'),
  }),
  execute: async function({ action, context }) {
    switch (action) {
      case 'next':
        return await getNextContent(context);
      case 'filter':
        return await filterContent(context);
      case 'search':
        return await searchContent(context);
      default:
        return await getCurrentContent();
    }
  },
});
```

## Voice-First UI Templates

### 1. Kiosk Application Template

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { useEffect } from 'react';

export default function VoiceKioskInterface() {
  const { messages, sendMessage } = useChat({
    api: '/api/voice-chat',
    id: 'kiosk-session'
  });

  // Voice input handling (STT integration)
  const handleVoiceInput = (transcript: string) => {
    sendMessage({ text: transcript });
  };

  return (
    <main 
      className="h-screen overflow-hidden bg-gray-900 text-white"
      role="main"
      aria-label="CTBTO Conference Voice Assistant"
    >
      <div className="p-8 max-w-4xl mx-auto">
        {messages.map(message => (
          <div key={message.id} className="mb-6">
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <div key={index} className="text-xl leading-relaxed">
                    {part.text}
                  </div>
                );
              }
              
              // Tool-generated components
              if (part.type.startsWith('tool-')) {
                return renderToolComponent(part, index);
              }
              
              return null;
            })}
          </div>
        ))}
      </div>
      
      {/* Voice input indicator */}
      <VoiceInputIndicator onVoiceInput={handleVoiceInput} />
    </main>
  );
}
```

### 2. Conference-Specific Tools

```typescript
export const conferenceTools = {
  showSpeaker: createTool({
    description: 'Display speaker information and their sessions',
    inputSchema: z.object({
      speakerName: z.string(),
    }),
    execute: async ({ speakerName }) => {
      const speaker = await getSpeakerInfo(speakerName);
      return {
        name: speaker.name,
        bio: speaker.biography,
        sessions: speaker.sessions,
        photo: speaker.profileImage
      };
    },
  }),

  showSchedule: createTool({
    description: 'Display conference schedule for specific time or day',
    inputSchema: z.object({
      timeframe: z.string().describe('Time period like "today", "tomorrow", "this afternoon"'),
    }),
    execute: async ({ timeframe }) => {
      const schedule = await getScheduleData(timeframe);
      return {
        sessions: schedule.sessions,
        timeframe: schedule.period,
        location: schedule.venue
      };
    },
  }),

  showNavigation: createTool({
    description: 'Provide navigation information within the venue',
    inputSchema: z.object({
      destination: z.string().describe('Room name or area to navigate to'),
    }),
    execute: async ({ destination }) => {
      const directions = await getNavigationInfo(destination);
      return {
        destination: directions.target,
        route: directions.steps,
        estimatedTime: directions.duration
      };
    },
  }),
};
```

## Design Guidelines for Voice-First UI

### 1. Visual Hierarchy for Voice

Design components that work well when read aloud:

```css
/* Large, clear typography */
.voice-primary-text {
  font-size: 1.5rem;
  line-height: 1.4;
  font-weight: 600;
}

/* High contrast for accessibility */
.voice-container {
  background: #1a1a1a;
  color: #ffffff;
  contrast: 21:1; /* WCAG AAA compliance */
}

/* No hover states - users can't hover with voice */
.voice-card {
  transition: none;
}

/* Focus indicators for screen readers */
.voice-card:focus-visible {
  outline: 3px solid #00ff88;
  outline-offset: 2px;
}
```

### 2. Responsive Without Scrolling

```css
.voice-layout {
  height: 100vh;
  overflow: hidden; /* No scrolling */
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.voice-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
```

### 3. Error Handling for Voice

```typescript
export const voiceErrorTool = createTool({
  description: 'Handle misunderstood voice commands gracefully',
  inputSchema: z.object({
    originalCommand: z.string(),
    context: z.string(),
  }),
  execute: async ({ originalCommand, context }) => {
    const suggestions = await getSimilarCommands(originalCommand);
    return {
      message: "I didn't quite understand that.",
      suggestions: suggestions,
      helpText: "Try saying something like 'Show me today's sessions' or 'Who is speaking about nuclear monitoring?'"
    };
  },
});
```

## Integration with Existing CTBTO System

### 1. Replace Interactive Handlers

**Before (Interactive):**
```typescript
const UIDeltaHandler = () => {
  const [cards, setCards] = useState([]);
  
  return (
    <div>
      {cards.map(card => (
        <SessionCard 
          key={card.id}
          onClick={() => handleCardClick(card)}
          onClose={() => handleCardClose(card)}
        />
      ))}
    </div>
  );
};
```

**After (Voice-First):**
```typescript
const VoiceUIHandler = () => {
  const { messages } = useChat({
    api: '/api/voice-conference'
  });
  
  return (
    <div>
      {messages.map(message => (
        <MessageRenderer key={message.id} message={message} />
      ))}
    </div>
  );
};
```

### 2. Voice-Activated RAG Integration

```typescript
export const ragTool = createTool({
  description: 'Search conference knowledge base using voice queries',
  inputSchema: z.object({
    query: z.string(),
    category: z.enum(['speakers', 'sessions', 'venues', 'general']).optional(),
  }),
  execute: async ({ query, category }) => {
    // Integrate with existing Weaviate RAG system
    const results = await searchWeaviateKnowledge(query, category);
    return {
      results: results.data,
      confidence: results.confidence,
      sources: results.sources
    };
  },
});
```

## Performance Considerations

### 1. Streaming for Immediate Feedback

Voice users expect immediate feedback:

```typescript
// Stream components as they're generated
return result.toUIMessageStreamResponse({
  experimentalStreamData: true,
  onToolResult: (toolName, result) => {
    // Immediate audio feedback
    announceToScreen(`Loading ${toolName} information`);
  }
});
```

### 2. Preload Common Responses

```typescript
const commonVoiceQueries = [
  'today\'s schedule',
  'speaker information',
  'session details',
  'venue navigation'
];

// Preload components for common queries
useEffect(() => {
  commonVoiceQueries.forEach(query => {
    prefetchQueryResponse(query);
  });
}, []);
```

## Testing Voice-First Interfaces

### 1. Screen Reader Testing

```bash
# Test with VoiceOver (macOS)
# Ensure all content is readable
# Verify focus management
# Check ARIA labels
```

### 2. Voice Command Testing

```typescript
const voiceTestCases = [
  {
    input: "Show me Dr. Smith's presentation",
    expectedTool: 'showSpeaker',
    expectedOutput: { speakerName: 'Dr. Smith' }
  },
  {
    input: "What's happening this afternoon?",
    expectedTool: 'showSchedule',
    expectedOutput: { timeframe: 'this afternoon' }
  }
];
```

## Migration Strategy

1. **Phase 1**: Replace click handlers with voice tools
2. **Phase 2**: Remove scrolling and hover states
3. **Phase 3**: Implement accessibility improvements
4. **Phase 4**: Add voice input integration
5. **Phase 5**: Performance optimization for kiosk hardware

This approach transforms the current interactive frontend into a true voice-first interface that aligns with modern AI-driven UI patterns while maintaining the rich information display required for the CTBTO conference system. 