import React, { useEffect } from 'react';
import type { VenueCardData } from '../../cards/enhanced/TimetableProcessor';

interface VenueHandlerProps {
  meetingState: string;
  conversationId: string;
  onVenueUpdate: (venueData: VenueCardData) => void;
}

export const VenueHandler: React.FC<VenueHandlerProps> = ({
  meetingState,
  conversationId,
  onVenueUpdate
}) => {
  useEffect(() => {
    if (meetingState !== 'joined-meeting') return;

    let lastVenueData: VenueCardData | null = null;

    const pollVenueData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/latest-venue/${conversationId}`);
        if (response.ok) {
          const venueData = await response.json();
          
          // Only update if data has changed (deep comparison for venue data)
          if (venueData && JSON.stringify(venueData) !== JSON.stringify(lastVenueData)) {
            lastVenueData = venueData;
            onVenueUpdate(venueData);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch venue data:', error);
      }
    };

    // Start polling every 2 seconds (exact weather pattern)
    const interval = setInterval(pollVenueData, 2000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [meetingState, conversationId, onVenueUpdate]);

  // This component doesn't render anything - it's just a data handler
  return null;
}; 