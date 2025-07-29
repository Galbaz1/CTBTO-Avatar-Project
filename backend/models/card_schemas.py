"""
Pydantic v2.7+ Card Schema Models for OpenAI Responses API
Strictly compliant with client.beta.chat.completions.parse() requirements
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Union, Literal


class SessionCard(BaseModel):
    """Session card matching PremiumTimetableSession interface - snake_case fields"""
    
    session_id: str = Field(..., description="Unique session identifier from Weaviate UUID")
    title: str = Field(..., description="Clear, descriptive session title")
    description: Optional[str] = Field(default=None, description="Session abstract or summary")
    
    # Time & Location (must match frontend interface)
    start_time: Optional[str] = Field(default=None, description="Session start time HH:MM format")
    end_time: Optional[str] = Field(default=None, description="Session end time HH:MM format") 
    duration_minutes: Optional[int] = Field(default=None, description="Session duration in minutes")
    date: Optional[str] = Field(default=None, description="Session date YYYY-MM-DD format")
    venue: Optional[str] = Field(default=None, description="Room name or venue location")
    
    # Session Classification (must match PremiumTimetableSession interface)
    session_type: Optional[str] = Field(default=None, description="Type like 'Technical Session', 'Keynote'")
    speakers: List[str] = Field(default_factory=list, description="List of speaker names")
    theme: Optional[str] = Field(default=None, description="Session theme or track")
    track: Optional[str] = Field(default=None, description="Conference track identifier")
    audience_level: Optional[str] = Field(default=None, description="Beginner/Intermediate/Advanced")
    day_of_week: Optional[str] = Field(default=None, description="Monday, Tuesday, etc.")
    time_of_day: Optional[str] = Field(default=None, description="Morning, Afternoon, Evening")
    
    # Computed Fields (must match frontend)
    has_speakers: bool = Field(default=False, description="Whether session has confirmed speakers")
    is_interactive: Optional[bool] = Field(default=None, description="Whether session is interactive")
    
    # Enrichment Data (must match frontend)
    keywords: Optional[List[str]] = Field(default=None, description="Keywords extracted from content")
    priority_level: Optional[Literal['high', 'medium', 'low']] = Field(default=None)
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Query relevance 0-1")
    theme_code: Optional[str] = Field(default=None, description="Theme code like T1.1, T2.3")
    scientific_field: Optional[Literal['physics', 'chemistry', 'technology', 'policy']] = Field(default=None)
    capacity: Optional[int] = Field(default=None, description="Session capacity")
    registration_required: Optional[bool] = Field(default=None)
    
    # Duration field required by frontend
    duration: Optional[int] = Field(default=None, description="Duration in minutes (alias for duration_minutes)")
    
    # Pydantic v2.7+ field validators
    @field_validator('speakers', mode='after')
    @classmethod
    def validate_speakers(cls, v: List[str]) -> List[str]:
        """Remove duplicates and empty strings, preserve order"""
        seen = set()
        cleaned = []
        for speaker in v:
            speaker = speaker.strip()
            if speaker and speaker not in seen:
                seen.add(speaker)
                cleaned.append(speaker)
        return cleaned
    
    @model_validator(mode='after')
    def set_computed_fields(self):
        """Set computed fields after all validation"""
        # Set has_speakers based on speakers list
        if self.speakers:
            self.has_speakers = True
        else:
            self.has_speakers = False
            
        # Sync duration and duration_minutes
        if self.duration_minutes and not self.duration:
            self.duration = self.duration_minutes
        elif self.duration and not self.duration_minutes:
            self.duration_minutes = self.duration
            
        return self


class SpeakerCard(BaseModel):
    """Speaker card with session relationships"""
    
    speaker_id: str = Field(..., description="Unique speaker identifier")
    name: str = Field(..., description="Speaker full name")
    affiliation: Optional[str] = Field(default=None, description="Institution or organization")
    biography: Optional[str] = Field(default=None, description="Speaker bio or background")
    sessions: Optional[List[str]] = Field(default_factory=list, description="Session IDs speaker presents")
    photo_url: Optional[str] = Field(default=None, description="Speaker photo URL")
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class VenueCard(BaseModel):
    """Venue/room card with session information"""
    
    venue_id: str = Field(..., description="Unique venue identifier")
    name: str = Field(..., description="Venue/room name")
    level: Optional[str] = Field(default=None, description="Floor or level")
    capacity: Optional[int] = Field(default=None, description="Room capacity")
    description: Optional[str] = Field(default=None, description="Venue description")
    sessions_count: Optional[int] = Field(default=None, description="Number of sessions in venue")
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class TopicCard(BaseModel):
    """Topic/theme card with related sessions"""
    
    topic_id: str = Field(..., description="Unique topic identifier")  
    title: str = Field(..., description="Topic title")
    theme_code: Optional[str] = Field(default=None, description="Theme code like T1.1")
    keywords: Optional[List[str]] = Field(default_factory=list, description="Topic keywords")
    sessions_count: Optional[int] = Field(default=None, description="Number of related sessions")
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)


# === WRAPPER LIST MODELS (Required by OpenAI Responses API) ===
# The API requires a single root Pydantic model, so we wrap lists

class SessionCardList(BaseModel):
    """Wrapper for list of session cards - required by Responses API"""
    cards: List[SessionCard] = Field(default_factory=list, description="List of session cards")


class SpeakerCardList(BaseModel):
    """Wrapper for list of speaker cards - required by Responses API"""
    cards: List[SpeakerCard] = Field(default_factory=list, description="List of speaker cards")


class VenueCardList(BaseModel):
    """Wrapper for list of venue cards - required by Responses API"""
    cards: List[VenueCard] = Field(default_factory=list, description="List of venue cards")


class TopicCardList(BaseModel):
    """Wrapper for list of topic cards - required by Responses API"""
    cards: List[TopicCard] = Field(default_factory=list, description="List of topic cards")


# === UNION TYPE FOR FLEXIBILITY ===
CardOutput = Union[SessionCard, SpeakerCard, VenueCard, TopicCard]
