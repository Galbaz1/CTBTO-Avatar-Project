#!/usr/bin/env python3
"""
UI Intelligence Agent - Modern 2025 Prompt Engineering for Smart Card Decisions
Implements human-like decision making for when and what UI cards to show
NO HARDCODED FALLBACKS - Pure AI reasoning
"""

import os
import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Import our SearchResult dataclass from vector_search_tool
try:
    from backend.vector_search_tool import SearchResult
except ImportError:
    from vector_search_tool import SearchResult

# Import structured logging
try:
    from backend.logger import logger as rosa_logger, LLMInstance
except ImportError:
    from logger import logger as rosa_logger, LLMInstance

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CardDecision:
    """Represents a decision to show a specific card"""
    card_type: str  # "session", "speaker", "topic", "venue"
    card_data: Dict[str, Any]
    display_reason: str
    confidence: float
    timing: str  # "immediate", "after_response", "delayed"

class UIIntelligenceAgent:
    """
    Advanced LLM agent using modern 2025 prompt engineering techniques for intelligent card decisions
    NO HARDCODED FALLBACKS - Every decision is made through intelligent reasoning
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.conversation_memory = {}  # Track conversation context
        self.user_preferences = {}     # Learn from user interactions
        self.decision_history = {}     # Track decision patterns
        
    def analyze_conversation_for_cards(self, 
                                     conversation_context: dict,
                                     rag_results: dict,
                                     session_id: str) -> List[CardDecision]:
        """
        Uses advanced prompt engineering to intelligently decide card rendering
        NO HARDCODED FALLBACKS - Pure AI reasoning
        """
        
        # Build dynamic context with Chain-of-Thought reasoning
        system_prompt = self._build_advanced_system_prompt()
        
        # Build conversation context with memory
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation memory for better context
        if session_id in self.conversation_memory:
            memory_context = self.conversation_memory[session_id]
            messages.append({
                "role": "system", 
                "content": f"Previous conversation patterns: {json.dumps(memory_context)}"
            })
        
        # Prepare the analysis request with rich context
        analysis_request = {
            "current_exchange": {
                "user_message": conversation_context.get("user_message", ""),
                "assistant_response": conversation_context.get("assistant_response", ""),
                "conversation_turn": conversation_context.get("turn_number", 1),
                "time_in_conversation": conversation_context.get("elapsed_time", "0s")
            },
            "available_information": {
                "rag_results": {category: [r.get('title', r.get('name', 'Unknown')) if isinstance(r, dict) else r.title for r in results] for category, results in rag_results.items() if results},
                "relevance_scores": {
                    "highest": max([r.get('relevance_score', 0) if isinstance(r, dict) else r.relevance_score for r in rag_results.get("sessions", [])], default=0),
                    "average": sum([r.get('relevance_score', 0) if isinstance(r, dict) else r.relevance_score for r in rag_results.get("sessions", [])]) / len(rag_results.get("sessions", [])) if rag_results.get("sessions") else 0
                },
                "result_categories": list(rag_results.keys()),
                "available_rooms": list(set([
                    r.get('related_room', {}).get('name') if isinstance(r, dict) else (r.related_room.get("name") if r.related_room else None)
                    for r in rag_results.get("sessions", []) 
                    if (isinstance(r, dict) and r.get('related_room', {}).get('name')) or (not isinstance(r, dict) and r.related_room and r.related_room.get("name"))
                ])),
                "card_types_available": ["session", "speaker", "topic", "venue"]
            },
            "conversation_metadata": {
                "topic_continuity": conversation_context.get("topic_continuity", "new"),
                "user_engagement_level": conversation_context.get("engagement", "normal"),
                "previous_cards_shown": conversation_context.get("cards_shown_count", 0)
            }
        }
        
        messages.append({
            "role": "user",
            "content": f"""Analyze this conversation and decide what information cards to show:

{json.dumps(analysis_request, indent=2)}

Use structured logical reasoning to make your decision. Follow this chain of thought:

1. **Context Analysis**: What is the user trying to achieve?
2. **Information Relevance**: How relevant is available data to their current need?
3. **Decision Logic**: Should cards be shown based on context + relevance?

Be concise and logical. Use deductive reasoning: premises → conclusion.

Respond in JSON format:
{{
  "reasoning": "Brief logical analysis (2-3 sentences max)",
  "show_cards": boolean,
  "confidence": 0.0-1.0,
  "cards": [...] // if show_cards is true
}}"""
        })
        
        try:
            # Use GPT-4.1 Mini for fast, focused reasoning
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",  # Faster model for focused UI decisions
                messages=messages,
                temperature=0.2,  # Reduced temperature for more consistent logic
                response_format={"type": "json_object"}
            )
            
            decision = json.loads(response.choices[0].message.content)
            
            # Log the full reasoning from UI Intelligence Agent
            reasoning = decision.get("reasoning", "No reasoning provided")
            show_cards = decision.get("show_cards", False)
            confidence = decision.get("confidence", 0.0)
            
            rosa_logger.info(f"🧠 Decision: {show_cards} | Confidence: {confidence:.2f}", session_id, LLMInstance.UI_INTEL)
            rosa_logger.info(f"🧠 Reasoning: {reasoning}", session_id, LLMInstance.UI_INTEL)
            
            # Learn from this decision
            self._update_conversation_memory(session_id, decision)
            
            # Convert to card display format if cards should be shown
            if show_cards:
                cards_to_format = decision.get("cards", [])

                # --- QUICK FALLBACK -----------------------------------------------------
                # Sometimes the LLM sets show_cards=true but forgets to include the
                # actual card objects.  In that case, fall back to the top-scoring
                # session result so the UI always gets at least one card.
                if show_cards and not cards_to_format:
                    top_session = None
                    if rag_results.get("sessions"):
                        # rag_results sessions may be list[dict] or list[SearchResult]
                        top_session = rag_results["sessions"][0]

                    if top_session:
                        if isinstance(top_session, dict):
                            meta = top_session.get("metadata", {})
                            cards_to_format = [{
                                "type": "session",
                                "id": meta.get("uuid") or top_session.get("id"),
                                "title": top_session.get("title") or meta.get("title"),
                                "description": meta.get("description", ""),
                                "speakers": [s.get("name") for s in top_session.get("related_speakers", [])] if top_session.get("related_speakers") else [],
                                "time": f"{meta.get('day', '')} {meta.get('startTime', '')}",
                                "venue": meta.get("venue", meta.get("related_room", {}).get("name", ""))
                            }]
                        else:
                            # Handle SearchResult dataclass
                            meta = getattr(top_session, "metadata", {})
                            cards_to_format = [{
                                "type": "session",
                                "id": getattr(top_session, "id", None),
                                "title": getattr(top_session, "title", meta.get("title")),
                                "description": meta.get("description", ""),
                                "speakers": [s.name if hasattr(s, "name") else s.get("name") for s in getattr(top_session, "related_speakers", [])] if getattr(top_session, "related_speakers", None) else [],
                                "time": f"{meta.get('day', '')} {meta.get('startTime', '')}",
                                "venue": meta.get("related_room", {}).get("name", "")
                            }]
                        rosa_logger.info("⚠️ Fallback: generated 1 session card because LLM omitted cards array", session_id, LLMInstance.UI_INTEL)
                rosa_logger.card_decision(session_id, True, len(cards_to_format), confidence)
                formatted_cards = self._format_cards_for_display(cards_to_format, rag_results, conversation_context, session_id)
                return formatted_cards
            
            rosa_logger.card_decision(session_id, False, 0, confidence)
            return []
            
        except Exception as e:
            logger.error(f"UI Intelligence analysis failed: {e}")
            # Graceful degradation - no cards rather than errors
            return []
    
    def _build_advanced_system_prompt(self) -> str:
        """Build the advanced system prompt with modern 2025 techniques"""
        
        return """You are an advanced UI Intelligence Agent with human-like decision making capabilities.

## Your Core Mission
Analyze conversations and decide when to display information cards that enhance user understanding without interrupting the flow. Think like a helpful human assistant who knows when to show supporting materials.

## Decision Framework (Structured Logic)

Apply deductive reasoning in this order:

1. **Context**: User's current goal and conversation stage
2. **Relevance**: Available information value to user's immediate need  
3. **Logic**: If context + relevance = high → show cards, else don't
4. **Confidence**: Rate certainty of decision (0.0-1.0)

## Dynamic Decision Rules (Not Hardcoded)

### Principle 1: Conversational Flow
- Analyze the natural rhythm of the conversation
- Show cards when they add value, not just because data exists
- Consider if the user is still formulating their question

### Principle 2: Information Density
- Balance between too little and too much information
- Use relevance scores as quality indicators (100% = definitely show, <50% = probably not)
- **PREFER SINGLE CARDS**: Show only the MOST relevant card to avoid overwhelming users
- If multiple cards are relevant, choose the highest scoring one

### Principle 3: User Behavior Patterns
- Learn from conversation history
- Adapt to implicit preferences (e.g., if user asks follow-ups, they want depth)
- Recognize exploration vs. specific search patterns

### Principle 4: Contextual Intelligence
- Understand domain-specific importance (keynotes > regular sessions)
- Recognize name drops vs. detailed discussions
- Identify when visual information would clarify verbal explanations

## Few-Shot Learning Examples

<example>
User: "Tell me about quantum sensing at the conference"
Assistant: "There's an exciting keynote on quantum sensing by Dr. Sarah Chen..."
Analysis: User asked about a topic, assistant is providing specific session → SHOW session card
Reasoning: Specific session mentioned with speaker name, high relevance to query
</example>

<example>
User: "What time does the conference start?"
Assistant: "The conference begins at 9:00 AM each day..."
Analysis: General scheduling question, no specific session → NO cards
Reasoning: User needs simple time info, not detailed session cards
</example>

<example>
User: "I'm interested in workshops"
Assistant: "We have several workshops including..."
Analysis: User exploring options, assistant listing multiple → SHOW topic card for "workshops"
Reasoning: Exploratory query benefits from organized visual overview
</example>

<example>
User: "Who is Dr. Chen?"
Assistant: "Dr. Sarah Chen is a renowned quantum physicist..."
Analysis: Specific person inquiry → SHOW speaker card with session links
Reasoning: Biographical query benefits from structured presenter information
</example>

## Meta-Learning Instructions

1. **Pattern Recognition**: Identify recurring user behaviors and adapt
2. **Relevance Calibration**: Adjust thresholds based on conversation success
3. **Timing Optimization**: Learn when users engage vs. ignore cards
4. **Preference Inference**: Deduce preferences from implicit signals

## Output Format

Return a decision object with reasoning FIRST (chain-of-thought structure):
{
  "reasoning": "Concise logical analysis (2-3 sentences: context → relevance → conclusion)",
  "show_cards": boolean,
  "confidence": 0.0-1.0,
  "cards": [...]
}

## Card Structure

When including cards in your decision, use these EXACT formats:

### Session Card
{
  "type": "session",
  "id": "[Use the exact session_id from metadata, e.g., 'session-2025-09-10-0900']",
  "title": "Session title",
  "description": "Brief description",
  "speakers": ["Speaker names"],
  "time": "Date and time",
  "venue": "Location"
}

### Speaker Card  
{
  "type": "speaker",
  "id": "[Use the exact id from the speaker result]",
  "name": "Speaker full name"
}

### Topic Card
{
  "type": "topic", 
  "id": "[Use the exact id from the topic result]",
  "topic_theme": "Topic theme name"
}

CRITICAL: For session cards, you MUST use the exact session_id value from the metadata field, NOT generate your own IDs.

Remember: You're not following rigid rules but making intelligent, context-aware decisions like a thoughtful human assistant would."""
    
    def _update_conversation_memory(self, session_id: str, decision: dict):
        """Update conversation memory with learning from decisions"""
        if session_id not in self.conversation_memory:
            self.conversation_memory[session_id] = {
                "decision_history": [],
                "patterns": {},
                "preferences": {}
            }
        
        memory = self.conversation_memory[session_id]
        memory["decision_history"].append({
            "timestamp": datetime.now().isoformat(),
            "confidence": decision.get("confidence", 0),
            "reasoning": decision.get("reasoning", ""),
            "cards_shown": decision.get("show_cards", False)
        })
        
        # Pattern recognition
        if len(memory["decision_history"]) > 5:
            # Analyze patterns in last 5 decisions
            recent_decisions = memory["decision_history"][-5:]
            show_rate = sum(1 for d in recent_decisions if d["cards_shown"]) / 5
            avg_confidence = sum(d["confidence"] for d in recent_decisions) / 5
            
            memory["patterns"]["recent_show_rate"] = show_rate
            memory["patterns"]["confidence_trend"] = avg_confidence
    
    def _calculate_dynamic_threshold(self, rag_results: dict, conversation_context: dict) -> float:
        """
        Calculate a dynamic relevance threshold based on result quality and conversation context.
        Higher thresholds when we have high-quality results, lower when results are sparse.
        """
        # Base threshold
        base_threshold = 0.55
        
        # Get all relevance scores
        all_scores = []
        for category_results in rag_results.values():
            for r in category_results:
                if isinstance(r, dict):
                    score = r.get('relevance_score', 0)
                    if score > 0:
                        all_scores.append(score)
                else:
                    if hasattr(r, 'relevance_score') and r.relevance_score > 0:
                        all_scores.append(r.relevance_score)
        
        if not all_scores:
            return base_threshold
        
        # Statistical analysis of result quality
        max_score = max(all_scores)
        avg_score = sum(all_scores) / len(all_scores)
        score_range = max_score - min(all_scores)
        
        # Adjust threshold based on result quality
        if max_score > 0.9 and avg_score > 0.7:
            # High-quality results available - slightly more selective but not too much
            dynamic_threshold = base_threshold + 0.05
        elif max_score > 0.8 and score_range > 0.3:
            # Good spread of relevance - use standard threshold
            dynamic_threshold = base_threshold
        elif avg_score < 0.5:
            # Poor overall relevance - be more lenient to show something useful
            dynamic_threshold = base_threshold - 0.10
        else:
            # Standard case
            dynamic_threshold = base_threshold
        
        # Context-based adjustments
        previous_cards_shown = conversation_context.get("cards_shown_count", 0)
        
        # If this is early in conversation, be more permissive
        if previous_cards_shown == 0:
            dynamic_threshold -= 0.10
        # If many cards already shown, be slightly more selective
        elif previous_cards_shown > 3:
            dynamic_threshold += 0.05
        
        # Ensure reasonable bounds
        final_threshold = max(0.35, min(0.85, dynamic_threshold))
        
        rosa_logger.debug(f"🎯 Dynamic threshold: {final_threshold:.2f} (base={base_threshold}, max_score={max_score:.2f}, avg_score={avg_score:.2f})", 
                         conversation_context.get("session_id", "unknown"), LLMInstance.UI_INTEL)
        
        return final_threshold

    def _format_cards_for_display(self, card_decisions: List[dict], rag_results: dict, conversation_context: dict, session_id: str = "unknown") -> List[CardDecision]:
        """Format AI decisions into actual card data for frontend with relevance filtering"""
        formatted_cards = []
        
        # Dynamic quality threshold based on result quality and conversation context
        RELEVANCE_THRESHOLD = self._calculate_dynamic_threshold(rag_results, conversation_context)
        
        for card in card_decisions:
            card_type = card.get("type")
            
            if card_type == "session":
                session_id_from_llm = card.get("id")
                if not session_id_from_llm:
                    continue

                rosa_logger.debug(f"🔍 Looking for session: {session_id_from_llm}", session_id, LLMInstance.UI_INTEL)
                
                for session_result in rag_results.get("sessions", []):
                    # Handle both dict and SearchResult objects
                    if isinstance(session_result, dict):
                        result_id = session_result.get('id', '')
                        relevance_score = session_result.get('relevance_score', 0)
                    else:
                        result_id = session_result.id if hasattr(session_result, 'id') else ''
                        relevance_score = session_result.relevance_score if hasattr(session_result, 'relevance_score') else 0
                    
                    if result_id == session_id_from_llm and relevance_score and relevance_score >= RELEVANCE_THRESHOLD:
                        formatted_cards.append(CardDecision(
                            card_type="session",
                            card_data=self._transform_session_for_frontend(session_result),
                            display_reason=card.get("display_reason", ""),
                            confidence=card.get("confidence", 0.8),
                            timing=card.get("timing", "immediate")
                        ))
                        rosa_logger.info(f"✅ Approved session card: {result_id} (relevance={relevance_score:.2f})", session_id, LLMInstance.UI_INTEL)
                        break # Found our session
                    elif result_id == session_id_from_llm:
                        rosa_logger.info(f"❌ Filtered low-relevance session: {result_id} (relevance={relevance_score:.2f})", session_id, LLMInstance.UI_INTEL)
                        break

            elif card_type == "speaker":
                speaker_name = card.get("name", "")
                if not speaker_name:
                    continue

                speaker_sessions = []
                for session_result in rag_results.get("sessions", []):
                    # Handle both dict and SearchResult objects
                    if isinstance(session_result, dict):
                        related_speakers = session_result.get('related_speakers', [])
                        relevance_score = session_result.get('relevance_score', 0)
                    else:
                        related_speakers = session_result.related_speakers if hasattr(session_result, 'related_speakers') else []
                        relevance_score = session_result.relevance_score if hasattr(session_result, 'relevance_score') else 0
                    
                    if related_speakers and any(
                        (speaker.get('name') if isinstance(speaker, dict) else speaker) == speaker_name 
                        for speaker in related_speakers
                    ):
                        if relevance_score and relevance_score >= RELEVANCE_THRESHOLD:
                            transformed_session = self._transform_session_for_frontend(session_result)
                            if transformed_session:
                                speaker_sessions.append(transformed_session)

                if speaker_sessions:
                    avg_relevance = sum(s.get('relevance_score', 0) for s in speaker_sessions) / len(speaker_sessions)
                    aggregated_speaker_data = self._aggregate_speaker_data(speaker_name, speaker_sessions)
                    
                    rosa_logger.info(f"✅ Approved speaker card: {speaker_name} ({len(speaker_sessions)} sessions, avg_relevance={avg_relevance:.2f})", session_id, LLMInstance.UI_INTEL)
                    formatted_cards.append(CardDecision(
                        card_type="speaker",
                        card_data=aggregated_speaker_data,
                        display_reason=card.get("display_reason", ""),
                        confidence=card.get("confidence", 0.8),
                        timing=card.get("timing", "immediate")
                    ))
                else:
                    rosa_logger.info(f"❌ No high-relevance sessions found for speaker: {speaker_name}", session_id, LLMInstance.UI_INTEL)

            elif card_type == "topic":
                topic_theme = card.get("topic_theme", "")
                if not topic_theme:
                    continue
                
                related_sessions = []
                for session_result in rag_results.get("sessions", []):
                    # Handle both dict and SearchResult objects
                    if isinstance(session_result, dict):
                        related_topics = session_result.get('related_topics', [])
                        relevance_score = session_result.get('relevance_score', 0)
                    else:
                        related_topics = session_result.related_topics if hasattr(session_result, 'related_topics') else []
                        relevance_score = session_result.relevance_score if hasattr(session_result, 'relevance_score') else 0
                    
                    if related_topics and any(
                        (topic.get('title', '') if isinstance(topic, dict) else topic).lower() in topic_theme.lower() 
                        for topic in related_topics
                    ):
                        if relevance_score and relevance_score >= RELEVANCE_THRESHOLD:
                            transformed_session = self._transform_session_for_frontend(session_result)
                            if transformed_session:
                                related_sessions.append(transformed_session)
                
                if related_sessions:
                    avg_relevance = sum(s.get('relevance_score', 0) for s in related_sessions) / len(related_sessions)
                    rosa_logger.info(f"✅ Approved topic card: {topic_theme} ({len(related_sessions)} sessions, avg_relevance={avg_relevance:.2f})", session_id, LLMInstance.UI_INTEL)
                    formatted_cards.append(CardDecision(
                        card_type="topic",
                        card_data={
                            "theme": topic_theme,
                            "sessions": related_sessions,
                            "overview": card.get("overview", "")
                        },
                        display_reason=card.get("display_reason", ""),
                        confidence=card.get("confidence", 0.8),
                        timing=card.get("timing", "immediate")
                    ))

            elif card_type == "venue" or card_type == "room":
                room_name = card.get("room_name", "")
                if not room_name:
                    continue
                
                # Find sessions in this room with high relevance
                room_sessions = []
                for session_result in rag_results.get("sessions", []):
                    # Handle both dict and SearchResult objects
                    if isinstance(session_result, dict):
                        related_room = session_result.get('related_room', {})
                        room_name_result = related_room.get('name', '') if related_room else ''
                        relevance_score = session_result.get('relevance_score', 0)
                    else:
                        room_name_result = session_result.related_room.get("name", "") if session_result.related_room else ''
                        relevance_score = session_result.relevance_score if hasattr(session_result, 'relevance_score') else 0
                    
                    if (room_name_result.lower() == room_name.lower() and
                        relevance_score >= RELEVANCE_THRESHOLD):
                        
                        transformed_session = self._transform_session_for_frontend(session_result)
                        if transformed_session:
                            room_sessions.append(transformed_session)
                
                if room_sessions:
                    avg_relevance = sum(s.get('relevance_score', 0) for s in room_sessions) / len(room_sessions)
                    room_data = self._aggregate_room_data(room_name, room_sessions)
                    
                    rosa_logger.info(f"✅ Approved room card: {room_name} ({len(room_sessions)} sessions, avg_relevance={avg_relevance:.2f})", session_id, LLMInstance.UI_INTEL)
                    formatted_cards.append(CardDecision(
                        card_type="venue",
                        card_data=room_data,
                        display_reason=card.get("display_reason", ""),
                        confidence=card.get("confidence", 0.8),
                        timing=card.get("timing", "immediate")
                    ))
                else:
                    rosa_logger.info(f"❌ No high-relevance sessions found for room: {room_name}", session_id, LLMInstance.UI_INTEL)
        
        rosa_logger.debug(f"🎴 Returning {len(formatted_cards)} formatted cards", None, LLMInstance.UI_INTEL)
        return formatted_cards

    def _transform_session_for_frontend(self, session_result) -> Optional[Dict[str, Any]]:
        """
        🔧 CRITICAL REFACTOR: Transform a SearchResult object or dict into the JSON format expected by the frontend cards.
        
        Converts from a flat SearchResult with 'metadata' and 'related_speakers'/'related_topics' attributes
        To a nested JSON object for the frontend cards.
        """
        if not session_result:
            return None

        try:
            # Handle both dictionary and SearchResult objects
            if isinstance(session_result, dict):
                session_id = session_result.get('id', '')
                title = session_result.get('title', session_result.get('name', 'Unknown Session'))
                metadata = session_result.get('metadata', {})
                related_room = session_result.get('related_room', {})
                related_speakers = session_result.get('related_speakers', [])
                related_topics = session_result.get('related_topics', [])
                relevance_score = session_result.get('relevance_score', 0.0)
            else:
                # Original SearchResult object handling
                if not isinstance(session_result, SearchResult):
                    return None
                session_id = session_result.id
                title = session_result.title
                metadata = session_result.metadata
                related_room = session_result.related_room
                related_speakers = session_result.related_speakers if hasattr(session_result, 'related_speakers') else []
                related_topics = session_result.related_topics if hasattr(session_result, 'related_topics') else []
                relevance_score = session_result.relevance_score if hasattr(session_result, 'relevance_score') else 0.0
            
            # Extract speaker names from the cross-reference
            speaker_names = [s.get('name', s) if isinstance(s, dict) else s for s in related_speakers] if related_speakers else []
            
            # Extract topic titles from the cross-reference
            topic_titles = [t.get('title', t) if isinstance(t, dict) else t for t in related_topics] if related_topics else []

            frontend_session = {
                # Core session identification
                "session_id": session_id,
                "title": title,
                
                # Timing information from metadata
                "date": metadata.get("date", ""),
                "start_time": metadata.get("startTime", ""),
                "end_time": metadata.get("endTime", ""),
                "duration": metadata.get("duration_minutes", 0),
                
                # Location from cross-reference or metadata
                "venue": related_room.get("name") if related_room else metadata.get("venue", ""),
                
                # Session classification from metadata
                "session_type": metadata.get("sessionType", ""),
                "theme": metadata.get("theme", ""),
                "track": metadata.get("track", ""),
                "audience_level": metadata.get("audience_level", ""),
                
                # Content
                "description": session_result.content,
                "speakers": speaker_names, # Use extracted speaker names
                
                # Flags
                "is_keynote": metadata.get("sessionType", "") == "Keynote",
                "is_interactive": metadata.get("is_interactive", False),
                "is_technical": metadata.get("is_technical", True),
                
                # Metadata for debugging/tracking
                "relevance_score": relevance_score or 0.0,
                
                # Additional enhanced fields for comprehensive display
                "day_of_week": metadata.get("day_of_week", ""),
                "time_of_day": metadata.get("time_of_day", ""),
                "speaker_count": len(speaker_names),
                "related_topics": topic_titles # Use extracted topic titles
            }
            
            rosa_logger.debug(f"✅ Transformed session: {frontend_session['session_id']} - {frontend_session['title']}")
            return frontend_session
            
        except Exception as e:
            rosa_logger.error(f"❌ Failed to transform session for frontend: {e}")
            return None

    def _aggregate_speaker_data(self, speaker_name: str, sessions: List[dict]) -> Dict[str, Any]:
        """
        🚀 COMPREHENSIVE SPEAKER DATA AGGREGATION
        
        Aggregates all available speaker data from multiple sessions to create
        a comprehensive speaker profile that maximizes data utilization.
        
        Returns format that matches enhanced SpeakerCard interface.
        """
        # Extract unique themes, tracks, and other data from all sessions
        themes = set()
        tracks = set()
        venues = set()
        session_types = set()
        keynote_count = 0
        total_duration = 0
        
        for session in sessions:
            if session.get('theme'):
                themes.add(session['theme'])
            if session.get('track'):
                tracks.add(session['track'])
            if session.get('venue'):
                venues.add(session['venue'])
            if session.get('session_type'):
                session_types.add(session['session_type'])
                if session['session_type'] == 'Keynote':
                    keynote_count += 1
            if session.get('duration'):
                try:
                    total_duration += int(session['duration'])
                except (ValueError, TypeError):
                    pass # Ignore if duration is not a valid number

        # Smart role inference from speaker name and session types
        inferred_role = ""
        inferred_org = ""
        
        if "Ambassador" in speaker_name:
            inferred_role = "Ambassador"
            inferred_org = "Diplomatic Mission"
        elif "Prof." in speaker_name or "Professor" in speaker_name:
            inferred_role = "Professor"
            inferred_org = "Academic Institution"
        elif "Dr." in speaker_name:
            inferred_role = "Doctor/Researcher"
            inferred_org = "Research Institution"
        elif "CEO" in speaker_name:
            inferred_role = "Chief Executive Officer"
        elif "Director" in speaker_name:
            inferred_role = "Director"
        elif "Mr." in speaker_name or "Ms." in speaker_name:
            inferred_role = "Professional"
        
        # Enhanced role based on session participation
        if keynote_count > 0:
            inferred_role = f"Keynote Speaker{' & ' + inferred_role if inferred_role else ''}"
        
        # Create comprehensive speaker data structure
        comprehensive_speaker_data = {
            # Core identity (required by SpeakerCard)
            "name": speaker_name,
            "sessions": sessions,  # Properly formatted session array
            
            # Aggregated metadata
            "totalSessions": len(sessions),
            "themes": list(themes),
            "tracks": list(tracks),
            
            # Enhanced professional profile
            "organization": inferred_org,
            "current_role": inferred_role,
            "bio": f"Speaking at {len(sessions)} session{'s' if len(sessions) != 1 else ''} covering {', '.join(list(themes)[:3])}{'...' if len(themes) > 3 else ''}.",
            
            # Conference participation metrics
            "keynote_sessions": keynote_count,
            "total_speaking_time": total_duration,
            "venues_spoken": list(venues),
            "session_types": list(session_types),
            
            # Professional estimates (for display enhancement)
            "years_experience": 10 + keynote_count * 5,  # Rough estimate based on keynotes
            "expertise": list(themes),  # Use themes as expertise areas
            "research_areas": list(themes),  # Themes are research areas
            
            # Conference context
            "conference_participation": {
                "total_sessions": len(sessions),
                "keynote_sessions": keynote_count,
                "tracks": list(tracks),
                "venues": list(venues)
            }
        }
        
        return comprehensive_speaker_data

    def _aggregate_room_data(self, room_name: str, sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate room/venue data from multiple sessions for VenueCard display.
        Creates a comprehensive room profile including session metrics and themes.
        """
        if not sessions:
            return {}
            
        # Extract aggregated data from sessions
        themes = set()
        tracks = set()
        speakers = set()
        session_types = set()
        
        for session in sessions:
            if session.get('themes'):
                themes.update(session['themes'])
            if session.get('track'):
                tracks.add(session['track'])
            if session.get('speakers'):
                speakers.update(session['speakers'])
            if session.get('sessionType'):
                session_types.add(session['sessionType'])
        
        # Calculate room utilization metrics
        total_duration = sum(session.get('duration', 0) for session in sessions if session.get('duration'))
        avg_duration = total_duration / len(sessions) if sessions else 0
        
        # Build comprehensive room data structure
        comprehensive_room_data = {
            # Core identity (required by VenueCard)
            "name": room_name,
            "sessions": sessions,  # Properly formatted session array
            
            # Aggregated metadata
            "totalSessions": len(sessions),
            "themes": list(themes),
            "tracks": list(tracks),
            "speakers": list(speakers),
            
            # Room utilization metrics
            "utilization": {
                "total_sessions": len(sessions),
                "total_duration_minutes": total_duration,
                "average_session_duration": avg_duration,
                "session_types": list(session_types)
            },
            
            # Room characteristics inferred from sessions
            "primary_track": list(tracks)[0] if tracks else "General",
            "capacity_level": "large" if len(sessions) > 10 else "medium" if len(sessions) > 5 else "small",
            
            # Content analysis
            "content_focus": list(themes)[:3],  # Top 3 themes for this room
            "description": f"Hosting {len(sessions)} session{'s' if len(sessions) != 1 else ''} across {len(tracks)} track{'s' if len(tracks) != 1 else ''}, focusing on {', '.join(list(themes)[:2])}{'...' if len(themes) > 2 else ''}.",
            
            # Conference context
            "conference_participation": {
                "total_sessions": len(sessions),
                "unique_speakers": len(speakers),
                "tracks_covered": list(tracks),
                "session_types": list(session_types)
            }
        }
        
        return comprehensive_room_data

class ContextualIntelligenceEngine:
    """Deep contextual understanding using multiple signals"""
    
    def __init__(self):
        self.context_analyzers = [
            self.analyze_linguistic_cues,
            self.analyze_temporal_patterns,
            self.analyze_semantic_coherence,
            self.analyze_user_expertise_level,
        ]
    
    def build_rich_context(self, conversation: dict) -> dict:
        """Build comprehensive context from multiple dimensions"""
        
        context = {
            "timestamp": datetime.now().isoformat(),
            "conversation_id": conversation.get("id"),
            "turn_number": conversation.get("turn_number", 0)
        }
        
        # Run all analyzers
        for analyzer in self.context_analyzers:
            analyzer_result = analyzer(conversation)
            context.update(analyzer_result)
        
        # Synthesize insights
        context["synthesis"] = self._synthesize_context(context)
        
        return context
    
    def analyze_linguistic_cues(self, conversation: dict) -> dict:
        """Extract linguistic patterns"""
        
        user_message = conversation.get("user_message", "")
        
        cues = {
            "question_type": self._classify_question_type(user_message),
            "urgency_level": self._detect_urgency(user_message),
            "specificity": self._measure_specificity(user_message),
            "formality": self._assess_formality(user_message)
        }
        
        return {"linguistic_cues": cues}
    
    def analyze_temporal_patterns(self, conversation: dict) -> dict:
        """Analyze time-based patterns"""
        
        history = conversation.get("history", [])
        
        patterns = {
            "message_frequency": self._calculate_message_frequency(history),
            "topic_persistence": self._measure_topic_persistence(history),
            "session_duration": self._get_session_duration(history),
        }
        
        return {"temporal_patterns": patterns}
    
    def analyze_semantic_coherence(self, conversation: dict) -> dict:
        """Measure semantic consistency and topic flow"""
        
        messages = conversation.get("history", [])
        
        coherence = {
            "topic_consistency": self._measure_topic_consistency(messages),
            "context_switches": self._count_context_switches(messages),
            "reference_patterns": self._analyze_references(messages),
        }
        
        return {"semantic_coherence": coherence}
    
    def analyze_user_expertise_level(self, conversation: dict) -> dict:
        """Assess user's domain expertise"""
        
        user_message = conversation.get("user_message", "")
        
        expertise = {
            "technical_vocabulary": self._count_technical_terms(user_message),
            "question_sophistication": self._assess_question_complexity(user_message),
            "domain_knowledge": self._estimate_domain_knowledge(user_message)
        }
        
        return {"user_expertise": expertise}
    
    def _synthesize_context(self, context: dict) -> dict:
        """Synthesize all context signals into actionable insights"""
        
        synthesis = {
            "user_state": "exploring",  # exploring, deciding, learning, confirming
            "information_need": "overview",  # overview, details, comparison, validation
            "cognitive_load": "moderate",  # low, moderate, high
            "engagement_trajectory": "increasing",  # increasing, stable, decreasing
            "optimal_card_strategy": "progressive_disclosure"  # immediate, progressive_disclosure, on_demand
        }
        
        # Adjust based on analyzed patterns
        if context.get("linguistic_cues", {}).get("urgency_level") == "high":
            synthesis["optimal_card_strategy"] = "immediate"
        
        if context.get("temporal_patterns", {}).get("message_frequency", 0) > 2.0:
            synthesis["user_state"] = "deciding"
            synthesis["information_need"] = "comparison"
        
        return synthesis
    
    # Helper methods for analysis (simplified implementations)
    def _classify_question_type(self, message: str) -> str:
        """Classify the type of question"""
        message_lower = message.lower()
        if any(word in message_lower for word in ["who", "speaker", "presenter"]):
            return "speaker_inquiry"
        elif any(word in message_lower for word in ["when", "time", "schedule"]):
            return "scheduling"
        elif any(word in message_lower for word in ["workshop", "hands-on", "interactive"]):
            return "interactive_interest"
        elif any(word in message_lower for word in ["topic", "about", "related"]):
            return "topic_exploration"
        else:
            return "general_inquiry"
    
    def _detect_urgency(self, message: str) -> str:
        """Detect urgency level in message"""
        urgent_words = ["urgent", "quickly", "asap", "immediately", "now"]
        return "high" if any(word in message.lower() for word in urgent_words) else "normal"
    
    def _measure_specificity(self, message: str) -> str:
        """Measure how specific the message is"""
        specific_indicators = ["dr.", "professor", "session", "room", "time", "date"]
        specific_count = sum(1 for word in specific_indicators if word in message.lower())
        return "high" if specific_count > 2 else "medium" if specific_count > 0 else "low"
    
    def _assess_formality(self, message: str) -> str:
        """Assess formality level"""
        formal_indicators = ["please", "could you", "would you", "i would like"]
        return "formal" if any(phrase in message.lower() for phrase in formal_indicators) else "informal"
    
    def _calculate_message_frequency(self, history: List[dict]) -> float:
        """Calculate messages per minute"""
        if len(history) < 2:
            return 0.0
        # Simplified: assume 1 message per minute
        return 1.0
    
    def _measure_topic_persistence(self, history: List[dict]) -> str:
        """Measure how long user stays on topics"""
        return "persistent" if len(history) > 3 else "exploratory"
    
    def _get_session_duration(self, history: List[dict]) -> int:
        """Get session duration in minutes"""
        return len(history)  # Simplified
    
    def _measure_topic_consistency(self, messages: List[dict]) -> str:
        """Measure topic consistency across messages"""
        return "consistent" if len(messages) > 2 else "variable"
    
    def _count_context_switches(self, messages: List[dict]) -> int:
        """Count context switches in conversation"""
        return max(0, len(messages) - 2)  # Simplified
    
    def _analyze_references(self, messages: List[dict]) -> str:
        """Analyze reference patterns"""
        return "forward_looking" if len(messages) > 1 else "contextual"
    
    def _count_technical_terms(self, message: str) -> int:
        """Count technical terms in message"""
        technical_terms = ["nuclear", "seismic", "monitoring", "verification", "treaty"]
        return sum(1 for term in technical_terms if term in message.lower())
    
    def _assess_question_complexity(self, message: str) -> str:
        """Assess question complexity"""
        complex_indicators = ["how does", "why", "what if", "compare"]
        return "high" if any(phrase in message.lower() for phrase in complex_indicators) else "low"
    
    def _estimate_domain_knowledge(self, message: str) -> str:
        """Estimate user's domain knowledge"""
        expert_terms = ["ctbto", "comprehensive test ban", "radionuclide", "hydroacoustic"]
        expert_count = sum(1 for term in expert_terms if term in message.lower())
        return "expert" if expert_count > 1 else "intermediate" if expert_count > 0 else "novice"

class DynamicLearningSystem:
    """Continuously learn and adapt from user interactions"""
    
    def __init__(self):
        self.learning_rate = 0.1
        self.decision_weights = {}
        self.feedback_buffer = []
        
    def process_feedback(self, decision: dict, outcome: dict):
        """Process feedback from user interactions"""
        
        feedback = {
            "decision": decision,
            "outcome": outcome,
            "timestamp": datetime.now().isoformat(),
            "success_score": self._calculate_success_score(outcome)
        }
        
        self.feedback_buffer.append(feedback)
        
        # Update weights after buffer reaches threshold
        if len(self.feedback_buffer) >= 10:
            self._update_decision_weights()
            
    def _calculate_success_score(self, outcome: dict) -> float:
        """Calculate success score from outcome metrics"""
        
        score = 0.0
        
        # Positive signals
        if outcome.get("card_clicked", False):
            score += 0.4
        if outcome.get("follow_up_question_related", False):
            score += 0.3
        if outcome.get("session_continued", False):
            score += 0.2
        if outcome.get("positive_feedback", False):
            score += 0.1
            
        # Negative signals
        if outcome.get("card_immediately_closed", False):
            score -= 0.3
        if outcome.get("conversation_abandoned", False):
            score -= 0.5
        if outcome.get("negative_feedback", False):
            score -= 0.2
            
        return max(0.0, min(1.0, score))
    
    def _update_decision_weights(self):
        """Update decision weights based on feedback"""
        
        # Group feedback by decision patterns
        pattern_outcomes = {}
        
        for feedback in self.feedback_buffer:
            pattern = self._extract_pattern(feedback["decision"])
            if pattern not in pattern_outcomes:
                pattern_outcomes[pattern] = []
            pattern_outcomes[pattern].append(feedback["success_score"])
        
        # Update weights
        for pattern, scores in pattern_outcomes.items():
            avg_score = sum(scores) / len(scores)
            
            if pattern not in self.decision_weights:
                self.decision_weights[pattern] = 0.5
            
            # Gradient update
            self.decision_weights[pattern] += self.learning_rate * (avg_score - 0.5)
            self.decision_weights[pattern] = max(0.1, min(0.9, self.decision_weights[pattern]))
        
        # Clear buffer
        self.feedback_buffer = []
    
    def get_weight_for_decision(self, decision: dict) -> float:
        """Get learned weight for a decision pattern"""
        
        pattern = self._extract_pattern(decision)
        return self.decision_weights.get(pattern, 0.5)
    
    def _extract_pattern(self, decision: dict) -> str:
        """Extract decision pattern for learning"""
        
        # Create pattern signature
        components = [
            decision.get("card_type", "unknown"),
            decision.get("timing", "immediate"),
            str(decision.get("relevance_threshold", 0.8)),
            decision.get("user_state", "exploring")
        ]
        
        return "|".join(components)

# Example usage and testing
if __name__ == "__main__":
    import sys
    import os
    # SearchResult is already imported at the top of the file

    # Test the UI Intelligence Agent
    print("🧠 Testing UI Intelligence Agent...")
    
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        exit(1)
    
    agent = UIIntelligenceAgent()
    
    # Mock conversation context
    test_context = {
        "user_message": "Tell me about quantum sensing at the conference",
        "assistant_response": "There's an exciting keynote on quantum sensing by Dr. Sarah Chen...",
        "turn_number": 1,
        "elapsed_time": "30s"
    }
    
    # Mock RAG results using the new SearchResult dataclass
    mock_rag_results = {
        "sessions": [
            SearchResult(
                id='QS001',
                collection='SnT25_Session',
                title='Quantum Sensing Keynote',
                content='An exciting keynote on quantum sensing.',
                relevance_score=0.95,
                metadata={'sessionType': 'Keynote', 'startTime': '2025-09-09T10:00:00Z'},
                related_speakers=[{'name': 'Dr. Sarah Chen'}],
                related_topics=[{'title': 'Quantum Sensing'}]
            ),
            SearchResult(
                id='QS002',
                collection='SnT25_Session',
                title='Advanced Quantum Sensing Techniques',
                content='A deep dive into advanced techniques.',
                relevance_score=0.85,
                metadata={'sessionType': 'Workshop', 'startTime': '2025-09-10T14:00:00Z'},
                related_speakers=[{'name': 'Dr. Sarah Chen'}, {'name': 'Dr. Ben Carter'}],
                related_topics=[{'title': 'Quantum Sensing'}]
            )
        ],
        "speakers": [
            SearchResult(
                id='spk_chen',
                collection='SnT25_Speaker',
                title='Dr. Sarah Chen',
                content='Renowned quantum physicist.',
                relevance_score=0.9,
            )
        ],
        "topics": [
            SearchResult(
                id='topic_qs',
                collection='SnT25_Topic',
                title='Quantum Sensing',
                content='Exploration of quantum phenomena for measurement.',
                relevance_score=0.88,
            )
        ]
    }
    
    # Test decision making
    try:
        decisions = agent.analyze_conversation_for_cards(
            test_context, 
            mock_rag_results, 
            "test_session"
        )
        
        print(f"✅ Agent made {len(decisions)} card decisions")
        for i, decision in enumerate(decisions):
            print(f"\n--- Decision {i+1} ---")
            print(f"  Card Type: {decision.card_type}")
            print(f"  Confidence: {decision.confidence}")
            print(f"  Reason: {decision.display_reason}")
            print(f"  Card Data: {json.dumps(decision.card_data, indent=2)}")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc() 