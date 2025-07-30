from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Annotated
import asyncio
import time
import uuid
from datetime import datetime

from voice_pipeline_gpt41 import get_voice_pipeline, VoiceIntentResult
from weaviate_knowledge_search import VectorSearchTool
from simple_ui_agent import simplified_ui_agent

# FastAPI app for voice-first kiosk endpoints
app = FastAPI(
    title="CTBTO Voice-First Kiosk API (GPT-4.1)",
    description="Modern voice-first kiosk API using GPT-4.1 Responses API with RUG patterns",
    version="2.0.0"
)

# CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for voice sessions (use Redis in production)
voice_sessions: Dict[str, Dict[str, Any]] = {}
session_deltas: Dict[str, List[Dict[str, Any]]] = {}

class VoiceProcessRequest(BaseModel):
    """Request model for voice processing"""
    transcript: str = Field(..., min_length=1, description="Voice transcript from Tavus CVI")
    session_id: str = Field(..., description="Current conversation session ID")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")
    user_profile: Dict[str, Any] = Field(default_factory=dict, description="User profile data")

class VoiceProcessResponse(BaseModel):
    """Response model for voice processing"""
    success: bool
    intent_type: str
    components: List[Dict[str, Any]]
    voice_feedback: str
    confidence: float
    deltas: List[Dict[str, Any]]
    session_id: str
    timestamp: float
    error: str | None = None

class SessionResponse(BaseModel):
    """Response model for session operations"""
    success: bool
    session_id: str
    created_at: float
    message: str | None = None

class ActiveSessionsResponse(BaseModel):
    """Response model for active sessions"""
    active_sessions: List[str]
    session_count: int
    cleaned_expired: int

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    service: str
    timestamp: float
    active_sessions: int

class ConversationCreateRequest(BaseModel):
    """Request model for creating Tavus conversation"""
    api_key: str = Field(..., description="Tavus API key")

class ConversationCreateResponse(BaseModel):
    """Response model for conversation creation"""
    success: bool
    conversation_id: str
    conversation_url: str
    message: str | None = None
    error: str | None = None

# Dependencies
async def get_session(session_id: str) -> Dict[str, Any]:
    """Dependency to validate and get session data"""
    if session_id not in voice_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update last activity
    voice_sessions[session_id]["last_activity"] = time.time()
    return voice_sessions[session_id]

@app.post("/api/voice/process", response_model=VoiceProcessResponse)
async def process_voice_intent(
    request: VoiceProcessRequest,
    background_tasks: BackgroundTasks
) -> VoiceProcessResponse:
    """
    Process voice intent using GPT-4.1 Responses API.
    
    Flow:
    1. Voice transcript -> GPT-4.1 RUG component selection
    2. Generate AG-UI deltas for Jotai atomic updates  
    3. Store deltas for frontend polling
    4. Return immediate response for voice feedback
    """
    
    try:
        # Validate or create session
        if request.session_id not in voice_sessions:
            voice_sessions[request.session_id] = {
                "created_at": time.time(),
                "last_activity": time.time(),
                "intent_count": 0
            }
            session_deltas[request.session_id] = []

        # Update session activity
        voice_sessions[request.session_id]["last_activity"] = time.time()
        voice_sessions[request.session_id]["intent_count"] += 1

        # Process voice intent with GPT-4.1 Responses API
        intent_result: VoiceIntentResult = await get_voice_pipeline().process_voice_intent(
            voice_transcript=request.transcript,
            context=request.context,
            session_id=request.session_id
        )

        if not intent_result.success:
            raise HTTPException(
                status_code=400, 
                detail=f"Voice processing failed: {intent_result.error}"
            )

        # Generate AG-UI deltas for frontend consumption
        deltas = get_voice_pipeline().generate_ag_ui_deltas(intent_result.components)
        
        # Store deltas for polling endpoint
        session_deltas[request.session_id].extend(deltas)
        
        # Limit stored deltas (prevent memory bloat)
        if len(session_deltas[request.session_id]) > 50:
            session_deltas[request.session_id] = session_deltas[request.session_id][-30:]

        # Background: Trigger RAG search for additional context (if needed)
        if intent_result.intent_type in ["search_query", "information_request"]:
            background_tasks.add_task(
                trigger_rag_search,
                query=request.transcript,
                session_id=request.session_id,
                components=intent_result.components
            )

        return VoiceProcessResponse(
            success=True,
            intent_type=intent_result.intent_type,
            components=intent_result.components,
            voice_feedback=intent_result.voice_feedback,
            confidence=intent_result.confidence,
            deltas=deltas,
            session_id=request.session_id,
            timestamp=time.time()
        )

    except Exception as e:
        print(f"❌ Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/deltas/{session_id}")
async def get_voice_deltas(
    session_data: Annotated[Dict[str, Any], Depends(get_session)]
) -> Dict[str, Any]:
    """
    Polling endpoint for frontend delta processor.
    
    Returns new deltas since last poll for 60Hz AG-UI updates.
    Research-backed 2-second polling interval for optimal performance.
    """
    
    session_id = next(
        sid for sid, data in voice_sessions.items() 
        if data is session_data
    )

    # Get pending deltas
    deltas = session_deltas.get(session_id, [])
    
    # Clear deltas after retrieval (one-time consumption)
    session_deltas[session_id] = []

    return {
        "success": True,
        "session_id": session_id,
        "deltas": deltas,
        "timestamp": time.time(),
        "has_active_session": True
    }

@app.post("/api/voice/session/create", response_model=SessionResponse)
async def create_voice_session() -> SessionResponse:
    """Create a new voice session for Tavus CVI integration."""
    
    session_id = f"voice-{uuid.uuid4().hex[:12]}"
    
    voice_sessions[session_id] = {
        "created_at": time.time(),
        "last_activity": time.time(),
        "intent_count": 0
    }
    session_deltas[session_id] = []

    print(f"🎤 Created voice session: {session_id}")
    
    return SessionResponse(
        success=True,
        session_id=session_id,
        created_at=time.time()
    )

@app.delete("/api/voice/session/{session_id}", response_model=SessionResponse)
async def end_voice_session(session_id: str) -> SessionResponse:
    """Clean up voice session resources."""
    
    if session_id in voice_sessions:
        del voice_sessions[session_id]
    
    if session_id in session_deltas:
        del session_deltas[session_id]

    print(f"🗑️ Ended voice session: {session_id}")
    
    return SessionResponse(
        success=True,
        session_id=session_id,
        created_at=0,
        message="Session ended"
    )

@app.get("/api/voice/sessions/active", response_model=ActiveSessionsResponse)
async def get_active_sessions() -> ActiveSessionsResponse:
    """Get list of active voice sessions (for debugging)."""
    
    # Clean up expired sessions (older than 1 hour)
    current_time = time.time()
    expired_sessions = [
        sid for sid, data in voice_sessions.items()
        if current_time - data["last_activity"] > 3600
    ]
    
    for sid in expired_sessions:
        if sid in voice_sessions:
            del voice_sessions[sid]
        if sid in session_deltas:
            del session_deltas[sid]

    return ActiveSessionsResponse(
        active_sessions=list(voice_sessions.keys()),
        session_count=len(voice_sessions),
        cleaned_expired=len(expired_sessions)
    )

@app.post("/api/conversation/create", response_model=ConversationCreateResponse)
async def create_conversation_server_side(
    request: ConversationCreateRequest
) -> ConversationCreateResponse:
    """
    Create Tavus conversation server-side.
    
    Based on Tavus docs: Simple POST to /v2/conversations with persona_id.
    Updated to use Rosa's proven patterns and persona ID.
    """
    try:
        import requests
        
        # Using Rosa's proven working persona from Pattern 1
        persona_id = 'pfa22a49cab9'  # Rosa Clean Diplomatic Assistant (PROVEN)
        replica_id = 'rb67667672ad'  # ROSA replica ID (green screen) (PROVEN)
        
        payload = {
            "persona_id": persona_id,
            "replica_id": replica_id,
            "conversation_name": "ROSA - Voice-First API (Proven Pattern)",
            "properties": {
                "apply_greenscreen": True,
                "max_call_duration": 1800,  # 30 minutes
                "participant_left_timeout": 60
            }
        }
        
        print(f"🚀 Voice API creating conversation with Rosa's proven pattern:")
        print(f"   Persona: {persona_id}")
        print(f"   Replica: {replica_id}")
        
        response = requests.post(
            "https://tavusapi.com/v2/conversations",
            headers={
                "Content-Type": "application/json",
                "x-api-key": request.api_key
            },
            json=payload,
            timeout=30
        )
        
        if not response.ok:
            error_text = response.text
            print(f"❌ Tavus API error: {response.status_code} - {error_text}")
            return ConversationCreateResponse(
                success=False,
                conversation_id="",
                conversation_url="",
                error=f"Tavus API error: {response.status_code}"
            )
        
        data = response.json()
        
        print(f"✅ Voice API conversation created: {data.get('conversation_id')}")
        
        return ConversationCreateResponse(
            success=True,
            conversation_id=data["conversation_id"],
            conversation_url=data["conversation_url"],
            message="Voice API conversation created with proven Rosa patterns"
        )
        
    except Exception as e:
        print(f"❌ Voice API conversation creation error: {e}")
        return ConversationCreateResponse(
            success=False,
            conversation_id="",
            conversation_url="",
            error=str(e)
        )

# Background task functions
async def trigger_rag_search(query: str, session_id: str, components: List[Dict[str, Any]]):
    """
    Background RAG search to enrich voice responses with conference data.
    Integrates with existing Weaviate hybrid search.
    """
    
    try:
        print(f"🔍 Background RAG search for: {query}")
        
        # Use existing hybrid search engine
        with VectorSearchTool() as search_tool:
            search_results = search_tool.enhanced_conference_search(
                query=query,
                search_mode="comprehensive"
            )

        if search_results and any(search_results.values()):
            # Generate enriched cards using simplified processor
            simplified_ui_agent.process_rag_callback(
                function_args={"query": query},
                rag_data={
                    "success": True,
                    "categorized_results": search_results
                },
                session_id=session_id
            )
            
            print(f"✅ Background RAG enrichment completed for session {session_id}")

    except Exception as e:
        print(f"❌ Background RAG search error: {e}")

# Health check
@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="voice-first-kiosk-gpt41",
        timestamp=time.time(),
        active_sessions=len(voice_sessions)
    )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting CTBTO Voice-First Kiosk API (GPT-4.1)")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 