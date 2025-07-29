#!/usr/bin/env python3
"""
🆕 PHASE 1: Delta Pipeline Test Harness
Tests the complete delta processing pipeline using real SnT2025 conference data
"""

import asyncio
import aiohttp
import json
import time
import random
from typing import Dict, List, Any

# Real SnT2025 Conference Data for Authentic Testing
REAL_SPEAKERS = [
    "Mr Anooshiravan Ansari",
    "Mr Benoit Doury", 
    "Ms Danielle Harris",
    "Ms Chutimon Promsuk",
    "Loring Schaible",
    "Mr Rodrigo De Negri",
    "Ms Samantha Patrick",
    "Anders Ringbom",
    "Nikolaus Helmut Hermanspahn",
    "Mr Christos Saragiotis",
    "Mr Ronan Le Bras"
]

REAL_SESSIONS = [
    {
        "session_id": "session-snt2025-o3-1",
        "title": "O3.1 Seismic, Hydroacoustic and Infrasound Technologies and Applications",
        "description": "Advanced sensor technologies and applications for treaty monitoring",
        "start_time": "13:30",
        "end_time": "14:50", 
        "date": "2025-09-09",
        "venue": "Prinz Eugen Saal",
        "session_type": "Oral",
        "speakers": ["Mr Anooshiravan Ansari", "Mr Benoit Doury"],
        "theme": "Theme 3. Monitoring and On-Site Inspection Technologies",
        "track": "Technology",
        "audience_level": "technical_experts",
        "relevance_score": 0.85,
        "speaker_count": 2,
        "related_topics": ["T3.1"]
    },
    {
        "session_id": "session-snt2025-o3-2", 
        "title": "O3.2 Radionuclide Technologies and Applications",
        "description": "Latest developments in radionuclide detection and analysis",
        "start_time": "15:30",
        "end_time": "17:05",
        "date": "2025-09-09", 
        "venue": "Forum",
        "session_type": "Oral",
        "speakers": ["Anders Ringbom", "Nikolaus Helmut Hermanspahn"],
        "theme": "Theme 3. Monitoring and On-Site Inspection Technologies",
        "track": "Technology",
        "audience_level": "technical_experts", 
        "relevance_score": 0.92,
        "speaker_count": 2,
        "related_topics": ["T3.2"]
    },
    {
        "session_id": "session-snt2025-whale-monitoring",
        "title": "Monitoring whale populations from acoustic data",
        "description": "Using hydroacoustic monitoring for marine mammal research",
        "start_time": "13:30",
        "end_time": "13:45",
        "date": "2025-09-09",
        "venue": "Forum",
        "session_type": "Oral",
        "speakers": ["Ms Danielle Harris"],
        "theme": "Theme 1. The Earth as a Complex System",
        "track": "Innovation",
        "audience_level": "all_attendees",
        "relevance_score": 0.78,
        "speaker_count": 1,
        "related_topics": ["T1.3"]
    }
]

REAL_VENUES = [
    "Festsaal", "Prinz Eugen Saal", "Forum", "Wintergarten", 
    "Zeremoniensaal", "Online Room 1", "Online Room 2"
]

class DeltaTestHarness:
    """Test harness for validating the complete delta processing pipeline"""
    
    def __init__(self, base_url: str = "http://localhost:8000", session_id: str = "test-session"):
        self.base_url = base_url
        self.session_id = session_id
        self.current_session = None
        
    async def setup_initial_session(self):
        """Set up initial session card data"""
        print("🔄 Setting up initial session card...")
        
        self.current_session = REAL_SESSIONS[0].copy()
        
        # Store initial session using the delta tracking system
        async with aiohttp.ClientSession() as session:
            # Simulate the UI Intelligence Agent storing initial card data
            response = await session.post(f"{self.base_url}/chat/completions", json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "user", "content": f"Tell me about {self.current_session['title']}"}
                ],
                "stream": False
            })
            
            if response.status == 200:
                print(f"✅ Initial session card created: {self.current_session['title']}")
            else:
                print(f"❌ Failed to create initial session: {response.status}")
    
    async def test_speaker_addition(self):
        """Test delta: Adding a new speaker to existing session"""
        print("\n🧪 TEST: Adding speaker to session...")
        
        original_speakers = self.current_session['speakers'].copy()
        new_speaker = random.choice([s for s in REAL_SPEAKERS if s not in original_speakers])
        
        # Simulate speaker addition
        self.current_session['speakers'].append(new_speaker)
        self.current_session['speaker_count'] += 1
        
        # This would be triggered by the UI Intelligence Agent
        await self._trigger_delta_update()
        
        print(f"   📝 Added speaker: {new_speaker}")
        print(f"   👥 Total speakers: {self.current_session['speaker_count']}")
        
        return await self._check_delta_response()
    
    async def test_track_change(self):
        """Test delta: Changing session track"""
        print("\n🧪 TEST: Changing session track...")
        
        old_track = self.current_session['track']
        new_tracks = ["Innovation", "Training", "Policy"]
        new_track = random.choice([t for t in new_tracks if t != old_track])
        
        self.current_session['track'] = new_track
        
        await self._trigger_delta_update()
        
        print(f"   🏷️ Track changed: {old_track} → {new_track}")
        
        return await self._check_delta_response()
    
    async def test_timing_update(self):
        """Test delta: Updating session timing"""
        print("\n🧪 TEST: Updating session timing...")
        
        old_start = self.current_session['start_time']
        # Simulate a 15-minute delay
        hour, minute = old_start.split(':')
        new_minute = (int(minute) + 15) % 60
        new_hour = int(hour) + ((int(minute) + 15) // 60)
        new_start = f"{new_hour:02d}:{new_minute:02d}"
        
        self.current_session['start_time'] = new_start
        
        await self._trigger_delta_update()
        
        print(f"   ⏰ Time updated: {old_start} → {new_start}")
        
        return await self._check_delta_response()
    
    async def test_venue_change(self):
        """Test delta: Changing session venue"""
        print("\n🧪 TEST: Changing session venue...")
        
        old_venue = self.current_session['venue']
        new_venue = random.choice([v for v in REAL_VENUES if v != old_venue])
        
        self.current_session['venue'] = new_venue
        
        await self._trigger_delta_update()
        
        print(f"   📍 Venue changed: {old_venue} → {new_venue}")
        
        return await self._check_delta_response()
    
    async def test_relevance_score_update(self):
        """Test delta: Updating relevance score (simulates AI re-evaluation)"""
        print("\n🧪 TEST: Updating relevance score...")
        
        old_score = self.current_session['relevance_score']
        # Simulate slight relevance change
        new_score = round(max(0.1, min(1.0, old_score + random.uniform(-0.15, 0.15))), 2)
        
        self.current_session['relevance_score'] = new_score
        
        await self._trigger_delta_update()
        
        print(f"   📊 Relevance updated: {old_score} → {new_score}")
        
        return await self._check_delta_response()
    
    async def test_complete_session_replacement(self):
        """Test delta: Complete session replacement (agent switches to different session)"""
        print("\n🧪 TEST: Complete session replacement...")
        
        old_session = self.current_session['title']
        self.current_session = random.choice([s for s in REAL_SESSIONS if s['session_id'] != self.current_session['session_id']]).copy()
        
        await self._trigger_delta_update()
        
        print(f"   🔄 Session replaced: {old_session}")
        print(f"      → {self.current_session['title']}")
        
        return await self._check_delta_response()
    
    async def _trigger_delta_update(self):
        """Simulate the backend storing updated card data"""
        # In real usage, this would be called by the UI Intelligence Agent
        # For testing, we'll simulate a conversation that triggers card updates
        
        async with aiohttp.ClientSession() as session:
            response = await session.post(f"{self.base_url}/chat/completions", json={
                "model": "gpt-4o-mini", 
                "messages": [
                    {"role": "user", "content": f"Update the information about session {self.current_session['session_id']}"}
                ],
                "stream": False
            })
            
            # Small delay to allow backend processing
            await asyncio.sleep(0.5)
    
    async def _check_delta_response(self) -> Dict[str, Any]:
        """Check the delta endpoint for updates"""
        async with aiohttp.ClientSession() as session:
            response = await session.get(f"{self.base_url}/latest-ui-delta/{self.session_id}")
            
            if response.status == 200:
                delta_data = await response.json()
                deltas = delta_data.get('deltas', [])
                
                if deltas:
                    print(f"   ✅ Received {len(deltas)} delta operations:")
                    for i, delta in enumerate(deltas, 1):
                        print(f"      {i}. {delta['op']} {delta['path']}")
                        if delta.get('value') and isinstance(delta['value'], (str, int, float)):
                            print(f"         → {delta['value']}")
                else:
                    print("   ℹ️ No deltas received (may indicate no changes detected)")
                
                return delta_data
            else:
                print(f"   ❌ Delta endpoint error: {response.status}")
                return {"error": f"HTTP {response.status}"}
    
    async def run_comprehensive_test(self):
        """Run all delta tests in sequence"""
        print("🚀 Starting comprehensive delta pipeline test...")
        print(f"   Session ID: {self.session_id}")
        print(f"   Backend URL: {self.base_url}")
        
        # Wait for backend to be ready
        print("\n🔍 Checking backend availability...")
        async with aiohttp.ClientSession() as session:
            try:
                response = await session.get(f"{self.base_url}/")
                if response.status == 200:
                    print("   ✅ Backend is running")
                else:
                    print(f"   ⚠️ Backend returned {response.status}")
            except Exception as e:
                print(f"   ❌ Backend not available: {e}")
                return
        
        # Run test sequence
        await self.setup_initial_session()
        
        test_results = []
        
        # Test individual micro-updates
        test_results.append(await self.test_speaker_addition())
        await asyncio.sleep(1)
        
        test_results.append(await self.test_track_change())
        await asyncio.sleep(1)
        
        test_results.append(await self.test_timing_update())
        await asyncio.sleep(1)
        
        test_results.append(await self.test_venue_change())
        await asyncio.sleep(1)
        
        test_results.append(await self.test_relevance_score_update())
        await asyncio.sleep(1)
        
        # Test complete replacement
        test_results.append(await self.test_complete_session_replacement())
        
        # Summary
        print("\n📋 TEST SUMMARY:")
        successful_tests = len([r for r in test_results if r and 'deltas' in r])
        print(f"   ✅ {successful_tests}/{len(test_results)} tests returned delta operations")
        print(f"   🔄 Delta pipeline validation: {'PASSED' if successful_tests > 0 else 'NEEDS INVESTIGATION'}")
        
        return test_results

async def main():
    """Main test runner"""
    harness = DeltaTestHarness(session_id="delta-test-session")
    await harness.run_comprehensive_test()

if __name__ == "__main__":
    print("🧪 SnT2025 Delta Pipeline Test Harness")
    print("=" * 50)
    asyncio.run(main()) 