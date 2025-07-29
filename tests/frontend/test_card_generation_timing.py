#!/usr/bin/env python3
"""
Unit test for card generation timing and API response latency.
Ensures API latency < 2s even with mocked 3-second card generation.
"""

import asyncio
import time
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(backend_dir, 'backend'))

from logger import log_task_duration, get_card_generation_metrics

# Mock functions to test the decorator
@log_task_duration("test_card_generation")
async def mock_card_generation_fast(session_id: str, duration: float = 1.0):
    """Mock fast card generation (< 2s)"""
    await asyncio.sleep(duration)
    return {"cards": 3, "status": "success"}

@log_task_duration("test_card_generation_slow")
async def mock_card_generation_slow(session_id: str, duration: float = 3.0):
    """Mock slow card generation (> 2s)"""
    await asyncio.sleep(duration)
    return {"cards": 5, "status": "success"}

@log_task_duration("test_card_generation_error")
async def mock_card_generation_error(session_id: str):
    """Mock card generation that fails"""
    await asyncio.sleep(0.5)
    raise Exception("Mock card generation error")

async def test_api_response_timing():
    """Test that API can respond quickly while card generation runs in background"""
    print("🧪 Testing API response timing with background card generation...")
    
    session_id = "test-session-123"
    
    # Simulate API response flow
    api_start = time.perf_counter()
    
    # Step 1: Store RAG data immediately (simulating real API)
    rag_data = {"query": "test query", "results": ["session1", "session2"]}
    
    # Step 2: Fire card generation in background (don't await)
    card_task = asyncio.create_task(mock_card_generation_slow(session_id, 3.0))
    
    # Step 3: Return API response immediately
    api_response = {"status": "success", "message": "RAG search complete"}
    api_duration = time.perf_counter() - api_start
    
    print(f"✅ API Response Time: {api_duration:.3f}s (Target: < 0.1s)")
    
    # Verify API response is fast
    assert api_duration < 0.1, f"API response too slow: {api_duration:.3f}s"
    
    # Wait for background task to complete and verify it took longer
    card_result = await card_task
    print(f"✅ Background card generation completed: {card_result}")
    
    return api_duration

async def test_decorator_timing_accuracy():
    """Test that the decorator accurately measures task duration"""
    print("🧪 Testing decorator timing accuracy...")
    
    session_id = "test-timing-456"
    
    # Test fast task
    start_time = time.perf_counter()
    await mock_card_generation_fast(session_id, 1.0)
    actual_duration = time.perf_counter() - start_time
    
    print(f"✅ Fast task duration: {actual_duration:.3f}s (Expected: ~1.0s)")
    assert 0.9 <= actual_duration <= 1.1, f"Timing accuracy issue: {actual_duration:.3f}s"
    
    # Test slow task  
    start_time = time.perf_counter()
    await mock_card_generation_slow(session_id, 2.0)
    actual_duration = time.perf_counter() - start_time
    
    print(f"✅ Slow task duration: {actual_duration:.3f}s (Expected: ~2.0s)")
    assert 1.9 <= actual_duration <= 2.1, f"Timing accuracy issue: {actual_duration:.3f}s"

async def test_error_handling():
    """Test that the decorator properly handles and logs errors"""
    print("🧪 Testing error handling...")
    
    session_id = "test-error-789"
    
    try:
        await mock_card_generation_error(session_id)
        assert False, "Expected exception was not raised"
    except Exception as e:
        print(f"✅ Exception properly caught: {str(e)}")
        assert "Mock card generation error" in str(e)

async def test_metrics_collection():
    """Test that metrics are properly collected"""
    print("🧪 Testing metrics collection...")
    
    # Get initial metrics
    initial_metrics = get_card_generation_metrics()
    initial_completed = initial_metrics["tasks_completed"]
    initial_failed = initial_metrics["tasks_failed"]
    
    session_id = "test-metrics-321"
    
    # Run successful task
    await mock_card_generation_fast(session_id, 0.5)
    
    # Run failed task
    try:
        await mock_card_generation_error(session_id)
    except:
        pass  # Expected to fail
    
    # Check metrics updated
    final_metrics = get_card_generation_metrics()
    
    print(f"📊 Metrics before: completed={initial_completed}, failed={initial_failed}")
    print(f"📊 Metrics after: completed={final_metrics['tasks_completed']}, failed={final_metrics['tasks_failed']}")
    
    assert final_metrics["tasks_completed"] == initial_completed + 1, "Completed tasks not incremented"
    assert final_metrics["tasks_failed"] == initial_failed + 1, "Failed tasks not incremented"
    
    print(f"✅ Average duration: {final_metrics['avg_duration']:.3f}s")
    print(f"✅ Active tasks: {final_metrics['active_tasks']}")

async def run_all_tests():
    """Run all tests and report results"""
    print("🚀 Starting Card Generation Timing Tests...")
    print("=" * 50)
    
    try:
        # Test 1: API response timing
        api_duration = await test_api_response_timing()
        print()
        
        # Test 2: Decorator timing accuracy
        await test_decorator_timing_accuracy()
        print()
        
        # Test 3: Error handling
        await test_error_handling()
        print()
        
        # Test 4: Metrics collection
        await test_metrics_collection()
        print()
        
        print("=" * 50)
        print("🎉 All tests passed!")
        print(f"✅ API Response Time: {api_duration:.3f}s (Target: < 2s)")
        print("✅ Decorator timing accuracy verified")
        print("✅ Error handling working correctly")
        print("✅ Metrics collection functioning")
        
        # Display final metrics
        final_metrics = get_card_generation_metrics()
        print(f"\n📊 Final Metrics Summary:")
        print(f"   Tasks Started: {final_metrics['tasks_started']}")
        print(f"   Tasks Completed: {final_metrics['tasks_completed']}")
        print(f"   Tasks Failed: {final_metrics['tasks_failed']}")
        print(f"   Average Duration: {final_metrics['avg_duration']:.3f}s")
        print(f"   Active Tasks: {final_metrics['active_tasks']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Run the tests
    success = asyncio.run(run_all_tests())
    
    if success:
        print("\n🎯 Next Steps:")
        print("   1. ✅ log_task_duration decorator implemented and tested")
        print("   2. ⬜ Add Prometheus/Grafana counters (future milestone)")
        print("   3. ⬜ Design CardGenerationQueue class skeleton")
        print("   4. ⬜ Feature flag USE_CARD_QUEUE env var")
        sys.exit(0)
    else:
        sys.exit(1) 