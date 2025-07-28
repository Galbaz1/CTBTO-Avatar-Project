#!/usr/bin/env python3
"""
Vector Search Tool for the SnT2025 Conference Avatar
-   **V4 Compliant**: Utilizes Weaviate Python Client v4.
-   **Graph-Based**: Leverages Weaviate's graph capabilities for multi-hop queries.
-   **Voice-Controlled Kiosk Ready**: Optimized for the generative UI pattern.
"""

import weaviate
import weaviate.classes.config as wvc
import weaviate.classes.query as wvc_query
import weaviate.classes.data as wvc_data
from weaviate.classes.init import Auth
import os
import asyncio
from typing import List, Dict, Any, Optional, Union, Literal
from dataclasses import dataclass
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- V4 Compliant Type Definitions ---
SearchType = Literal["hybrid", "semantic", "keyword"]
Collection = Literal["SnT25_Speaker", "SnT25_Session", "SnT25_Topic", "SnT25_Room", "SnT25_GlossaryTerm"]

@dataclass
class SearchResult:
    """A standardized search result structure for graph-based queries."""
    id: str
    collection: Collection
    title: str
    content: str
    relevance_score: Optional[float] = None
    metadata: Dict[str, Any] = None
    # For graph results
    related_speakers: Optional[List[Dict]] = None
    related_sessions: Optional[List[Dict]] = None
    related_topics: Optional[List[Dict]] = None
    related_room: Optional[Dict] = None

class VectorSearchTool:
    """
    A Weaviate v4-compliant search tool optimized for the SnT2025 conference knowledge graph.
    Simplified for voice-controlled kiosk with generative UI pattern.
    """
    def __init__(self):
        """Initializes the Weaviate client using v4 patterns."""
        weaviate_url = os.getenv("WEAVIATE_URL")
        weaviate_api_key = os.getenv("WEAVIATE_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")

        if not all([weaviate_url, weaviate_api_key, openai_api_key]):
            raise ValueError("Missing required Weaviate environment variables.")

        try:
            self.client = weaviate.connect_to_weaviate_cloud(
                cluster_url=weaviate_url,
                auth_credentials=Auth.api_key(weaviate_api_key),
                headers={"X-OpenAI-Api-Key": openai_api_key}
            )
            self.client.is_ready()
            logger.info("Weaviate connection successful using v4 client.")
        except Exception as e:
            logger.error(f"Failed to connect to Weaviate: {e}")
            raise

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            self.client.close()
            logger.info("Weaviate client connection closed.")

    # --- Core Search Function (V4 Compliant) ---

    def hybrid_search(self, collection: Collection, query: str, limit: int = 5, alpha: float = 0.6, 
                     include_references: bool = True) -> List[SearchResult]:
        """
        Performs hybrid search (semantic + keyword) using Weaviate v4 syntax.
        This is the primary search method for the voice-controlled kiosk.
        """
        try:
            coll = self.client.collections.get(collection)
            
            # Build return_references for graph data
            return_refs = []
            if include_references:
                if collection == "SnT25_Session":
                    return_refs = [
                        wvc_query.QueryReference(link_on="hasSpeakers", return_properties=["name", "affiliation"]),
                        wvc_query.QueryReference(link_on="hasTopic", return_properties=["title", "topicCode"]),
                        wvc_query.QueryReference(link_on="inRoom", return_properties=["name", "level"])
                    ]
            
            response = coll.query.hybrid(
                query=query,
                limit=limit,
                alpha=alpha,  # 0.6 = slightly favor semantic over keyword
                return_metadata=wvc_query.MetadataQuery(score=True),
                return_references=return_refs if return_refs else None
            )
            return [self._format_result(obj, collection) for obj in response.objects]
        except Exception as e:
            logger.error(f"Hybrid search failed on {collection}: {e}")
            return []

    # --- Graph-Based Search Functions (Multi-Hop Queries) ---

    def find_sessions_by_speaker(self, speaker_name: str, limit: int = 3) -> List[SearchResult]:
        """Finds sessions a specific speaker is part of using by_ref filter."""
        try:
            sessions = self.client.collections.get("SnT25_Session")
            response = sessions.query.fetch_objects(
                limit=limit,
                filters=wvc_query.Filter.by_ref_count(
                    link_on="hasSpeakers"
                ).greater_than(0) & wvc_query.Filter.by_ref(
                    link_on="hasSpeakers"
                ).by_property("name").equal(speaker_name),
                return_properties=["title", "sessionType", "startTime"],
                return_references=[
                    wvc_query.QueryReference(
                        link_on="hasSpeakers",
                        return_properties=["name", "affiliation"]
                    ),
                    wvc_query.QueryReference(
                        link_on="hasTopic", 
                        return_properties=["title", "topicCode"]
                    )
                ]
            )
            return [self._format_result(obj, "SnT25_Session") for obj in response.objects]
        except Exception as e:
            logger.error(f"Graph search for sessions by '{speaker_name}' failed: {e}")
            return []

    def find_speakers_for_session(self, session_title: str, limit: int = 5) -> List[SearchResult]:
        """Finds speakers for a specific session by querying the session first."""
        try:
            sessions = self.client.collections.get("SnT25_Session")
            response = sessions.query.fetch_objects(
                limit=1,
                filters=wvc_query.Filter.by_property("title").equal(session_title),
                return_references=[
                    wvc_query.QueryReference(
                        link_on="hasSpeakers",
                        return_properties=["name", "affiliation", "bio"]
                    )
                ]
            )
            
            # Extract speakers from the session's references
            speakers = []
            for session_obj in response.objects:
                if hasattr(session_obj, 'references') and session_obj.references:
                    speaker_refs = session_obj.references.get("hasSpeakers")
                    if speaker_refs and hasattr(speaker_refs, 'objects'):
                        for speaker_ref in speaker_refs.objects:
                            speakers.append(SearchResult(
                                id=str(speaker_ref.uuid),
                                collection="SnT25_Speaker",
                                title=speaker_ref.properties.get("name", "Unknown"),
                                content=speaker_ref.properties.get("bio", ""),
                                metadata={
                                    "uuid": str(speaker_ref.uuid),
                                    "weaviate_collection": "SnT25_Speaker",
                                    **speaker_ref.properties
                                }
                            ))
            
            return speakers[:limit]
        except Exception as e:
            logger.error(f"Graph search for speakers in '{session_title}' failed: {e}")
            return []
            
    def find_sessions_on_topic(self, topic_name: str, limit: int = 3) -> List[SearchResult]:
        """Finds sessions related to a specific topic using by_ref filter."""
        try:
            sessions = self.client.collections.get("SnT25_Session")
            response = sessions.query.fetch_objects(
                limit=limit,
                filters=wvc_query.Filter.by_ref_count(
                    link_on="hasTopic"
                ).greater_than(0) & wvc_query.Filter.by_ref(
                    link_on="hasTopic"
                ).by_property("title").equal(topic_name),
                return_properties=["title", "sessionType", "startTime"],
                return_references=[
                    wvc_query.QueryReference(
                        link_on="hasTopic",
                        return_properties=["title", "topicCode"]
                    ),
                    wvc_query.QueryReference(
                        link_on="hasSpeakers",
                        return_properties=["name"]
                    )
                ]
            )
            return [self._format_result(obj, "SnT25_Session") for obj in response.objects]
        except Exception as e:
            logger.error(f"Graph search for sessions on topic '{topic_name}' failed: {e}")
            return []

    def find_sessions_in_room(self, room_name: str, limit: int = 10) -> List[SearchResult]:
        """Finds sessions happening in a specific room using by_ref filter."""
        try:
            sessions = self.client.collections.get("SnT25_Session")
            response = sessions.query.fetch_objects(
                limit=limit,
                filters=wvc_query.Filter.by_ref_count(
                    link_on="inRoom"
                ).greater_than(0) & wvc_query.Filter.by_ref(
                    link_on="inRoom"
                ).by_property("name").equal(room_name),
                return_properties=["title", "sessionType", "startTime", "endTime"],
                return_references=[
                    wvc_query.QueryReference(
                        link_on="inRoom",
                        return_properties=["name", "level", "capacity"]
                    ),
                    wvc_query.QueryReference(
                        link_on="hasSpeakers",
                        return_properties=["name", "affiliation"]
                    ),
                    wvc_query.QueryReference(
                        link_on="hasTopic",
                        return_properties=["title", "topicCode"]
                    )
                ]
            )
            return [self._format_result(obj, "SnT25_Session") for obj in response.objects]
        except Exception as e:
            logger.error(f"Graph search for sessions in room '{room_name}' failed: {e}")
            return []

    # --- Enhanced Conference Search (Proven Generative UI Pattern) ---
    
    def enhanced_conference_search(self, query: str, search_mode: str = "comprehensive") -> Dict[str, List[SearchResult]]:
        """
        Enhanced search optimized for conference data with rich metadata.
        This is the main method used by Agent1.py for the generative UI pattern.
        Returns categorized results: sessions, speakers, topics
        """
        try:
            logger.info(f"Enhanced conference search: '{query}' (mode: {search_mode})")
            
            results = {
                "sessions": [],
                "speakers": [],
                "topics": []
            }
            
            if search_mode == "comprehensive":
                # Primary hybrid search on sessions (most common use case)
                session_results = self.hybrid_search(
                    collection="SnT25_Session",
                    query=query,
                    limit=6,
                    alpha=0.6,  # Balanced hybrid
                    include_references=True
                )
                
                # Extract categorized data from the rich session results
                session_ids = set()
                speaker_names = set()
                topic_titles = set()
                
                for result in session_results:
                    # Add session if unique
                    session_id = result.metadata.get("uuid")
                    if session_id and session_id not in session_ids:
                        results["sessions"].append(result)
                        session_ids.add(session_id)
                    
                    # Extract speakers from cross-references
                    if result.related_speakers:
                        for speaker in result.related_speakers:
                            speaker_name = speaker.get("name")
                            if speaker_name and speaker_name not in speaker_names:
                                # Create speaker result from cross-reference data
                                speaker_result = SearchResult(
                                    id=f"speaker-{hash(speaker_name)}",
                                    collection="SnT25_Speaker",
                                    title=speaker_name,
                                    content=speaker.get("affiliation", ""),
                                    relevance_score=result.relevance_score * 0.8 if result.relevance_score else 0.8,
                                    metadata={
                                        "name": speaker_name,
                                        "affiliation": speaker.get("affiliation"),
                                        "type": "speaker_from_session"
                                    }
                                )
                                results["speakers"].append(speaker_result)
                                speaker_names.add(speaker_name)
                    
                    # Extract topics from cross-references
                    if result.related_topics:
                        for topic in result.related_topics:
                            topic_title = topic.get("title")
                            if topic_title and topic_title not in topic_titles:
                                topic_result = SearchResult(
                                    id=f"topic-{hash(topic_title)}",
                                    collection="SnT25_Topic",
                                    title=topic_title,
                                    content=topic.get("topicCode", ""),
                                    relevance_score=result.relevance_score * 0.7 if result.relevance_score else 0.7,
                                    metadata={
                                        "title": topic_title,
                                        "topicCode": topic.get("topicCode"),
                                        "type": "topic_from_session"
                                    }
                                )
                                results["topics"].append(topic_result)
                                topic_titles.add(topic_title)
            
            # Sort by relevance and limit results
            for category in results:
                results[category].sort(key=lambda x: x.relevance_score or 0, reverse=True)
                results[category] = results[category][:5]  # Limit for UI performance
            
            logger.info(f"Enhanced search results: {len(results['sessions'])} sessions, {len(results['speakers'])} speakers, {len(results['topics'])} topics")
            return results
            
        except Exception as e:
            logger.error(f"Enhanced conference search failed: {e}")
            return {"sessions": [], "speakers": [], "topics": []}

    # --- Helper & Formatting ---

    def _format_result(self, obj: wvc_data.DataObject, collection: Collection) -> SearchResult:
        """Formats a Weaviate v4 DataObject into our standardized SearchResult."""
        props = obj.properties
        metadata = {
            "uuid": str(obj.uuid),
            "weaviate_collection": collection,
            **props
        }
        
        # Extract linked data from references (V4 correct approach)
        related_speakers = self._extract_linked_data(obj, "hasSpeakers")
        related_sessions = self._extract_linked_data(obj, "speaksIn")  # Won't exist but keeping for future
        related_topics = self._extract_linked_data(obj, "hasTopic")
        related_room = self._extract_linked_data(obj, "inRoom", single=True)

        return SearchResult(
            id=str(obj.uuid),
            collection=collection,
            title=props.get("name") or props.get("title") or "N/A",
            content=props.get("bio") or props.get("abstract") or props.get("description") or "",
            relevance_score=obj.metadata.score if obj.metadata and obj.metadata.score else None,
            metadata=metadata,
            related_speakers=related_speakers,
            related_sessions=related_sessions,
            related_topics=related_topics,
            related_room=related_room
        )

    def _extract_linked_data(self, obj: wvc_data.DataObject, ref_name: str, single: bool = False) -> Optional[Union[List[Dict], Dict]]:
        """Safely extracts properties from Weaviate v4 cross-references."""
        if not hasattr(obj, 'references') or not obj.references:
            return None
            
        references = obj.references.get(ref_name)
        if not references or not hasattr(references, 'objects'):
            return None
        
        if single:
            if references.objects:
                return references.objects[0].properties
            return None

        return [ref.properties for ref in references.objects]

# --- Main Tool Function for Agent Integration ---

def vector_search_tool(
    query: str,
    search_type: SearchType = "hybrid",
    collection: Collection = "SnT25_Session",
    limit: int = 5,
    graph_query_type: Optional[Literal["sessions_by_speaker", "speakers_for_session", "sessions_on_topic", "sessions_in_room"]] = None,
    graph_query_input: Optional[str] = None
) -> List[SearchResult]:
    """
    Unified vector search tool for the SnT2025 multi-agent system.
    Handles both standard search and complex graph-based queries.
    """
    logger.info(
        f"Executing search: type='{search_type}', collection='{collection}', "
        f"graph_query='{graph_query_type}', input='{graph_query_input}', query='{query}'"
    )

    with VectorSearchTool() as tool:
        if graph_query_type and graph_query_input:
            if graph_query_type == "sessions_by_speaker":
                return tool.find_sessions_by_speaker(graph_query_input, limit)
            elif graph_query_type == "speakers_for_session":
                return tool.find_speakers_for_session(graph_query_input, limit)
            elif graph_query_type == "sessions_on_topic":
                return tool.find_sessions_on_topic(graph_query_input, limit)
            elif graph_query_type == "sessions_in_room":
                return tool.find_sessions_in_room(graph_query_input, limit)
        
        # Default to hybrid search
        return tool.hybrid_search(collection, query, limit)

# --- Example Usage ---

def run_graph_examples():
    """Demonstrates the enhanced search capabilities."""
    with VectorSearchTool() as tool:
        print("\n--- Enhanced Conference Search Test ---")
        results = tool.enhanced_conference_search("nuclear monitoring verification")
        
        print(f"Sessions found: {len(results['sessions'])}")
        for session in results['sessions'][:2]:
            print(f"  • {session.title} (score: {session.relevance_score:.3f})")
            if session.related_speakers:
                speakers = [s['name'] for s in session.related_speakers]
                print(f"    Speakers: {', '.join(speakers)}")
        
        print(f"\nSpeakers found: {len(results['speakers'])}")
        for speaker in results['speakers'][:2]:
            print(f"  • {speaker.title}")
        
        print(f"\nTopics found: {len(results['topics'])}")
        for topic in results['topics'][:2]:
            print(f"  • {topic.title}")
        
        print("\n--- Room-Based Search Test ---")
        room_sessions = tool.find_sessions_in_room("Festsaal")
        print(f"Sessions in Festsaal: {len(room_sessions)}")
        for session in room_sessions[:3]:
            print(f"  • {session.title}")
            print(f"    Type: {session.metadata.get('sessionType', 'Unknown')}")
            print(f"    Time: {session.metadata.get('startTime', 'Unknown')}")
            if session.related_speakers:
                speakers = [s['name'] for s in session.related_speakers]
                print(f"    Speakers: {', '.join(speakers)}")
        
        print("\n--- Graph Lookup Test ---")
        speaker_sessions = tool.find_sessions_by_speaker("Samantha Patrick")
        print(f"Sessions by Samantha Patrick: {len(speaker_sessions)}")
        for session in speaker_sessions:
            print(f"  • {session.title}")
            if session.related_topics:
                topics = [t['title'] for t in session.related_topics]
                print(f"    Topics: {', '.join(topics)}")


if __name__ == "__main__":
    run_graph_examples() 