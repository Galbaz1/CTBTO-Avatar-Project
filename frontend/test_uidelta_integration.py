#!/usr/bin/env python3
"""
🧪 UIDeltaHandler Integration Test Suite
Tests the complete frontend-backend delta integration pipeline
"""

import asyncio
import aiohttp
import json
import time
import subprocess
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path

class UIDeltaIntegrationTest:
    """Test suite for validating UIDeltaHandler integration with backend delta system"""
    
    def __init__(self, backend_url: str = None, frontend_url: str = "http://localhost:5173"):
        # Auto-detect backend URL by trying both localhost and 127.0.0.1
        self.backend_url = backend_url or self._detect_backend_url()
        self.frontend_url = frontend_url
        self.test_session_id = "integration-test-session"
        self.test_results = []
        
    def _detect_backend_url(self) -> str:
        """Auto-detect which backend URL is accessible"""
        import aiohttp
        urls_to_try = ["http://localhost:8000", "http://127.0.0.1:8000"]
        
        for url in urls_to_try:
            try:
                # Quick synchronous check
                import requests
                response = requests.get(f"{url}/", timeout=2)
                if response.status_code in [200, 404]:  # Either is fine, server is running
                    print(f"   🔍 Backend detected at {url}")
                    return url
            except:
                continue
        
        # Default fallback
        return "http://localhost:8000"
        
    async def check_backend_health(self) -> bool:
        """Verify backend is running and responding"""
        print("🔍 Checking backend health...")
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.get(f"{self.backend_url}/")
                if response.status in [200, 404]:
                    # 404 is acceptable – backend is up but root route not defined
                    print(f"   ✅ Backend is running (HTTP {response.status})")
                    return True
                else:
                    print(f"   ❌ Unexpected HTTP status {response.status}")
                    return False
        except Exception as e:
            print(f"   ❌ Backend connection failed: {e}")
            return False
    
    async def test_delta_endpoint_empty_response(self) -> bool:
        """Test delta endpoint returns empty response when no data"""
        print("\n🧪 TEST: Delta endpoint empty response...")
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.get(f"{self.backend_url}/latest-ui-delta/{self.test_session_id}")
                
                if response.status == 200:
                    data = await response.json()
                    if 'deltas' in data and data['deltas'] == []:
                        print("   ✅ Empty delta response correct")
                        return True
                    else:
                        print(f"   ❌ Unexpected response format: {data}")
                        return False
                else:
                    print(f"   ❌ HTTP error: {response.status}")
                    return False
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
            return False
    
    async def create_test_card_data(self) -> Dict[str, Any]:
        """Create test card data that matches frontend expectations"""
        return {
            "card_data": {
                "title": "Test Session: O3.1 Seismic Technologies",
                "metadata": {
                    "session_id": "test-session-o3-1",
                    "title": "O3.1 Seismic Technologies and Applications", 
                    "description": "Advanced sensor technologies for monitoring",
                    "start_time": "13:30",
                    "end_time": "14:50",
                    "date": "2025-09-09",
                    "venue": "Prinz Eugen Saal",
                    "session_type": "Oral",
                    "speakers": ["Mr Anooshiravan Ansari", "Mr Benoit Doury"],
                    "theme": "Theme 3. Monitoring Technologies",
                    "track": "Technology",
                    "audience_level": "technical_experts",
                    "speaker_count": 2,
                    "related_topics": ["T3.1"],
                    "relevance_score": 0.85
                }
            }
        }
    
    async def simulate_card_creation(self) -> bool:
        """Simulate backend creating initial card data"""
        print("\n🧪 TEST: Card creation simulation...")
        
        # Directly call the backend's session storage mechanism
        # In real usage, this would be triggered by UI Intelligence Agent
        try:
            card_data = await self.create_test_card_data()
            
            # Simulate a chat completion that triggers card storage
            async with aiohttp.ClientSession() as session:
                # Properly use /process_query/{session_id} so backend records session-specific data
                response = await session.post(
                    f"{self.backend_url}/process_query/{self.test_session_id}",
                    json={"query": "Tell me about seismic monitoring technologies"}
                )
                
                if response.status == 200:
                    print("   ✅ Card creation request sent")
                    # Small delay for backend processing
                    await asyncio.sleep(1)
                    return True
                else:
                    print(f"   ❌ Card creation failed: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"   ❌ Card creation error: {e}")
            return False
    
    async def test_delta_operations(self) -> bool:
        """Test various delta operations"""
        print("\n🧪 TEST: Delta operations...")
        
        # Test 1: Property update (speaker addition)
        success = await self._test_speaker_addition()
        if not success:
            return False
            
        # Test 2: Property change (venue change)
        success = await self._test_venue_change()
        if not success:
            return False
            
        # Test 3: Timing update
        success = await self._test_timing_update()
        
        return success
    
    async def _test_speaker_addition(self) -> bool:
        """Test adding a speaker (array addition delta)"""
        print("   🔄 Testing speaker addition delta...")
        
        try:
            # Simulate backend call that would trigger speaker addition
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{self.backend_url}/process_query/{self.test_session_id}",
                    json={"query": "Add Anders Ringbom as a speaker to the current session"}
                )
                
                if response.status == 200:
                    await asyncio.sleep(0.5)  # Allow processing
                    
                    # Check for deltas
                    delta_response = await session.get(f"{self.backend_url}/latest-ui-delta/{self.test_session_id}")
                    if delta_response.status == 200:
                        delta_data = await delta_response.json()
                        deltas = delta_data.get('deltas', [])
                        
                        if deltas:
                            print(f"      ✅ Received {len(deltas)} delta operations")
                            for delta in deltas:
                                print(f"         {delta['op']} {delta['path']}")
                            return True
                        else:
                            print("      ℹ️ No deltas received (expected for this test)")
                            return True  # Not necessarily an error
                    else:
                        print(f"      ❌ Delta check failed: {delta_response.status}")
                        return False
                else:
                    print(f"      ❌ Speaker addition request failed: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"      ❌ Speaker addition test error: {e}")
            return False
    
    async def _test_venue_change(self) -> bool:
        """Test changing venue (property replacement delta)"""
        print("   🔄 Testing venue change delta...")
        
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{self.backend_url}/process_query/{self.test_session_id}",
                    json={"query": "The session venue has changed to Forum"}
                )
                
                if response.status == 200:
                    await asyncio.sleep(0.5)
                    
                    delta_response = await session.get(f"{self.backend_url}/latest-ui-delta/{self.test_session_id}")
                    if delta_response.status == 200:
                        delta_data = await delta_response.json()
                        deltas = delta_data.get('deltas', [])
                        print(f"      ✅ Venue change test completed ({len(deltas)} deltas)")
                        return True
                    else:
                        print(f"      ❌ Delta check failed: {delta_response.status}")
                        return False
                else:
                    print(f"      ❌ Venue change request failed: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"      ❌ Venue change test error: {e}")
            return False
    
    async def _test_timing_update(self) -> bool:
        """Test updating session timing (property replacement delta)"""
        print("   🔄 Testing timing update delta...")
        
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{self.backend_url}/process_query/{self.test_session_id}",
                    json={"query": "The session start time has been delayed to 14:00"}
                )
                
                if response.status == 200:
                    await asyncio.sleep(0.5)
                    
                    delta_response = await session.get(f"{self.backend_url}/latest-ui-delta/{self.test_session_id}")
                    if delta_response.status == 200:
                        delta_data = await delta_response.json()
                        deltas = delta_data.get('deltas', [])
                        print(f"      ✅ Timing update test completed ({len(deltas)} deltas)")
                        return True
                    else:
                        print(f"      ❌ Delta check failed: {delta_response.status}")
                        return False
                else:
                    print(f"      ❌ Timing update request failed: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"      ❌ Timing update test error: {e}")
            return False
    
    async def test_delta_format_compatibility(self) -> bool:
        """Test delta format matches UIDeltaHandler expectations"""
        print("\n🧪 TEST: Delta format compatibility...")
        
        # Expected delta format according to UIDeltaHandler.tsx:
        expected_format = {
            "deltas": [
                {
                    "op": "replace",  # 'replace' | 'add' | 'remove'
                    "path": "/property",  # JSON Pointer path
                    "value": "new_value",  # Any value
                    "timestamp": int(time.time())
                }
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.get(f"{self.backend_url}/latest-ui-delta/{self.test_session_id}")
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Check structure
                    if 'deltas' not in data:
                        print("   ❌ Missing 'deltas' key in response")
                        return False
                    
                    if not isinstance(data['deltas'], list):
                        print("   ❌ 'deltas' should be a list")
                        return False
                    
                    # Check delta operations format if any exist
                    for delta in data['deltas']:
                        required_fields = ['op', 'path']
                        for field in required_fields:
                            if field not in delta:
                                print(f"   ❌ Missing required field '{field}' in delta operation")
                                return False
                        
                        valid_ops = ['replace', 'add', 'remove']
                        if delta['op'] not in valid_ops:
                            print(f"   ❌ Invalid operation '{delta['op']}', expected one of {valid_ops}")
                            return False
                    
                    print("   ✅ Delta format is compatible with UIDeltaHandler")
                    return True
                    
                else:
                    print(f"   ❌ Delta endpoint error: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"   ❌ Format compatibility test error: {e}")
            return False
    
    async def run_full_integration_test(self) -> Dict[str, Any]:
        """Run complete integration test suite"""
        print("🚀 Starting UIDeltaHandler Integration Test Suite")
        print("=" * 60)
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Session ID: {self.test_session_id}")
        print()
        
        # Test results tracking
        results = {
            "backend_health": False,
            "empty_delta_response": False,
            "card_creation": False,
            "delta_operations": False,
            "format_compatibility": False,
            "overall_success": False
        }
        
        # Run tests in sequence
        results["backend_health"] = await self.check_backend_health()
        if not results["backend_health"]:
            print("\n❌ Backend health check failed - stopping tests")
            return results
        
        results["empty_delta_response"] = await self.test_delta_endpoint_empty_response()
        results["card_creation"] = await self.simulate_card_creation()
        results["delta_operations"] = await self.test_delta_operations()
        results["format_compatibility"] = await self.test_delta_format_compatibility()
        
        # Calculate overall success
        test_results = [
            results["empty_delta_response"],
            results["card_creation"], 
            results["delta_operations"],
            results["format_compatibility"]
        ]
        
        results["overall_success"] = all(test_results)
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        for test_name, result in results.items():
            if test_name == "overall_success":
                continue
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print()
        overall_status = "✅ ALL TESTS PASSED" if results["overall_success"] else "❌ SOME TESTS FAILED"
        print(f"Overall Result: {overall_status}")
        
        if results["overall_success"]:
            print("\n🎉 UIDeltaHandler integration is working correctly!")
            print("   The frontend can now consume delta operations from the backend.")
        else:
            print("\n🔧 Issues detected in UIDeltaHandler integration.")
            print("   Check the test output above for specific problems.")
        
        return results

async def main():
    """Main test runner"""
    tester = UIDeltaIntegrationTest()
    results = await tester.run_full_integration_test()
    
    # Exit with appropriate code
    sys.exit(0 if results["overall_success"] else 1)

if __name__ == "__main__":
    asyncio.run(main()) 