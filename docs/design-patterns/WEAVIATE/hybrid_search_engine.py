#!/usr/bin/env python3
"""
Intelligent Hybrid Search Engine for Weaviate v4
------------------------------------------------
Implements smart hybrid search with:
- Dynamic alpha tuning based on query classification
- Parallel search across all collections
- Metadata field boosting
- Multi-hop graph traversal
- Result fusion with relevance scoring

Usage:
    from hybrid_search_engine import HybridSearchEngine
    
    engine = HybridSearchEngine()
    results = await engine.search("machine learning seismic detection")
"""

import os
import asyncio
import weaviate
from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional, Tuple, Union
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
from pydantic import BaseModel, Field
from enum import Enum
import re
import time
import hashlib
from dataclasses import dataclass

# Pydantic models for structured responses
class QueryType(str, Enum):
    FACT_SEEKING = "fact_seeking"          # "What time is keynote?" "Where is session T1.2?"
    CONCEPT_SEEKING = "concept_seeking"    # "How does machine learning work?" "Explain seismic detection"
    PERSON_SEEKING = "person_seeking"      # "Find Dr. Smith" "Who is presenting on AI?"
    KEYWORD_QUERIES = "keyword_queries"    # "CTBTO" "hydroacoustic" "T1.2"
    MISSPELLED = "misspelled"             # Typos in any of the above
    BROWSING = "browsing"                  # "Show me speakers" "List sessions today" "What's happening now"
    NAVIGATION = "navigation"              # "How do I get to Festsaal?" "Route to room T1.2"

class SearchIntent(BaseModel):
    type: str = Field(description="Type of search intent")
    query: str = Field(description="Refined query for this intent")
    weight: float = Field(description="Weight/importance of this intent")

class QueryClassification(BaseModel):
    query_type: QueryType = Field(description="Classified query type")
    confidence: float = Field(description="Classification confidence 0-1")
    optimal_alpha: float = Field(description="Recommended alpha value for hybrid search")
    reasoning: str = Field(description="Why this classification was chosen")

@dataclass
class SearchResult:
    """Individual search result from a collection"""
    uuid: str
    collection: str
    properties: Dict[str, Any]
    references: Optional[Dict[str, Any]]
    score: float
    explanation: Optional[Dict[str, Any]]

@dataclass
class FusedResult:
    """Result after fusion and scoring"""
    result: SearchResult
    final_score: float
    metadata_richness: float
    cross_reference_bonus: float
    relevance_factors: Dict[str, float]

class HybridSearchEngine:
    """Intelligent hybrid search engine for Weaviate v4"""
    
    # Alpha tuning configuration for conference queries
    ALPHA_CONFIG = {
        QueryType.FACT_SEEKING: 0.25,      # Heavy BM25 for exact facts (times, rooms, etc.)
        QueryType.CONCEPT_SEEKING: 0.75,   # Heavy vector for technical concepts
        QueryType.PERSON_SEEKING: 0.35,    # Balanced with slight BM25 bias for names
        QueryType.KEYWORD_QUERIES: 0.20,   # Heavy BM25 for acronyms/codes
        QueryType.MISSPELLED: 0.80,        # Vector handles typos better
        QueryType.BROWSING: 0.50,          # Balanced for content browsing
        QueryType.NAVIGATION: 0.15         # Heavy BM25 for exact room names/locations
    }
    
    def __init__(self):
        self.load_config()
        self.client = self.connect_weaviate()
        self.query_cache = {}  # Simple in-memory cache
        self.cache_ttl = 300   # 5 minutes
        
    def load_config(self):
        """Load environment configuration"""
        script_dir = os.path.dirname(os.path.realpath(__file__))
        dotenv_path = os.path.join(script_dir, '..', '..', '..', 'frontend', '.env')
        load_dotenv(dotenv_path=dotenv_path)
        
        self.config = {
            "WEAVIATE_URL": os.getenv('WEAVIATE_URL'),
            "WEAVIATE_API_KEY": os.getenv('WEAVIATE_API_KEY'),
            "OPENAI_API_KEY": os.getenv('OPENAI_API_KEY')
        }
        
        if not all([self.config["WEAVIATE_URL"], self.config["WEAVIATE_API_KEY"]]):
            raise ValueError('Missing Weaviate configuration in .env file')
    
    def connect_weaviate(self):
        """Connect to Weaviate Cloud instance"""
        return weaviate.connect_to_weaviate_cloud(
            cluster_url=self.config["WEAVIATE_URL"],
            auth_credentials=weaviate.auth.AuthApiKey(self.config["WEAVIATE_API_KEY"]),
            headers={'X-OpenAI-Api-Key': self.config["OPENAI_API_KEY"]}
        )

    def get_cache_key(self, query: str, params: Dict) -> str:
        """Generate cache key for query + parameters"""
        cache_str = f"{query}_{str(sorted(params.items()))}"
        return hashlib.md5(cache_str.encode()).hexdigest()

    async def classify_query(self, query: str) -> QueryClassification:
        """Classify query type to determine optimal search strategy"""
        
        # Simple rule-based classification for now
        # In production, you'd use GPT-4.1-nano for classification
        
        query_lower = query.lower()
        
        # Check for exact facts (time, location, who questions)
        fact_patterns = [
            r'\b(what time|when|where|who|which room)\b',
            r'\b(session \w+|room \w+|speaker \w+)\b',
            r'\b(\d{1,2}:\d{2}|morning|afternoon|day \d+)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in fact_patterns):
            return QueryClassification(
                query_type=QueryType.FACT_SEEKING,
                confidence=0.8,
                optimal_alpha=self.ALPHA_CONFIG[QueryType.FACT_SEEKING],
                reasoning="Query contains specific factual request patterns"
            )
        
        # Check for concept seeking (how, why, explain)
        concept_patterns = [
            r'\b(how|why|explain|what is|what are)\b',
            r'\b(concept|theory|method|approach|technique)\b',
            r'\b(machine learning|artificial intelligence|deep learning)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in concept_patterns):
            return QueryClassification(
                query_type=QueryType.CONCEPT_SEEKING,
                confidence=0.8,
                optimal_alpha=self.ALPHA_CONFIG[QueryType.CONCEPT_SEEKING],
                reasoning="Query seeks conceptual understanding"
            )
        
        # Check for exact keywords/acronyms
        keyword_patterns = [
            r'\b(ctbto|ctbt|ims|idc|osi|ndc)\b',
            r'\b[A-Z]{2,}\b',  # All caps acronyms
            r'^\w+$'  # Single word
        ]
        
        if any(re.search(pattern, query_lower) for pattern in keyword_patterns):
            return QueryClassification(
                query_type=QueryType.KEYWORD_QUERIES,
                confidence=0.8,
                optimal_alpha=self.ALPHA_CONFIG[QueryType.KEYWORD_QUERIES],
                reasoning="Query contains specific keywords or acronyms"
            )
        
        # Check for misspellings (simple heuristic)
        # In production, use spell-check library
        if len([word for word in query.split() if len(word) > 3 and word.isalpha()]) > 0:
            # For now, assume no misspellings, classify as web search
            pass
        
        # Check for navigation/wayfinding queries
        navigation_patterns = [
            r'\b(how do i get to|route to|directions to|way to)\b',
            r'\b(where is room|find room|go to room)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in navigation_patterns):
            return QueryClassification(
                query_type=QueryType.NAVIGATION,
                confidence=0.8,
                optimal_alpha=self.ALPHA_CONFIG[QueryType.NAVIGATION],
                reasoning="Query requests wayfinding/navigation to venue"
            )
        
        # Check for browsing queries
        browsing_patterns = [
            r'\b(show me|list|what.*today|what.*now|browse)\b',
            r'\b(all speakers|all sessions|schedule)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in browsing_patterns):
            return QueryClassification(
                query_type=QueryType.BROWSING,
                confidence=0.8,
                optimal_alpha=self.ALPHA_CONFIG[QueryType.BROWSING],
                reasoning="Query requests content browsing/listing"
            )
        
        # Default to concept seeking for general conference queries
        return QueryClassification(
            query_type=QueryType.CONCEPT_SEEKING,
            confidence=0.6,
            optimal_alpha=self.ALPHA_CONFIG[QueryType.CONCEPT_SEEKING],
            reasoning="General conference content query"
        )

    async def decompose_query(self, query: str) -> List[SearchIntent]:
        """Decompose complex queries into specific search intents"""
        
        # Simple rule-based decomposition
        # In production, use GPT-4.1-mini for intelligent decomposition
        
        intents = []
        query_lower = query.lower()
        
        # Check for speaker intent
        speaker_patterns = [
            r'\b(speaker|presenter|dr\.|prof\.|mr\.|ms\.)\b',
            r'\b(who is|tell me about|find speaker)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in speaker_patterns):
            intents.append(SearchIntent(
                type="SPEAKER_INTENT",
                query=query,
                weight=0.8
            ))
        
        # Check for session intent
        session_patterns = [
            r'\b(session|presentation|talk|workshop|panel)\b',
            r'\b(meeting|conference|event)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in session_patterns):
            intents.append(SearchIntent(
                type="SESSION_INTENT", 
                query=query,
                weight=0.8
            ))
        
        # Check for topic/concept intent
        topic_patterns = [
            r'\b(topic|theme|subject|field|area)\b',
            r'\b(technology|method|approach|research)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in topic_patterns):
            intents.append(SearchIntent(
                type="TOPIC_INTENT",
                query=query, 
                weight=0.7
            ))
        
        # Check for venue intent
        venue_patterns = [
            r'\b(room|venue|location|where|hall|saal)\b'
        ]
        
        if any(re.search(pattern, query_lower) for pattern in venue_patterns):
            intents.append(SearchIntent(
                type="VENUE_INTENT",
                query=query,
                weight=0.7
            ))
        
        # If no specific intents found, add general search
        if not intents:
            intents.append(SearchIntent(
                type="GENERAL_INTENT",
                query=query,
                weight=1.0
            ))
        
        return intents

    async def search_speakers_hybrid(
        self, 
        query: str, 
        alpha: float,
        limit: int = 10
    ) -> List[SearchResult]:
        """Hybrid search in Speaker collection with metadata boosting"""
        
        if not self.client.collections.exists('Speaker'):
            return []
            
        collection = self.client.collections.get('Speaker')
        
    try:
            # Use hybrid search with property weights
            response = await asyncio.to_thread(
                collection.query.hybrid,
                query=query,
                alpha=alpha,
                limit=limit,
                return_properties=[
                    'name', 'title', 'affiliation', 'bio', 'expertise', 
                    'researchFocus', 'totalSessions', 'ctbtoInvolvement',
                    'keyPublications', 'contactInfo'
                ],
                # Property boosting - name and expertise get higher weights
                properties=['name^2.5', 'expertise^2.0', 'researchFocus^1.5', 
                           'affiliation^1.3', 'bio^1.2', 'ctbtoInvolvement^1.2'],
                return_metadata=wvc_query.MetadataQuery(score=True, explain_score=True)
            )
            
            results = []
            for obj in response.objects:
                result = SearchResult(
                    uuid=str(obj.uuid),
                    collection='Speaker',
                    properties=obj.properties,
                    references=getattr(obj, 'references', None),
                    score=obj.metadata.score if obj.metadata else 0.0,
                    explanation=obj.metadata.explain_score if obj.metadata else None
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error searching speakers: {e}")
            return []

    async def search_sessions_hybrid(
        self, 
        query: str, 
        alpha: float,
        limit: int = 10
    ) -> List[SearchResult]:
        """Hybrid search in Session collection with cross-references"""
        
        if not self.client.collections.exists('Session'):
            return []
            
        collection = self.client.collections.get('Session')
        
    try:
            response = await asyncio.to_thread(
                collection.query.hybrid,
                query=query,
                alpha=alpha,
                limit=limit,
                return_properties=[
                    'title', 'sessionType', 'startTime', 'endTime', 'day',
                    'abstract', 'themeCode', 'duration'
                ],
                # Property boosting for sessions
                properties=['title^2.0', 'abstract^1.5', 'themeCode^1.2'],
                return_references=[
                    wvc_query.QueryReference(
                        link_on='speakers',
                        return_properties=['name', 'expertise', 'affiliation']
                    ),
                    wvc_query.QueryReference(
                        link_on='topic',
                        return_properties=['title', 'keywords']
                    ),
                    wvc_query.QueryReference(
                        link_on='venue',
                        return_properties=['name', 'level', 'description']
                    )
                ],
                return_metadata=wvc_query.MetadataQuery(score=True, explain_score=True)
            )
            
            results = []
            for obj in response.objects:
                result = SearchResult(
                    uuid=str(obj.uuid),
                    collection='Session',
                    properties=obj.properties,
                    references=getattr(obj, 'references', None),
                    score=obj.metadata.score if obj.metadata else 0.0,
                    explanation=obj.metadata.explain_score if obj.metadata else None
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error searching sessions: {e}")
            return []

    async def search_topics_hybrid(
        self, 
        query: str, 
        alpha: float,
        limit: int = 5
    ) -> List[SearchResult]:
        """Hybrid search in Topic collection"""
        
        if not self.client.collections.exists('Topic'):
            return []
            
        collection = self.client.collections.get('Topic')
        
    try:
            response = await asyncio.to_thread(
                collection.query.hybrid,
                query=query,
                alpha=alpha,
                limit=limit,
                return_properties=[
                    'topicCode', 'title', 'description', 'keywords',
                    'themeTitle', 'themeDescription', 'sessionCount'
                ],
                properties=['title^2.0', 'keywords^1.8', 'themeTitle^1.5', 'description^1.2'],
                return_metadata=wvc_query.MetadataQuery(score=True, explain_score=True)
            )
            
            results = []
            for obj in response.objects:
                result = SearchResult(
                    uuid=str(obj.uuid),
                    collection='Topic',
                    properties=obj.properties,
                    references=getattr(obj, 'references', None),
                    score=obj.metadata.score if obj.metadata else 0.0,
                    explanation=obj.metadata.explain_score if obj.metadata else None
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error searching topics: {e}")
            return []

    async def search_venues_hybrid(
        self, 
        query: str, 
        alpha: float,
        limit: int = 5
    ) -> List[SearchResult]:
        """Hybrid search in Venue collection"""
        
        if not self.client.collections.exists('Venue'):
            return []
            
        collection = self.client.collections.get('Venue')
        
    try:
            response = await asyncio.to_thread(
                collection.query.hybrid,
                query=query,
                alpha=alpha,
                limit=limit,
                return_properties=[
                    'name', 'level', 'description', 'capacity', 'sessionCount'
                ],
                properties=['name^2.5', 'description^1.5', 'level^1.2'],
                return_metadata=wvc_query.MetadataQuery(score=True, explain_score=True)
            )
            
            results = []
            for obj in response.objects:
                result = SearchResult(
                    uuid=str(obj.uuid),
                    collection='Venue',
                    properties=obj.properties,
                    references=getattr(obj, 'references', None),
                    score=obj.metadata.score if obj.metadata else 0.0,
                    explanation=obj.metadata.explain_score if obj.metadata else None
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error searching venues: {e}")
            return []

    async def search_content_chunks_hybrid(
        self, 
        query: str, 
        alpha: float,
        limit: int = 5
    ) -> List[SearchResult]:
        """Hybrid search in ContentChunk collection for context"""
        
        if not self.client.collections.exists('ContentChunk'):
            return []
            
        collection = self.client.collections.get('ContentChunk')
        
    try:
            response = await asyncio.to_thread(
                collection.query.hybrid,
                query=query,
                alpha=alpha,
                limit=limit,
                return_properties=[
                    'chunkText', 'sourceType', 'sourceId', 'chunkIndex', 'tokenCount'
                ],
                properties=['chunkText^1.0'],
                return_metadata=wvc_query.MetadataQuery(score=True, explain_score=True)
            )
            
            results = []
            for obj in response.objects:
                result = SearchResult(
                    uuid=str(obj.uuid),
                    collection='ContentChunk',
                    properties=obj.properties,
                    references=getattr(obj, 'references', None),
                    score=obj.metadata.score if obj.metadata else 0.0,
                    explanation=obj.metadata.explain_score if obj.metadata else None
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error searching content chunks: {e}")
            return []

    def calculate_metadata_richness(self, result: SearchResult) -> float:
        """Calculate metadata richness bonus for result ranking"""
        richness_score = 0.0
        props = result.properties
        
        if result.collection == 'Speaker':
            # Rich speaker profiles get bonuses
            if props.get('expertise') and len(props['expertise']) > 0:
                richness_score += 0.15
            if props.get('keyPublications') and len(props['keyPublications']) > 0:
                richness_score += 0.10
            if props.get('researchFocus'):
                richness_score += 0.10
            if props.get('ctbtoInvolvement'):
                richness_score += 0.10
            if props.get('bio') and len(props['bio']) > 50:
                richness_score += 0.05
                
        elif result.collection == 'Session':
            # Sessions with complete information get bonuses  
            if props.get('abstract') and len(props['abstract']) > 100:
                richness_score += 0.15
            if result.references and 'speakers' in result.references:
                richness_score += 0.10
            if props.get('themeCode'):
                richness_score += 0.05
                
        elif result.collection == 'Topic':
            if props.get('keywords'):
                richness_score += 0.10
            if props.get('description') and len(props['description']) > 50:
                richness_score += 0.10
                
        return min(richness_score, 0.3)  # Cap at 30% bonus

    def calculate_cross_reference_bonus(self, result: SearchResult) -> float:
        """Calculate bonus for results with rich cross-references"""
        if not result.references:
            return 0.0
            
        bonus = 0.0
        
        # Sessions with speakers and venues get bonuses
        if result.collection == 'Session':
            if 'speakers' in result.references and result.references['speakers']:
                bonus += 0.10
            if 'venue' in result.references and result.references['venue']:
                bonus += 0.05
            if 'topic' in result.references and result.references['topic']:
                bonus += 0.05
        
        return min(bonus, 0.20)  # Cap at 20% bonus

    def fuse_results(
        self, 
        all_results: List[List[SearchResult]], 
        query: str
    ) -> List[FusedResult]:
        """Fuse and rank results from multiple collections"""
        
        fused_results = []
        seen_uuids = set()
        
        # Flatten all results
        for collection_results in all_results:
            for result in collection_results:
                if result.uuid in seen_uuids:
                    continue
                seen_uuids.add(result.uuid)
                
                # Calculate bonuses
                metadata_bonus = self.calculate_metadata_richness(result)
                cross_ref_bonus = self.calculate_cross_reference_bonus(result)
                
                # Collection-specific weighting
                collection_weight = {
                    'Speaker': 1.0,
                    'Session': 1.0,
                    'Topic': 0.8,
                    'Venue': 0.7,
                    'ContentChunk': 0.5
                }.get(result.collection, 0.5)
                
                # Calculate final score
                base_score = result.score * collection_weight
                final_score = base_score + metadata_bonus + cross_ref_bonus
                
                fused_result = FusedResult(
                    result=result,
                    final_score=final_score,
                    metadata_richness=metadata_bonus,
                    cross_reference_bonus=cross_ref_bonus,
                    relevance_factors={
                        'base_score': base_score,
                        'collection_weight': collection_weight,
                        'metadata_bonus': metadata_bonus,
                        'cross_ref_bonus': cross_ref_bonus
                    }
                )
                fused_results.append(fused_result)
        
        # Sort by final score
        fused_results.sort(key=lambda x: x.final_score, reverse=True)
        
        return fused_results[:15]  # Return top 15 results

    async def search(
        self, 
        query: str,
        max_results: int = 10,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """Main search interface - orchestrates the complete search pipeline"""
        
        start_time = time.time()
        
        # Check cache first
        cache_key = self.get_cache_key(query, {'max_results': max_results})
        if use_cache and cache_key in self.query_cache:
            cached_result, timestamp = self.query_cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                cached_result['cache_hit'] = True
                return cached_result
        
    try:
            # Step 1: Parallel query analysis
            classification_task = self.classify_query(query)
            decomposition_task = self.decompose_query(query)
            
            classification, search_intents = await asyncio.gather(
                classification_task, decomposition_task
            )
            
            # Step 2: Execute parallel hybrid searches
            alpha = classification.optimal_alpha
            
            search_tasks = [
                self.search_speakers_hybrid(query, alpha, max_results),
                self.search_sessions_hybrid(query, alpha, max_results),
                self.search_topics_hybrid(query, alpha, max_results),
                self.search_venues_hybrid(query, alpha, max_results),
                self.search_content_chunks_hybrid(query, alpha, max_results)
            ]
            
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Filter out exceptions
            valid_results = [r for r in search_results if not isinstance(r, Exception)]
            
            # Step 3: Fuse and rank results
            fused_results = self.fuse_results(valid_results, query)
            
            # Step 4: Prepare response
            end_time = time.time()
            
            response = {
                'query': query,
                'results': fused_results[:max_results],
                'classification': classification,
                'search_intents': search_intents,
                'performance': {
                    'total_latency_ms': (end_time - start_time) * 1000,
                    'alpha_used': alpha,
                    'results_found': len(fused_results),
                    'collections_searched': len(valid_results)
                },
                'cache_hit': False,
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache the result
            if use_cache:
                self.query_cache[cache_key] = (response, time.time())
            
            return response
            
        except Exception as e:
            return {
                'query': query,
                'results': [],
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def close(self):
        """Close Weaviate connection"""
        self.client.close()


# Convenience functions for testing
async def test_search():
    """Test the hybrid search engine"""
    engine = HybridSearchEngine()
    
    try:
        # Test different query types for conference system (using real SnT2025 data)
        test_queries = [
            "machine learning seismic location",     # concept_seeking (Ansari's expertise)
            "Find Anooshiravan Ansari",             # person_seeking (real speaker)
            "What time is O3.1 session?",           # fact_seeking (real session)
            "IMS detection capabilities",            # keyword_queries (real CTBTO term)
            "How do I get to Prinz Eugen Saal?",    # navigation (real room)
            "Show me T1.2 solid earth sessions",    # browsing (real topic)
        ]
        
        for query in test_queries:
            print(f"\n🔍 Testing: '{query}'")
            result = await engine.search(query)
            
            print(f"Classification: {result['classification'].query_type.value}")
            print(f"Alpha: {result['classification'].optimal_alpha}")
            print(f"Results: {len(result['results'])}")
            print(f"Latency: {result['performance']['total_latency_ms']:.1f}ms")
            
            for i, fused_result in enumerate(result['results'][:3]):
                print(f"  {i+1}. {fused_result.result.collection}: {fused_result.final_score:.3f}")
                
    finally:
        engine.close()

if __name__ == "__main__":
    asyncio.run(test_search()) 