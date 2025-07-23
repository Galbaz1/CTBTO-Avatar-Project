// Copy exact pattern from existing WeatherHandler.tsx and CTBTOHandler.tsx
import { useDailyEvent } from "@daily-co/daily-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleStore } from './useSimpleStore';

export const SimpleConferenceHandler = () => {
  const { toast } = useToast();
  const { showSpeaker, showVenue } = useSimpleStore();

  useDailyEvent(
    'app-message',
    useCallback((ev: any) => {
      console.log('🏛️ Conference event:', ev);
      
      // CRITICAL: These events come from Python backend function calls, not direct UI events
      // Pattern matches existing WeatherHandler and CTBTOHandler implementations
      
      if (ev.data?.event === 'show_speaker_info') {
        const speakerId = ev.data.data?.speaker_id;
        if (speakerId) {
          showSpeaker(speakerId);
          toast({
            title: 'Speaker profile displayed',
            description: `Showing ${speakerId}`,
          });
        }
      }
      
      if (ev.data?.event === 'show_venue_info') {
        const venueId = ev.data.data?.venue_id;
        if (venueId) {
          showVenue(venueId);
          toast({
            title: 'Venue information displayed', 
            description: `Showing ${venueId}`,
          });
        }
      }
      
      // Future: Add other conference events as Python backend expands
      // - show_schedule, show_route, search_conference, etc.
      
    }, [showSpeaker, showVenue, toast])
  );

  return null;
}; 