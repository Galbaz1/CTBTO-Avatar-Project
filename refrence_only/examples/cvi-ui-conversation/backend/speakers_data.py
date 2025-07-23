#!/usr/bin/env python3
"""
speakers_data.py - CTBTO Conference Speaker Database
Part of Rosa's Python backend implementation
Following Agent1.py pattern for data management
"""

# CTBTO SnT 2025 Conference Speaker Database
CTBTO_SPEAKERS = [
    {
        "id": "dr-sarah-chen", 
        "profile": {
            "name": "Dr. Sarah Chen",
            "title": "Lead Nuclear Verification Scientist",
            "organization": "CTBTO Preparatory Commission",
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "main-auditorium",
            "room_name": "Main Auditorium", 
            "time": "09:30 - 10:15",
            "topic": "Advanced Seismic Analysis for Nuclear Test Detection"
        },
        "ai_metadata": {
            "expertise": ["seismic monitoring", "nuclear verification", "signal processing"],
            "keywords": ["seismic", "nuclear test", "verification", "monitoring", "detection"],
            "bio_summary": "Leading expert in seismic analysis with 15+ years at CTBTO. Pioneered automated detection algorithms that reduced false positives by 85%. Her work ensures comprehensive monitoring of global seismic events for nuclear test detection.",
            "conference_relevance": "keynote_speaker"
        }
    },
    {
        "id": "prof-mikhail-volkov",
        "profile": {
            "name": "Prof. Mikhail Volkov", 
            "title": "Director of Radionuclide Technology",
            "organization": "CTBTO Preparatory Commission",
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "conference-room-a",
            "room_name": "Conference Room A",
            "time": "11:00 - 11:45", 
            "topic": "Next-Generation Radionuclide Detection Systems"
        },
        "ai_metadata": {
            "expertise": ["radionuclide detection", "atmospheric monitoring", "nuclear forensics"],
            "keywords": ["radionuclide", "atmospheric", "detection", "noble gases", "particulate"],
            "bio_summary": "Renowned physicist specializing in atmospheric radionuclide detection. Developed the current generation of noble gas systems used worldwide. His innovations enable detection of nuclear activities at unprecedented sensitivity levels.",
            "conference_relevance": "technology_expert"
        }
    },
    {
        "id": "dr-amira-hassan",
        "profile": {
            "name": "Dr. Amira Hassan",
            "title": "Hydroacoustic Research Lead",
            "organization": "CTBTO Preparatory Commission", 
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "workshop-hall",
            "room_name": "Workshop Hall",
            "time": "14:30 - 15:15",
            "topic": "Ocean Monitoring: Hydroacoustic Technologies for Nuclear Test Detection"
        },
        "ai_metadata": {
            "expertise": ["hydroacoustic monitoring", "underwater acoustics", "marine surveillance"],
            "keywords": ["hydroacoustic", "ocean", "underwater", "acoustic", "marine monitoring"],
            "bio_summary": "Marine acoustics specialist focusing on underwater nuclear test detection. Led deployment of hydroacoustic stations across Pacific and Atlantic. Her research ensures comprehensive ocean monitoring for treaty verification.",
            "conference_relevance": "technology_expert"
        }
    },
    {
        "id": "dr-james-wright",
        "profile": {
            "name": "Dr. James Wright",
            "title": "Infrasound Network Coordinator", 
            "organization": "CTBTO Preparatory Commission",
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "technical-center",
            "room_name": "Technical Center",
            "time": "16:00 - 16:45",
            "topic": "Atmospheric Monitoring: Infrasound Detection of Nuclear Explosions"
        },
        "ai_metadata": {
            "expertise": ["infrasound monitoring", "atmospheric acoustics", "signal analysis"],
            "keywords": ["infrasound", "atmospheric", "low frequency", "acoustic waves", "explosion detection"],
            "bio_summary": "Atmospheric physicist specializing in infrasound detection systems. Manages global network of infrasound stations. His expertise in atmospheric acoustic propagation enhances detection capabilities for nuclear monitoring.",
            "conference_relevance": "network_specialist"
        }
    },
    {
        "id": "dr-liu-wei",
        "profile": {
            "name": "Dr. Liu Wei",
            "title": "Data Integration Specialist",
            "organization": "CTBTO Preparatory Commission",
            "photo_url": "/api/placeholder/150/150"
        },
        "session": {
            "room_id": "data-center",
            "room_name": "Data Center",
            "time": "10:30 - 11:15", 
            "topic": "AI and Machine Learning in Nuclear Monitoring Data Analysis"
        },
        "ai_metadata": {
            "expertise": ["data fusion", "machine learning", "pattern recognition", "automated analysis"],
            "keywords": ["AI", "machine learning", "data analysis", "automation", "pattern recognition"],
            "bio_summary": "Computer scientist applying AI to nuclear monitoring. Developed machine learning algorithms that integrate seismic, radionuclide, infrasound, and hydroacoustic data. His work enables rapid, automated analysis of global monitoring data.",
            "conference_relevance": "innovation_leader"
        }
    }
]

def get_speaker_by_id(speaker_id: str) -> dict:
    """Get speaker by ID"""
    for speaker in CTBTO_SPEAKERS:
        if speaker["id"] == speaker_id:
            return speaker
    return None

def search_speakers_by_topic(topic: str) -> list:
    """Simple keyword-based speaker search"""
    topic_lower = topic.lower()
    matching_speakers = []
    
    for speaker in CTBTO_SPEAKERS:
        # Check keywords, expertise, and bio summary
        metadata = speaker["ai_metadata"]
        if (any(keyword in topic_lower for keyword in metadata["keywords"]) or
            any(expertise in topic_lower for expertise in metadata["expertise"]) or
            topic_lower in metadata["bio_summary"].lower() or
            topic_lower in speaker["session"]["topic"].lower()):
            matching_speakers.append(speaker)
    
    return matching_speakers

def get_all_speakers() -> list:
    """Get all available speakers"""
    return CTBTO_SPEAKERS 