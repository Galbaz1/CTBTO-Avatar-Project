#!/usr/bin/env python3
"""
conference_data.py - CTBTO Conference Data for Rosa
Contains speaker and session information for the CTBTO SnT 2025 conference
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

# Conference speakers database
CTBTO_SPEAKERS = {
    "dr-sarah-chen": {
        "id": "dr-sarah-chen",
        "name": "Dr. Sarah Chen",
        "title": "Lead Nuclear Verification Scientist",
        "organization": "CTBTO Preparatory Commission",
        "session": "Advanced Seismic Analysis for Nuclear Test Detection",
        "time": "09:30 - 10:15",
        "room": "Main Auditorium",
        "expertise": [
            "Seismic monitoring and analysis",
            "Nuclear verification technologies",
            "Signal processing and pattern recognition",
            "Automated detection algorithms"
        ],
        "biography": "Dr. Sarah Chen is a leading expert in seismic analysis with over 15 years of experience at the CTBTO Preparatory Commission. She has pioneered automated detection algorithms that reduced false positives by 85%, significantly enhancing the accuracy of nuclear test detection systems. Her groundbreaking work in seismic signal processing has been instrumental in developing the current generation of monitoring technologies used by the International Monitoring System.",
        "relevance": "Keynote speaker presenting latest advances in AI-enhanced seismic monitoring.",
        "type": "keynote"
    },
    "prof-mikhail-volkov": {
        "id": "prof-mikhail-volkov",
        "name": "Prof. Mikhail Volkov",
        "title": "Director of Radionuclide Technology",
        "organization": "CTBTO Preparatory Commission",
        "session": "Next-Generation Radionuclide Detection Systems",
        "time": "11:00 - 11:45",
        "room": "Conference Room A",
        "expertise": [
            "Radionuclide detection and analysis",
            "Atmospheric monitoring systems",
            "Noble gas detection technologies",
            "Nuclear forensics and source identification"
        ],
        "biography": "Professor Mikhail Volkov is a renowned physicist specializing in atmospheric radionuclide detection with over 20 years of experience in nuclear monitoring. As Director of Radionuclide Technology at the CTBTO, he has led the development of the current generation of noble gas detection systems deployed worldwide.",
        "relevance": "Technology expert presenting breakthrough advances in radionuclide detection.",
        "type": "technical"
    },
    "dr-amira-hassan": {
        "id": "dr-amira-hassan",
        "name": "Dr. Amira Hassan",
        "title": "Hydroacoustic Monitoring Specialist",
        "organization": "CTBTO Preparatory Commission",
        "session": "Hydroacoustic Monitoring Technologies",
        "time": "14:30 - 15:15",
        "room": "Workshop Hall",
        "expertise": [
            "Hydroacoustic monitoring",
            "Ocean monitoring systems",
            "Underwater detection technologies",
            "Marine nuclear event detection"
        ],
        "biography": "Dr. Amira Hassan specializes in underwater nuclear detection systems and has developed revolutionary hydroacoustic monitoring techniques for ocean-based nuclear activity detection.",
        "relevance": "Leading expert in oceanic monitoring systems for nuclear test detection.",
        "type": "technical"
    }
}

# Conference sessions database
CONFERENCE_SESSIONS = {
    "session-001": {
        "id": "session-001",
        "title": "Advanced Seismic Analysis for Nuclear Test Detection",
        "speaker": "Dr. Sarah Chen",
        "speaker_id": "dr-sarah-chen",
        "time": "09:30 - 10:15",
        "date": "2025-01-15",
        "room": "Main Auditorium",
        "type": "keynote",
        "topics": ["seismic monitoring", "nuclear verification", "detection algorithms"],
        "description": "Latest advances in AI-enhanced seismic monitoring and automated detection algorithms for nuclear test verification.",
        "capacity": 500,
        "registration_required": True
    },
    "session-002": {
        "id": "session-002",
        "title": "Next-Generation Radionuclide Detection Systems",
        "speaker": "Prof. Mikhail Volkov",
        "speaker_id": "prof-mikhail-volkov",
        "time": "11:00 - 11:45",
        "date": "2025-01-15",
        "room": "Conference Room A",
        "type": "technical",
        "topics": ["radionuclide detection", "atmospheric monitoring", "noble gases"],
        "description": "Breakthrough advances in particulate and noble gas detection technologies for atmospheric monitoring.",
        "capacity": 150,
        "registration_required": True
    },
    "session-003": {
        "id": "session-003",
        "title": "Hydroacoustic Monitoring Technologies",
        "speaker": "Dr. Amira Hassan",
        "speaker_id": "dr-amira-hassan",
        "time": "14:30 - 15:15",
        "date": "2025-01-15",
        "room": "Workshop Hall",
        "type": "technical",
        "topics": ["hydroacoustic monitoring", "ocean monitoring", "underwater detection"],
        "description": "Revolutionary underwater detection systems for monitoring nuclear activities in marine environments.",
        "capacity": 100,
        "registration_required": True
    }
}

def get_speaker_by_id(speaker_id: str) -> Optional[Dict[str, Any]]:
    """Get speaker information by ID"""
    return CTBTO_SPEAKERS.get(speaker_id.lower())

def search_speakers_by_name(name: str) -> List[Dict[str, Any]]:
    """Search speakers by name (partial match)"""
    name_lower = name.lower()
    results = []
    for speaker in CTBTO_SPEAKERS.values():
        if name_lower in speaker['name'].lower():
            results.append(speaker)
    return results

def search_speakers_by_topic(topic: str) -> List[Dict[str, Any]]:
    """Search speakers by expertise topic"""
    topic_lower = topic.lower()
    results = []
    for speaker in CTBTO_SPEAKERS.values():
        # Check expertise areas
        for expertise in speaker['expertise']:
            if topic_lower in expertise.lower():
                results.append(speaker)
                break
    return results

def get_session_by_id(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session information by ID"""
    return CONFERENCE_SESSIONS.get(session_id)

def search_sessions_by_topic(topic: str) -> List[Dict[str, Any]]:
    """Search sessions by topic"""
    topic_lower = topic.lower()
    results = []
    for session in CONFERENCE_SESSIONS.values():
        # Check title and topics
        if topic_lower in session['title'].lower():
            results.append(session)
            continue
        # Check topics list
        for session_topic in session['topics']:
            if topic_lower in session_topic.lower():
                results.append(session)
                break
    return results

def get_sessions_by_time(time_filter: str = "all") -> List[Dict[str, Any]]:
    """Get sessions filtered by time period"""
    sessions = list(CONFERENCE_SESSIONS.values())
    
    if time_filter == "morning":
        return [s for s in sessions if s['time'].startswith(('09:', '10:', '11:'))]
    elif time_filter == "afternoon":
        return [s for s in sessions if s['time'].startswith(('12:', '13:', '14:', '15:', '16:', '17:'))]
    else:
        return sessions

def get_schedule_summary() -> Dict[str, Any]:
    """Get a summary of the conference schedule"""
    sessions = list(CONFERENCE_SESSIONS.values())
    speakers = list(CTBTO_SPEAKERS.values())
    
    return {
        "total_sessions": len(sessions),
        "total_speakers": len(speakers),
        "session_types": {
            "keynote": len([s for s in sessions if s['type'] == 'keynote']),
            "technical": len([s for s in sessions if s['type'] == 'technical'])
        },
        "time_slots": [s['time'] for s in sessions],
        "rooms": list(set(s['room'] for s in sessions))
    } 