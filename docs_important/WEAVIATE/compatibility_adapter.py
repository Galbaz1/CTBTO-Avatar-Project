#!/usr/bin/env python3
"""
Backward Compatibility Adapter
------------------------------
Bridges the old VectorSearchTool interface to the new HybridSearchEngine.
Ensures existing code continues to work during migration period.

This adapter:
- Provides the old enhanced_conference_search() interface
- Translates between old SnT25_ collection names and new clean names
- Converts new hybrid search results to old format
- Enables gradual rollout with feature flags

Usage:
    # Drop-in replacement for VectorSearchTool
    from compatibility_adapter import CompatibilityAdapter
    
    search_tool = CompatibilityAdapter(use_hybrid=True)
    results = search_tool.enhanced_conference_search("machine learning")
"""

import os
import asyncio
from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass
from dotenv import load_dotenv
import logging

# Import the new hybrid search engine
from hybrid_search_engine import HybridSearchEngine, FusedResult, SearchResult as HybridSearchResult

# Import old search result format for compatibility
from typing import NamedTuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Old type definitions for backward compatibility
Collection = Literal["SnT25_Speaker", "SnT25_Session", "SnT25_Topic", "SnT25_Room", "SnT25_GlossaryTerm"]

@dataclass
class SearchResult:
    """Legacy SearchResult structure for backward compatibility"""
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

class CompatibilityAdapter:
    """
    Backward compatibility adapter that makes HybridSearchEngine work
    with existing VectorSearchTool interface
    """
    
    # Collection name mapping: old -> new
    COLLECTION_MAPPING = {
        'SnT25_Speaker': 'Speaker',
        'SnT25_Session': 'Session', 
        'SnT25_Topic': 'Topic',
        'SnT25_Room': 'Venue',
        'SnT25_GlossaryTerm': 'GlossaryTerm'
    }
    
    # Reverse mapping: new -> old
    REVERSE_MAPPING = {v: k for k, v in COLLECTION_MAPPING.items()}
    
    def __init__(self, use_hybrid: bool = None):
        """
        Initialize compatibility adapter
        
        Args:
            use_hybrid: If True, use new hybrid search. If False, fall back to old search.
                       If None, check USE_HYBRID_SEARCH_V2 environment variable.
        """
        # Determine whether to use hybrid search
        if use_hybrid is None:
            use_hybrid = os.getenv('USE_HYBRID_SEARCH_V2', 'false').lower() == 'true'
        
        self.use_hybrid = use_hybrid
        
        if self.use_hybrid:
            # Initialize new hybrid search engine
            try:
                self.hybrid_engine = HybridSearchEngine()
                logger.info("✅ Compatibility adapter using NEW hybrid search engine")
            except Exception as e:
                logger.error(f"❌ Failed to initialize hybrid search engine: {e}")
                self.use_hybrid = False
                self._init_fallback()
        else:
            self._init_fallback()
    
    def _init_fallback(self):
        """Initialize fallback to original VectorSearchTool"""
        try:
            # Import original search tool as fallback
            from backend.weaviate_knowledge_search import VectorSearchTool
            self.fallback_tool = VectorSearchTool()
            logger.info("⚠️  Compatibility adapter using LEGACY search engine (fallback)")
        except ImportError:
            logger.warning("❌ Could not import legacy VectorSearchTool")
            self.fallback_tool = None

    def enhanced_conference_search(
        self, 
        query: str, 
        search_mode: str = "comprehensive",
        limit: int = 10
    ) -> Dict[str, List[SearchResult]]:
        """
        Maintain the old enhanced_conference_search interface
        Routes to either hybrid or legacy search based on configuration
        """
        
        if self.use_hybrid and hasattr(self, 'hybrid_engine'):
            return self._hybrid_enhanced_search(query, search_mode, limit)
        elif hasattr(self, 'fallback_tool') and self.fallback_tool:
            return self._legacy_enhanced_search(query, search_mode, limit)
        else:
            logger.error("❌ No search engine available (hybrid failed, no fallback)")
            return self._empty_results()
    
    def _hybrid_enhanced_search(
        self, 
        query: str, 
        search_mode: str,
        limit: int
    ) -> Dict[str, List[SearchResult]]:
        """Execute search using new hybrid engine and convert results"""
        
        try:
            # Execute hybrid search (async)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                hybrid_response = loop.run_until_complete(
                    self.hybrid_engine.search(query, max_results=limit)
                )
            finally:
                loop.close()
            
            # Convert hybrid results to legacy format
            return self._convert_hybrid_to_legacy(hybrid_response, query)
            
        except Exception as e:
            logger.error(f"❌ Hybrid search failed: {e}")
            
            # Fallback to legacy if available
            if hasattr(self, 'fallback_tool') and self.fallback_tool:
                logger.info("🔄 Falling back to legacy search due to hybrid failure")
                return self._legacy_enhanced_search(query, search_mode, limit)
            else:
                return self._empty_results()
    
    def _legacy_enhanced_search(
        self, 
        query: str, 
        search_mode: str,
        limit: int
    ) -> Dict[str, List[SearchResult]]:
        """Execute search using legacy VectorSearchTool"""
        
        try:
            return self.fallback_tool.enhanced_conference_search(query, search_mode)
        except Exception as e:
            logger.error(f"❌ Legacy search failed: {e}")
            return self._empty_results()
    
    def _convert_hybrid_to_legacy(
        self, 
        hybrid_response: Dict[str, Any], 
        original_query: str
    ) -> Dict[str, List[SearchResult]]:
        """Convert new hybrid search results to legacy format"""
        
        # Initialize categorized results
        categorized = {
            "sessions": [],
            "speakers": [], 
            "topics": [],
            "rooms": [],
            "glossary": []
        }
        
        # Check for errors
        if 'error' in hybrid_response:
            logger.error(f"Hybrid search error: {hybrid_response['error']}")
            return categorized
        
        # Process fused results
        fused_results = hybrid_response.get('results', [])
        
        for fused_result in fused_results:
            if not isinstance(fused_result, FusedResult):
                continue
                
            hybrid_result = fused_result.result
            collection = hybrid_result.collection
            
            # Convert to legacy SearchResult
            legacy_result = self._convert_single_result(hybrid_result, fused_result.final_score)
            
            # Categorize by collection type
            if collection == 'Session':
                categorized["sessions"].append(legacy_result)
            elif collection == 'Speaker':
                categorized["speakers"].append(legacy_result)
            elif collection == 'Topic':
                categorized["topics"].append(legacy_result)
            elif collection == 'Venue':
                categorized["rooms"].append(legacy_result)  # Note: Venue -> rooms for legacy
            elif collection == 'GlossaryTerm':
                categorized["glossary"].append(legacy_result)
        
        # Log conversion results
        total_results = sum(len(results) for results in categorized.values())
        logger.info(f"🔄 Converted {len(fused_results)} hybrid results to {total_results} legacy results")
        
        return categorized
    
    def _convert_single_result(
        self, 
        hybrid_result: HybridSearchResult, 
        final_score: float
    ) -> SearchResult:
        """Convert a single hybrid result to legacy format"""
        
        props = hybrid_result.properties
        collection = hybrid_result.collection
        
        # Map new collection name to old format
        legacy_collection = self.REVERSE_MAPPING.get(collection, f"SnT25_{collection}")
        
        # Extract title based on collection type
        if collection == 'Speaker':
            title = props.get('name', 'Unknown Speaker')
            content = props.get('affiliation', '')
        elif collection == 'Session':
            title = props.get('title', 'Unknown Session')
            content = props.get('abstract', props.get('sessionType', ''))
        elif collection == 'Topic':
            title = props.get('title', 'Unknown Topic')
            content = props.get('topicCode', '')
        elif collection == 'Venue':
            title = props.get('name', 'Unknown Venue')
            content = props.get('description', props.get('level', ''))
        elif collection == 'GlossaryTerm':
            title = props.get('term', 'Unknown Term')
            content = props.get('definition', '')
        else:
            title = 'Unknown'
            content = ''
        
        # Extract metadata
        metadata = dict(props)  # Copy all properties as metadata
        
        # Add timing information for sessions
        if collection == 'Session':
            metadata.update({
                'sessionType': props.get('sessionType'),
                'startTime': props.get('startTime'),
                'endTime': props.get('endTime'),
                'day': props.get('day')
            })
        
        # Convert references to legacy format
        related_speakers = None
        related_sessions = None
        related_topics = None
        related_room = None
        
        if hybrid_result.references:
            refs = hybrid_result.references
            
            # Convert speaker references
            if 'speakers' in refs and refs['speakers']:
                related_speakers = []
                if hasattr(refs['speakers'], 'objects'):
                    for speaker_ref in refs['speakers'].objects:
                        related_speakers.append({
                            'name': speaker_ref.properties.get('name', ''),
                            'affiliation': speaker_ref.properties.get('affiliation', '')
                        })
                else:
                    # Handle direct list format
                    related_speakers = refs['speakers']
            
            # Convert venue reference  
            if 'venue' in refs and refs['venue']:
                if hasattr(refs['venue'], 'properties'):
                    related_room = {
                        'name': refs['venue'].properties.get('name', ''),
                        'level': refs['venue'].properties.get('level', '')
                    }
                else:
                    related_room = refs['venue']
            
            # Convert topic reference
            if 'topic' in refs and refs['topic']:
                if hasattr(refs['topic'], 'properties'):
                    related_topics = [{
                        'title': refs['topic'].properties.get('title', ''),
                        'topicCode': refs['topic'].properties.get('topicCode', '')
                    }]
                else:
                    related_topics = [refs['topic']]
        
        return SearchResult(
            id=hybrid_result.uuid,
            collection=legacy_collection,
            title=title,
            content=content,
            relevance_score=final_score,
            metadata=metadata,
            related_speakers=related_speakers,
            related_sessions=related_sessions,
            related_topics=related_topics,
            related_room=related_room
        )
    
    def _empty_results(self) -> Dict[str, List[SearchResult]]:
        """Return empty results structure"""
        return {
            "sessions": [],
            "speakers": [],
            "topics": [], 
            "rooms": [],
            "glossary": []
        }
    
    # Legacy method compatibility
    def hybrid_search(
        self, 
        collection: Collection, 
        query: str, 
        limit: int = 5, 
        alpha: float = 0.6,
        include_references: bool = True
    ) -> List[SearchResult]:
        """
        Maintain compatibility with old hybrid_search method
        """
        
        if self.use_hybrid and hasattr(self, 'hybrid_engine'):
            # Use new hybrid search but filter by collection
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    hybrid_response = loop.run_until_complete(
                        self.hybrid_engine.search(query, max_results=limit)
                    )
                finally:
                    loop.close()
                
                # Convert and filter by collection
                categorized = self._convert_hybrid_to_legacy(hybrid_response, query)
                
                # Map collection name to category
                collection_map = {
                    'SnT25_Session': 'sessions',
                    'SnT25_Speaker': 'speakers',
                    'SnT25_Topic': 'topics',
                    'SnT25_Room': 'rooms',
                    'SnT25_GlossaryTerm': 'glossary'
                }
                
                category = collection_map.get(collection, 'sessions')
                return categorized.get(category, [])
                
            except Exception as e:
                logger.error(f"❌ Hybrid collection search failed: {e}")
                
                if hasattr(self, 'fallback_tool') and self.fallback_tool:
                    return self.fallback_tool.hybrid_search(collection, query, limit, alpha, include_references)
                else:
                    return []
        
        elif hasattr(self, 'fallback_tool') and self.fallback_tool:
            return self.fallback_tool.hybrid_search(collection, query, limit, alpha, include_references)
        else:
            return []
    
    def close(self):
        """Clean up resources"""
        if hasattr(self, 'hybrid_engine'):
            self.hybrid_engine.close()
        if hasattr(self, 'fallback_tool') and self.fallback_tool:
            if hasattr(self.fallback_tool, 'close'):
                self.fallback_tool.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Convenience function for drop-in replacement
def create_search_tool(use_hybrid: bool = None) -> CompatibilityAdapter:
    """
    Factory function to create a search tool that's compatible with existing code
    
    Args:
        use_hybrid: Whether to use hybrid search (checks env var if None)
        
    Returns:
        CompatibilityAdapter instance
    """
    return CompatibilityAdapter(use_hybrid=use_hybrid)


# Testing function
async def test_compatibility():
    """Test the compatibility adapter with both modes"""
    
    print("🧪 Testing Compatibility Adapter")
    
    # Test with hybrid enabled
    print("\n1️⃣ Testing with HYBRID search:")
    try:
        adapter_hybrid = CompatibilityAdapter(use_hybrid=True)
        results_hybrid = adapter_hybrid.enhanced_conference_search("machine learning seismic location")
        
        print(f"Sessions found: {len(results_hybrid['sessions'])}")
        print(f"Speakers found: {len(results_hybrid['speakers'])}")
        print(f"Topics found: {len(results_hybrid['topics'])}")
        
        adapter_hybrid.close()
        
    except Exception as e:
        print(f"❌ Hybrid test failed: {e}")
    
    # Test with legacy fallback
    print("\n2️⃣ Testing with LEGACY search:")
    try:
        adapter_legacy = CompatibilityAdapter(use_hybrid=False)
        results_legacy = adapter_legacy.enhanced_conference_search("machine learning seismic location")
        
        print(f"Sessions found: {len(results_legacy['sessions'])}")
        print(f"Speakers found: {len(results_legacy['speakers'])}")
        print(f"Topics found: {len(results_legacy['topics'])}")
        
        adapter_legacy.close()
        
    except Exception as e:
        print(f"❌ Legacy test failed: {e}")
    
    print("\n✅ Compatibility testing complete")


if __name__ == "__main__":
    asyncio.run(test_compatibility()) 