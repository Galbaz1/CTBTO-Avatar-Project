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

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CardDecision:
    """Represents a decision to show a specific card"""
    card_type: str  # "session", "speaker", "topic"
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
                "rag_results": rag_results,
                "relevance_scores": {
                    "highest": max([r.get('relevance_score', 0) if isinstance(r, dict) else r.relevance_score for r in rag_results.get("sessions", [])], default=0),
                    "average": sum([r.get('relevance_score', 0) if isinstance(r, dict) else r.relevance_score for r in rag_results.get("sessions", [])]) / len(rag_results.get("sessions", [])) if rag_results.get("sessions") else 0
                },
                "result_categories": list(rag_results.keys())
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

Use your advanced reasoning to make a human-like decision. Consider all factors and explain your thinking.

Please respond in JSON format with your decision."""
        })
        
        try:
            # Use GPT-4 for advanced reasoning
            response = self.client.chat.completions.create(
                model="gpt-4.1",  # Use most capable model
                messages=messages,
                temperature=0.3,  # Some creativity in decision making
                response_format={"type": "json_object"}
            )
            
            decision = json.loads(response.choices[0].message.content)
            print(f"🤖 UI Intelligence decision: {json.dumps(decision, indent=2)}")
            
            # Learn from this decision
            self._update_conversation_memory(session_id, decision)
            
            # Convert to card display format if cards should be shown
            if decision.get("show_cards", False):
                cards_to_format = decision.get("cards", [])
                print(f"🎴 Formatting {len(cards_to_format)} cards for display")
                return self._format_cards_for_display(cards_to_format, rag_results)
            
            print(f"🚫 UI Intelligence decided not to show cards (show_cards={decision.get('show_cards', False)})")
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

## Decision Framework (Chain-of-Thought Process)

When analyzing a conversation, follow this reasoning chain:

1. **Context Understanding**: What is the user trying to achieve? What stage of the conversation are we in?
2. **Information Relevance**: How relevant is the available information to the current moment?
3. **User Intent Recognition**: Is the user exploring, deciding, or seeking specific details?
4. **Timing Sensitivity**: Would showing a card now help or hinder the conversation?
5. **Cognitive Load**: How much information can the user process right now?

## Dynamic Decision Rules (Not Hardcoded)

### Principle 1: Conversational Flow
- Analyze the natural rhythm of the conversation
- Show cards when they add value, not just because data exists
- Consider if the user is still formulating their question

### Principle 2: Information Density
- Balance between too little and too much information
- Use relevance scores as quality indicators (100% = definitely show, <50% = probably not)
- Group related information intelligently

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

Return a decision object with your reasoning:
{
  "show_cards": boolean,
  "cards": [...],
  "reasoning": "Step-by-step thought process",
  "confidence": 0.0-1.0,
  "alternative_considered": "What else you considered"
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
    
    def _format_cards_for_display(self, card_decisions: List[dict], rag_results: dict) -> List[CardDecision]:
        """Format AI decisions into actual card data for frontend"""
        formatted_cards = []
        
        for card in card_decisions:
            card_type = card.get("type")
            
            if card_type == "session":
                # Find the session in RAG results
                session_id = card.get("session_id") or card.get("id")  # Try both field names
                print(f"🔍 Looking for session: {session_id}")
                for session in rag_results.get("sessions", []):
                    session_metadata = session.get('metadata', {}) if isinstance(session, dict) else session.metadata
                    session_id_in_metadata = session_metadata.get("session_id")
                    print(f"🔍 Checking session metadata: {session_id_in_metadata}")
                    if session_id_in_metadata == session_id:
                        formatted_cards.append(CardDecision(
                            card_type="session",
                            card_data=session,
                            display_reason=card.get("display_reason", ""),
                            confidence=card.get("confidence", 0.8),
                            timing=card.get("timing", "immediate")
                        ))
                        break
            
            elif card_type == "speaker":
                # Format speaker card
                speaker_name = card.get("speaker_name", "")
                if not speaker_name:
                    continue  # Skip if no speaker name
                    
                # Find all sessions for this speaker
                speaker_sessions = []
                for session in rag_results.get("sessions", []):
                    session_metadata = session.get('metadata', {}) if isinstance(session, dict) else session.metadata
                    speakers = session_metadata.get("speakers", [])
                    if speaker_name and speaker_name in speakers:
                        speaker_sessions.append(session)
                
                if speaker_sessions:
                    formatted_cards.append(CardDecision(
                        card_type="speaker",
                        card_data={
                            "name": speaker_name,
                            "sessions": speaker_sessions,
                            "bio": card.get("bio", "")
                        },
                        display_reason=card.get("display_reason", ""),
                        confidence=card.get("confidence", 0.8),
                        timing=card.get("timing", "immediate")
                    ))
            
            elif card_type == "topic":
                # Format topic exploration card
                topic_theme = card.get("topic_theme", "")
                if not topic_theme:
                    continue  # Skip if no topic theme
                    
                related_sessions = []
                for session in rag_results.get("sessions", []):
                    session_metadata = session.get('metadata', {}) if isinstance(session, dict) else session.metadata
                    session_theme = session_metadata.get("theme", "")
                    if topic_theme and session_theme and topic_theme.lower() in session_theme.lower():
                        related_sessions.append(session)
                
                if related_sessions:
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
        
        print(f"🎴 Returning {len(formatted_cards)} formatted cards")
        return formatted_cards

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
    
    # Mock RAG results (using plain dictionaries for JSON compatibility)
    mock_rag_results = {
        "sessions": [
            {
                'relevance_score': 0.95,
                'title': 'Quantum Sensing Keynote',
                'metadata': {
                    'session_id': 'QS001',
                    'speakers': ['Dr. Sarah Chen'],
                    'venue': 'Main Hall'
                }
            }
        ],
        "speakers": [],
        "topics": []
    }
    
    # Test decision making
    try:
        decisions = agent.analyze_conversation_for_cards(
            test_context, 
            mock_rag_results, 
            "test_session"
        )
        
        print(f"✅ Agent made {len(decisions)} card decisions")
        for decision in decisions:
            print(f"   - {decision.card_type}: {decision.display_reason}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}") 