# Card Component Architecture
## Modular Design for Conference RAG System

### 📁 **OPTIMAL FOLDER STRUCTURE**

```
src/
├── components/
│   ├── cards/
│   │   ├── enhanced/                    # New RAG-optimized cards
│   │   │   ├── SessionCard.tsx         # Enhanced with RAG metadata
│   │   │   ├── SpeakerCard.tsx         # Enhanced with session aggregation
│   │   │   ├── TopicCard.tsx           # New topic-based card
│   │   │   └── index.ts                # Barrel exports
│   │   ├── legacy/                     # Existing cards (backup)
│   │   │   ├── SessionCard.tsx         # Current implementation
│   │   │   └── SpeakerCard.tsx         # Current implementation
│   │   └── shared/                     # Reusable card components
│   │       ├── CardBase.tsx            # Common card wrapper
│   │       ├── CardHeader.tsx          # Standard header
│   │       ├── CardActions.tsx         # Action buttons
│   │       └── CardMetadata.tsx        # Metadata display
│   ├── handlers/
│   │   ├── rag/                        # RAG-specific handlers
│   │   │   ├── SessionHandler.tsx      # Session card polling
│   │   │   ├── SpeakerHandler.tsx      # Speaker card polling  
│   │   │   ├── TopicHandler.tsx        # Topic card polling
│   │   │   └── RAGCoordinator.tsx      # Master coordinator
│   │   └── WeatherHandler.tsx          # Existing pattern (reference)
│   ├── shared/
│   │   ├── ui/                         # Reusable UI primitives
│   │   │   ├── Badge.tsx               # Topic/theme badges
│   │   │   ├── TimeDisplay.tsx         # Time formatting
│   │   │   ├── VenueIcon.tsx           # Venue indicators
│   │   │   └── SpeakerAvatar.tsx       # Speaker images
│   │   └── hooks/                      # Shared hooks
│   │       ├── usePolling.tsx          # Generic polling hook
│   │       ├── useCardData.tsx         # Card data management
│   │       └── useRAGSearch.tsx        # RAG search integration
│   └── utils/
│       ├── cardUtils.ts                # Card-specific utilities
│       ├── timeUtils.ts                # Time formatting
│       └── searchUtils.ts              # Search result processing
```

### 🎯 **DESIGN PRINCIPLES**

1. **Modularity**: Each card type is self-contained
2. **Reusability**: Shared components across all cards  
3. **Performance**: Lazy loading and component memoization
4. **Extensibility**: Easy to add new card types
5. **Consistency**: Unified design language

### 🎨 **CARD TYPE SPECIFICATIONS**

#### **1. Enhanced SessionCard**
- **Data Source**: `session_id` from RAG results
- **Rich Metadata**: Duration, venue, speaker count, interaction type
- **Interactive Elements**: Speaker links, venue maps, calendar integration
- **Performance**: Memoized with speaker/venue dependencies

#### **2. Enhanced SpeakerCard** 
- **Data Source**: `speaker_name` from aggregated sessions
- **Session Aggregation**: All sessions for speaker with time sorting
- **Expertise Display**: Topic areas, session types, experience level
- **Bio Integration**: Links to speaker details, research papers

#### **3. New TopicCard**
- **Data Source**: `theme` + `track` from related sessions  
- **Session Grouping**: All sessions under topic with relevance scoring
- **Trend Analysis**: Topic popularity, session distribution
- **Deep Dive**: Links to detailed topic exploration

### 🚀 **IMPLEMENTATION STRATEGY**

#### **Phase 1: Enhanced Cards** 
1. Create enhanced versions alongside existing cards
2. Implement shared UI components 
3. Add comprehensive TypeScript interfaces
4. Test with static data

#### **Phase 2: RAG Handlers**
1. Copy WeatherHandler pattern exactly
2. Create separate handlers for each card type
3. Implement 2-second polling as specified
4. Add error handling and loading states

#### **Phase 3: Integration**
1. Add handlers to SimpleConferenceHandler.tsx
2. Implement UI Intelligence Agent integration
3. Add card decision logic
4. Performance optimization and caching

### 🎨 **CARD DESIGN SPECIFICATIONS**

#### **SessionCard Enhanced Features:**
```typescript
interface EnhancedSessionCardProps {
  session: SessionCardData;
  showSpeakers?: boolean;
  showVenue?: boolean; 
  showTiming?: boolean;
  compact?: boolean;
  onSpeakerClick?: (speaker: string) => void;
  onVenueClick?: (venue: string) => void;
}
```

#### **SpeakerCard Enhanced Features:**
```typescript  
interface EnhancedSpeakerCardProps {
  speaker: SpeakerCardData;
  showSessions?: boolean;
  showExpertise?: boolean;
  maxSessions?: number;
  onSessionClick?: (sessionId: string) => void;
}
```

#### **TopicCard New Features:**
```typescript
interface TopicCardProps {
  topic: TopicCardData;
  showSessions?: boolean;
  showTrends?: boolean;
  maxSessions?: number;
  onSessionClick?: (sessionId: string) => void;
  onDeepDive?: (topic: string) => void;
}
```

### 📊 **PERFORMANCE OPTIMIZATIONS**

1. **Component Memoization**: React.memo with deep comparison
2. **Lazy Loading**: Dynamic imports for card types
3. **Virtual Scrolling**: For large session lists
4. **Caching**: Session data caching with TTL
5. **Bundle Splitting**: Separate chunks for card components

### 🔧 **DEVELOPMENT WORKFLOW**

#### **Step 1: Base Components**
```bash
# Create shared UI primitives
touch src/components/shared/ui/{Badge,TimeDisplay,VenueIcon,SpeakerAvatar}.tsx
```

#### **Step 2: Enhanced Cards**  
```bash
# Create enhanced card components
touch src/components/cards/enhanced/{SessionCard,SpeakerCard,TopicCard}.tsx
```

#### **Step 3: RAG Handlers**
```bash  
# Create polling handlers (copy WeatherHandler pattern)
touch src/components/handlers/rag/{Session,Speaker,Topic}Handler.tsx
```

#### **Step 4: Integration**
```bash
# Integrate with main conference handler
# Update SimpleConferenceHandler.tsx with new handlers
```

### 🎯 **SUCCESS METRICS**

- [ ] **Performance**: Card render time < 16ms  
- [ ] **Bundle Size**: Each card component < 10KB gzipped
- [ ] **Reusability**: 80%+ component reuse across cards
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Mobile**: Responsive design on all screen sizes
- [ ] **Testing**: 95%+ test coverage on card components

### 🚨 **CRITICAL SUCCESS FACTORS**

1. **Follow Weather Pattern**: Copy existing polling exactly
2. **TypeScript First**: Full type safety for all props
3. **Performance**: Memoization and lazy loading from day 1
4. **Accessibility**: Semantic HTML and ARIA labels
5. **Mobile**: Touch-friendly interactions and responsive design
6. **Testing**: Unit tests for all card components

This architecture provides maximum modularity while maintaining high performance and developer experience. 