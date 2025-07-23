#!/usr/bin/env python3
"""
conference_planner.py - CTBTO Conference Personalized Agenda Generator
Part of Rosa's Python backend implementation
Implements PRD requirements for ≤3 second agenda generation with QR export
"""

import json
import hashlib
import qrcode
import io
import base64
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

# Conference session database (simplified for demo)
CONFERENCE_SESSIONS = [
    {
        "id": "session-001",
        "title": "Advanced Seismic Analysis for Nuclear Test Detection",
        "speaker": "Dr. Sarah Chen",
        "time": "09:30 - 10:15",
        "room": "Main Auditorium",
        "type": "keynote",
        "topics": ["seismic monitoring", "nuclear verification", "detection algorithms"],
        "keywords": ["seismic", "detection", "verification", "monitoring", "nuclear"]
    },
    {
        "id": "session-002", 
        "title": "Next-Generation Radionuclide Detection Systems",
        "speaker": "Prof. Mikhail Volkov",
        "time": "11:00 - 11:45",
        "room": "Conference Room A",
        "type": "technical",
        "topics": ["radionuclide detection", "atmospheric monitoring", "noble gases"],
        "keywords": ["radionuclide", "atmospheric", "detection", "noble gases", "particulate"]
    },
    {
        "id": "session-003",
        "title": "Hydroacoustic Monitoring Technologies",
        "speaker": "Dr. Amira Hassan", 
        "time": "14:30 - 15:15",
        "room": "Workshop Hall",
        "type": "technical",
        "topics": ["hydroacoustic monitoring", "ocean monitoring", "underwater detection"],
        "keywords": ["hydroacoustic", "ocean", "underwater", "monitoring", "detection"]
    },
    {
        "id": "session-004",
        "title": "Infrasound Detection Networks",
        "speaker": "Dr. James Wright",
        "time": "16:00 - 16:45", 
        "room": "Technical Center",
        "type": "technical",
        "topics": ["infrasound", "atmospheric monitoring", "global networks"],
        "keywords": ["infrasound", "atmospheric", "networks", "detection", "monitoring"]
    },
    {
        "id": "session-005",
        "title": "AI and Machine Learning in Nuclear Monitoring",
        "speaker": "Dr. Liu Wei",
        "time": "10:30 - 11:15",
        "room": "Data Center", 
        "type": "technical",
        "topics": ["artificial intelligence", "machine learning", "data analysis"],
        "keywords": ["AI", "machine learning", "data", "analysis", "algorithms"]
    },
    {
        "id": "session-006",
        "title": "CTBTO Policy and International Cooperation", 
        "speaker": "Ambassador Elena Rodriguez",
        "time": "13:00 - 13:45",
        "room": "Diplomatic Hall",
        "type": "policy",
        "topics": ["international policy", "treaty compliance", "diplomacy"],
        "keywords": ["policy", "treaty", "diplomacy", "international", "cooperation"]
    },
    {
        "id": "session-007",
        "title": "Networking Coffee Break",
        "speaker": "Conference Organizers",
        "time": "15:30 - 16:00",
        "room": "Main Lobby",
        "type": "networking", 
        "topics": ["networking", "informal discussions", "coffee"],
        "keywords": ["networking", "coffee", "informal", "break", "discussions"]
    }
]

def calculate_relevance_score(session: Dict[str, Any], interests: str, preferences: str = "") -> float:
    """
    Calculate how relevant a session is to user interests (0.0 - 1.0)
    Simple keyword matching algorithm
    """
    interests_lower = interests.lower()
    preferences_lower = preferences.lower()
    
    score = 0.0
    
    # Check keywords
    for keyword in session["keywords"]:
        if keyword in interests_lower:
            score += 0.3
        if keyword in preferences_lower:
            score += 0.2
    
    # Check topics
    for topic in session["topics"]:
        if any(word in interests_lower for word in topic.split()):
            score += 0.2
    
    # Check title
    title_words = session["title"].lower().split()
    interest_words = interests_lower.split()
    
    common_words = set(title_words) & set(interest_words)
    if common_words:
        score += len(common_words) * 0.1
    
    # Normalize to 0.0 - 1.0 range
    return min(score, 1.0)

def filter_sessions_by_time(sessions: List[Dict], time_commitment: str) -> List[Dict]:
    """
    Filter sessions based on user's time commitment
    """
    if "full day" in time_commitment.lower():
        return sessions  # Return all sessions
    elif "half day" in time_commitment.lower():
        return sessions[:4]  # Return first 4 sessions
    elif "few hours" in time_commitment.lower() or "3" in time_commitment or "4" in time_commitment:
        return sessions[:3]  # Return first 3 sessions  
    elif "key sessions" in time_commitment.lower() or "important" in time_commitment.lower():
        return [s for s in sessions if s["type"] == "keynote"][:2]  # Only keynotes
    else:
        return sessions[:3]  # Default to 3 sessions

def generate_qr_code(agenda_data: Dict[str, Any]) -> str:
    """
    Generate QR code for mobile agenda access
    Returns base64 encoded PNG image
    """
    # Create a simple URL for the agenda (in real implementation, this would be a proper URL)
    agenda_id = hashlib.md5(json.dumps(agenda_data, sort_keys=True).encode()).hexdigest()[:8]
    agenda_url = f"https://ctbto-snt2025.org/agenda/{agenda_id}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(agenda_url)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def create_personalized_agenda(
    interests: str,
    time_available: str, 
    preferences: str = "",
    language: str = "en"
) -> Dict[str, Any]:
    """
    Create a personalized conference agenda based on user preferences
    Implements PRD requirements for ≤3 second generation
    """
    
    # Step 1: Calculate relevance scores for all sessions
    scored_sessions = []
    for session in CONFERENCE_SESSIONS:
        relevance = calculate_relevance_score(session, interests, preferences)
        scored_sessions.append({
            **session,
            "relevance_score": relevance
        })
    
    # Step 2: Sort by relevance (highest first)
    scored_sessions.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    # Step 3: Filter by time commitment
    filtered_sessions = filter_sessions_by_time(scored_sessions, time_available)
    
    # Step 4: Calculate total duration
    total_hours = len(filtered_sessions) * 0.75  # Assume 45 min per session
    total_duration = f"{total_hours:.1f} hours"
    
    # Step 5: Create agenda structure
    agenda_sessions = []
    for session in filtered_sessions:
        agenda_sessions.append({
            "id": session["id"],
            "title": session["title"],
            "speaker": session["speaker"], 
            "time": session["time"],
            "room": session["room"],
            "type": session["type"],
            "relevance_score": session["relevance_score"]
        })
    
    # Step 6: Generate export links (simplified for demo)
    agenda_id = hashlib.md5(f"{interests}{time_available}".encode()).hexdigest()[:8]
    
    agenda_data = {
        "user_interests": interests,
        "time_commitment": time_available,
        "sessions": agenda_sessions,
        "total_duration": total_duration,
        "export_links": {
            "pdf": f"https://ctbto-snt2025.org/export/pdf/{agenda_id}",
            "ical": f"https://ctbto-snt2025.org/export/ical/{agenda_id}"
        }
    }
    
    # Step 7: Generate QR code
    agenda_data["qr_code_url"] = generate_qr_code(agenda_data)
    
    return agenda_data

# Example usage for testing
if __name__ == "__main__":
    # Test agenda generation
    test_agenda = create_personalized_agenda(
        interests="nuclear monitoring and seismic analysis",
        time_available="half day",
        preferences="technical sessions preferred"
    )
    
    print("Generated Agenda:")
    print(f"Sessions: {len(test_agenda['sessions'])}")
    print(f"Duration: {test_agenda['total_duration']}")
    print(f"User interests: {test_agenda['user_interests']}")
    
    for session in test_agenda['sessions']:
        print(f"- {session['title']} ({session['relevance_score']:.1%} match)") 