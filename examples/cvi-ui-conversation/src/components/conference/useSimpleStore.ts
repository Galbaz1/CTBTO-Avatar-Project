// Copy exact pattern from examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/useStore.ts
import { create } from "zustand";
import { SIMPLE_SPEAKERS, SIMPLE_VENUES } from './simpleData';

interface SimpleConferenceState {
  currentPanel: 'welcome' | 'speaker' | 'venue';
  currentSpeaker: any | null;
  currentVenue: any | null;
  
  // Simple actions like in useStore.ts lines 44-85
  showSpeaker: (speakerId: string) => void;
  showVenue: (venueId: string) => void;
  resetToWelcome: () => void;
}

export const useSimpleStore = create<SimpleConferenceState>((set) => ({
  currentPanel: 'welcome',
  currentSpeaker: null,
  currentVenue: null,
  
  showSpeaker: (speakerId) => {
    const speaker = SIMPLE_SPEAKERS.find(s => s.id === speakerId);
    set({ currentPanel: 'speaker', currentSpeaker: speaker });
  },
  
  showVenue: (venueId) => {
    const venue = SIMPLE_VENUES.find(v => v.id === venueId);
    set({ currentPanel: 'venue', currentVenue: venue });
  },
  
  resetToWelcome: () => set({ 
    currentPanel: 'welcome', 
    currentSpeaker: null, 
    currentVenue: null 
  }),
})); 