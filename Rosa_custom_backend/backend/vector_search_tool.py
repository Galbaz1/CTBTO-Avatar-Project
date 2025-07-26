#!/usr/bin/env python3
"""
Vector Search Tool for CTBTO Avatar System
Integrates Weaviate RAG capabilities into the existing agent architecture
Supports semantic, keyword, hybrid, and filtered search types
Optimized for sub-second latency requirements
"""

import weaviate
import weaviate.classes.query as wq
from weaviate.classes.init import Auth
from weaviate.util import generate_uuid5
import os
import asyncio
from typing import List, Dict, Any, Optional, Union, Literal
from dataclasses import dataclass
from enum import Enum
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Type definitions for search results
SearchType = Literal["semantic", "keyword", "hybrid", "filtered", "rag"]
CollectionType = Literal["ConferenceChunk", "ConferenceSession"]

@dataclass
class SearchResult:
    """Standardized search result structure"""
    id: str
    title: str
    content: str
    metadata: Dict[str, Any]
    relevance_score: float
    collection: str
    search_type: str

@dataclass
class SearchQuery:
    """Structured search query for AI agents"""
    query_text: str
    search_type: SearchType
    collection: CollectionType
    filters: Optional[Dict[str, Any]] = None
    limit: int = 5
    include_metadata: bool = True

class VectorSearchTool:
    """
    Vector search tool optimized for CTBTO Avatar System
    Integrates with existing agent architecture using RunContextWrapper pattern
    """
    
    def __init__(self):
        """Initialize with environment validation"""
        self.weaviate_url = os.getenv("WEAVIATE_URL")
        self.weaviate_api_key = os.getenv("WEAVIATE_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if not all([self.weaviate_url, self.weaviate_api_key, self.openai_api_key]):
            raise ValueError("Missing required environment variables for Weaviate connection")
        
        self.client = None
        self._connection_validated = False
    
    def _get_client(self) -> weaviate.WeaviateClient:
        """Get or create Weaviate client with connection validation"""
        if not self._connection_validated:
            # Use context manager pattern for connection validation
            try:
                with weaviate.connect_to_weaviate_cloud(
                    cluster_url=self.weaviate_url,
                    auth_credentials=Auth.api_key(self.weaviate_api_key),
                    headers={"X-OpenAI-Api-Key": self.openai_api_key}
                ) as client:
                    if not client.is_live():
                        raise ConnectionError("Weaviate cluster is not live")
                    self._connection_validated = True
                    logger.info("Weaviate connection validated successfully")
            except Exception as e:
                logger.error(f"Failed to validate Weaviate connection: {e}")
                raise
        
        # Return client for actual operations
        return weaviate.connect_to_weaviate_cloud(
            cluster_url=self.weaviate_url,
            auth_credentials=Auth.api_key(self.weaviate_api_key),
            headers={"X-OpenAI-Api-Key": self.openai_api_key}
        )
    
    def _build_filters(self, filter_spec: Dict[str, Any]) -> Optional[wq.Filter]:
        """Convert filter specification to Weaviate filters"""
        if not filter_spec:
            return None
        
        filters = []
        for field, value in filter_spec.items():
            if isinstance(value, list):
                # Handle array fields like related_topics, authors
                filters.append(wq.Filter.by_property(field).contains_any(value))
            elif isinstance(value, bool):
                filters.append(wq.Filter.by_property(field).equal(value))
            elif isinstance(value, dict):
                # Handle range queries
                if "gte" in value:
                    filters.append(wq.Filter.by_property(field).greater_or_equal(value["gte"]))
                if "lte" in value:
                    filters.append(wq.Filter.by_property(field).less_or_equal(value["lte"]))
                if "gt" in value:
                    filters.append(wq.Filter.by_property(field).greater_than(value["gt"]))
                if "lt" in value:
                    filters.append(wq.Filter.by_property(field).less_than(value["lt"]))
            else:
                filters.append(wq.Filter.by_property(field).equal(value))
        
        # Combine filters with AND logic
        if len(filters) == 1:
            return filters[0]
        elif len(filters) > 1:
            combined = filters[0]
            for f in filters[1:]:
                combined = combined & f
            return combined
        return None
    
    def _format_result(self, obj: Any, search_type: str, collection: str) -> SearchResult:
        """Format Weaviate result into standardized SearchResult"""
        properties = obj.properties
        
        # Extract core fields based on collection type
        if collection == "ConferenceChunk":
            title = properties.get("title", "")
            content = properties.get("contextualized_content", properties.get("content", ""))
        elif collection == "ConferenceSession":
            title = properties.get("title", "")
            content = properties.get("semantic_context", properties.get("description", ""))
        else:
            # Fallback for any unknown collection types
            title = properties.get("title", "")
            content = properties.get("content", "")
        
        # Extract relevance score
        relevance_score = 0.0
        if hasattr(obj, 'metadata') and obj.metadata:
            if hasattr(obj.metadata, 'distance') and obj.metadata.distance is not None:
                # Better conversion: cosine distance ranges 0-2, convert to 0-1 scale
                # distance 0 = perfect match (1.0), distance 2 = opposite (0.0)
                relevance_score = max(0.0, (2.0 - obj.metadata.distance) / 2.0)
            elif hasattr(obj.metadata, 'score') and obj.metadata.score is not None:
                relevance_score = obj.metadata.score
        
        # Create metadata dict
        metadata = {
            "uuid": str(obj.uuid),
            "collection": collection,
            "search_type": search_type,
            **{k: v for k, v in properties.items() if k not in ["title", "content", "contextualized_content", "semantic_context"]}
        }
        
        return SearchResult(
            id=str(obj.uuid),
            title=title,
            content=content,
            metadata=metadata,
            relevance_score=relevance_score,
            collection=collection,
            search_type=search_type
        )
    
    def semantic_search(self, query: str, collection: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """
        Semantic search using vector similarity
        Best for: Conceptual queries, meaning-based search
        """
        with self._get_client() as client:
            coll = client.collections.get(collection)
            
            # Build filters
            where_filter = self._build_filters(filters) if filters else None
            
            # Execute semantic search (only pass where if not None)
            if where_filter is not None:
                response = coll.query.near_text(
                    query=query,
                    limit=limit,
                    where=where_filter,
                    return_metadata=wq.MetadataQuery(distance=True)
                )
            else:
                response = coll.query.near_text(
                    query=query,
                    limit=limit,
                    return_metadata=wq.MetadataQuery(distance=True)
                )
            
            return [self._format_result(obj, "semantic", collection) for obj in response.objects]
    
    def keyword_search(self, query: str, collection: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """
        Keyword search using BM25
        Best for: Exact term matching, fast retrieval
        """
        with self._get_client() as client:
            coll = client.collections.get(collection)
            
            # Build filters
            where_filter = self._build_filters(filters) if filters else None
            
            # Execute keyword search (only pass where if not None)
            if where_filter is not None:
                response = coll.query.bm25(
                    query=query,
                    limit=limit,
                    where=where_filter,
                    return_metadata=wq.MetadataQuery(score=True)
                )
            else:
                response = coll.query.bm25(
                    query=query,
                    limit=limit,
                    return_metadata=wq.MetadataQuery(score=True)
                )
            
            return [self._format_result(obj, "keyword", collection) for obj in response.objects]
    
    def hybrid_search(self, query: str, collection: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None, alpha: float = 0.5) -> List[SearchResult]:
        """
        Hybrid search combining semantic and keyword search
        Best for: Balanced results, general-purpose search
        alpha: 0.0 = pure keyword, 1.0 = pure semantic, 0.5 = balanced
        """
        with self._get_client() as client:
            coll = client.collections.get(collection)
            
            # Build filters
            where_filter = self._build_filters(filters) if filters else None
            
            # Execute hybrid search (only pass where if not None)
            if where_filter is not None:
                response = coll.query.hybrid(
                    query=query,
                    limit=limit,
                    where=where_filter,
                    alpha=alpha,
                    return_metadata=wq.MetadataQuery(score=True)
                )
            else:
                response = coll.query.hybrid(
                    query=query,
                    limit=limit,
                    alpha=alpha,
                    return_metadata=wq.MetadataQuery(score=True)
                )
            
            return [self._format_result(obj, "hybrid", collection) for obj in response.objects]
    
    def filtered_search(self, filters: Dict[str, Any], collection: str, limit: int = 10) -> List[SearchResult]:
        """
        Filtered search without query text
        Best for: Structured queries, specific constraints
        """
        with self._get_client() as client:
            coll = client.collections.get(collection)
            
            # Build filters
            where_filter = self._build_filters(filters)
            if not where_filter:
                raise ValueError("Filters are required for filtered search")
            
            # Execute filtered search
            response = coll.query.fetch_objects(
                where=where_filter,
                limit=limit
            )
            
            return [self._format_result(obj, "filtered", collection) for obj in response.objects]
    
    def rag_search(self, query: str, collection: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None, 
                   prompt_template: Optional[str] = None) -> Dict[str, Any]:
        """
        RAG (Retrieval-Augmented Generation) search
        Returns search results only - generation handled by main ROSA agent
        """
        with self._get_client() as client:
            coll = client.collections.get(collection)
            
            # Build filters
            where_filter = self._build_filters(filters) if filters else None
            
            # Execute pure vector search (NO LLM generation to avoid double calls)
            if where_filter is not None:
                response = coll.query.near_text(
                    query=query,
                    limit=limit,
                    where=where_filter,
                    return_metadata=wq.MetadataQuery(distance=True)
                )
            else:
                response = coll.query.near_text(
                    query=query,
                    limit=limit,
                    return_metadata=wq.MetadataQuery(distance=True)
                )
            
            # Format results
            search_results = [self._format_result(obj, "rag", collection) for obj in response.objects]
            
            return {
                "search_results": search_results,
                "query": query,
                "collection": collection,
                "success": True
            }
    
    def multi_collection_search(self, query: str, collections: List[str], search_type: str = "hybrid", 
                               limit_per_collection: int = 3, filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """
        Search across multiple collections and merge results
        Useful for comprehensive queries across different data types
        """
        all_results = []
        
        for collection in collections:
            try:
                if search_type == "semantic":
                    results = self.semantic_search(query, collection, limit_per_collection, filters)
                elif search_type == "keyword":
                    results = self.keyword_search(query, collection, limit_per_collection, filters)
                elif search_type == "hybrid":
                    results = self.hybrid_search(query, collection, limit_per_collection, filters)
                else:
                    logger.warning(f"Unknown search type: {search_type}, using hybrid")
                    results = self.hybrid_search(query, collection, limit_per_collection, filters)
                
                all_results.extend(results)
                
            except Exception as e:
                logger.error(f"Search failed for collection {collection}: {e}")
                continue
        
        # Sort by relevance score
        all_results.sort(key=lambda x: x.relevance_score, reverse=True)
        return all_results
    
    def search(self, search_query: SearchQuery) -> Union[List[SearchResult], Dict[str, Any]]:
        """
        Unified search interface for AI agents
        Accepts structured SearchQuery objects
        """
        try:
            if search_query.search_type == "semantic":
                return self.semantic_search(
                    search_query.query_text, 
                    search_query.collection, 
                    search_query.limit, 
                    search_query.filters
                )
            elif search_query.search_type == "keyword":
                return self.keyword_search(
                    search_query.query_text,
                    search_query.collection,
                    search_query.limit,
                    search_query.filters
                )
            elif search_query.search_type == "hybrid":
                return self.hybrid_search(
                    search_query.query_text,
                    search_query.collection,
                    search_query.limit,
                    search_query.filters
                )
            elif search_query.search_type == "filtered":
                if not search_query.filters:
                    raise ValueError("Filters are required for filtered search")
                return self.filtered_search(
                    search_query.filters,
                    search_query.collection,
                    search_query.limit
                )
            elif search_query.search_type == "rag":
                return self.rag_search(
                    search_query.query_text,
                    search_query.collection,
                    search_query.limit,
                    search_query.filters
                )
            else:
                raise ValueError(f"Unknown search type: {search_query.search_type}")
                
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise

    def enhanced_conference_search(self, query: str, filters: Optional[Dict[str, Any]] = None, 
                                  search_mode: str = "comprehensive") -> Dict[str, List[SearchResult]]:
        """
        Enhanced search optimized for conference data with rich metadata
        Returns categorized results: sessions, speakers, topics
        """
        # Build comprehensive filters based on conference metadata
        base_filters = filters or {}
        
        results = {
            "sessions": [],
            "speakers": [],
            "topics": []
        }
        
        if search_mode == "comprehensive":
            # Multi-field hybrid search (combines semantic + keyword for best relevance scores)
            # Reduced limits for faster response times
            session_results = self.hybrid_search(
                query=query,
                collection="ConferenceSession", 
                limit=6,  # Reduced from 10 to 6
                filters=base_filters
            )
            
            # Also search chunks for topic-based content
            chunk_results = self.hybrid_search(
                query=query,
                collection="ConferenceChunk",
                limit=3,  # Reduced from 5 to 3
                filters=base_filters
            )
            
            # Categorize and deduplicate results
            session_ids = set()
            speaker_names = set()
            topic_themes = set()
            
            for result in session_results:
                # Extract session info
                if result.metadata.get("session_id") and result.metadata["session_id"] not in session_ids:
                    results["sessions"].append(result)
                    session_ids.add(result.metadata["session_id"])
                
                # Extract speaker info
                speakers = result.metadata.get("speakers", [])
                if isinstance(speakers, str):
                    speakers = [speakers]
                for speaker in speakers:
                    if speaker and speaker not in speaker_names:
                        # Create speaker result
                        speaker_result = SearchResult(
                            id=f"speaker-{hash(speaker)}",
                            title=speaker,
                            content=f"Speaker: {speaker}",
                            collection="Speaker",
                            search_type="semantic",
                            relevance_score=result.relevance_score * 0.8,
                            metadata={"speaker_name": speaker, "type": "speaker"}
                        )
                        results["speakers"].append(speaker_result)
                        speaker_names.add(speaker)
                
                # Extract topic info
                theme = result.metadata.get("theme", "")
                if theme and theme not in topic_themes:
                    topic_result = SearchResult(
                        id=f"topic-{hash(theme)}",
                        title=theme,
                        content=f"Topic: {theme}",
                        collection="Topic", 
                        search_type="semantic",
                        relevance_score=result.relevance_score * 0.7,
                        metadata={"theme": theme, "type": "topic"}
                    )
                    results["topics"].append(topic_result)
                    topic_themes.add(theme)
        
        # Sort by relevance
        for category in results:
            results[category].sort(key=lambda x: x.relevance_score, reverse=True)
            # Limit results per category
            results[category] = results[category][:5]
        
        return results




# Tool function for integration with existing agent architecture
def vector_search_tool(ctx, query: str, search_type: str = "hybrid", collection: str = "ConferenceChunk", 
                      limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
    """
    Vector search tool function for CTBTO Avatar System
    Implements double-wrap protection pattern for context handling
    
    Args:
        ctx: RunContextWrapper[SimpleContext] - Agent execution context
        query: Search query text
        search_type: Type of search ("semantic", "keyword", "hybrid", "filtered", "rag")
        collection: Target collection ("ConferenceChunk", "ConferenceSession")
        limit: Maximum number of results
        filters: Optional filters for search
    
    Returns:
        List of SearchResult objects
    """
    # Implement double-wrap protection pattern
    context = ctx.context
    if hasattr(context, 'context'):
        context = context.context
    
    # Safe access to context properties
    session_id = context.session_id
    language = context.language
    
    # Log search for session tracking
    logger.info(f"Vector search - Session: {session_id}, Query: {query}, Type: {search_type}, Collection: {collection}")
    
    # Initialize search tool
    search_tool = VectorSearchTool()
    
    # Create search query
    search_query = SearchQuery(
        query_text=query,
        search_type=search_type,
        collection=collection,
        filters=filters,
        limit=limit
    )
    
    # Execute search
    results = search_tool.search(search_query)
    
    # Store results in session state for potential follow-up queries
    context.session_state[f"last_search_{session_id}"] = {
        "query": query,
        "search_type": search_type,
        "collection": collection,
        "results_count": len(results) if isinstance(results, list) else 1,
        "timestamp": "current_time"  # You can replace with actual timestamp
    }
    
    return results


# Example usage functions for testing
def example_conference_searches():
    """Example searches for CTBTO conference data"""
    search_tool = VectorSearchTool()
    
    # Example 1: Semantic search for research topics
    print("=== Semantic Search: Machine Learning ===")
    results = search_tool.semantic_search(
        "machine learning seismic detection",
        "ConferenceChunk",
        limit=3
    )
    for result in results:
        print(f"Title: {result.title}")
        print(f"Relevance: {result.relevance_score:.3f}")
        print(f"Content: {result.content[:200]}...")
        print()
    
    # Example 2: Hybrid search for sessions
    print("=== Hybrid Search: Morning Workshops ===")
    results = search_tool.hybrid_search(
        "workshop training hands-on",
        "ConferenceSession",
        limit=3,
        filters={"time_of_day": "morning", "is_interactive": True}
    )
    for result in results:
        print(f"Title: {result.title}")
        print(f"Relevance: {result.relevance_score:.3f}")
        print()
    
    # Example 3: Filtered search by venue
    print("=== Filtered Search: Festsaal Sessions ===")
    results = search_tool.filtered_search(
        {"venue": "Festsaal"},
        "ConferenceSession",
        limit=3
    )
    for result in results:
        print(f"Title: {result.title}")
        print(f"Venue: {result.metadata.get('venue', 'N/A')}")
        print()
    
    # Example 4: RAG search
    print("=== RAG Search: Nuclear Detection ===")
    rag_result = search_tool.rag_search(
        "How does nuclear detection work?",
        "ConferenceChunk",
        limit=3
    )
    print(f"Generated Response: {rag_result['generated_response']}")
    print(f"Based on {len(rag_result['search_results'])} sources")


if __name__ == "__main__":
    # Run example searches
    example_conference_searches() 