# Rosa Kiosk: Standalone Hybrid Search Migration Guide

**For AI Assistants - Complete Self-Contained Instructions**

## 🎯 Context & Purpose

You are helping migrate the Rosa Kiosk conference assistant from legacy search to hybrid search. Rosa is a React/Python conference kiosk that shows information cards about SnT2025 (CTBTO conference) content based on voice queries.

### Current System Architecture
- **Frontend**: React TypeScript with card components
- **Backend**: Python FastAPI with Weaviate vector database
- **Search**: Legacy collection-specific BM25/vector search  
- **Cards**: Dynamic UI cards populated from search results

### Migration Goal
Transform from rigid collection queries to intelligent hybrid search with zero downtime.

## 📋 Prerequisites Check

Before starting, verify these files exist in the codebase:

### Required Existing Files
```
backend/
├── weaviate_knowledge_search.py    # Legacy search tool
├── smart_card_manager.py           # UI card processor  
├── main_conversation_agent.py      # Main conversation agent
└── backend_data/
    ├── speakers/snt2025_speaker_profiles.json  # Rich speaker data
    ├── event_info/snt2025_program.json        # Session data
    └── glossaries/ctbto_glossary.json         # Terms data

docs/design-patterns/WEAVIATE/
├── populate_weaviate_v4.py         # Original population script
├── weaviate-v4-patterns.md         # V4 patterns documentation
└── learnings.md                    # Migration learnings
```

### Environment Variables Required
```bash
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
USE_HYBRID_SEARCH_V2=false  # Start with legacy, switch later
```

## 🔧 Migration Scripts Overview

The migration uses 6 specialized scripts (all in `docs/design-patterns/WEAVIATE/`):

1. **schema_refactor_v2.py** - Migrates Weaviate collections (SnT25_* → clean names)
2. **enrich_speaker_data.py** - Enhances Speaker collection with rich profiles  
3. **hybrid_search_engine.py** - Core intelligent search with dynamic alpha tuning
4. **compatibility_adapter.py** - Zero-breaking-change bridge to existing code
5. **hybrid_integration_bridge.py** - Integration with card processor pipeline
6. **performance_benchmarks.py** - A/B testing framework for validation

## 🚀 Step-by-Step Execution

### Phase 1: Schema Migration (30 minutes)

#### Step 1.1: Verify Current Weaviate State
```bash
cd docs/design-patterns/WEAVIATE/

# Check existing collections (should see SnT25_* prefixed collections)
python -c "
import weaviate
import os
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv('WEAVIATE_URL'),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv('WEAVIATE_API_KEY'))
)
for collection in client.collections.list_all():
    print(f'- {collection}')
client.close()
"
```
**Expected**: See collections like `SnT25_Speaker`, `SnT25_Session`, `SnT25_Topic`, etc.

#### Step 1.2: Run Schema Migration
```bash
# Migrate schema using gradual strategy (keeps both old & new)
python schema_refactor_v2.py --migrate --gradual

# Expected output:
# ✓ Created Topic collection (from SnT25_Topic)
# ✓ Created Speaker collection (from SnT25_Speaker)  
# ✓ Created Venue collection (from SnT25_Room)
# ✓ Created Session collection (from SnT25_Session)
# ✓ Migration log saved to gradual_migration_log_*.json
```

#### Step 1.3: Verify Migration Success
```bash
python schema_refactor_v2.py --verify

# Expected output:
# ✅ Migration verification passed!
# ✅ Data integrity: 100%
# ✅ Collections verified: Topic, Speaker, Venue, Session, GlossaryTerm
```

#### Step 1.4: Enrich Speaker Data
```bash
python enrich_speaker_data.py --enrich

# Expected output:
# ✅ Speaker enrichment completed!
# Processed: XX speakers from snt2025_speaker_profiles.json
# Enhanced: XX speaker records with full biographical data
```

### Phase 2: Performance Validation (20 minutes)

#### Step 2.1: Baseline Benchmarks
```bash
# Test current legacy search performance
export USE_HYBRID_SEARCH_V2=false

python performance_benchmarks.py --latency-test --iterations=3

# Expected: Baseline metrics for legacy search
# Note latency and relevance scores for comparison
```

#### Step 2.2: Hybrid Search Benchmarks  
```bash
# Test new hybrid search performance
export USE_HYBRID_SEARCH_V2=true

python performance_benchmarks.py --run-all --iterations=5

# Expected results to validate:
# 📊 Latency improvement: >10% faster
# 📊 Relevance improvement: >15% better scores  
# 📊 Error rate: <1%
# 📄 Report saved: benchmark_report_*.json
```

#### Step 2.3: Load Testing
```bash
python performance_benchmarks.py --load-test --concurrent-users=10

# Expected: System handles 10 concurrent users without errors
# Queries/second should be >20 for production readiness
```

### Phase 3: Integration Testing (15 minutes)

#### Step 3.1: Test Compatibility Bridge
```bash
# Verify existing code works unchanged with new search
python compatibility_adapter.py

# Expected output:
# 🧪 Testing Compatibility Adapter
# 1️⃣ Testing with HYBRID search: [results shown]
# 2️⃣ Testing with LEGACY search: [results shown]  
# ✅ Compatibility testing complete
```

#### Step 3.2: Test Integration Bridge
```bash
python hybrid_integration_bridge.py

# Expected output:
# 🧪 Testing Hybrid Integration Bridge
# 🔍 Query: 'machine learning seismic location'
# Success: True, Engine: hybrid, Time: <500ms
# Results: >0 total across categories
# ✅ Integration bridge testing complete
```

#### Step 3.3: Test Core Search Engine
```bash
python hybrid_search_engine.py

# Expected output:
# 🧪 Testing Hybrid Search Engine
# 🔍 Query classification examples
# 🔍 Parallel search examples  
# 🔍 Result fusion examples
# ✅ Hybrid search engine testing complete
```

### Phase 4: Production Switch (10 minutes)

#### Step 4.1: Switch Environment
```bash
# Enable hybrid search system-wide
export USE_HYBRID_SEARCH_V2=true

# Or update .env file:
echo "USE_HYBRID_SEARCH_V2=true" >> .env
```

#### Step 4.2: Verify System Ready
```bash
python schema_refactor_v2.py --switch

# Expected output:
# 🔍 Verifying new collections are ready for production...
# ✅ Topic: XXX objects
# ✅ Speaker: XXX objects  
# ✅ Venue: XXX objects
# ✅ Session: XXX objects
# ✅ Environment switched to use new collections
```

#### Step 4.3: Final Production Test
```bash
# Test integration with existing card system
python -c "
from hybrid_integration_bridge import HybridIntegrationBridge

bridge = HybridIntegrationBridge()
result = bridge.enhanced_conference_search('Anooshiravan Ansari machine learning')

print(f'Success: {result[\"success\"]}')
print(f'Engine: {result[\"metadata\"][\"search_engine\"]}')
print(f'Processing time: {result[\"metadata\"][\"processing_time_ms\"]:.1f}ms')
print(f'Total results: {sum(result[\"total_results\"].values())}')

# Verify card-ready formatted response
if len(result['formatted_response']) > 100:
    print('✅ Card processor format verified')
else:
    print('❌ Card processor format issue')

bridge.close()
"
```

**Expected**: Success=True, Engine=hybrid, <500ms, >0 results, card format verified

### Phase 5: Cleanup (Optional - Can be done later)

#### Step 5.1: Monitor Production (Wait 1 week minimum)
```bash
# Run continuous monitoring
python performance_benchmarks.py --latency-test --iterations=10

# Monitor for:
# - Error rate stays <1%  
# - Latency stays <500ms
# - User experience remains good
```

#### Step 5.2: Remove Legacy Collections (DESTRUCTIVE - Optional)
```bash
# Only after 100% confidence in new system
python schema_refactor_v2.py --cleanup --confirm

# This permanently deletes SnT25_* collections
# Only do this if absolutely certain new system is stable
```

## 🔄 Troubleshooting

### Issue: Migration verification fails
```bash
# Check collection existence
python -c "
import weaviate, os
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv('WEAVIATE_URL'),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv('WEAVIATE_API_KEY'))
)
for name in ['Topic', 'Speaker', 'Session', 'Venue']:
    if client.collections.exists(name):
        count = client.collections.get(name).aggregate.over_all(total_count=True).total_count
        print(f'{name}: {count} objects')
    else:
        print(f'{name}: MISSING')
client.close()
"
```

### Issue: Hybrid search errors
```bash
# Disable hybrid search to fall back to legacy
export USE_HYBRID_SEARCH_V2=false

# Test legacy system still works
python compatibility_adapter.py
```

### Issue: Performance degradation
```bash
# Compare performance metrics
python performance_benchmarks.py --latency-test --iterations=5

# If hybrid is slower, investigate:
# 1. Check Weaviate cloud performance
# 2. Verify OpenAI API key has sufficient quota
# 3. Check network latency to both services
```

## 📊 Success Criteria

After migration completion, verify these metrics:

### Technical Validation
- ✅ **Search latency**: Average <500ms (target: <300ms)
- ✅ **Error rate**: <1% (target: <0.5%)  
- ✅ **Relevance improvement**: >15% vs legacy
- ✅ **Zero downtime**: No service interruptions during migration

### Functional Validation  
- ✅ **All test queries work**: Conference-specific queries return relevant results
- ✅ **Card generation works**: UI cards populate correctly from search results
- ✅ **Fallback works**: System gracefully handles errors with legacy fallback
- ✅ **Real data works**: Queries about actual speakers/sessions/venues succeed

## 🎉 Migration Complete!

The Rosa system now has:

### ✅ **Intelligent Search**
- Query classification (fact-seeking vs concept-seeking vs person-seeking)
- Dynamic alpha tuning for optimal hybrid search  
- Parallel search across all collections with result fusion

### ✅ **Rich Data Access**
- Enhanced speaker profiles with full biographical data
- Cross-reference graph traversal (speaker ↔ session ↔ venue ↔ topic)
- Metadata field boosting for better relevance

### ✅ **Production Architecture**  
- Zero-downtime deployment with gradual migration
- Automatic fallback on errors
- Performance monitoring and caching
- Backward compatible with all existing code

### 🚀 **Ready for Future Enhancements**
The system is now prepared for:
- OpenAI Responses API integration (Pydantic structured outputs)
- Additional conference data (speaker social profiles, session recordings, etc.)
- Advanced search features (faceted search, personalization, etc.)

## 📞 Support Information

If migration fails at any step:

1. **Check environment variables** are correctly set
2. **Verify Weaviate connection** with the troubleshooting commands
3. **Review migration logs** in `gradual_migration_log_*.json` files
4. **Use rollback** with `python schema_refactor_v2.py --rollback <log_file>`
5. **Enable legacy fallback** with `export USE_HYBRID_SEARCH_V2=false`

The migration is designed to be safe with automatic fallbacks and complete rollback capability.

---

**End of Self-Contained Migration Guide**

This guide contains everything needed to execute the hybrid search migration without prior Rosa system knowledge. 