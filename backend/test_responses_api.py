#!/usr/bin/env python3
"""
Test script for the new Pydantic Structured Outputs migration.
Tests the Responses API integration with our new card schemas.
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path for imports
sys.path.append('.')

from models.card_schemas import SessionCard, SpeakerCard
from structured_card_processor import StructuredCardProcessor
from weaviate_knowledge_search import SearchResult

# Load environment variables
load_dotenv()

async def test_responses_api():
    """Test the new Responses API with structured outputs"""
    
    print("�� Testing Responses API Integration...")
    
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        return False
    
    try:
        # Initialize the structured processor
        processor = StructuredCardProcessor()
        
        # Create mock search results for testing
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
        
        # Test parallel processing
        print("🔄 Processing search results with structured outputs...")
        user_query = "Tell me about quantum sensing technologies"
        
        cards_data = await processor.process_search_results_parallel(
            search_results=mock_search_results,
            user_query=user_query,
            max_cards=3
        )
        
        print(f"✅ Successfully generated {len(cards_data)} structured cards")
        
        for i, card in enumerate(cards_data):
            print(f"\n--- Card {i+1} ---")
            print(f"Type: {card.get('session_id', card.get('speaker_id', 'Unknown'))}")
            print(f"Relevance: {card.get('relevance_score', 0):.2f}")
            print(f"Title: {card.get('title', card.get('name', 'Unknown'))}")
            if 'speakers' in card:
                print(f"Speakers: {card['speakers']}")
            if 'venue' in card:
                print(f"Venue: {card['venue']}")
        
        print("\n🎉 Responses API integration test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_responses_api())
    exit(0 if success else 1)
