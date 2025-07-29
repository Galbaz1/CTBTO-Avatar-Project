# Rosa Kiosk: Weaviate Hybrid Search Migration Plan
**Date:** 2025-01-29  
**Goal:** Replace collection-specific searches with intelligent hybrid search + query decomposition  
**Target:** < 2s card generation with +25% relevance improvement  

## Executive Summary

Transform Rosa's search from rigid collection queries into an adaptive hybrid system that:
- Uses dynamic alpha tuning based on query type classification
- Leverages rich metadata through field boosting
- Performs parallel query decomposition for complex intents
- Implements metadata-aware result fusion
- Maintains sub-2-second performance targets

## Current State Analysis

### Existing Collections (from populate_weaviate_v4.py)
```
SnT25_Topic          → Rich theme/topic data
SnT25_Speaker        → Basic name/title (NEEDS ENRICHMENT)
SnT25_Room           → Venue metadata  
SnT25_Session        → Full session data with cross-refs
SnT25_GlossaryTerm   → Term definitions
SnT25_RedZoneRule    → Content guidelines
```

### Data Gaps Identified
1. **Speaker Collection**: Missing rich profiles from `speakers/snt2025_speaker_profiles.json`
2. **No Content Chunks**: Long-form content not chunked for retrieval
3. **Prefix Pollution**: `SnT25_` prefixes limit reusability
4. **Missing Metadata**: No embedding model version tracking

## Migration Architecture

### 1. Schema Refactor (Week 1)
**New Collection Names** (drop SnT25_ prefix):
- `Topic` - theme/topic data
- `Speaker` - enriched with full profiles  
- `Venue` - room/location data
- `Session` - conference sessions with cross-refs
- `GlossaryTerm` - terminology
- `RedZoneRule` - content guidelines
- `ContentChunk` - NEW: chunked long-form content

### 2. Hybrid Search Engine (Week 1-2)
**Components:**
- `QueryClassifier` - routes queries to optimal alpha values
- `QueryDecomposer` - breaks complex queries into parallel intents
- `HybridSearchEngine` - unified search across collections
- `ResultFusion` - metadata-aware result merging

### 3. Integration Pipeline (Week 2-3)
**Flow:**
```
User Query → Classify & Decompose → Parallel Hybrid Search → Fuse Results → Pydantic Cards
```

## Implementation Scripts

### Core Scripts (in docs/design-patterns/WEAVIATE/)
1. `schema_refactor_v2.py` - Collection redesign & migration
2. `enrich_speaker_data.py` - Ingest rich speaker profiles  
3. `hybrid_search_engine.py` - Core search implementation
4. `query_classification.py` - Query routing system
5. `result_fusion.py` - Result merging & scoring
6. `integration_pipeline.py` - Wire into card processor

### Support Scripts
7. `performance_benchmarks.py` - A/B testing framework
8. `alpha_tuning.py` - Dynamic parameter optimization
9. `metadata_analyzer.py` - Content richness scoring

## Performance Targets

### Search Performance
- **Latency**: < 500ms for hybrid search + classification
- **Throughput**: 100+ concurrent queries
- **Relevance**: +25% improvement vs current vector-only

### Card Generation Pipeline  
- **End-to-End**: < 2s for 3 cards
- **Schema Compliance**: 100% (Pydantic validation)
- **Cost Reduction**: 40% through model selection

## Risk Mitigation

### Technical Risks
1. **Alpha Parameter Sensitivity**: A/B test multiple values
2. **Query Classification Accuracy**: Validate with manual labels
3. **Performance Regression**: Parallel execution + caching
4. **Schema Breaking Changes**: Backward-compatible migration

### Rollback Strategy
- Feature flag: `USE_HYBRID_SEARCH_V2`
- Keep existing search as fallback
- Monitor error rates and auto-rollback if > 5%

## Success Metrics

### Week 1: Foundation
- [ ] New schema deployed and populated
- [ ] Speaker data enriched with full profiles
- [ ] Basic hybrid search working

### Week 2: Intelligence  
- [ ] Query classification achieving > 85% accuracy
- [ ] Parallel search pipeline functional
- [ ] Result fusion improving relevance scores

### Week 3: Integration
- [ ] Card processor using hybrid search
- [ ] A/B testing showing improvement
- [ ] Performance within targets

### Week 4: Optimization
- [ ] Alpha parameters auto-tuned
- [ ] Monitoring and alerting in place
- [ ] Documentation complete

## Next Steps

1. **Execute schema refactor** (`schema_refactor_v2.py`)
2. **Enrich speaker data** (`enrich_speaker_data.py`) 
3. **Build hybrid engine** (`hybrid_search_engine.py`)
4. **Implement classification** (`query_classification.py`)
5. **Create fusion system** (`result_fusion.py`)
6. **Wire integration** (`integration_pipeline.py`)

This migration positions Rosa as a cutting-edge hybrid search system leveraging the latest Weaviate v4 capabilities while solving real user experience problems around search relevance and response time. 