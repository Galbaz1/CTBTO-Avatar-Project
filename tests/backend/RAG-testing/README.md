# RAG Testing Suite

## Overview

This comprehensive testing suite evaluates your RAG (Retrieval-Augmented Generation) system's query decomposition, routing, and retrieval capabilities. It automatically runs multiple test scenarios and saves detailed results for analysis.

## What It Tests

### 🔍 Core Functionality
- **5 Search Strategies**: semantic, keyword, hybrid, filtered, RAG
- **2 Collections**: SnT25_GlossaryTerm, SnT25_Session  
- **Query Complexity**: Simple, medium, and complex queries
- **Multi-Collection Search**: Cross-collection retrieval and merging
- **Enhanced Conference Search**: Categorized results (sessions/speakers/topics)

### 📊 Test Categories

#### 1. Individual Search Strategy Testing
Tests each search strategy (semantic, keyword, hybrid, filtered, RAG) across different query types:
- Technical concepts: "nuclear monitoring technologies"
- Speaker names: "Dr. Elizabeth Hayes" 
- Venue queries: "Festsaal venue"
- Complex queries: "What quantum sensing sessions are available on Wednesday morning?"

#### 2. Multi-Collection Search Testing
Evaluates searching across multiple collections simultaneously:
- Collection distribution analysis
- Result merging and ranking
- Performance across collections

#### 3. Enhanced Conference Search Testing
Tests the categorized search functionality:
- Session categorization
- Speaker extraction
- Topic identification
- Result deduplication

#### 4. Advanced Filtering Testing
Comprehensive filter mechanism testing:
- Venue filters: `{"venue": "Festsaal"}`
- Time filters: `{"time_of_day": "morning"}`
- Boolean filters: `{"is_interactive": true}`
- Range filters: `{"date": {"gte": "2025-09-09"}}`
- Complex combined filters

#### 5. Query Routing Analysis
Analyzes how queries should be routed to optimal search strategies:
- Intent classification patterns
- Query complexity analysis
- Routing recommendation generation

#### 6. Performance Stress Testing
Tests system performance under load:
- Rapid sequential queries
- Execution time analysis
- Memory and resource usage patterns

## Usage

### Prerequisites
1. Ensure your Weaviate instance is running
2. Set up environment variables:
   ```bash
   WEAVIATE_URL=your_weaviate_url
   WEAVIATE_API_KEY=your_api_key
   OPENAI_API_KEY=your_openai_key
   ```

### Running Tests

```bash
cd Rosa_custom_backend/backend
python RAG-testing/rag_test_suite.py
```

### Test Execution Flow

1. **Phase 1**: Individual Search Strategy Testing (semantic, keyword, hybrid, RAG)
2. **Phase 2**: Multi-Collection Search Testing
3. **Phase 3**: Enhanced Conference Search Testing  
4. **Phase 4**: Advanced Filtering Testing
5. **Phase 5**: Query Routing Analysis
6. **Phase 6**: Performance Stress Testing

## Output Files

The test suite generates timestamped files in the `RAG-testing/` folder:

### 📄 `rag_test_results_YYYYMMDD_HHMMSS.json`
Detailed JSON results containing:
- Individual test results
- Execution times
- Relevance scores
- Error information
- Result previews

### 📄 `test_queries_YYYYMMDD_HHMMSS.json` 
All test queries with metadata:
- Query text and complexity
- Expected intent and entities
- Search strategy recommendations

### 📊 `test_summary_YYYYMMDD_HHMMSS.md`
Human-readable summary including:
- Performance metrics
- Strategy comparison
- Top performing queries
- Failed test analysis
- Optimization recommendations

## Test Queries

The suite includes **17 comprehensive test queries** covering:

### Simple Queries (Complexity: Simple)
- `"nuclear monitoring technologies"` - Semantic search
- `"Dr. Elizabeth Hayes"` - Keyword search
- `"sessions today"` - Filtered search

### Medium Complexity
- `"machine learning seismic analysis"` - Hybrid search
- `"Dr. Chen quantum workshops"` - Multi-entity hybrid
- `"morning sessions artificial intelligence"` - Time + topic

### Complex Queries (Multi-Entity)
- `"What quantum sensing sessions are available on Wednesday morning with Dr. Chen?"`
- `"Find interactive workshops about machine learning or AI detection methods in Festsaal"`
- `"Show me all keynote speakers presenting about nuclear verification technologies this week"`

### Edge Cases
- Empty queries
- Non-existent entities
- Extremely long queries

## Analysis Metrics

### Performance Metrics
- **Execution Time**: Average response time per strategy
- **Result Count**: Number of results returned
- **Relevance Scores**: Quality of retrieved results
- **Success Rate**: Percentage of successful queries

### Quality Metrics
- **Top Relevance Score**: Best matching result quality
- **Average Relevance**: Overall result quality
- **Collection Distribution**: Result spread across collections
- **Category Breakdown**: Session/speaker/topic distribution

## Interpreting Results

### 🟢 Good Performance Indicators
- **Execution Time** < 500ms for simple queries
- **Relevance Scores** > 0.7 for well-matched queries
- **Success Rate** > 95%
- **Result Count** 3-10 per query (good coverage)

### 🟡 Areas for Optimization
- **Slow Queries** > 1000ms execution time
- **Low Relevance** < 0.5 average relevance
- **Empty Results** for valid queries
- **Error Rates** > 5%

### 🔴 Issues Requiring Attention
- **Connection Failures** to Weaviate
- **Authentication Errors** with APIs
- **Query Parsing Errors**
- **Memory/Resource Issues**

## Customization

### Adding Test Queries
Edit the `_load_test_queries()` method in `rag_test_suite.py`:

```python
TestQuery(
    id="custom_001",
    query_text="your custom query",
    expected_intent="session_search",
    complexity="medium",
    expected_search_type="hybrid",
    expected_entities=["entity1", "entity2"],
    description="Description of test case"
)
```

### Modifying Test Parameters
Adjust test parameters in the respective methods:
- Result limits: `limit=5`
- Collections: `["SnT25_GlossaryTerm", "SnT25_Session"]`
- Search strategies: `["semantic", "keyword", "hybrid", "rag"]`

### Custom Filters
Add custom filter tests in `_test_filtering_mechanisms()`:

```python
{
    "name": "custom_filter",
    "query": "your query",
    "filters": {"your_field": "your_value"},
    "description": "Filter description"
}
```

## Benchmarking

The test suite provides baseline metrics for benchmarking improvements:

1. **Before Optimization**: Run tests to establish baseline
2. **After Changes**: Re-run tests to measure improvements
3. **Compare Results**: Use JSON diff tools to analyze changes
4. **Track Metrics**: Monitor execution time and relevance trends

## Next Steps

After running tests, use results to:

1. **Identify Bottlenecks**: Focus on slow-performing queries
2. **Optimize Search Strategy**: Route queries to best-performing strategies  
3. **Improve Relevance**: Adjust alpha parameters and filters
4. **Implement Caching**: Cache frequent query patterns
5. **Query Decomposition**: Break complex queries into sub-queries
6. **Performance Tuning**: Optimize Weaviate configuration

## Troubleshooting

### Common Issues

**Connection Errors**
```
Error: Failed to validate Weaviate connection
```
- Check `WEAVIATE_URL` and `WEAVIATE_API_KEY`
- Verify Weaviate instance is running
- Test network connectivity

**Import Errors** 
```
ModuleNotFoundError: No module named 'vector_search_tool'
```
- Ensure you're running from the correct directory
- Check Python path configuration
- Verify all dependencies are installed

**Empty Results**
```
No relevant conference information found
```
- Check if collections contain data
- Verify collection names match your setup
- Test with simpler queries first

**Memory Issues**
```
MemoryError during testing
```
- Reduce test query count
- Lower result limits
- Run tests in smaller batches

## Support

For issues or questions:
1. Check the error logs in test results
2. Verify environment configuration
3. Test individual components separately
4. Review Weaviate cluster status

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Compatibility**: Python 3.8+, Weaviate 1.20+ 