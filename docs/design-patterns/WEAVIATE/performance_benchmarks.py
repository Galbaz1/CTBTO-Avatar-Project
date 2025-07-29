#!/usr/bin/env python3
"""
Performance Benchmarks for Hybrid Search Migration
--------------------------------------------------
A/B testing framework to validate improvements from legacy search to hybrid search.

This benchmark suite:
- Tests both legacy and hybrid search engines
- Measures latency, relevance, and error rates
- Generates detailed performance reports
- Provides statistical analysis of improvements
- Tests with real SnT2025 conference queries

Usage:
    python performance_benchmarks.py --run-all
    python performance_benchmarks.py --compare-latency
    python performance_benchmarks.py --relevance-test
    python performance_benchmarks.py --load-test
"""

import os
import time
import asyncio
import json
import statistics
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse
import logging

# Import both search engines for comparison
from compatibility_adapter import CompatibilityAdapter
from hybrid_integration_bridge import HybridIntegrationBridge

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SearchMetrics:
    """Metrics for a single search operation"""
    query: str
    search_engine: str  # 'legacy' or 'hybrid'
    latency_ms: float
    success: bool
    results_count: int
    error_message: Optional[str] = None
    relevance_scores: List[float] = None
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

@dataclass
class BenchmarkResults:
    """Results from a complete benchmark run"""
    benchmark_name: str
    total_queries: int
    successful_queries: int
    failed_queries: int
    avg_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    avg_results_count: float
    avg_relevance_score: float
    error_rate: float
    timestamp: str
    individual_metrics: List[SearchMetrics]

class PerformanceBenchmarks:
    """A/B testing framework for hybrid search validation"""
    
    # Real SnT2025 test queries organized by type
    TEST_QUERIES = {
        'fact_seeking': [
            "What time is O3.1 session?",
            "Where is Prinz Eugen Saal located?", 
            "When does Anooshiravan Ansari present?",
            "Which room hosts seismic sessions?",
            "What day is machine learning session?"
        ],
        'concept_seeking': [
            "How does machine learning apply to seismic detection?",
            "What is CTBTO International Monitoring System?",
            "Explain hydroacoustic monitoring technologies",
            "What are seismic hazard modeling approaches?",
            "How does nuclear verification work?"
        ],
        'person_seeking': [
            "Find Anooshiravan Ansari speaker",
            "Who is Benoit Doury?",
            "Tell me about CTBTO seismic experts",
            "Find speakers from Tehran University",
            "Who presents on earthquake engineering?"
        ],
        'keyword_queries': [
            "CTBTO",
            "IMS detection capabilities", 
            "hydroacoustic",
            "T1.2 solid earth",
            "SnT2025 seismology"
        ],
        'browsing': [
            "Show me all seismic sessions",
            "List speakers on machine learning",
            "What sessions happen in Festsaal?",
            "Browse earthquake monitoring topics",
            "Display all CTBTO presentations"
        ]
    }
    
    def __init__(self):
        """Initialize benchmark framework"""
        self.benchmark_id = f"benchmark_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize search engines
        self.legacy_adapter = CompatibilityAdapter(use_hybrid=False)
        self.hybrid_adapter = CompatibilityAdapter(use_hybrid=True)
        self.integration_bridge = HybridIntegrationBridge()
        
        # Results storage
        self.results = {}
        
        print(f"🧪 Performance Benchmark Suite initialized (ID: {self.benchmark_id})")
    
    def run_latency_benchmark(self, query_categories: List[str] = None, iterations: int = 3) -> Dict[str, BenchmarkResults]:
        """
        Benchmark search latency comparing legacy vs hybrid
        
        Args:
            query_categories: List of query categories to test (None = all)
            iterations: Number of iterations per query for statistical significance
            
        Returns:
            Dictionary with benchmark results for each engine
        """
        print(f"\n⏱️  Running latency benchmark ({iterations} iterations per query)...")
        
        if query_categories is None:
            query_categories = list(self.TEST_QUERIES.keys())
        
        # Collect all queries to test
        test_queries = []
        for category in query_categories:
            test_queries.extend(self.TEST_QUERIES.get(category, []))
        
        print(f"Testing {len(test_queries)} queries across {len(query_categories)} categories")
        
        # Test both engines
        legacy_metrics = self._run_search_benchmark(
            search_engine='legacy',
            queries=test_queries,
            iterations=iterations,
            adapter=self.legacy_adapter
        )
        
        hybrid_metrics = self._run_search_benchmark(
            search_engine='hybrid', 
            queries=test_queries,
            iterations=iterations,
            adapter=self.hybrid_adapter
        )
        
        # Generate results
        legacy_results = self._calculate_benchmark_results("Legacy Search Latency", legacy_metrics)
        hybrid_results = self._calculate_benchmark_results("Hybrid Search Latency", hybrid_metrics)
        
        results = {
            'legacy': legacy_results,
            'hybrid': hybrid_results
        }
        
        self.results['latency_benchmark'] = results
        
        # Print comparison
        self._print_latency_comparison(legacy_results, hybrid_results)
        
        return results
    
    def _run_search_benchmark(
        self, 
        search_engine: str,
        queries: List[str], 
        iterations: int,
        adapter: CompatibilityAdapter
    ) -> List[SearchMetrics]:
        """Run search benchmark for a specific engine"""
        
        print(f"  🔍 Testing {search_engine} search engine...")
        metrics = []
        
        for query in queries:
            for iteration in range(iterations):
                try:
                    # Measure search latency
                    start_time = time.time()
                    
                    results = adapter.enhanced_conference_search(query)
                    
                    end_time = time.time()
                    latency_ms = (end_time - start_time) * 1000
                    
                    # Count total results
                    total_results = 0
                    relevance_scores = []
                    
                    if isinstance(results, dict):
                        for category_results in results.values():
                            if isinstance(category_results, list):
                                total_results += len(category_results)
                                # Extract relevance scores
                                for result in category_results:
                                    if hasattr(result, 'relevance_score') and result.relevance_score:
                                        relevance_scores.append(result.relevance_score)
                    
                    metrics.append(SearchMetrics(
                        query=query,
                        search_engine=search_engine,
                        latency_ms=latency_ms,
                        success=True,
                        results_count=total_results,
                        relevance_scores=relevance_scores
                    ))
                    
                except Exception as e:
                    metrics.append(SearchMetrics(
                        query=query,
                        search_engine=search_engine,
                        latency_ms=0,
                        success=False,
                        results_count=0,
                        error_message=str(e)
                    ))
        
        return metrics
    
    def _calculate_benchmark_results(self, benchmark_name: str, metrics: List[SearchMetrics]) -> BenchmarkResults:
        """Calculate aggregate benchmark results from individual metrics"""
        
        successful_metrics = [m for m in metrics if m.success]
        failed_metrics = [m for m in metrics if not m.success]
        
        if not successful_metrics:
            return BenchmarkResults(
                benchmark_name=benchmark_name,
                total_queries=len(metrics),
                successful_queries=0,
                failed_queries=len(failed_metrics),
                avg_latency_ms=0,
                p95_latency_ms=0,
                p99_latency_ms=0,
                avg_results_count=0,
                avg_relevance_score=0,
                error_rate=1.0,
                timestamp=datetime.now().isoformat(),
                individual_metrics=metrics
            )
        
        # Calculate latency statistics
        latencies = [m.latency_ms for m in successful_metrics]
        avg_latency = statistics.mean(latencies)
        p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies)
        p99_latency = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max(latencies)
        
        # Calculate result counts
        result_counts = [m.results_count for m in successful_metrics]
        avg_results = statistics.mean(result_counts) if result_counts else 0
        
        # Calculate relevance scores
        all_relevance_scores = []
        for m in successful_metrics:
            if m.relevance_scores:
                all_relevance_scores.extend(m.relevance_scores)
        
        avg_relevance = statistics.mean(all_relevance_scores) if all_relevance_scores else 0
        
        # Calculate error rate
        error_rate = len(failed_metrics) / len(metrics)
        
        return BenchmarkResults(
            benchmark_name=benchmark_name,
            total_queries=len(metrics),
            successful_queries=len(successful_metrics),
            failed_queries=len(failed_metrics),
            avg_latency_ms=avg_latency,
            p95_latency_ms=p95_latency,
            p99_latency_ms=p99_latency,
            avg_results_count=avg_results,
            avg_relevance_score=avg_relevance,
            error_rate=error_rate,
            timestamp=datetime.now().isoformat(),
            individual_metrics=metrics
        )
    
    def _print_latency_comparison(self, legacy_results: BenchmarkResults, hybrid_results: BenchmarkResults):
        """Print formatted comparison of latency results"""
        
        print(f"\n📊 Latency Benchmark Results Comparison:")
        print(f"{'Metric':<25} {'Legacy':<15} {'Hybrid':<15} {'Improvement':<15}")
        print("-" * 70)
        
        # Average latency
        legacy_avg = legacy_results.avg_latency_ms
        hybrid_avg = hybrid_results.avg_latency_ms
        avg_improvement = ((legacy_avg - hybrid_avg) / legacy_avg * 100) if legacy_avg > 0 else 0
        
        print(f"{'Avg Latency (ms)':<25} {legacy_avg:<15.1f} {hybrid_avg:<15.1f} {avg_improvement:<15.1f}%")
        
        # P95 latency
        legacy_p95 = legacy_results.p95_latency_ms
        hybrid_p95 = hybrid_results.p95_latency_ms
        p95_improvement = ((legacy_p95 - hybrid_p95) / legacy_p95 * 100) if legacy_p95 > 0 else 0
        
        print(f"{'P95 Latency (ms)':<25} {legacy_p95:<15.1f} {hybrid_p95:<15.1f} {p95_improvement:<15.1f}%")
        
        # Results count
        legacy_count = legacy_results.avg_results_count
        hybrid_count = hybrid_results.avg_results_count
        count_improvement = ((hybrid_count - legacy_count) / legacy_count * 100) if legacy_count > 0 else 0
        
        print(f"{'Avg Results Count':<25} {legacy_count:<15.1f} {hybrid_count:<15.1f} {count_improvement:<15.1f}%")
        
        # Relevance score
        legacy_relevance = legacy_results.avg_relevance_score
        hybrid_relevance = hybrid_results.avg_relevance_score
        relevance_improvement = ((hybrid_relevance - legacy_relevance) / legacy_relevance * 100) if legacy_relevance > 0 else 0
        
        print(f"{'Avg Relevance Score':<25} {legacy_relevance:<15.3f} {hybrid_relevance:<15.3f} {relevance_improvement:<15.1f}%")
        
        # Error rate
        legacy_error = legacy_results.error_rate * 100
        hybrid_error = hybrid_results.error_rate * 100
        error_improvement = legacy_error - hybrid_error
        
        print(f"{'Error Rate (%)':<25} {legacy_error:<15.1f} {hybrid_error:<15.1f} {error_improvement:<15.1f}pp")
    
    def run_load_test(self, concurrent_users: int = 10, queries_per_user: int = 5) -> Dict[str, Any]:
        """
        Test search performance under concurrent load
        
        Args:
            concurrent_users: Number of concurrent search threads
            queries_per_user: Number of queries each thread executes
            
        Returns:
            Load test results
        """
        print(f"\n🚀 Running load test ({concurrent_users} concurrent users, {queries_per_user} queries each)...")
        
        # Prepare test queries
        all_queries = []
        for category_queries in self.TEST_QUERIES.values():
            all_queries.extend(category_queries)
        
        # Test both engines
        legacy_load_results = self._run_concurrent_load_test(
            engine_name='legacy',
            adapter=self.legacy_adapter,
            queries=all_queries,
            concurrent_users=concurrent_users,
            queries_per_user=queries_per_user
        )
        
        hybrid_load_results = self._run_concurrent_load_test(
            engine_name='hybrid',
            adapter=self.hybrid_adapter, 
            queries=all_queries,
            concurrent_users=concurrent_users,
            queries_per_user=queries_per_user
        )
        
        results = {
            'legacy': legacy_load_results,
            'hybrid': hybrid_load_results,
            'test_config': {
                'concurrent_users': concurrent_users,
                'queries_per_user': queries_per_user,
                'total_queries': concurrent_users * queries_per_user
            }
        }
        
        self.results['load_test'] = results
        
        # Print comparison
        self._print_load_test_comparison(legacy_load_results, hybrid_load_results)
        
        return results
    
    def _run_concurrent_load_test(
        self, 
        engine_name: str,
        adapter: CompatibilityAdapter,
        queries: List[str],
        concurrent_users: int,
        queries_per_user: int
    ) -> Dict[str, Any]:
        """Run concurrent load test for a specific engine"""
        
        print(f"  🔍 Load testing {engine_name} engine...")
        
        start_time = time.time()
        all_metrics = []
        
        def user_load_test(user_id: int) -> List[SearchMetrics]:
            """Simulate one user's query load"""
            user_metrics = []
            
            for i in range(queries_per_user):
                query = queries[(user_id * queries_per_user + i) % len(queries)]
                
                try:
                    query_start = time.time()
                    results = adapter.enhanced_conference_search(query)
                    query_end = time.time()
                    
                    # Count results
                    total_results = 0
                    if isinstance(results, dict):
                        for category_results in results.values():
                            if isinstance(category_results, list):
                                total_results += len(category_results)
                    
                    user_metrics.append(SearchMetrics(
                        query=f"user_{user_id}_query_{i}",
                        search_engine=engine_name,
                        latency_ms=(query_end - query_start) * 1000,
                        success=True,
                        results_count=total_results
                    ))
                    
                except Exception as e:
                    user_metrics.append(SearchMetrics(
                        query=f"user_{user_id}_query_{i}",
                        search_engine=engine_name,
                        latency_ms=0,
                        success=False,
                        results_count=0,
                        error_message=str(e)
                    ))
            
            return user_metrics
        
        # Execute concurrent load test
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(user_load_test, user_id) for user_id in range(concurrent_users)]
            
            for future in as_completed(futures):
                user_metrics = future.result()
                all_metrics.extend(user_metrics)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Calculate load test results
        successful_queries = sum(1 for m in all_metrics if m.success)
        failed_queries = sum(1 for m in all_metrics if not m.success)
        
        successful_metrics = [m for m in all_metrics if m.success]
        avg_latency = statistics.mean([m.latency_ms for m in successful_metrics]) if successful_metrics else 0
        
        queries_per_second = len(all_metrics) / total_duration if total_duration > 0 else 0
        
        return {
            'engine': engine_name,
            'total_duration_seconds': total_duration,
            'total_queries': len(all_metrics),
            'successful_queries': successful_queries,
            'failed_queries': failed_queries,
            'queries_per_second': queries_per_second,
            'avg_latency_ms': avg_latency,
            'error_rate': failed_queries / len(all_metrics) if all_metrics else 0,
            'concurrent_users': concurrent_users,
            'metrics': all_metrics
        }
    
    def _print_load_test_comparison(self, legacy_results: Dict, hybrid_results: Dict):
        """Print formatted load test comparison"""
        
        print(f"\n📊 Load Test Results Comparison:")
        print(f"{'Metric':<25} {'Legacy':<15} {'Hybrid':<15} {'Improvement':<15}")
        print("-" * 70)
        
        # Queries per second
        legacy_qps = legacy_results['queries_per_second']
        hybrid_qps = hybrid_results['queries_per_second']
        qps_improvement = ((hybrid_qps - legacy_qps) / legacy_qps * 100) if legacy_qps > 0 else 0
        
        print(f"{'Queries/Second':<25} {legacy_qps:<15.1f} {hybrid_qps:<15.1f} {qps_improvement:<15.1f}%")
        
        # Average latency under load
        legacy_latency = legacy_results['avg_latency_ms']
        hybrid_latency = hybrid_results['avg_latency_ms']
        latency_improvement = ((legacy_latency - hybrid_latency) / legacy_latency * 100) if legacy_latency > 0 else 0
        
        print(f"{'Avg Latency (ms)':<25} {legacy_latency:<15.1f} {hybrid_latency:<15.1f} {latency_improvement:<15.1f}%")
        
        # Error rate under load
        legacy_error = legacy_results['error_rate'] * 100
        hybrid_error = hybrid_results['error_rate'] * 100
        error_improvement = legacy_error - hybrid_error
        
        print(f"{'Error Rate (%)':<25} {legacy_error:<15.1f} {hybrid_error:<15.1f} {error_improvement:<15.1f}pp")
    
    def generate_report(self, output_file: str = None) -> str:
        """Generate comprehensive benchmark report"""
        
        if output_file is None:
            output_file = f"benchmark_report_{self.benchmark_id}.json"
        
        report = {
            'benchmark_id': self.benchmark_id,
            'timestamp': datetime.now().isoformat(),
            'summary': self._generate_summary(),
            'detailed_results': self.results,
            'test_configuration': {
                'test_queries': self.TEST_QUERIES,
                'total_query_categories': len(self.TEST_QUERIES),
                'total_test_queries': sum(len(queries) for queries in self.TEST_QUERIES.values())
            }
        }
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📄 Benchmark report saved to: {output_file}")
        
        return output_file
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate executive summary of benchmark results"""
        summary = {
            'overall_assessment': 'pending',
            'key_improvements': [],
            'performance_gains': {},
            'recommendations': []
        }
        
        # Analyze latency results
        if 'latency_benchmark' in self.results:
            latency_results = self.results['latency_benchmark']
            legacy = latency_results['legacy']
            hybrid = latency_results['hybrid']
            
            latency_improvement = ((legacy.avg_latency_ms - hybrid.avg_latency_ms) / legacy.avg_latency_ms * 100) if legacy.avg_latency_ms > 0 else 0
            relevance_improvement = ((hybrid.avg_relevance_score - legacy.avg_relevance_score) / legacy.avg_relevance_score * 100) if legacy.avg_relevance_score > 0 else 0
            
            summary['performance_gains']['latency_improvement_pct'] = latency_improvement
            summary['performance_gains']['relevance_improvement_pct'] = relevance_improvement
            
            if latency_improvement > 10:
                summary['key_improvements'].append(f"Latency improved by {latency_improvement:.1f}%")
            
            if relevance_improvement > 5:
                summary['key_improvements'].append(f"Relevance improved by {relevance_improvement:.1f}%")
        
        # Analyze load test results
        if 'load_test' in self.results:
            load_results = self.results['load_test']
            legacy_qps = load_results['legacy']['queries_per_second']
            hybrid_qps = load_results['hybrid']['queries_per_second']
            
            qps_improvement = ((hybrid_qps - legacy_qps) / legacy_qps * 100) if legacy_qps > 0 else 0
            summary['performance_gains']['throughput_improvement_pct'] = qps_improvement
            
            if qps_improvement > 15:
                summary['key_improvements'].append(f"Throughput improved by {qps_improvement:.1f}%")
        
        # Overall assessment
        total_improvements = len(summary['key_improvements'])
        if total_improvements >= 2:
            summary['overall_assessment'] = 'excellent'
            summary['recommendations'].append("Proceed with hybrid search deployment")
        elif total_improvements >= 1:
            summary['overall_assessment'] = 'good'
            summary['recommendations'].append("Consider hybrid search deployment with monitoring")
        else:
            summary['overall_assessment'] = 'needs_improvement'
            summary['recommendations'].append("Address performance issues before deployment")
        
        return summary
    
    def close(self):
        """Clean up resources"""
        if hasattr(self.legacy_adapter, 'close'):
            self.legacy_adapter.close()
        if hasattr(self.hybrid_adapter, 'close'):
            self.hybrid_adapter.close()
        if hasattr(self.integration_bridge, 'close'):
            self.integration_bridge.close()


def main():
    parser = argparse.ArgumentParser(description='Hybrid Search Performance Benchmarks')
    parser.add_argument('--run-all', action='store_true', help='Run all benchmark tests')
    parser.add_argument('--latency-test', action='store_true', help='Run latency benchmark')
    parser.add_argument('--load-test', action='store_true', help='Run load test')
    parser.add_argument('--iterations', type=int, default=3, help='Iterations per query for latency test')
    parser.add_argument('--concurrent-users', type=int, default=10, help='Concurrent users for load test')
    parser.add_argument('--output', type=str, help='Output file for benchmark report')
    
    args = parser.parse_args()
    
    benchmarks = PerformanceBenchmarks()
    
    try:
        if args.run_all or args.latency_test:
            print("🚀 Running latency benchmarks...")
            benchmarks.run_latency_benchmark(iterations=args.iterations)
        
        if args.run_all or args.load_test:
            print("🚀 Running load test...")
            benchmarks.run_load_test(concurrent_users=args.concurrent_users)
        
        # Generate report
        report_file = benchmarks.generate_report(args.output)
        
        print(f"\n✅ Benchmark suite completed!")
        print(f"📊 Report generated: {report_file}")
        
    except Exception as e:
        print(f"\n❌ Benchmark failed: {e}")
        raise
    finally:
        benchmarks.close()


if __name__ == "__main__":
    main() 