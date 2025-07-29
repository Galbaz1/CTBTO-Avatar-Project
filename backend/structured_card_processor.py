import asyncio
import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from models.card_schemas import (
    SessionCard, SpeakerCard, VenueCard, TopicCard,
    SessionCardList, SpeakerCardList, VenueCardList, TopicCardList
)
from weaviate_knowledge_search import SearchResult
from logger import logger

class StructuredCardProcessor:
    """
    Async processor for converting Weaviate results to structured cards using GPT 4.1 + Responses API.
    Implements parallel processing and intelligent model selection for optimal performance.
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model_selector = ModelSelector()
    
    async def process_search_results_parallel(
        self, 
        search_results: List[SearchResult], 
        user_query: str,
        max_cards: int = 3
    ) -> List[Dict[str, Any]]:
        """Process multiple search results in parallel using structured outputs"""
        
        print(f"🔄 Processing {len(search_results)} search results...")
        
        # Group by likely card type for efficiency
        sessions = []
        speakers = []
        venues = []
        topics = []
        
        for result in search_results:
            is_session = self._is_session_result(result)
            is_speaker = self._is_speaker_result(result)
            is_venue = self._is_venue_result(result)
            
            print(f"  - {result.title}: session={is_session}, speaker={is_speaker}, venue={is_venue}")
            
            if is_session:
                sessions.append(result)
            elif is_speaker:
                speakers.append(result)
            elif is_venue:
                venues.append(result)
            else:
                topics.append(result)
        
        print(f"📊 Grouped: {len(sessions)} sessions, {len(speakers)} speakers, {len(venues)} venues, {len(topics)} topics")
        
        # Process each type in parallel
        tasks = []
        if sessions:
            print(f"🎯 Adding session processing task for {len(sessions)} sessions")
            tasks.append(self._process_session_cards(sessions[:max_cards], user_query))
        if speakers:
            print(f"🎯 Adding speaker processing task for {len(speakers)} speakers")
            tasks.append(self._process_speaker_cards(speakers[:max_cards], user_query))
        if venues:
            tasks.append(self._process_venue_cards(venues[:max_cards], user_query))
        if topics:
            tasks.append(self._process_topic_cards(topics[:max_cards], user_query))
        
        print(f"🚀 Running {len(tasks)} parallel processing tasks...")
        
        # Await all parallel processing
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        print(f"📋 Processing results: {len(results)} task results")
        
        # Flatten and filter successful results
        cards = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ Task {i} failed: {result}")
            elif isinstance(result, list):
                print(f"✅ Task {i} returned {len(result)} cards")
                cards.extend(result)
            else:
                print(f"⚠️ Task {i} returned unexpected type: {type(result)}")
        
        print(f"🎴 Total cards before sorting: {len(cards)}")
        
        # Sort by relevance and return top cards
        cards.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        final_cards = cards[:max_cards]
        
        print(f"🎯 Returning {len(final_cards)} final cards")
        return final_cards
    
    async def _process_session_cards(
        self, 
        results: List[SearchResult], 
        user_query: str
    ) -> List[Dict[str, Any]]:
        """Convert session search results to SessionCard using Responses API"""
        
        sessions_data = self._prepare_sessions_context(results)
        model = self.model_selector.select_model("session", len(results))
        
        try:
            print(f"🎬 Processing {len(results)} session results with model {model}")
            print(f"📝 Sessions data preview: {sessions_data[:200]}...")
            
            # Use beta.chat.completions.parse for structured outputs
            response = await self.client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a conference data processor. Convert raw session data into structured SessionCard objects.

CRITICAL INSTRUCTIONS:
- Extract ALL available information from the provided data
- Use speaker names exactly as provided in related_speakers
- Calculate duration_minutes if start_time and end_time are available
- Set relevance_score based on how well the session matches the user query
- For missing fields, use appropriate defaults (None for optional strings, [] for lists)
- Ensure has_speakers is true when speakers list is not empty"""
                    },
                    {
                        "role": "user",
                        "content": f"""User Query: "{user_query}"

Raw Session Data:
{sessions_data}

Convert each session to a SessionCard with all available fields populated. Return a SessionCardList object with a 'cards' field containing the list of SessionCard objects."""
                    }
                ],
                response_format=SessionCardList,  # Use wrapper model
            )
            
            # Extract parsed data from response
            parsed_data = response.choices[0].message.parsed
            
            if parsed_data and parsed_data.cards:
                print(f"✅ API call successful! Parsed {len(parsed_data.cards)} session cards")
                
                # Convert Pydantic objects to dicts for frontend compatibility
                cards = [card.model_dump() for card in parsed_data.cards]
                print(f"📄 Converted to {len(cards)} card dicts")
            else:
                print("⚠️ No parsed data in response")
                cards = []
            
            return cards
            
        except Exception as e:
            print(f"❌ Failed to process session cards: {e}")
            import traceback
            print(f"📍 Full traceback: {traceback.format_exc()}")
            return []
    
    async def _process_speaker_cards(
        self, 
        results: List[SearchResult], 
        user_query: str
    ) -> List[Dict[str, Any]]:
        """Convert speaker search results to SpeakerCard using Responses API"""
        
        speakers_data = self._prepare_speakers_context(results)
        model = self.model_selector.select_model("speaker", len(results))
        
        try:
            print(f"🎭 Processing {len(results)} speaker results with model {model}")
            print(f"📝 Speakers data preview: {speakers_data[:200]}...")
            
            response = await self.client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a speaker profile processor. Convert raw speaker data into structured SpeakerCard objects.

CRITICAL INSTRUCTIONS:
- Extract name, title, affiliation from the data
- Use bio/content field for speaker biography
- Count sessions accurately for total_sessions
- Extract expertise areas from bio or content
- Set relevance_score based on speaker's match to user query"""
                    },
                    {
                        "role": "user",
                        "content": f"""User Query: "{user_query}"

Raw Speaker Data:
{speakers_data}

Convert each speaker to a SpeakerCard with all available information. Return a SpeakerCardList object with a 'cards' field containing the list of SpeakerCard objects."""
                    }
                ],
                response_format=SpeakerCardList,
            )
            
            # Extract parsed data from response
            parsed_data = response.choices[0].message.parsed
            
            if parsed_data and parsed_data.cards:
                print(f"✅ Speaker API call successful! Parsed {len(parsed_data.cards)} speaker cards")
                
                cards = [card.model_dump() for card in parsed_data.cards]
                print(f"📄 Converted to {len(cards)} speaker card dicts")
            else:
                print("⚠️ No parsed speaker data in response")
                cards = []
            
            return cards
            
        except Exception as e:
            print(f"❌ Failed to process speaker cards: {e}")
            import traceback
            print(f"📍 Full traceback: {traceback.format_exc()}")
            return []
    
    async def _process_venue_cards(
        self, 
        results: List[SearchResult], 
        user_query: str
    ) -> List[Dict[str, Any]]:
        """Convert venue search results to VenueCard using Responses API"""
        
        venues_data = self._prepare_venues_context(results)
        model = self.model_selector.select_model("venue", len(results))
        
        try:
            response = await self.client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a venue information processor. Convert raw venue data into structured VenueCard objects.

CRITICAL INSTRUCTIONS:
- Extract venue name, building, capacity from the data
- Count sessions accurately for sessions_count
- Set relevance_score based on venue's match to user query
- Use description field for venue details"""
                    },
                    {
                        "role": "user",
                        "content": f"""User Query: "{user_query}"

Raw Venue Data:
{venues_data}

Convert each venue to a VenueCard with all available information. Return a VenueCardList object with a 'cards' field containing the list of VenueCard objects."""
                    }
                ],
                response_format=VenueCardList,
            )
            
            parsed_data = response.choices[0].message.parsed
            return [card.model_dump() for card in parsed_data.cards] if parsed_data and parsed_data.cards else []
            
        except Exception as e:
            logger.error(f"Failed to process venue cards: {e}")
            return []
    
    async def _process_topic_cards(
        self, 
        results: List[SearchResult], 
        user_query: str
    ) -> List[Dict[str, Any]]:
        """Convert topic search results to TopicCard using Responses API"""
        
        topics_data = self._prepare_topics_context(results)
        model = self.model_selector.select_model("topic", len(results))
        
        try:
            response = await self.client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a topic categorization processor. Convert raw topic data into structured TopicCard objects.

CRITICAL INSTRUCTIONS:
- Extract topic title, theme code, keywords from the data
- Count related sessions accurately for sessions_count
- Set relevance_score based on topic's match to user query
- Use related_sessions for session titles under this topic"""
                    },
                    {
                        "role": "user",
                        "content": f"""User Query: "{user_query}"

Raw Topic Data:
{topics_data}

Convert each topic to a TopicCard with all available information. Return a TopicCardList object with a 'cards' field containing the list of TopicCard objects."""
                    }
                ],
                response_format=TopicCardList,
            )
            
            parsed_data = response.choices[0].message.parsed
            return [card.model_dump() for card in parsed_data.cards] if parsed_data and parsed_data.cards else []
            
        except Exception as e:
            logger.error(f"Failed to process topic cards: {e}")
            return []
    
    def _prepare_sessions_context(self, results: List[SearchResult]) -> str:
        """Format session search results for LLM processing"""
        context = []
        for i, result in enumerate(results):
            session_context = f"""
SESSION {i+1}:
ID: {result.id}
Title: {result.title}
Content: {result.content}
Metadata: {result.metadata}
Related Speakers: {result.related_speakers}
Related Room: {result.related_room}
Related Topics: {result.related_topics}
---"""
            context.append(session_context)
        return "\n".join(context)
    
    def _prepare_speakers_context(self, results: List[SearchResult]) -> str:
        """Format speaker search results for LLM processing"""
        context = []
        for i, result in enumerate(results):
            speaker_context = f"""
SPEAKER {i+1}:
ID: {result.id}
Name: {result.title}
Content: {result.content}
Metadata: {result.metadata}
---"""
            context.append(speaker_context)
        return "\n".join(context)
    
    def _prepare_venues_context(self, results: List[SearchResult]) -> str:
        """Format venue search results for LLM processing"""
        context = []
        for i, result in enumerate(results):
            venue_context = f"""
VENUE {i+1}:
ID: {result.id}
Name: {result.title}
Content: {result.content}
Metadata: {result.metadata}
---"""
            context.append(venue_context)
        return "\n".join(context)
    
    def _prepare_topics_context(self, results: List[SearchResult]) -> str:
        """Format topic search results for LLM processing"""
        context = []
        for i, result in enumerate(results):
            topic_context = f"""
TOPIC {i+1}:
ID: {result.id}
Title: {result.title}
Content: {result.content}
Metadata: {result.metadata}
---"""
            context.append(topic_context)
        return "\n".join(context)
    
    def _is_session_result(self, result: SearchResult) -> bool:
        """Determine if search result represents a session"""
        # Check collection name first (most reliable)
        if hasattr(result, 'collection') and 'session' in result.collection.lower():
            return True
        
        # Check metadata for session indicators
        if hasattr(result, 'metadata') and result.metadata:
            metadata_str = str(result.metadata).lower()
            session_metadata_indicators = ['sessiontype', 'session_type', 'starttime', 'endtime', 'duration_minutes']
            if any(indicator in metadata_str for indicator in session_metadata_indicators):
                return True
        
        # Check content for session-related terms
        indicators = ['session', 'presentation', 'talk', 'workshop', 'keynote', 'technical session', 'conference', 'symposium']
        content_lower = f"{result.title} {result.content}".lower()
        return any(indicator in content_lower for indicator in indicators)
    
    def _is_speaker_result(self, result: SearchResult) -> bool:
        """Determine if search result represents a speaker"""
        # Check collection name first
        if hasattr(result, 'collection') and 'speaker' in result.collection.lower():
            return True
            
        # Check for speaker title indicators
        indicators = ['speaker', 'presenter', 'dr.', 'prof.', 'professor', 'ambassador', 'mr.', 'ms.', 'mrs.']
        content_lower = f"{result.title} {result.content}".lower()
        return any(indicator in content_lower for indicator in indicators)
    
    def _is_venue_result(self, result: SearchResult) -> bool:
        """Determine if search result represents a venue"""
        # Check collection name first
        if hasattr(result, 'collection') and any(term in result.collection.lower() for term in ['venue', 'room', 'location']):
            return True
            
        indicators = ['room', 'hall', 'venue', 'auditorium', 'building', 'chamber', 'conference room', 'meeting room']
        content_lower = f"{result.title} {result.content}".lower()
        return any(indicator in content_lower for indicator in indicators)

class ModelSelector:
    """Select optimal model variant based on task complexity - using GPT-4.1 family"""
    
    MODELS = {
        "complex": "gpt-4.1",             # Full model for complex reasoning
        "standard": "gpt-4.1-mini",       # Mini for most tasks (cost reduction)
        "simple": "gpt-4.1-nano"          # Nano for simple classification tasks
    }
    
    def select_model(self, task_type: str, data_complexity: int) -> str:
        """Select appropriate model variant"""
        if task_type == "session" and data_complexity > 5:
            return self.MODELS["complex"]
        elif task_type in ["speaker", "venue"]:
            return self.MODELS["standard"] 
        else:
            return self.MODELS["simple"]
