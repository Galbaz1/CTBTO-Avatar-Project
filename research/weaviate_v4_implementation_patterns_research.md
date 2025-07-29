# Weaviate v4 Implementation Patterns for CTBTO Avatar

**Date:** 2025-01-29  
**Source:** Extracted from docs_important/WEAVIATE/ documentation  
**Purpose:** Implementation patterns for CTBTO Avatar hybrid search and RAG capabilities

## Executive Summary

This research consolidates Weaviate v4 implementation patterns specifically relevant to the CTBTO Avatar voice-first kiosk. It focuses on hybrid search capabilities, multi-modal queries, and performance optimization patterns needed for real-time conference information retrieval.

## 1. Core Weaviate v4 Import Patterns

### Essential Imports for CTBTO Avatar
```python
import weaviate
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
import weaviate.classes.data as wvc_data
import asyncio
from typing import List, Dict, Optional, Union
```

### Client Configuration for Production
```python
# Production client setup with authentication
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WEAVIATE_API_KEY")),
    headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
)

# Alternative local setup for development
client = weaviate.connect_to_local(
    host="localhost",
    port=8080,
    headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
)
```

## 2. CTBTO Collection Schema Patterns

### Conference Data Collections (Optimized Schema)
```python
# Drop SnT25_ prefix for cleaner schema
CTBTO_COLLECTIONS = {
    "Speaker": {
        "description": "Conference speaker profiles with expertise and sessions",
        "properties": [
            wvc.Property(name="name", data_type=wvc.DataType.TEXT),
            wvc.Property(name="title", data_type=wvc.DataType.TEXT),
            wvc.Property(name="organization", data_type=wvc.DataType.TEXT),
            wvc.Property(name="expertise", data_type=wvc.DataType.TEXT_ARRAY),
            wvc.Property(name="biography", data_type=wvc.DataType.TEXT),
            wvc.Property(name="photo_url", data_type=wvc.DataType.TEXT),
            wvc.Property(name="contact_info", data_type=wvc.DataType.OBJECT),
            wvc.Property(name="session_count", data_type=wvc.DataType.INT),
        ],
        "references": [
            wvc.ReferenceProperty(name="presentsSessions", target_collection="Session"),
            wvc.ReferenceProperty(name="expertiseAreas", target_collection="Topic"),
        ],
        "vectorizer": wvc.Vectorizer.text2vec_openai(),
    },
    
    "Session": {
        "description": "Conference sessions with speakers and topics",
        "properties": [
            wvc.Property(name="title", data_type=wvc.DataType.TEXT),
            wvc.Property(name="abstract", data_type=wvc.DataType.TEXT),
            wvc.Property(name="session_type", data_type=wvc.DataType.TEXT),
            wvc.Property(name="start_time", data_type=wvc.DataType.DATE),
            wvc.Property(name="end_time", data_type=wvc.DataType.DATE),
            wvc.Property(name="day", data_type=wvc.DataType.TEXT),
            wvc.Property(name="duration", data_type=wvc.DataType.INT),
            wvc.Property(name="tags", data_type=wvc.DataType.TEXT_ARRAY),
        ],
        "references": [
            wvc.ReferenceProperty(name="hasSpeakers", target_collection="Speaker"),
            wvc.ReferenceProperty(name="inVenue", target_collection="Venue"),
            wvc.ReferenceProperty(name="coverTopics", target_collection="Topic"),
        ],
        "vectorizer": wvc.Vectorizer.text2vec_openai(),
    },
    
    "Venue": {
        "description": "Conference venues and rooms",
        "properties": [
            wvc.Property(name="name", data_type=wvc.DataType.TEXT),
            wvc.Property(name="floor", data_type=wvc.DataType.TEXT),
            wvc.Property(name="capacity", data_type=wvc.DataType.INT),
            wvc.Property(name="equipment", data_type=wvc.DataType.TEXT_ARRAY),
            wvc.Property(name="accessibility", data_type=wvc.DataType.TEXT),
            wvc.Property(name="location_description", data_type=wvc.DataType.TEXT),
        ],
        "references": [
            wvc.ReferenceProperty(name="hostsSessions", target_collection="Session"),
        ],
        "vectorizer": wvc.Vectorizer.text2vec_openai(),
    },
    
    "Topic": {
        "description": "Conference themes and expertise areas",
        "properties": [
            wvc.Property(name="name", data_type=wvc.DataType.TEXT),
            wvc.Property(name="description", data_type=wvc.DataType.TEXT),
            wvc.Property(name="category", data_type=wvc.DataType.TEXT),
            wvc.Property(name="keywords", data_type=wvc.DataType.TEXT_ARRAY),
        ],
        "references": [
            wvc.ReferenceProperty(name="relatedSessions", target_collection="Session"),
            wvc.ReferenceProperty(name="expertSpeakers", target_collection="Speaker"),
        ],
        "vectorizer": wvc.Vectorizer.text2vec_openai(),
    }
}
```

### Schema Creation and Migration
```python
async def create_ctbto_collections():
    """Create optimized collections for CTBTO Avatar"""
    for collection_name, config in CTBTO_COLLECTIONS.items():
        try:
            collection = client.collections.create(
                name=collection_name,
                description=config["description"],
                properties=config["properties"],
                references=config.get("references", []),
                vectorizer_config=config["vectorizer"],
                generative_config=wvc.Generative.openai(model="gpt-4o"),
                # Performance optimizations
                vector_index_config=wvc.VectorIndex.hnsw(
                    distance_metric=wvc.VectorDistanceMetric.COSINE,
                    dynamic_ef_factor=8,
                    dynamic_ef_max=500,
                    flat_search_cutoff=40000,
                ),
                # Enable hybrid search
                inverted_index_config=wvc.InvertedIndex(
                    bm25_k1=1.2,
                    bm25_b=0.75,
                    cleanup_interval_seconds=60,
                ),
            )
            print(f"Created collection: {collection_name}")
        except Exception as e:
            print(f"Error creating {collection_name}: {e}")
```

## 3. Hybrid Search Patterns for Voice Queries

### Intelligent Query Classification
```python
class CTBTOQueryClassifier:
    """Classify voice queries to optimize search parameters"""
    
    QUERY_PATTERNS = {
        'speaker_name': {
            'alpha': 0.9,  # High keyword weight for exact names
            'patterns': [r'\b(dr|prof|professor)\s+\w+', r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b'],
            'description': 'Direct speaker name queries'
        },
        'expertise_area': {
            'alpha': 0.3,  # High semantic weight for concepts
            'patterns': [r'\b(expert|specialist|research|field|area)\b', r'\b(seismic|nuclear|verification)\b'],
            'description': 'Expertise and research area queries'
        },
        'session_topic': {
            'alpha': 0.5,  # Balanced for session content
            'patterns': [r'\b(session|presentation|talk|about)\b', r'\b(AI|machine learning|monitoring)\b'],
            'description': 'Session content and topic queries'
        },
        'venue_navigation': {
            'alpha': 0.8,  # High keyword for room names
            'patterns': [r'\b(room|hall|floor|where|location)\b', r'\b(zeremoniensaal|festsaal)\b'],
            'description': 'Venue and navigation queries'
        },
        'schedule_time': {
            'alpha': 0.7,  # Keyword-focused for time queries
            'patterns': [r'\b(when|time|schedule|today|tomorrow)\b', r'\b\d{1,2}:\d{2}\b'],
            'description': 'Schedule and timing queries'
        }
    }
    
    def classify_query(self, query: str) -> Dict[str, float]:
        """Classify query and return optimal alpha value"""
        query_lower = query.lower()
        
        for pattern_type, config in self.QUERY_PATTERNS.items():
            for pattern in config['patterns']:
                if re.search(pattern, query_lower):
                    return {
                        'type': pattern_type,
                        'alpha': config['alpha'],
                        'description': config['description']
                    }
        
        # Default balanced hybrid search
        return {'type': 'general', 'alpha': 0.5, 'description': 'General query'}
```

### Adaptive Hybrid Search Engine
```python
class CTBTOHybridSearchEngine:
    """Optimized hybrid search for CTBTO Avatar voice queries"""
    
    def __init__(self, client: weaviate.WeaviatClient):
        self.client = client
        self.classifier = CTBTOQueryClassifier()
        
    async def search_speakers(self, query: str, limit: int = 5) -> List[Dict]:
        """Search speakers with adaptive hybrid parameters"""
        classification = self.classifier.classify_query(query)
        alpha = classification['alpha']
        
        collection = self.client.collections.get("Speaker")
        
        # Use classified alpha for optimal results
        response = collection.query.hybrid(
            query=query,
            alpha=alpha,
            limit=limit,
            return_properties=["name", "title", "organization", "expertise", "biography"],
            return_references=[
                wvc_query.QueryReference(
                    link_on="presentsSessions",
                    return_properties=["title", "start_time", "session_type"]
                ),
                wvc_query.QueryReference(
                    link_on="expertiseAreas", 
                    return_properties=["name", "category"]
                )
            ],
            # Boost fields based on query type
            where=self._build_query_filter(query, classification['type'])
        )
        
        return self._format_speaker_results(response.objects)
    
    async def search_sessions(self, query: str, day_filter: Optional[str] = None) -> List[Dict]:
        """Search sessions with temporal and topic filtering"""
        classification = self.classifier.classify_query(query)
        
        collection = self.client.collections.get("Session")
        
        # Build time-aware filter
        where_filter = None
        if day_filter:
            where_filter = wvc_query.Filter.by_property("day").like(f"*{day_filter}*")
        
        response = collection.query.hybrid(
            query=query,
            alpha=classification['alpha'],
            limit=10,
            return_properties=["title", "abstract", "session_type", "start_time", "day"],
            return_references=[
                wvc_query.QueryReference(
                    link_on="hasSpeakers",
                    return_properties=["name", "title", "organization"]
                ),
                wvc_query.QueryReference(
                    link_on="inVenue",
                    return_properties=["name", "floor", "accessibility"]
                )
            ],
            where=where_filter
        )
        
        return self._format_session_results(response.objects)
    
    async def search_by_expertise(self, expertise: str) -> Dict[str, List]:
        """Cross-collection search by expertise area"""
        # First find the topic
        topics = self.client.collections.get("Topic")
        topic_response = topics.query.hybrid(
            query=expertise,
            alpha=0.3,  # Semantic search for concepts
            limit=3,
            return_properties=["name", "description", "keywords"]
        )
        
        if not topic_response.objects:
            return {"speakers": [], "sessions": [], "message": "No expertise area found"}
        
        # Use topic to find related speakers and sessions
        primary_topic = topic_response.objects[0]
        
        # Parallel search for speakers and sessions
        speakers_task = self.search_speakers(f"{expertise} {primary_topic.properties['name']}")
        sessions_task = self.search_sessions(f"{expertise} {primary_topic.properties['name']}")
        
        speakers, sessions = await asyncio.gather(speakers_task, sessions_task)
        
        return {
            "topic": primary_topic.properties,
            "speakers": speakers,
            "sessions": sessions,
            "message": f"Found {len(speakers)} speakers and {len(sessions)} sessions in {expertise}"
        }
    
    def _build_query_filter(self, query: str, query_type: str) -> Optional[wvc_query.Filter]:
        """Build filters based on query classification"""
        if query_type == 'venue_navigation':
            # Filter for venue-related content
            return None  # Apply in venue collection search
        elif query_type == 'schedule_time':
            # Filter for current/upcoming sessions
            from datetime import datetime, timedelta
            today = datetime.now().strftime("%Y-%m-%d")
            return wvc_query.Filter.by_property("day").like(f"*{today}*")
        
        return None
    
    def _format_speaker_results(self, objects) -> List[Dict]:
        """Format speaker search results for voice interface"""
        results = []
        for obj in objects:
            props = obj.properties
            
            # Extract session information
            sessions = []
            if obj.references and "presentsSessions" in obj.references:
                for session_ref in obj.references["presentsSessions"].objects:
                    sessions.append({
                        "title": session_ref.properties.get("title"),
                        "time": session_ref.properties.get("start_time"),
                        "type": session_ref.properties.get("session_type")
                    })
            
            # Extract expertise areas
            expertise_areas = []
            if obj.references and "expertiseAreas" in obj.references:
                for topic_ref in obj.references["expertiseAreas"].objects:
                    expertise_areas.append({
                        "name": topic_ref.properties.get("name"),
                        "category": topic_ref.properties.get("category")
                    })
            
            results.append({
                "id": str(obj.uuid),
                "name": props.get("name"),
                "title": props.get("title"),
                "organization": props.get("organization"),
                "expertise": props.get("expertise", []),
                "biography": props.get("biography", "")[:200] + "...",  # Truncate for voice
                "sessions": sessions,
                "expertise_areas": expertise_areas,
                "score": getattr(obj.metadata, 'score', 0.0)
            })
            
        return results
    
    def _format_session_results(self, objects) -> List[Dict]:
        """Format session search results for voice interface"""
        results = []
        for obj in objects:
            props = obj.properties
            
            # Extract speaker information
            speakers = []
            if obj.references and "hasSpeakers" in obj.references:
                for speaker_ref in obj.references["hasSpeakers"].objects:
                    speakers.append({
                        "name": speaker_ref.properties.get("name"),
                        "title": speaker_ref.properties.get("title"),
                        "organization": speaker_ref.properties.get("organization")
                    })
            
            # Extract venue information
            venue_info = {}
            if obj.references and "inVenue" in obj.references:
                venue_ref = obj.references["inVenue"].objects[0]
                venue_info = {
                    "name": venue_ref.properties.get("name"),
                    "floor": venue_ref.properties.get("floor"),
                    "accessibility": venue_ref.properties.get("accessibility")
                }
            
            results.append({
                "id": str(obj.uuid),
                "title": props.get("title"),
                "abstract": props.get("abstract", "")[:150] + "...",  # Truncate for voice
                "session_type": props.get("session_type"),
                "start_time": props.get("start_time"),
                "day": props.get("day"),
                "speakers": speakers,
                "venue": venue_info,
                "score": getattr(obj.metadata, 'score', 0.0)
            })
            
        return results
```

## 4. Multi-Modal Search Patterns

### Image-Enhanced Session Search
```python
async def search_sessions_with_images(self, query: str, image_data: Optional[str] = None) -> List[Dict]:
    """Search sessions using both text and image similarity"""
    collection = self.client.collections.get("Session")
    
    if image_data:
        # Multi-modal search with image + text
        response = collection.query.near_image(
            near_image=image_data,  # base64 encoded image
            limit=5,
            return_properties=["title", "abstract", "session_type"],
            return_references=[
                wvc_query.QueryReference(
                    link_on="hasSpeakers",
                    return_properties=["name", "photo_url"]
                )
            ],
            # Combine with text query if provided
            where=wvc_query.Filter.by_property("title").like(f"*{query}*") if query else None
        )
    else:
        # Text-only semantic search
        response = collection.query.near_text(
            query=query,
            limit=5,
            return_properties=["title", "abstract", "session_type"],
            return_references=[
                wvc_query.QueryReference(
                    link_on="hasSpeakers",
                    return_properties=["name", "title"]
                )
            ]
        )
    
    return self._format_session_results(response.objects)
```

### Generative Search for Voice Responses
```python
async def generate_voice_response(self, query: str, collection_name: str) -> Dict[str, str]:
    """Generate natural language responses optimized for voice synthesis"""
    collection = self.client.collections.get(collection_name)
    
    # Single prompt generation for individual results
    response = collection.generate.near_text(
        query=query,
        single_prompt="Create a brief, conversational response about this {collection_name.lower()} suitable for voice synthesis. Include key details but keep it under 30 seconds of speech: {title} - {abstract if available}",
        limit=3,
        return_properties=["title", "abstract", "name"]
    )
    
    voice_responses = []
    for result in response.objects:
        voice_responses.append({
            "original": result.properties,
            "voice_response": result.generated,
            "estimated_speech_time": len(result.generated.split()) * 0.3  # ~200 words per minute
        })
    
    # Grouped task for summary
    summary_response = collection.generate.near_text(
        query=query,
        grouped_task=f"Based on these {collection_name.lower()} results, provide a brief 2-sentence summary suitable for voice response about what the user is looking for.",
        limit=5
    )
    
    return {
        "individual_responses": voice_responses,
        "summary": summary_response.generated,
        "total_results": len(voice_responses)
    }
```

## 5. Performance Optimization Patterns

### Async Batch Operations
```python
async def batch_search_conference_info(self, user_query: str) -> Dict[str, any]:
    """Perform parallel searches across all collections for comprehensive results"""
    
    # Parallel search tasks
    speaker_task = self.search_speakers(user_query, limit=3)
    session_task = self.search_sessions(user_query)
    venue_task = self.search_venues(user_query)
    topic_task = self.search_topics(user_query)
    
    # Execute all searches concurrently
    speaker_results, session_results, venue_results, topic_results = await asyncio.gather(
        speaker_task, session_task, venue_task, topic_task,
        return_exceptions=True
    )
    
    # Handle exceptions gracefully
    safe_results = {}
    safe_results['speakers'] = speaker_results if not isinstance(speaker_results, Exception) else []
    safe_results['sessions'] = session_results if not isinstance(session_results, Exception) else []
    safe_results['venues'] = venue_results if not isinstance(venue_results, Exception) else []
    safe_results['topics'] = topic_results if not isinstance(topic_results, Exception) else []
    
    # Rank and merge results
    return self._rank_and_merge_results(safe_results, user_query)

def _rank_and_merge_results(self, results: Dict, original_query: str) -> Dict:
    """Rank and merge results from multiple collections"""
    all_results = []
    
    # Add type metadata and normalize scores
    for result_type, items in results.items():
        for item in items:
            item['result_type'] = result_type
            item['relevance_score'] = item.get('score', 0.0)
            all_results.append(item)
    
    # Sort by relevance score
    all_results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return {
        'query': original_query,
        'total_results': len(all_results),
        'top_results': all_results[:5],  # Top 5 most relevant
        'by_type': results,
        'response_time': time.time() - start_time if 'start_time' in locals() else 0
    }
```

### Caching Strategy for Voice Queries
```python
import asyncio
from functools import wraps
import hashlib
import json

class CTBTOSearchCache:
    """Smart caching for frequently asked conference questions"""
    
    def __init__(self, ttl_seconds: int = 300):  # 5 minute cache
        self.cache = {}
        self.ttl = ttl_seconds
    
    def cache_key(self, query: str, **kwargs) -> str:
        """Generate cache key from query and parameters"""
        cache_data = {'query': query.lower().strip(), **kwargs}
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def cached_search(self, ttl: Optional[int] = None):
        """Decorator for caching search results"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Extract query from arguments
                if len(args) > 1:
                    query = args[1]  # Assuming second arg is query
                else:
                    query = kwargs.get('query', '')
                
                cache_key = self.cache_key(query, **kwargs)
                current_time = time.time()
                
                # Check cache
                if cache_key in self.cache:
                    cached_data, timestamp = self.cache[cache_key]
                    if current_time - timestamp < (ttl or self.ttl):
                        return cached_data
                
                # Execute search
                result = await func(*args, **kwargs)
                
                # Cache result
                self.cache[cache_key] = (result, current_time)
                
                # Cleanup old entries
                self._cleanup_cache(current_time)
                
                return result
            return wrapper
        return decorator
    
    def _cleanup_cache(self, current_time: float):
        """Remove expired cache entries"""
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if current_time - timestamp > self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]

# Usage with cache decorator
cache = CTBTOSearchCache(ttl_seconds=300)

class CachedCTBTOSearchEngine(CTBTOHybridSearchEngine):
    
    @cache.cached_search(ttl=300)
    async def search_speakers(self, query: str, limit: int = 5) -> List[Dict]:
        return await super().search_speakers(query, limit)
    
    @cache.cached_search(ttl=180)  # Shorter cache for sessions (time-sensitive)
    async def search_sessions(self, query: str, day_filter: Optional[str] = None) -> List[Dict]:
        return await super().search_sessions(query, day_filter)
```

## 6. Integration with FastAPI Data Service

### FastAPI Endpoint Implementation
```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

app = FastAPI(title="CTBTO Avatar Data API")

# Initialize search engine
search_engine = CachedCTBTOSearchEngine(client)

class SearchRequest(BaseModel):
    query: str
    collection: Optional[str] = None
    limit: Optional[int] = 5
    filters: Optional[Dict[str, Any]] = None

class VoiceSearchRequest(BaseModel):
    utterance: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

@app.post("/api/search/speakers")
async def search_speakers_endpoint(request: SearchRequest):
    """Voice-optimized speaker search endpoint"""
    try:
        results = await search_engine.search_speakers(
            query=request.query,
            limit=request.limit
        )
        
        return {
            "success": True,
            "results": results,
            "count": len(results),
            "query": request.query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/sessions")
async def search_sessions_endpoint(request: SearchRequest):
    """Voice-optimized session search endpoint"""
    try:
        day_filter = request.filters.get('day') if request.filters else None
        results = await search_engine.search_sessions(
            query=request.query,
            day_filter=day_filter
        )
        
        return {
            "success": True,
            "results": results,
            "count": len(results),
            "query": request.query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/search")
async def voice_search_endpoint(request: VoiceSearchRequest):
    """Unified voice search endpoint for all collections"""
    try:
        # Use comprehensive search for voice queries
        results = await search_engine.batch_search_conference_info(request.utterance)
        
        # Generate voice-optimized response
        voice_response = await search_engine.generate_voice_response(
            query=request.utterance,
            collection_name="Session"  # Default to sessions
        )
        
        return {
            "success": True,
            "search_results": results,
            "voice_response": voice_response,
            "session_id": request.session_id,
            "query": request.utterance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Weaviate connection
        collections = client.collections.list_all()
        return {
            "status": "healthy",
            "weaviate_connected": True,
            "collections_available": len(collections),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }
```

## 7. Error Handling and Resilience Patterns

### Graceful Degradation
```python
class ResilientSearchEngine(CachedCTBTOSearchEngine):
    """Search engine with fallback strategies"""
    
    async def search_with_fallback(self, query: str, search_type: str = "hybrid") -> Dict:
        """Search with multiple fallback strategies"""
        try:
            # Primary: Hybrid search
            if search_type == "hybrid":
                return await self.search_speakers(query)
        except Exception as e:
            print(f"Hybrid search failed: {e}")
            
        try:
            # Fallback 1: Vector-only search
            return await self._vector_only_search(query)
        except Exception as e:
            print(f"Vector search failed: {e}")
            
        try:
            # Fallback 2: Keyword search
            return await self._keyword_only_search(query)
        except Exception as e:
            print(f"Keyword search failed: {e}")
            
        # Final fallback: Return helpful error message
        return {
            "results": [],
            "message": "I'm having trouble searching right now. Could you try rephrasing your question?",
            "error_type": "search_unavailable",
            "suggestions": [
                "Try asking about a specific speaker name",
                "Ask about sessions happening today",
                "Inquire about room locations"
            ]
        }
    
    async def _vector_only_search(self, query: str) -> Dict:
        """Fallback to vector-only search"""
        collection = self.client.collections.get("Speaker")
        response = collection.query.near_text(
            query=query,
            limit=5,
            return_properties=["name", "title", "organization"]
        )
        return {"results": self._format_speaker_results(response.objects)}
    
    async def _keyword_only_search(self, query: str) -> Dict:
        """Fallback to keyword-only search"""
        collection = self.client.collections.get("Speaker")
        response = collection.query.bm25(
            query=query,
            limit=5,
            return_properties=["name", "title", "organization"]
        )
        return {"results": self._format_speaker_results(response.objects)}
```

## Implementation Guidelines for CTBTO Avatar

### Integration Checklist
- [ ] Weaviate v4 client properly configured with authentication
- [ ] Collections created with optimized schema for conference data
- [ ] Hybrid search with adaptive alpha values implemented
- [ ] Query classification for voice input optimization
- [ ] Async batch operations for comprehensive search
- [ ] Caching strategy for frequently asked questions
- [ ] Error handling with graceful degradation
- [ ] FastAPI endpoints optimized for voice interactions
- [ ] Multi-modal search capabilities available
- [ ] Performance monitoring and optimization

### Performance Targets
- **Search Latency:** <500ms for hybrid queries
- **Batch Search:** <2s for comprehensive multi-collection search
- **Cache Hit Rate:** >70% for common conference questions
- **Error Recovery:** <1% failed requests with fallback strategies
- **Concurrent Users:** Support for 100+ simultaneous voice queries

## References

- Weaviate v4 Python Client Documentation
- CTBTO Avatar Development Plan (development_plan.md)
- Existing Weaviate Documentation (docs_important/WEAVIATE/)
- Hybrid Search Migration Plan (docs_important/WEAVIATE/hybrid-search-migration-plan.md)
- Weaviate v4 Patterns (docs_important/weaviate-v4-patterns.md) 