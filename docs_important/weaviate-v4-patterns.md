# Weaviate v4 Advanced Patterns for RAG Systems

This document provides **Weaviate Python Client v4** patterns for advanced features needed in our SnT2025 RAG system. This replaces the v3 patterns found in `../weaviate-advanced-features.md`.

## Key V4 Import Pattern

```python
import weaviate
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
import weaviate.classes.data as wvc_data
```

## 1. Multi-Modal Search (V4)

Weaviate's multi-modal capabilities work with models like CLIP to search across text and images in the same vector space.

### V4 Syntax for Image Search:

```python
# V4 Pattern: Image similarity search
sessions_collection = client.collections.get("SnT25_Session")

response = sessions_collection.query.near_image(
    near_image="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD...",  # base64 image
    limit=3,
    return_properties=["title", "abstract"],
    return_references=[
        wvc_query.QueryReference(link_on="hasSpeakers", return_properties=["name"])
    ]
)

for session in response.objects:
    print(f"Session: {session.properties['title']}")
    if session.references:
        speakers = [s.properties['name'] for s in session.references['hasSpeakers'].objects]
        print(f"Speakers: {', '.join(speakers)}")
```

### V4 Syntax for Text Similarity:

```python
# V4 Pattern: Semantic text search
response = sessions_collection.query.near_text(
    query="machine learning seismic detection",
    limit=5,
    return_properties=["title", "abstract", "sessionType"],
    where=wvc_query.Filter.by_property("sessionType").equal("Technical Session")
)
```

## 2. Generative Search (V4)

Weaviate v4 provides more flexible generative search patterns using the `generate` module.

### Single Prompt Generation:

```python
# V4 Pattern: Generate content for each result
response = sessions_collection.generate.near_text(
    query="artificial intelligence",
    single_prompt="Summarize this session in one sentence: {title} - {abstract}",
    limit=3
)

for result in response.objects:
    print(f"Original: {result.properties['title']}")
    print(f"Summary: {result.generated}")
```

### Grouped Task Generation:

```python
# V4 Pattern: Generate content across all results
response = sessions_collection.generate.near_text(
    query="Dr. Smith presentations",
    grouped_task="Based on these sessions, what are Dr. Smith's main research interests?",
    limit=5
)

print(f"Research Summary: {response.generated}")
```

## 3. Hybrid Search (V4)

Combines vector similarity with keyword search for better precision on specific terms.

```python
# V4 Pattern: Hybrid search with alpha parameter
response = sessions_collection.query.hybrid(
    query="CTBTO monitoring seismic",
    alpha=0.7,  # 0.7 = more vector, 0.3 = more keyword
    limit=10,
    return_properties=["title", "abstract"],
    where=wvc_query.Filter.by_property("day").like("*Mon*")
)
```

## 4. Complex Filtering and Cross-References (V4)

Leverage the knowledge graph structure for sophisticated queries.

### Multi-Hop Graph Queries:

```python
# V4 Pattern: Find sessions by speaker's previous work
# Step 1: Find speaker by expertise area
speakers_collection = client.collections.get("SnT25_Speaker")
expert_speakers = speakers_collection.query.near_text(
    query="nuclear test monitoring",
    limit=3,
    return_properties=["name"]
)

# Step 2: Find sessions by those speakers
speaker_names = [s.properties['name'] for s in expert_speakers.objects]

sessions_by_experts = sessions_collection.query.fetch_objects(
    where=wvc_query.Filter.by_ref_count(
        link_on="hasSpeakers", 
        on="SnT25_Speaker",
        where=wvc_query.Filter.by_property("name").contains_any(speaker_names)
    ).greater_than(0),
    limit=10,
    return_references=[
        wvc_query.QueryReference(link_on="hasSpeakers", return_properties=["name"]),
        wvc_query.QueryReference(link_on="hasTopic", return_properties=["title"])
    ]
)
```

### Complex Filtering Combinations:

```python
# V4 Pattern: Complex multi-condition filtering
response = sessions_collection.query.fetch_objects(
    where=wvc_query.Filter.all_of([
        wvc_query.Filter.by_property("sessionType").equal("Technical Session"),
        wvc_query.Filter.by_property("day").like("*Tue*"),
        wvc_query.Filter.by_ref_count(
            link_on="inRoom",
            on="SnT25_Room", 
            where=wvc_query.Filter.by_property("name").equal("Festsaal")
        ).greater_than(0)
    ]),
    limit=20
)
```

## 5. Parallel Async Queries (V4)

For multi-agent RAG systems requiring concurrent data retrieval.

```python
import asyncio

async def parallel_weaviate_queries(client):
    """Execute multiple Weaviate queries concurrently"""
    
    async def get_sessions_by_topic(topic_code):
        collection = client.collections.get("SnT25_Session")
        return collection.query.fetch_objects(
            where=wvc_query.Filter.by_ref(
                link_on="hasTopic",
                on="SnT25_Topic",
                where=wvc_query.Filter.by_property("topicCode").equal(topic_code)
            ),
            limit=10
        )
    
    async def get_speakers_by_expertise(expertise):
        collection = client.collections.get("SnT25_Speaker")
        return collection.query.near_text(
            query=expertise,
            limit=5
        )
    
    async def get_venue_info(room_name):
        collection = client.collections.get("SnT25_Room")
        return collection.query.fetch_objects(
            where=wvc_query.Filter.by_property("name").equal(room_name),
            limit=1
        )
    
    # Execute all queries in parallel
    results = await asyncio.gather(
        get_sessions_by_topic("T3.1"),
        get_speakers_by_expertise("seismic monitoring"),
        get_venue_info("Festsaal"),
        return_exceptions=True
    )
    
    return {
        "sessions": results[0],
        "experts": results[1], 
        "venue": results[2]
    }

# Usage in your RAG system
async def coordinator_agent_query():
    async with weaviate.use_async_with_weaviate_cloud(
        cluster_url=WEAVIATE_URL,
        auth_credentials=wvc.init.Auth.api_key(WEAVIATE_API_KEY)
    ) as client:
        parallel_results = await parallel_weaviate_queries(client)
        return parallel_results
```

## 6. Aggregation and Analytics (V4)

Get insights about your knowledge base.

```python
# V4 Pattern: Collection statistics
sessions_collection = client.collections.get("SnT25_Session")

# Basic counts
total_sessions = sessions_collection.aggregate.over_all(total_count=True)
print(f"Total sessions: {total_sessions.total_count}")

# Group by property
session_types = sessions_collection.aggregate.over_all(
    group_by="sessionType",
    return_metrics=[wvc.query.Metrics("sessionType").count()]
)

for group in session_types.groups:
    print(f"{group.grouped_by['sessionType']}: {group.total_count} sessions")
```

## 7. Batch Operations (V4)

Efficient bulk operations for dynamic knowledge updates.

```python
# V4 Pattern: Dynamic batch updates
sessions_collection = client.collections.get("SnT25_Session")

with sessions_collection.batch.dynamic() as batch:
    for session_data in new_session_updates:
        batch.add_object(
            properties=session_data["properties"],
            uuid=session_data["uuid"],
            references=session_data.get("references")
        )

# Check for any failures
if batch.failed_objects:
    print(f"Failed to insert {len(batch.failed_objects)} objects")
    for failed_obj in batch.failed_objects:
        print(f"Error: {failed_obj.message}")
```

## 8. Error Handling and Best Practices (V4)

```python
# V4 Pattern: Robust error handling
try:
    with weaviate.connect_to_weaviate_cloud(
        cluster_url=WEAVIATE_URL,
        auth_credentials=wvc.init.Auth.api_key(WEAVIATE_API_KEY),
        headers={'X-OpenAI-Api-Key': OPENAI_API_KEY}
    ) as client:
        
        collection = client.collections.get("SnT25_Session")
        
        response = collection.query.near_text(
            query="machine learning",
            limit=5,
            return_properties=["title"]
        )
        
        return [obj.properties['title'] for obj in response.objects]
        
except weaviate.exceptions.WeaviateConnectionError as e:
    print(f"Connection failed: {e}")
    return []
except weaviate.exceptions.WeaviateQueryError as e:
    print(f"Query failed: {e}")
    return []
except Exception as e:
    print(f"Unexpected error: {e}")
    return []
```

## Migration Notes from V3 to V4

### Key Syntax Changes:
- `client.query.get()` → `collection.query.fetch_objects()` or `collection.query.near_text()`
- `.with_near_text()` → `query.near_text(query=...)`
- `.with_where()` → `where=wvc_query.Filter.by_property(...)`
- `.with_limit()` → `limit=N`
- `.do()` → Not needed (queries execute immediately)
- `.with_generate()` → `collection.generate.near_text()`

### Reference Handling:
- V3: Add references after object creation
- V4: Include references in `batch.add_object()` during creation

---

**Important:** Always use this v4 syntax for new development. The v3 patterns in other documents are deprecated for our project.
