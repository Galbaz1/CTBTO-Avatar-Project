#!/usr/bin/env python3
"""
Debug the search result classification logic
"""

import sys
sys.path.append('.')

from weaviate_knowledge_search import SearchResult
from structured_card_processor import StructuredCardProcessor

def debug_classification():
    print("🔍 Debugging search result classification...")
    
    # Create the same mock data as our test
    mock_search_results = [
        SearchResult(
            id='QS001',
            collection='SnT25_Session',
            title='Quantum Sensing and Verification Technologies',
            content='Advanced quantum sensing technologies for nuclear verification and monitoring systems.',
            relevance_score=0.95,
            metadata={
                'sessionType': 'Technical Session', 
                'startTime': '10:00', 
                'endTime': '11:30',
                'date': '2025-09-09',
                'venue': 'Festsaal',
                'theme': 'T1.1'
            },
            related_speakers=[{'name': 'Dr. Maria Kowalski'}, {'name': 'Prof. James Chen'}],
            related_topics=[{'title': 'Quantum Sensing'}],
            related_room={'name': 'Festsaal'}
        ),
        SearchResult(
            id='SP001',
            collection='SnT25_Speaker',
            title='Dr. Maria Kowalski',
            content='Leading expert in quantum sensing technologies and nuclear verification systems.',
            relevance_score=0.88,
            metadata={'affiliation': 'Vienna International Centre', 'country': 'Austria'},
            related_speakers=[],
            related_topics=[],
            related_room=None
        )
    ]
    
    processor = StructuredCardProcessor()
    
    print("📊 Classification results:")
    for i, result in enumerate(mock_search_results):
        print(f"\nResult {i+1}:")
        print(f"  Title: {result.title}")
        print(f"  Content: {result.content}")
        
        is_session = processor._is_session_result(result)
        is_speaker = processor._is_speaker_result(result)
        is_venue = processor._is_venue_result(result)
        
        print(f"  Is Session: {is_session}")
        print(f"  Is Speaker: {is_speaker}")
        print(f"  Is Venue: {is_venue}")
        
        content_lower = f"{result.title} {result.content}".lower()
        print(f"  Combined text: {content_lower}")

if __name__ == "__main__":
    debug_classification()
