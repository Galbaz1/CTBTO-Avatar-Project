# Learnings from Weaviate v4 Data Ingestion

This document captures the key lessons and best practices discovered during the process of populating our Weaviate instance with conference data for the SnT2025 RAG system.

## 1. Client Version is Critical: V4 is a Paradigm Shift

The single most important learning was the distinction between the Weaviate Python `v3` and `v4` clients. They are fundamentally different, and using patterns from one in the other will fail.

### V3 vs V4 Key Differences:

- **V3 (Legacy):** Uses a single, monolithic `client` object for most operations (e.g., `client.schema.create()`, `client.batch.add_data_object()`). Schema is often defined as a large JSON dictionary.
- **V4 (Modern):** Uses a collection-centric model. You first get a collection object (`client.collections.get(...)`) and then perform actions on it (`collection.batch.add_object(...)`). Schema is defined programmatically with helper classes from `weaviate.classes.config`. This is more Pythonic, provides better type safety, and is less error-prone.

**Conclusion:** Always verify the target Weaviate version and use the corresponding client version's documentation and patterns. For this project, **only V4 patterns are correct.**

## 2. The Correct V4 Pattern for Batch Ingestion with Graph Links

After extensive research and multiple failed attempts, the most robust and efficient pattern for creating a knowledge graph with cross-references in v4 is a **two-phase ingestion process**:

### Phase 1: Ingest Independent Objects
- Batch-import all "node" objects that do **not** have references to other objects being created in the same run (e.g., Speakers, Rooms, Topics, Glossary Terms, Red Zone Rules).
- Generate and cache their deterministic UUIDs (using `weaviate.util.generate_uuid5`) during this phase.
- Use collection-specific batch contexts: `with collection.batch.dynamic() as batch:`

### Phase 2: Ingest and Link Connector Objects
- Batch-import the "connector" objects (e.g., Sessions).
- When creating these objects with `batch.add_object()`, populate the `references` parameter using `wvc_data.DataReference(beacon=uuid)`.
- This creates the object and its graph links in a single, efficient API call.

### Critical V4 Syntax for References:
```python
# Correct v4 way to add references
references = {
    "hasSpeakers": [wvc_data.DataReference(beacon=speaker_uuid) for speaker_uuid in speaker_uuids],
    "hasTopic": wvc_data.DataReference(beacon=topic_uuid),
    "inRoom": wvc_data.DataReference(beacon=room_uuid)
}

batch.add_object(
    properties=properties,
    uuid=session_uuid,
    references=references
)
```

## 3. Schema Definition Best Practices (V4)

### Correct V4 Schema Creation Pattern:
```python
import weaviate.classes.config as wvc

# Define vectorizer and generative configs once
vectorizer_config = wvc.Configure.Vectorizer.text2vec_openai(vectorize_collection_name=False)
generative_config = wvc.Configure.Generative.openai()

# Create collections with proper property definitions
client.collections.create(
    name='SnT25_Session',
    vectorizer_config=vectorizer_config,
    generative_config=generative_config,
    properties=[
        wvc.Property(name='title', data_type=wvc.DataType.TEXT),
        wvc.Property(name='startTime', data_type=wvc.DataType.DATE),
        # ... other properties
    ],
    references=[
        wvc.ReferenceProperty(name='hasSpeakers', target_collection='SnT25_Speaker'),
        wvc.ReferenceProperty(name='hasTopic', target_collection='SnT25_Topic'),
        # ... other references
    ]
)
```

## 4. Pre-Process Data for the Full Pipeline

The data in the vector database is not the final product; it's an intermediate step for the RAG agent and a Text-to-Speech (TTS) engine.

### Phonetic Correctness for TTS
- **Critical Requirement:** All text data must be pre-processed to expand abbreviations (e.g., "Dr." → "Doctor", "IMS" → "International Monitoring System").
- **Implementation:** Build a centralized expansion map from glossary data and apply it consistently across all text fields.
- **Why:** This ensures natural-sounding speech when the RAG system generates responses that are converted to audio.

### Handling Missing/Inconsistent Data
- **Real-world Challenge:** Source data is often imperfect with `null` values, missing fields, or inconsistent formatting.
- **Solution:** The ingestion script must be robust against missing values (like event `location` being `None`) to prevent crashes.
- **Pattern:** Use `.get()` methods with defaults and validate data before processing.

## 5. Environment and Configuration Lessons

### Path Resolution for Scripts
- **Issue:** Python scripts that are not in the root directory need explicit path configuration.
- **Solution:** Use relative paths from script location:
```python
script_dir = os.path.dirname(os.path.realpath(__file__))
dotenv_path = os.path.join(script_dir, '..', '..', 'Rosa_custom_backend', '.env')
load_dotenv(dotenv_path=dotenv_path)
```

### Service Dependencies
- **Weaviate Service:** The Weaviate instance must be running *before* the client attempts to connect. "Connection refused" errors indicate the database is down.
- **Module Configuration:** Weaviate instances must be configured with required modules (e.g., `text2vec-openai`) via environment variables (`ENABLE_MODULES`).

## 6. Common Pitfalls and Solutions

### UUID Generation and Caching
- **Pitfall:** Generating different UUIDs for the same entity across runs leads to duplicates.
- **Solution:** Use deterministic UUID generation with consistent string keys: `generate_uuid5(f"speaker-{name}")`

### Reference Property Naming
- **Pitfall:** Inconsistent naming between schema definition and data insertion.
- **Solution:** Use clear, consistent naming conventions (e.g., `hasSpeakers`, `hasTopic`, `inRoom`).

### Batch Context Management
- **Pitfall:** Not properly managing batch contexts can lead to memory issues or failed insertions.
- **Solution:** Always use `with collection.batch.dynamic() as batch:` for automatic resource management.

### Date/Time Handling
- **Pitfall:** Timezone-naive datetime objects cause warnings and potential issues.
- **Solution:** Always specify timezone explicitly: `datetime(..., tzinfo=timezone.utc)`

## 7. Verification and Testing

### Essential Verification Steps
1. **Count Verification:** Check that expected numbers of objects were created in each collection.
2. **Reference Verification:** Query specific objects and verify their references are correctly established.
3. **Sample Data Check:** Fetch and inspect sample objects to ensure data quality and completeness.

### Query Pattern for Verification:
```python
response = collection.query.fetch_objects(
    where=wvc_query.Filter.by_property("property_name").like("*pattern*"),
    limit=1,
    return_references=[
        wvc_query.QueryReference(link_on="reference_name", return_properties=["prop1", "prop2"])
    ]
)
```

## 8. Performance Considerations

### Batch Size and Memory
- **Default Dynamic Batching:** Use `batch.dynamic()` for automatic batch size optimization.
- **Memory Management:** For large datasets, consider processing in chunks to avoid memory issues.

### Connection Management
- **Context Managers:** Use `with weaviate.connect_to_weaviate_cloud(...) as client:` for proper connection cleanup.
- **Error Handling:** Wrap operations in try-catch blocks with proper cleanup.

## Future Improvements

1. **Error Recovery:** Implement checkpoint/resume functionality for large ingestion jobs.
2. **Data Validation:** Add more comprehensive data validation before ingestion.
3. **Incremental Updates:** Support for updating existing objects rather than full re-ingestion.
4. **Parallel Processing:** Explore concurrent ingestion for independent collections.

---

*This document represents hard-won knowledge from the trenches of Weaviate v4 implementation. Keep it updated as we learn more!*
