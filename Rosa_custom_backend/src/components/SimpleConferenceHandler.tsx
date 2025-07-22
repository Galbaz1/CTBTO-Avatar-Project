import React, { useCallback } from 'react';
import { useDailyEvent } from '@daily-co/daily-react';
import { conference_data } from '../data/conference-data';

interface ConferenceHandlerProps {
  onSpeakerUpdate?: (speaker: any) => void;
  onSessionUpdate?: (session: any) => void;
  onScheduleUpdate?: (schedule: any) => void;
  conversationId?: string;
}

// Simple conference logging
const conferenceLog = {
  responseCheck: (text: string) => {
    console.log(`%c🔍 Checking Rosa response for conference content:`, 'color: #2563eb; font-weight: bold;', text.substring(0, 100) + '...');
  },
  
  speakerDetected: (speakerName: string) => {
    console.log(`%c🎤 Speaker detected in response: ${speakerName}`, 'color: #059669; font-weight: bold;');
  },
  
  uiUpdate: (type: string, data: any) => {
    console.log(`%c🎨 Triggering UI update: ${type}`, 'color: #7c3aed; font-weight: bold;', data);
  }
};

export const SimpleConferenceHandler: React.FC<ConferenceHandlerProps> = ({ 
  onSpeakerUpdate, 
  onSessionUpdate, 
  onScheduleUpdate,
  conversationId 
}) => {

  // Parse Rosa's response for conference information and metadata tags
  const parseConferenceContent = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    let hasUpdate = false;
    
    // PRIORITY 1: Check for Rosa's metadata tags (most reliable)
    if (text.includes('[ROSA_SPEAKER:')) {
      const speakerMatch = text.match(/\[ROSA_SPEAKER:([^\]]+)\]/);
      if (speakerMatch) {
        const speakerId = speakerMatch[1];
        const speaker = conference_data.speakers.find(s => s.id === speakerId);
        if (speaker && onSpeakerUpdate) {
          conferenceLog.speakerDetected(speaker.name + ' (via metadata)');
          conferenceLog.uiUpdate('speaker', speaker);
          onSpeakerUpdate(speaker);
          hasUpdate = true;
        }
      }
    }
    
    if (text.includes('[ROSA_SCHEDULE]')) {
      if (onScheduleUpdate) {
        conferenceLog.uiUpdate('schedule (via metadata)', conference_data.sessions);
        onScheduleUpdate({
          sessions: conference_data.sessions,
          message: "Conference Schedule"
        });
        hasUpdate = true;
      }
    }
    
    // PRIORITY 2: Fallback to text parsing (if no metadata found)
    if (!hasUpdate) {
      // Check for speaker mentions by name
      if (lowerText.includes('dr. sarah chen') || lowerText.includes('sarah chen')) {
        const speaker = conference_data.speakers.find(s => s.name.toLowerCase().includes('sarah chen'));
        if (speaker && onSpeakerUpdate) {
          conferenceLog.speakerDetected('Dr. Sarah Chen (via text parsing)');
          conferenceLog.uiUpdate('speaker', speaker);
          onSpeakerUpdate(speaker);
          hasUpdate = true;
        }
      }

      if (lowerText.includes('prof. mikhail volkov') || lowerText.includes('mikhail volkov')) {
        const speaker = conference_data.speakers.find(s => s.name.toLowerCase().includes('mikhail volkov'));
        if (speaker && onSpeakerUpdate) {
          conferenceLog.speakerDetected('Prof. Mikhail Volkov (via text parsing)');
          conferenceLog.uiUpdate('speaker', speaker);
          onSpeakerUpdate(speaker);
          hasUpdate = true;
        }
      }

      if (lowerText.includes('dr. amira hassan') || lowerText.includes('amira hassan')) {
        const speaker = conference_data.speakers.find(s => s.name.toLowerCase().includes('amira hassan'));
        if (speaker && onSpeakerUpdate) {
          conferenceLog.speakerDetected('Dr. Amira Hassan (via text parsing)');
          conferenceLog.uiUpdate('speaker', speaker);
          onSpeakerUpdate(speaker);
          hasUpdate = true;
        }
      }
      
      // Check for session-related keywords that should show schedule
      if (lowerText.includes('today\'s sessions') || 
          lowerText.includes('session') || 
          lowerText.includes('schedule') ||
          lowerText.includes('morning') ||
          lowerText.includes('afternoon')) {
        
        if (onScheduleUpdate) {
          conferenceLog.uiUpdate('schedule (via text parsing)', conference_data.sessions);
          onScheduleUpdate({
            sessions: conference_data.sessions,
            message: "Conference Schedule"
          });
          hasUpdate = true;
        }
      }
    }
    
    return hasUpdate;
  }, [onSpeakerUpdate, onSessionUpdate, onScheduleUpdate]);

  // Debug: Listen for ALL app-messages to see what we're getting
  useDailyEvent('app-message', useCallback((event: any) => {
    const data = event.data;
    
    // DEBUG: Log all events to see what we're actually receiving
    console.log('🔍 SimpleConferenceHandler received event:', {
      event_type: data?.event_type,
      properties: data?.properties,
      fullData: data
    });
    
    // Listen for Rosa's responses (conversation.respond events)
    if (data?.event_type === 'conversation.respond' && data.properties?.text) {
      const responseText = data.properties.text;
      
      conferenceLog.responseCheck(responseText);
      
      // Parse immediately - no delay needed
      parseConferenceContent(responseText);
    }
    
    // Also check other event types that might contain Rosa's responses
    if (data?.event_type === 'conversation.interrupted' && data.properties?.text) {
      console.log('🔍 Found interrupted response:', data.properties.text);
      parseConferenceContent(data.properties.text);
    }
    
    // Check for any other text-containing events
    if (data?.properties?.text && data.event_type !== 'conversation.respond') {
      console.log('🔍 Found text in other event type:', data.event_type, data.properties.text);
    }
  }, [parseConferenceContent]));

  return null; // This is a headless component
}; 