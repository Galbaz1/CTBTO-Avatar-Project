#!/usr/bin/env python3
"""
Document Loader for ROSA Speaker System
Simple implementation inspired by Agent SDK pattern but compatible with current architecture
"""

import os
import re
from typing import Dict, List, Optional, Any
import json

class SpeakerDocumentLoader:
    """Load and parse speaker information from markdown documents"""
    
    def __init__(self, data_dir: str = "../data/speakers"):
        self.data_dir = data_dir
        self._speakers_cache = None
        
    def load_speakers_document(self) -> str:
        """Load the main speakers document"""
        doc_path = os.path.join(self.data_dir, "ctbto_speakers_snt2025.md")
        
        if not os.path.exists(doc_path):
            raise FileNotFoundError(f"Speaker document not found: {doc_path}")
            
        with open(doc_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def parse_speakers_from_document(self, document_content: str) -> List[Dict[str, Any]]:
        """Parse speaker profiles from markdown document"""
        speakers = []
        
        # Split by speaker sections (### headers)
        speaker_sections = re.split(r'\n### (.+?)\n', document_content)
        
        for i in range(1, len(speaker_sections), 2):
            if i + 1 < len(speaker_sections):
                header = speaker_sections[i]
                content = speaker_sections[i + 1]
                speaker = self._parse_speaker_section(header, content)
                if speaker:
                    speakers.append(speaker)
        
        return speakers
    
    def _parse_speaker_section(self, header: str, content: str) -> Optional[Dict[str, Any]]:
        """Parse individual speaker section"""
        try:
            # Extract name and title from header
            name_title_match = re.match(r'(.+?)\s*-\s*(.+)', header)
            if not name_title_match:
                return None
                
            name = name_title_match.group(1).strip()
            title = name_title_match.group(2).strip()
            
            # Extract structured data
            speaker_data = {
                "profile": {
                    "name": name,
                    "title": title,
                    "organization": self._extract_field(content, "Organization"),
                    "photo_url": "/api/placeholder/150/150"  # Default placeholder
                },
                "session": {
                    "topic": self._extract_field(content, "Session"),
                    "time": self._extract_field(content, "Time"),
                    "room_name": self._extract_field(content, "Room"),
                    "room_id": self._extract_field(content, "Room", transform="id")
                },
                "ai_metadata": {
                    "expertise": self._extract_expertise(content),
                    "keywords": self._extract_keywords(content),
                    "bio_summary": self._extract_biography(content),
                    "conference_relevance": self._extract_field(content, "Conference Relevance", transform="relevance")
                }
            }
            
            # Generate speaker ID
            speaker_id = self._extract_field(content, "Speaker ID")
            if speaker_id:
                speaker_id = speaker_id.strip('`')  # Remove markdown code formatting
            else:
                speaker_id = name.lower().replace(' ', '-').replace('.', '')
                
            speaker_data["id"] = speaker_id
            
            return speaker_data
            
        except Exception as e:
            print(f"Error parsing speaker section '{header}': {e}")
            return None
    
    def _extract_field(self, content: str, field_name: str, transform: str = None) -> str:
        """Extract a field value from content"""
        pattern = f"\\*\\*{field_name}\\*\\*:?\\s*(.+?)(?=\\n|$)"
        match = re.search(pattern, content, re.MULTILINE)
        
        if match:
            value = match.group(1).strip()
            
            if transform == "id":
                return value.lower().replace(' ', '-')
            elif transform == "relevance":
                return value.lower().replace(' ', '_')
            
            return value
        return ""
    
    def _extract_expertise(self, content: str) -> List[str]:
        """Extract expertise areas from content"""
        expertise_section = re.search(r'\*\*Expertise Areas:\*\*\n((?:- .+\n?)+)', content)
        if expertise_section:
            expertise_lines = expertise_section.group(1).strip().split('\n')
            return [line.strip('- ').strip() for line in expertise_lines if line.strip()]
        return []
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Generate keywords from expertise and content"""
        expertise = self._extract_expertise(content)
        
        # Convert expertise to keywords
        keywords = []
        for exp in expertise:
            # Split by common delimiters and add individual words
            words = re.split(r'[,\s]+', exp.lower())
            keywords.extend([word.strip() for word in words if len(word.strip()) > 2])
        
        # Add some common keywords based on content
        content_lower = content.lower()
        if 'seismic' in content_lower:
            keywords.extend(['seismic', 'earthquake', 'ground motion'])
        if 'radionuclide' in content_lower:
            keywords.extend(['radionuclide', 'noble gas', 'atmospheric'])
        if 'hydroacoustic' in content_lower:
            keywords.extend(['hydroacoustic', 'underwater', 'ocean'])
        if 'infrasound' in content_lower:
            keywords.extend(['infrasound', 'sound waves', 'atmospheric'])
        if 'ai' in content_lower or 'machine learning' in content_lower:
            keywords.extend(['ai', 'machine learning', 'automation'])
        
        return list(set(keywords))  # Remove duplicates
    
    def _extract_biography(self, content: str) -> str:
        """Extract biography text"""
        bio_section = re.search(r'\*\*Biography:\*\*\n((?:.+\n?)+?)(?=\n\*\*|\n---|$)', content, re.MULTILINE | re.DOTALL)
        if bio_section:
            bio_text = bio_section.group(1).strip()
            # Clean up extra whitespace and line breaks
            bio_text = re.sub(r'\n+', ' ', bio_text)
            bio_text = re.sub(r'\s+', ' ', bio_text)
            return bio_text
        return ""
    
    def get_all_speakers(self) -> List[Dict[str, Any]]:
        """Get all speakers, using cache if available"""
        if self._speakers_cache is None:
            document = self.load_speakers_document()
            self._speakers_cache = self.parse_speakers_from_document(document)
        return self._speakers_cache
    
    def get_speaker_by_id(self, speaker_id: str) -> Optional[Dict[str, Any]]:
        """Get speaker by ID"""
        speakers = self.get_all_speakers()
        for speaker in speakers:
            if speaker["id"] == speaker_id:
                return speaker
        return None
    
    def search_speakers_by_topic(self, topic: str) -> List[Dict[str, Any]]:
        """Search speakers by topic using keywords and content"""
        topic_lower = topic.lower()
        matching_speakers = []
        
        speakers = self.get_all_speakers()
        for speaker in speakers:
            metadata = speaker["ai_metadata"]
            
            # Check keywords, expertise, bio, and session topic
            if (any(keyword in topic_lower for keyword in metadata["keywords"]) or
                any(expertise.lower() in topic_lower for expertise in metadata["expertise"]) or
                topic_lower in metadata["bio_summary"].lower() or
                topic_lower in speaker["session"]["topic"].lower()):
                matching_speakers.append(speaker)
        
        return matching_speakers

# Test function
def test_document_loader():
    """Test the document loader"""
    try:
        loader = SpeakerDocumentLoader()
        speakers = loader.get_all_speakers()
        
        print(f"✅ Loaded {len(speakers)} speakers from document")
        
        # Test search
        seismic_speakers = loader.search_speakers_by_topic("seismic")
        print(f"✅ Found {len(seismic_speakers)} speakers for 'seismic'")
        
        # Test specific speaker
        sarah = loader.get_speaker_by_id("dr-sarah-chen")
        if sarah:
            print(f"✅ Found Dr. Sarah Chen: {sarah['profile']['title']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Document loader test failed: {e}")
        return False

if __name__ == "__main__":
    test_document_loader() 