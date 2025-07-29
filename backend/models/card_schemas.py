from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SessionCard(BaseModel):
    """Structured session card data for frontend display"""
    id: str = Field(description="Unique session identifier")
    title: str = Field(description="Session title")
    description: Optional[str] = Field(default=None, description="Session description")
    start_time: Optional[str] = Field(default=None, description="Session start time")
    end_time: Optional[str] = Field(default=None, description="Session end time")
    duration_minutes: Optional[int] = Field(default=None, description="Session duration in minutes")
    room: Optional[str] = Field(default=None, description="Room/venue name")
    building: Optional[str] = Field(default=None, description="Building name")
    session_type: Optional[str] = Field(default=None, description="Type of session")
    theme_code: Optional[str] = Field(default=None, description="Theme code")
    speakers: List[str] = Field(default_factory=list, description="List of speaker names")
    has_speakers: bool = Field(default=False, description="Whether session has speakers")
    related_topics: List[str] = Field(default_factory=list, description="Related topic areas")
    relevance_score: float = Field(default=0.0, description="Relevance score to user query (0-1)")
    
    @field_validator('relevance_score')
    @classmethod
    def validate_relevance_score(cls, v):
        """Validate relevance score is between 0 and 1"""
        if v < 0:
            return 0.0
        elif v > 1:
            return 1.0
        return v


class SpeakerCard(BaseModel):
    """Structured speaker card data for frontend display"""
    id: str = Field(description="Unique speaker identifier")
    name: str = Field(description="Speaker full name")
    title: Optional[str] = Field(default=None, description="Professional title")
    affiliation: Optional[str] = Field(default=None, description="Organization/institution")
    bio: Optional[str] = Field(default=None, description="Speaker biography")
    expertise: List[str] = Field(default_factory=list, description="Areas of expertise")
    total_sessions: int = Field(default=0, description="Number of sessions speaker is presenting")
    sessions: List[str] = Field(default_factory=list, description="Session titles")
    relevance_score: float = Field(default=0.0, description="Relevance score to user query (0-1)")
    
    @field_validator('relevance_score')
    @classmethod
    def validate_relevance_score(cls, v):
        """Validate relevance score is between 0 and 1"""
        if v < 0:
            return 0.0
        elif v > 1:
            return 1.0
        return v


class VenueCard(BaseModel):
    """Structured venue card data for frontend display"""
    id: str = Field(description="Unique venue identifier")
    name: str = Field(description="Venue/room name")
    building: Optional[str] = Field(default=None, description="Building name")
    capacity: Optional[int] = Field(default=None, description="Room capacity")
    description: Optional[str] = Field(default=None, description="Venue description")
    accessibility: Optional[str] = Field(default=None, description="Accessibility information")
    sessions_count: int = Field(default=0, description="Number of sessions in this venue")
    current_session: Optional[str] = Field(default=None, description="Current session title")
    next_session: Optional[str] = Field(default=None, description="Next session title")
    relevance_score: float = Field(default=0.0, description="Relevance score to user query (0-1)")
    
    @field_validator('relevance_score')
    @classmethod
    def validate_relevance_score(cls, v):
        """Validate relevance score is between 0 and 1"""
        if v < 0:
            return 0.0
        elif v > 1:
            return 1.0
        return v


class TopicCard(BaseModel):
    """Structured topic card data for frontend display"""
    id: str = Field(description="Unique topic identifier")
    title: str = Field(description="Topic title")
    theme_code: Optional[str] = Field(default=None, description="Theme code")
    description: Optional[str] = Field(default=None, description="Topic description")
    keywords: List[str] = Field(default_factory=list, description="Related keywords")
    sessions_count: int = Field(default=0, description="Number of sessions under this topic")
    related_sessions: List[str] = Field(default_factory=list, description="Related session titles")
    relevance_score: float = Field(default=0.0, description="Relevance score to user query (0-1)")
    
    @field_validator('relevance_score')
    @classmethod
    def validate_relevance_score(cls, v):
        """Validate relevance score is between 0 and 1"""
        if v < 0:
            return 0.0
        elif v > 1:
            return 1.0
        return v


# List wrapper classes for OpenAI Structured Outputs API
class SessionCardList(BaseModel):
    """Container for multiple session cards"""
    cards: List[SessionCard] = Field(description="List of session cards")


class SpeakerCardList(BaseModel):
    """Container for multiple speaker cards"""
    cards: List[SpeakerCard] = Field(description="List of speaker cards")


class VenueCardList(BaseModel):
    """Container for multiple venue cards"""
    cards: List[VenueCard] = Field(description="List of venue cards")


class TopicCardList(BaseModel):
    """Container for multiple topic cards"""
    cards: List[TopicCard] = Field(description="List of topic cards")
