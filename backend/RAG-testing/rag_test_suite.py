#!/usr/bin/env python3
"""
RAG Testing Suite - Comprehensive Query Decomposition, Routing & Retrieval Tests
Tests all search strategies, query types, and processing patterns
Saves detailed results for analysis and benchmarking
"""

import os
import sys
import json
import time
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging

# Add parent directory to path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.weaviate_knowledge_search import VectorSearchTool, SearchQuery, SearchResult
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TestQuery:
    """Represents a test query with metadata"""
    id: str
    query_text: str
    expected_intent: str
    complexity: str  # "simple", "medium", "complex"
    expected_search_type: str
    expected_entities: List[str]
    description: str

@dataclass
class TestResult:
    """Comprehensive test result structure"""
    test_id: str
    query: str
    search_type: str
    collection: str
    execution_time_ms: float
    result_count: int
    avg_relevance_score: float
    top_relevance_score: float
    error: Optional[str]
    results_preview: List[Dict[str, Any]]
    filters_applied: Optional[Dict[str, Any]]
    timestamp: str

class RAGTestSuite:
    """Comprehensive testing suite for RAG system"""
    
    def __init__(self):
        self.search_tool = VectorSearchTool()
        self.results: List[TestResult] = []
        self.test_queries = self._load_test_queries()
        
    def _load_test_queries(self) -> List[TestQuery]:
        """Load comprehensive test queries covering different scenarios"""
        return [
            # Simple Semantic Queries
            TestQuery(
                id="semantic_001",
                query_text="nuclear monitoring technologies",
                expected_intent="topic_exploration",
                complexity="simple",
                expected_search_type="semantic",
                expected_entities=["nuclear", "monitoring", "technologies"],
                description="Basic semantic search for technical concepts"
            ),
            TestQuery(
                id="semantic_002", 
                query_text="quantum sensing applications",
                expected_intent="topic_exploration",
                complexity="simple",
                expected_search_type="semantic",
                expected_entities=["quantum", "sensing", "applications"],
                description="Conceptual query about quantum technology"
            ),
            TestQuery(
                id="semantic_003",
                query_text="seismic detection methods",
                expected_intent="topic_exploration", 
                complexity="simple",
                expected_search_type="semantic",
                expected_entities=["seismic", "detection", "methods"],
                description="Scientific methodology query"
            ),
            
            # Keyword/Exact Match Queries
            TestQuery(
                id="keyword_001",
                query_text="Dr. Elizabeth Hayes",
                expected_intent="speaker_lookup",
                complexity="simple",
                expected_search_type="keyword",
                expected_entities=["Dr. Elizabeth Hayes"],
                description="Exact speaker name lookup"
            ),
            TestQuery(
                id="keyword_002",
                query_text="Festsaal venue",
                expected_intent="venue_navigation",
                complexity="simple", 
                expected_search_type="keyword",
                expected_entities=["Festsaal"],
                description="Venue-specific query"
            ),
            TestQuery(
                id="keyword_003",
                query_text="SnT2025 conference",
                expected_intent="conference_info",
                complexity="simple",
                expected_search_type="keyword", 
                expected_entities=["SnT2025"],
                description="Conference identifier search"
            ),
            
            # Hybrid Queries (Most Common)
            TestQuery(
                id="hybrid_001",
                query_text="machine learning seismic analysis",
                expected_intent="topic_exploration",
                complexity="medium",
                expected_search_type="hybrid",
                expected_entities=["machine learning", "seismic", "analysis"],
                description="Technical topic combining AI and geophysics"
            ),
            TestQuery(
                id="hybrid_002",
                query_text="Dr. Chen quantum workshops",
                expected_intent="session_search",
                complexity="medium",
                expected_search_type="hybrid",
                expected_entities=["Dr. Chen", "quantum", "workshops"],
                description="Speaker + topic + session type combination"
            ),
            TestQuery(
                id="hybrid_003",
                query_text="morning sessions artificial intelligence",
                expected_intent="schedule_planning",
                complexity="medium",
                expected_search_type="hybrid",
                expected_entities=["morning", "sessions", "artificial intelligence"],
                description="Time-based filtering with topic"
            ),
            
            # Complex Multi-Entity Queries
            TestQuery(
                id="complex_001",
                query_text="What quantum sensing sessions are available on Wednesday morning with Dr. Chen?",
                expected_intent="session_search",
                complexity="complex",
                expected_search_type="hybrid",
                expected_entities=["quantum sensing", "sessions", "Wednesday", "morning", "Dr. Chen"],
                description="Multi-entity query requiring decomposition"
            ),
            TestQuery(
                id="complex_002", 
                query_text="Find interactive workshops about machine learning or AI detection methods in Festsaal",
                expected_intent="session_search",
                complexity="complex",
                expected_search_type="hybrid",
                expected_entities=["interactive", "workshops", "machine learning", "AI", "detection", "Festsaal"],
                description="Complex query with multiple filters and OR logic"
            ),
            TestQuery(
                id="complex_003",
                query_text="Show me all keynote speakers presenting about nuclear verification technologies this week",
                expected_intent="speaker_lookup",
                complexity="complex", 
                expected_search_type="hybrid",
                expected_entities=["keynote", "speakers", "nuclear verification", "technologies", "this week"],
                description="Speaker search with topic and time constraints"
            ),
            
            # Temporal Queries
            TestQuery(
                id="temporal_001",
                query_text="sessions today",
                expected_intent="schedule_planning",
                complexity="simple",
                expected_search_type="filtered",
                expected_entities=["today"],
                description="Current day session lookup"
            ),
            TestQuery(
                id="temporal_002",
                query_text="Wednesday afternoon presentations",
                expected_intent="schedule_planning", 
                complexity="medium",
                expected_search_type="filtered",
                expected_entities=["Wednesday", "afternoon", "presentations"],
                description="Specific day and time filtering"
            ),
            
            # Edge Cases
            TestQuery(
                id="edge_001",
                query_text="",
                expected_intent="unknown",
                complexity="simple",
                expected_search_type="semantic",
                expected_entities=[],
                description="Empty query handling"
            ),
            TestQuery(
                id="edge_002",
                query_text="xyz123 nonexistent speaker",
                expected_intent="speaker_lookup", 
                complexity="simple",
                expected_search_type="keyword",
                expected_entities=["xyz123", "nonexistent", "speaker"],
                description="Non-existent entity query"
            ),
            TestQuery(
                id="edge_003",
                query_text="a" * 500,  # Very long query
                expected_intent="unknown",
                complexity="simple", 
                expected_search_type="semantic",
                expected_entities=[],
                description="Extremely long query handling"
            )
        ]
    
    def run_comprehensive_tests(self):
        """Run all test scenarios and save results"""
        print("🧪 Starting RAG Test Suite - Comprehensive Query Testing")
        print(f"📊 Testing {len(self.test_queries)} queries across all search strategies")
        print("=" * 80)
        
        test_start_time = time.time()
        
        # Test 1: Individual Search Strategy Testing
        print("\n🔍 Phase 1: Individual Search Strategy Testing")
        self._test_search_strategies()
        
        # Test 2: Multi-Collection Search Testing  
        print("\n🔍 Phase 2: Multi-Collection Search Testing")
        self._test_multi_collection_search()
        
        # Test 3: Enhanced Conference Search Testing
        print("\n🔍 Phase 3: Enhanced Conference Search Testing")
        self._test_enhanced_conference_search()
        
        # Test 4: Filter Testing
        print("\n🔍 Phase 4: Advanced Filtering Testing")
        self._test_filtering_mechanisms()
        
        # Test 5: Query Routing Analysis
        print("\n🔍 Phase 5: Query Routing Analysis")
        self._analyze_query_routing()
        
        # Test 6: Performance Stress Testing
        print("\n🔍 Phase 6: Performance Stress Testing")
        self._test_performance_scenarios()
        
        total_time = time.time() - test_start_time
        print(f"\n✅ Test Suite Complete! Total execution time: {total_time:.2f}s")
        print(f"📈 Total tests executed: {len(self.results)}")
        
        # Save all results
        self._save_test_results()
        self._generate_test_summary()
    
    def _test_search_strategies(self):
        """Test each search strategy individually"""
        strategies = ["semantic", "keyword", "hybrid", "rag"]
        collections = ["SnT25_GlossaryTerm", "SnT25_Session"]
        
        for strategy in strategies:
            print(f"  Testing {strategy} search...")
            
            for query_test in self.test_queries[:8]:  # Test first 8 queries for each strategy
                if query_test.query_text.strip() == "":  # Skip empty queries for some strategies
                    continue
                    
                for collection in collections:
                    try:
                        start_time = time.time()
                        
                        search_query = SearchQuery(
                            query_text=query_test.query_text,
                            search_type=strategy,
                            collection=collection,
                            limit=5
                        )
                        
                        results = self.search_tool.search(search_query)
                        execution_time = (time.time() - start_time) * 1000
                        
                        # Handle different result formats
                        if isinstance(results, dict):  # RAG search returns dict
                            actual_results = results.get("search_results", [])
                        else:
                            actual_results = results
                        
                        # Calculate metrics
                        avg_relevance = sum(r.relevance_score for r in actual_results) / len(actual_results) if actual_results else 0
                        top_relevance = max([r.relevance_score for r in actual_results], default=0)
                        
                        # Create result preview
                        results_preview = []
                        for i, result in enumerate(actual_results[:3]):  # Top 3 results
                            results_preview.append({
                                "rank": i + 1,
                                "title": result.title[:100],
                                "relevance_score": result.relevance_score,
                                "collection": result.collection,
                                "search_type": result.search_type
                            })
                        
                        test_result = TestResult(
                            test_id=f"{strategy}_{collection}_{query_test.id}",
                            query=query_test.query_text,
                            search_type=strategy,
                            collection=collection,
                            execution_time_ms=execution_time,
                            result_count=len(actual_results),
                            avg_relevance_score=avg_relevance,
                            top_relevance_score=top_relevance,
                            error=None,
                            results_preview=results_preview,
                            filters_applied=None,
                            timestamp=datetime.now().isoformat()
                        )
                        
                        self.results.append(test_result)
                        
                    except Exception as e:
                        error_result = TestResult(
                            test_id=f"{strategy}_{collection}_{query_test.id}_ERROR",
                            query=query_test.query_text,
                            search_type=strategy,
                            collection=collection,
                            execution_time_ms=0,
                            result_count=0,
                            avg_relevance_score=0,
                            top_relevance_score=0,
                            error=str(e),
                            results_preview=[],
                            filters_applied=None,
                            timestamp=datetime.now().isoformat()
                        )
                        self.results.append(error_result)
                        print(f"    ❌ Error testing {strategy} on {collection}: {e}")
    
    def _test_multi_collection_search(self):
        """Test multi-collection search capabilities"""
        print("  Testing multi-collection search...")
        
        test_queries = ["quantum sensing", "nuclear detection", "machine learning", "Dr. Elizabeth Hayes"]
        collections = ["SnT25_GlossaryTerm", "SnT25_Session"]
        
        for query in test_queries:
            try:
                start_time = time.time()
                
                results = self.search_tool.multi_collection_search(
                    query=query,
                    collections=collections,
                    search_type="hybrid",
                    limit_per_collection=3
                )
                
                execution_time = (time.time() - start_time) * 1000
                
                # Analyze collection distribution
                collection_counts = {}
                for result in results:
                    collection_counts[result.collection] = collection_counts.get(result.collection, 0) + 1
                
                avg_relevance = sum(r.relevance_score for r in results) / len(results) if results else 0
                top_relevance = max([r.relevance_score for r in results], default=0)
                
                results_preview = []
                for i, result in enumerate(results[:5]):
                    results_preview.append({
                        "rank": i + 1,
                        "title": result.title[:100],
                        "relevance_score": result.relevance_score,
                        "collection": result.collection,
                        "search_type": result.search_type
                    })
                
                test_result = TestResult(
                    test_id=f"multi_collection_{query.replace(' ', '_')}",
                    query=query,
                    search_type="multi_collection_hybrid",
                    collection="SnT25_GlossaryTerm+SnT25_Session",
                    execution_time_ms=execution_time,
                    result_count=len(results),
                    avg_relevance_score=avg_relevance,
                    top_relevance_score=top_relevance,
                    error=None,
                    results_preview=results_preview,
                    filters_applied={"collections": collections, "collection_counts": collection_counts},
                    timestamp=datetime.now().isoformat()
                )
                
                self.results.append(test_result)
                
            except Exception as e:
                print(f"    ❌ Error in multi-collection search for '{query}': {e}")
    
    def _test_enhanced_conference_search(self):
        """Test enhanced conference search with categorization"""
        print("  Testing enhanced conference search...")
        
        test_queries = [
            "quantum sensing applications",
            "nuclear verification technologies", 
            "machine learning detection",
            "Dr. Elizabeth Hayes presentations",
            "keynote speakers artificial intelligence"
        ]
        
        for query in test_queries:
            try:
                start_time = time.time()
                
                categorized_results = self.search_tool.enhanced_conference_search(
                    query=query,
                    search_mode="comprehensive"
                )
                
                execution_time = (time.time() - start_time) * 1000
                
                # Analyze categorization
                total_results = sum(len(categorized_results[cat]) for cat in categorized_results)
                category_breakdown = {cat: len(results) for cat, results in categorized_results.items()}
                
                # Get top results from each category for preview
                results_preview = []
                for category, results in categorized_results.items():
                    if results:
                        top_result = results[0]
                        results_preview.append({
                            "category": category,
                            "title": top_result.title[:100],
                            "relevance_score": top_result.relevance_score,
                            "count_in_category": len(results)
                        })
                
                test_result = TestResult(
                    test_id=f"enhanced_conference_{query.replace(' ', '_')}",
                    query=query,
                    search_type="enhanced_conference",
                    collection="Categorized Results",
                    execution_time_ms=execution_time,
                    result_count=total_results,
                    avg_relevance_score=0,  # Would need to calculate across categories
                    top_relevance_score=0,  # Would need to calculate across categories
                    error=None,
                    results_preview=results_preview,
                    filters_applied={"category_breakdown": category_breakdown},
                    timestamp=datetime.now().isoformat()
                )
                
                self.results.append(test_result)
                
            except Exception as e:
                print(f"    ❌ Error in enhanced conference search for '{query}': {e}")
    
    def _test_filtering_mechanisms(self):
        """Test various filtering mechanisms"""
        print("  Testing filtering mechanisms...")
        
        filter_tests = [
            {
                "name": "venue_filter",
                "query": "sessions",
                "filters": {"venue": "Festsaal"},
                "description": "Filter by specific venue"
            },
            {
                "name": "interactive_filter", 
                "query": "workshops",
                "filters": {"is_interactive": True},
                "description": "Filter for interactive sessions only"
            },
            {
                "name": "time_filter",
                "query": "presentations",
                "filters": {"time_of_day": "morning"},
                "description": "Filter by time of day"
            },
            {
                "name": "date_range_filter",
                "query": "conference sessions",
                "filters": {"date": {"gte": "2025-09-09", "lte": "2025-09-12"}},
                "description": "Filter by date range"
            },
            {
                "name": "topic_array_filter",
                "query": "technical sessions",
                "filters": {"related_topics": ["machine learning", "seismic detection"]},
                "description": "Filter by multiple topics"
            },
            {
                "name": "complex_combined_filter",
                "query": "morning workshops",
                "filters": {
                    "time_of_day": "morning",
                    "is_interactive": True,
                    "related_topics": ["quantum sensing"],
                    "date": {"gte": "2025-09-10"}
                },
                "description": "Complex multi-criteria filtering"
            }
        ]
        
        for filter_test in filter_tests:
            try:
                start_time = time.time()
                
                search_query = SearchQuery(
                    query_text=filter_test["query"],
                    search_type="hybrid",
                    collection="SnT25_Session",
                    filters=filter_test["filters"],
                    limit=10
                )
                
                results = self.search_tool.search(search_query)
                execution_time = (time.time() - start_time) * 1000
                
                avg_relevance = sum(r.relevance_score for r in results) / len(results) if results else 0
                top_relevance = max([r.relevance_score for r in results], default=0)
                
                results_preview = []
                for i, result in enumerate(results[:3]):
                    results_preview.append({
                        "rank": i + 1,
                        "title": result.title[:100],
                        "relevance_score": result.relevance_score,
                        "metadata_sample": {k: v for k, v in list(result.metadata.items())[:3]}
                    })
                
                test_result = TestResult(
                    test_id=f"filter_{filter_test['name']}",
                    query=filter_test["query"],
                    search_type="hybrid_with_filters",
                    collection="SnT25_Session",
                    execution_time_ms=execution_time,
                    result_count=len(results),
                    avg_relevance_score=avg_relevance,
                    top_relevance_score=top_relevance,
                    error=None,
                    results_preview=results_preview,
                    filters_applied=filter_test["filters"],
                    timestamp=datetime.now().isoformat()
                )
                
                self.results.append(test_result)
                
            except Exception as e:
                print(f"    ❌ Error testing filter '{filter_test['name']}': {e}")
    
    def _analyze_query_routing(self):
        """Analyze how different queries should be routed to different search strategies"""
        print("  Analyzing query routing patterns...")
        
        # This would ideally test a query classification system
        # For now, we'll analyze the patterns from our existing results
        
        routing_analysis = {
            "semantic_candidates": [],
            "keyword_candidates": [],
            "hybrid_candidates": [],
            "filtered_candidates": []
        }
        
        for query_test in self.test_queries:
            # Simple heuristic analysis (would be replaced by ML model)
            query = query_test.query_text.lower()
            
            if any(indicator in query for indicator in ["dr.", "prof.", "speaker"]):
                routing_analysis["keyword_candidates"].append(query_test.id)
            elif any(indicator in query for indicator in ["technology", "method", "approach", "concept"]):
                routing_analysis["semantic_candidates"].append(query_test.id)
            elif any(indicator in query for indicator in ["today", "tomorrow", "morning", "afternoon", "venue"]):
                routing_analysis["filtered_candidates"].append(query_test.id)
            else:
                routing_analysis["hybrid_candidates"].append(query_test.id)
        
        # Save routing analysis
        routing_result = TestResult(
            test_id="query_routing_analysis",
            query="ROUTING_ANALYSIS",
            search_type="analysis",
            collection="all",
            execution_time_ms=0,
            result_count=len(self.test_queries),
            avg_relevance_score=0,
            top_relevance_score=0,
            error=None,
            results_preview=[],
            filters_applied=routing_analysis,
            timestamp=datetime.now().isoformat()
        )
        
        self.results.append(routing_result)
    
    def _test_performance_scenarios(self):
        """Test performance under various load scenarios"""
        print("  Testing performance scenarios...")
        
        # Test 1: Rapid sequential queries
        rapid_queries = ["quantum", "nuclear", "seismic", "AI", "detection"] * 3
        start_time = time.time()
        
        rapid_results = []
        for query in rapid_queries:
            try:
                query_start = time.time()
                results = self.search_tool.hybrid_search(query, "SnT25_GlossaryTerm", limit=3)
                query_time = (time.time() - query_start) * 1000
                rapid_results.append(query_time)
            except Exception as e:
                rapid_results.append(-1)  # Error marker
        
        total_rapid_time = (time.time() - start_time) * 1000
        
        performance_result = TestResult(
            test_id="performance_rapid_sequential",
            query=f"15 rapid queries: {rapid_queries[:5]}...",
            search_type="hybrid_performance_test",
            collection="SnT25_GlossaryTerm",
            execution_time_ms=total_rapid_time,
            result_count=len(rapid_queries),
            avg_relevance_score=0,
            top_relevance_score=0,
            error=None,
            results_preview=[],
            filters_applied={
                "individual_query_times": rapid_results,
                "avg_query_time": sum(t for t in rapid_results if t > 0) / len([t for t in rapid_results if t > 0]),
                "total_time": total_rapid_time
            },
            timestamp=datetime.now().isoformat()
        )
        
        self.results.append(performance_result)
    
    def _save_test_results(self):
        """Save detailed test results to JSON file"""
        os.makedirs("RAG-testing", exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save detailed results
        results_file = f"RAG-testing/rag_test_results_{timestamp}.json"
        with open(results_file, 'w') as f:
            json.dump([asdict(result) for result in self.results], f, indent=2)
        
        print(f"📄 Detailed results saved to: {results_file}")
        
        # Save test queries for reference
        queries_file = f"RAG-testing/test_queries_{timestamp}.json"
        with open(queries_file, 'w') as f:
            json.dump([asdict(query) for query in self.test_queries], f, indent=2)
        
        print(f"📄 Test queries saved to: {queries_file}")
    
    def _generate_test_summary(self):
        """Generate a human-readable test summary"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        summary_file = f"RAG-testing/test_summary_{timestamp}.md"
        
        successful_tests = [r for r in self.results if r.error is None]
        failed_tests = [r for r in self.results if r.error is not None]
        
        # Calculate performance metrics
        avg_execution_time = sum(r.execution_time_ms for r in successful_tests) / len(successful_tests) if successful_tests else 0
        avg_result_count = sum(r.result_count for r in successful_tests) / len(successful_tests) if successful_tests else 0
        avg_relevance = sum(r.avg_relevance_score for r in successful_tests) / len(successful_tests) if successful_tests else 0
        
        # Strategy performance breakdown
        strategy_performance = {}
        for result in successful_tests:
            strategy = result.search_type
            if strategy not in strategy_performance:
                strategy_performance[strategy] = {"count": 0, "total_time": 0, "total_results": 0}
            strategy_performance[strategy]["count"] += 1
            strategy_performance[strategy]["total_time"] += result.execution_time_ms
            strategy_performance[strategy]["total_results"] += result.result_count
        
        summary_content = f"""# RAG Test Suite Summary
**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Test Overview
- **Total Tests Executed:** {len(self.results)}
- **Successful Tests:** {len(successful_tests)}
- **Failed Tests:** {len(failed_tests)}
- **Success Rate:** {(len(successful_tests) / len(self.results) * 100):.1f}%

## Performance Metrics
- **Average Execution Time:** {avg_execution_time:.2f}ms
- **Average Results per Query:** {avg_result_count:.1f}
- **Average Relevance Score:** {avg_relevance:.3f}

## Search Strategy Performance
"""
        
        for strategy, stats in strategy_performance.items():
            avg_time = stats["total_time"] / stats["count"]
            avg_results = stats["total_results"] / stats["count"]
            summary_content += f"""
### {strategy.upper()}
- **Tests:** {stats["count"]}
- **Avg Time:** {avg_time:.2f}ms
- **Avg Results:** {avg_results:.1f}
"""
        
        summary_content += f"""
## Top Performing Queries
"""
        
        # Find top performing queries by relevance
        top_queries = sorted(successful_tests, key=lambda x: x.top_relevance_score, reverse=True)[:5]
        for i, result in enumerate(top_queries, 1):
            summary_content += f"""
{i}. **Query:** "{result.query[:50]}..."
   - **Strategy:** {result.search_type}
   - **Top Relevance:** {result.top_relevance_score:.3f}
   - **Results:** {result.result_count}
   - **Time:** {result.execution_time_ms:.2f}ms
"""
        
        if failed_tests:
            summary_content += f"""
## Failed Tests ({len(failed_tests)})
"""
            for result in failed_tests:
                summary_content += f"""
- **Query:** "{result.query[:50]}..."
- **Strategy:** {result.search_type}
- **Error:** {result.error}
"""
        
        summary_content += f"""
## Test Configuration
- **Collections Tested:** SnT25_GlossaryTerm, SnT25_Session
- **Search Strategies:** semantic, keyword, hybrid, filtered, rag
- **Result Limits:** 3-10 per query
- **Total Test Queries:** {len(self.test_queries)}

## Next Steps
1. Analyze slow queries (>{avg_execution_time * 2:.0f}ms)
2. Investigate failed tests
3. Optimize query routing based on performance patterns
4. Consider caching for repeated query patterns
5. Implement query decomposition for complex queries

---
*Generated by RAG Test Suite v1.0*
"""
        
        with open(summary_file, 'w') as f:
            f.write(summary_content)
        
        print(f"📊 Test summary saved to: {summary_file}")

def main():
    """Main execution function"""
    print("🚀 RAG Testing Suite - Starting Comprehensive Tests")
    print("=" * 80)
    
    try:
        test_suite = RAGTestSuite()
        test_suite.run_comprehensive_tests()
        
        print("\n🎉 All tests completed successfully!")
        print("📁 Check the RAG-testing folder for detailed results and analysis")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 