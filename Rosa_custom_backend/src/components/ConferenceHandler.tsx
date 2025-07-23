import React from 'react';
import { useDailyEvent, useDaily } from '@daily-co/daily-react';

// Types for conference data
interface SpeakerInfo {
  id: string;
  name: string;
  title: string;
  organization: string;
  session: string;
  time: string;
  room: string;
  expertise: string[];
  biography: string;
  relevance: string;
  type: string;
}

interface SessionInfo {
  id: string;
  title: string;
  speaker: string;
  speaker_id: string;
  time: string;
  date: string;
  room: string;
  type: string;
  topics: string[];
  description: string;
  capacity: number;
  registration_required: boolean;
}

interface ConferenceHandlerProps {
  onSpeakerUpdate?: (speaker: SpeakerInfo) => void;
  onSessionUpdate?: (session: SessionInfo) => void;
  onScheduleUpdate?: (schedule: any) => void;
  conversationId?: string;
}

// Conference logging utility
const conferenceLog = {
  functionCall: (functionName: string, args: any) => {
    console.log(`%c🏛️ ${functionName}:`, 'color: #2563eb; font-weight: bold;', args);
  },
  
  success: (functionName: string, resultType: string, count?: number) => {
    const countText = count ? ` (${count} items)` : '';
    console.log(`%c✅ ${functionName} success: ${resultType}${countText}`, 'color: #059669; font-weight: bold;');
  },
  
  error: (functionName: string, error: string) => {
    console.log(`%c❌ ${functionName} error: ${error}`, 'color: #dc2626; font-weight: bold;');
  },

  uiUpdate: (type: string, data: any) => {
    console.log(`%c🎨 UI Update: ${type}`, 'color: #7c3aed; font-weight: bold;', data);
  }
};

export const ConferenceHandler: React.FC<ConferenceHandlerProps> = ({ 
  onSpeakerUpdate, 
  onSessionUpdate, 
  onScheduleUpdate,
  conversationId 
}) => {
  const daily = useDaily();

  // Listen for conference-related function calls from Rosa Pattern 1 backend
  useDailyEvent('app-message', async (event: any) => {
    const data = event.data;
    
    // Handle function call results from Rosa Pattern 1 backend
    // The backend processes function calls and sends back app-messages with results
    if (data?.event_type === 'conversation.function_result') {
      const functionName = data.properties?.function_name;
      const functionResult = data.properties?.result;
      const callId = data.properties?.call_id;

      conferenceLog.functionCall(functionName, data.properties?.arguments);

      try {
        if (functionName === 'get_speaker_info' && functionResult?.success) {
          await handleSpeakerResult(functionResult, callId);
        } 
        else if (functionName === 'get_session_info' && functionResult?.success) {
          await handleSessionResult(functionResult, callId);
        }
        else if (functionName === 'get_conference_schedule' && functionResult?.success) {
          await handleScheduleResult(functionResult, callId);
        }
        else if (functionResult && !functionResult.success) {
          conferenceLog.error(functionName, functionResult.message || 'Unknown error');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        conferenceLog.error(functionName, errorMsg);
      }

      // Remove from pending calls
      if (callId) {
        // setPendingFunctionCalls(prev => { // This line was removed as per the edit hint
        //   const newSet = new Set(prev);
        //   newSet.delete(callId);
        //   return newSet;
        // });
      }
    }

    // Handle direct function calls that come through Pattern 1
    // These are parsed function calls that need UI updates
    if (data?.event_type === 'conversation.conference_update') {
      const updateType = data.properties?.update_type;
      const updateData = data.properties?.data;

      conferenceLog.uiUpdate(updateType, updateData);

      try {
        if (updateType === 'speaker_info' && updateData && onSpeakerUpdate) {
          onSpeakerUpdate(updateData);
        }
        else if (updateType === 'session_info' && updateData && onSessionUpdate) {
          onSessionUpdate(updateData);
        }
        else if (updateType === 'schedule' && updateData && onScheduleUpdate) {
          onScheduleUpdate(updateData);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        conferenceLog.error('UI Update', errorMsg);
      }
    }
  });

  // Handle speaker function results
  const handleSpeakerResult = async (result: any, callId?: string) => {
    if (result.type === 'speaker_info' && result.speaker) {
      conferenceLog.success('get_speaker_info', 'single speaker');
      
      // Update UI callback
      if (onSpeakerUpdate) {
        onSpeakerUpdate(result.speaker);
      }

      // Send UI update message
      await sendConferenceUpdate('speaker_info', result.speaker, callId);
    }
    else if (result.type === 'speaker_search' && result.speakers) {
      conferenceLog.success('get_speaker_info', 'speaker search', result.speakers.length);
      
      // For multiple speakers, show the first one or create a summary
      if (result.speakers.length === 1 && onSpeakerUpdate) {
        onSpeakerUpdate(result.speakers[0]);
        await sendConferenceUpdate('speaker_info', result.speakers[0], callId);
      } else {
        // Create speakers list update
        await sendConferenceUpdate('speakers_list', {
          speakers: result.speakers,
          message: result.message
        }, callId);
      }
    }
    else if (result.type === 'speaker_overview' && result.speakers) {
      conferenceLog.success('get_speaker_info', 'speakers overview', result.speakers.length);
      
      await sendConferenceUpdate('speakers_overview', {
        speakers: result.speakers,
        message: result.message
      }, callId);
    }
  };

  // Handle session function results
  const handleSessionResult = async (result: any, callId?: string) => {
    if (result.type === 'session_info' && result.session) {
      conferenceLog.success('get_session_info', 'single session');
      
      if (onSessionUpdate) {
        onSessionUpdate(result.session);
      }

      await sendConferenceUpdate('session_info', result.session, callId);
    }
    else if (result.type === 'session_search' && result.sessions) {
      conferenceLog.success('get_session_info', 'session search', result.sessions.length);
      
      await sendConferenceUpdate('sessions_list', {
        sessions: result.sessions,
        message: result.message
      }, callId);
    }
    else if (result.type === 'session_schedule' && result.sessions) {
      conferenceLog.success('get_session_info', 'session schedule', result.sessions.length);
      
      await sendConferenceUpdate('schedule', {
        sessions: result.sessions,
        time_filter: result.time_filter,
        message: result.message
      }, callId);
    }
  };

  // Handle conference schedule results
  const handleScheduleResult = async (result: any, callId?: string) => {
    conferenceLog.success('get_conference_schedule', 'full schedule');
    
    if (onScheduleUpdate) {
      onScheduleUpdate(result);
    }

    await sendConferenceUpdate('full_schedule', {
      schedule_summary: result.schedule_summary,
      sessions: result.sessions,
      message: result.message
    }, callId);
  };

  // Send conference UI update messages
  const sendConferenceUpdate = async (updateType: string, data: any, callId?: string) => {
    if (daily) {
      await daily.sendAppMessage({
        message_type: 'conference_ui_update',
        event_type: 'conversation.conference_update',
        conversation_id: conversationId,
        properties: {
          update_type: updateType,
          data: data,
          call_id: callId,
          timestamp: Date.now()
        }
      }, '*');
      
      conferenceLog.uiUpdate(updateType, data);
    }
  };

  return null; // This is a headless component
}; 