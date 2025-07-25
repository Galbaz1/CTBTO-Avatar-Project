// TimetableProcessor.ts - Utility to convert timetable.json into card data structures

export interface TimetableEntry {
  session_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  date: string;
  venue: string;
  session_type: string;
  speakers: string[];
  theme: string;
  track: string;
  audience_level: string;
  day_of_week: string;
  time_of_day: string;
  duration_minutes: number;
  has_speakers: boolean;
  is_interactive: boolean;
  is_social: boolean;
  is_technical: boolean;
  speaker_count: number;
  related_topics?: string[];
  search_keywords?: string[];
}

export interface TimetableData {
  total_entries: number;
  entries: TimetableEntry[];
}

// Session Card Data (direct mapping)
export interface SessionCardData extends TimetableEntry {}

// Speaker Card Data
export interface SpeakerCardData {
  name: string;
  sessions: {
    session_id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    venue: string;
    session_type: string;
    theme: string;
    track: string;
    is_keynote?: boolean;
  }[];
  totalSessions: number;
  tracks: string[];
  themes: string[];
  bio?: string;
  organization?: string;
  expertise?: string[];
}

// Venue Card Data
export interface VenueCardData {
  name: string;
  sessions: {
    session_id: string;
    title: string;
    start_time: string;
    end_time: string;
    date: string;
    day_of_week: string;
    time_of_day: string;
    session_type: string;
    speakers: string[];
    theme: string;
    track: string;
    duration_minutes: number;
    is_interactive: boolean;
    is_technical: boolean;
    audience_level: string;
  }[];
  totalSessions: number;
  sessionTypes: string[];
  tracks: string[];
  capacity?: number;
  location?: string;
  facilities?: string[];
  description?: string;
}

// Topic Card Data
export interface TopicCardData {
  theme: string;
  sessions: {
    session_id: string;
    title: string;
    start_time: string;
    end_time: string;
    date: string;
    day_of_week: string;
    venue: string;
    session_type: string;
    speakers: string[];
    track: string;
    duration_minutes: number;
    is_interactive: boolean;
    is_technical: boolean;
    audience_level: string;
  }[];
  totalSessions: number;
  relatedTopics?: string[];
  tracks: string[];
  speakers: string[];
  totalSpeakers: number;
  sessionTypes: string[];
  description?: string;
  expertiseLevel?: string;
  popularityScore?: number;
}

// Schedule Card Data
export interface ScheduleCardData {
  title: string;
  sessions: {
    session_id: string;
    title: string;
    start_time: string;
    end_time: string;
    date: string;
    day_of_week: string;
    time_of_day: string;
    venue: string;
    session_type: string;
    speakers: string[];
    theme: string;
    track: string;
    duration_minutes: number;
    is_interactive: boolean;
    is_technical: boolean;
    is_social: boolean;
    audience_level: string;
  }[];
  dateRange?: {
    start: string;
    end: string;
  };
  totalDays?: number;
  totalSessions: number;
}

export class TimetableProcessor {
  private timetableData: TimetableData;

  constructor(timetableData: TimetableData) {
    this.timetableData = timetableData;
  }

  // Process all speakers from timetable
  getAllSpeakers(): SpeakerCardData[] {
    const speakerMap = new Map<string, SpeakerCardData>();

    this.timetableData.entries.forEach(session => {
      session.speakers.forEach(speakerName => {
        if (!speakerMap.has(speakerName)) {
          speakerMap.set(speakerName, {
            name: speakerName,
            sessions: [],
            totalSessions: 0,
            tracks: [],
            themes: [],
            bio: this.generateSpeakerBio(speakerName),
            organization: this.extractOrganization(speakerName)
          });
        }

        const speaker = speakerMap.get(speakerName)!;
        speaker.sessions.push({
          session_id: session.session_id,
          title: session.title,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          venue: session.venue,
          session_type: session.session_type,
          theme: session.theme,
          track: session.track,
          is_keynote: session.session_type === 'Keynote'
        });

        // Update aggregated data
        if (!speaker.tracks.includes(session.track)) {
          speaker.tracks.push(session.track);
        }
        if (!speaker.themes.includes(session.theme)) {
          speaker.themes.push(session.theme);
        }
      });
    });

    // Finalize speaker data
    speakerMap.forEach(speaker => {
      speaker.totalSessions = speaker.sessions.length;
    });

    return Array.from(speakerMap.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }

  // Process all venues from timetable
  getAllVenues(): VenueCardData[] {
    const venueMap = new Map<string, VenueCardData>();

    this.timetableData.entries.forEach(session => {
      if (!venueMap.has(session.venue)) {
        venueMap.set(session.venue, {
          name: session.venue,
          sessions: [],
          totalSessions: 0,
          sessionTypes: [],
          tracks: [],
          capacity: this.getVenueCapacity(session.venue),
          location: 'Hofburg Palace, Vienna',
          facilities: this.getVenueFacilities(session.venue),
          description: this.getVenueDescription(session.venue)
        });
      }

      const venue = venueMap.get(session.venue)!;
      venue.sessions.push({
        session_id: session.session_id,
        title: session.title,
        start_time: session.start_time,
        end_time: session.end_time,
        date: session.date,
        day_of_week: session.day_of_week,
        time_of_day: session.time_of_day,
        session_type: session.session_type,
        speakers: session.speakers,
        theme: session.theme,
        track: session.track,
        duration_minutes: session.duration_minutes,
        is_interactive: session.is_interactive,
        is_technical: session.is_technical,
        audience_level: session.audience_level
      });

      // Update aggregated data
      if (!venue.sessionTypes.includes(session.session_type)) {
        venue.sessionTypes.push(session.session_type);
      }
      if (!venue.tracks.includes(session.track)) {
        venue.tracks.push(session.track);
      }
    });

    // Finalize venue data
    venueMap.forEach(venue => {
      venue.totalSessions = venue.sessions.length;
    });

    return Array.from(venueMap.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }

  // Process all topics/themes from timetable
  getAllTopics(): TopicCardData[] {
    const topicMap = new Map<string, TopicCardData>();

    this.timetableData.entries.forEach(session => {
      if (!topicMap.has(session.theme)) {
        topicMap.set(session.theme, {
          theme: session.theme,
          sessions: [],
          totalSessions: 0,
          relatedTopics: [],
          tracks: [],
          speakers: [],
          totalSpeakers: 0,
          sessionTypes: [],
          description: this.getTopicDescription(session.theme),
          popularityScore: this.calculatePopularityScore(session.theme)
        });
      }

      const topic = topicMap.get(session.theme)!;
      topic.sessions.push({
        session_id: session.session_id,
        title: session.title,
        start_time: session.start_time,
        end_time: session.end_time,
        date: session.date,
        day_of_week: session.day_of_week,
        venue: session.venue,
        session_type: session.session_type,
        speakers: session.speakers,
        track: session.track,
        duration_minutes: session.duration_minutes,
        is_interactive: session.is_interactive,
        is_technical: session.is_technical,
        audience_level: session.audience_level
      });

      // Update aggregated data
      session.speakers.forEach(speaker => {
        if (!topic.speakers.includes(speaker)) {
          topic.speakers.push(speaker);
        }
      });
      
      if (!topic.tracks.includes(session.track)) {
        topic.tracks.push(session.track);
      }
      if (!topic.sessionTypes.includes(session.session_type)) {
        topic.sessionTypes.push(session.session_type);
      }
    });

    // Finalize topic data and add related topics
    topicMap.forEach(topic => {
      topic.totalSessions = topic.sessions.length;
      topic.totalSpeakers = topic.speakers.length;
      topic.relatedTopics = this.findRelatedTopics(topic.theme, Array.from(topicMap.keys()));
    });

    return Array.from(topicMap.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }

  // Create schedule data
  getScheduleData(): ScheduleCardData {
    const sessions = this.timetableData.entries.map(session => ({
      session_id: session.session_id,
      title: session.title,
      start_time: session.start_time,
      end_time: session.end_time,
      date: session.date,
      day_of_week: session.day_of_week,
      time_of_day: session.time_of_day,
      venue: session.venue,
      session_type: session.session_type,
      speakers: session.speakers,
      theme: session.theme,
      track: session.track,
      duration_minutes: session.duration_minutes,
      is_interactive: session.is_interactive,
      is_technical: session.is_technical,
      is_social: session.is_social,
      audience_level: session.audience_level
    }));

    // Calculate date range
    const dates = sessions.map(s => s.date).sort();
    const uniqueDates = [...new Set(dates)];

    return {
      title: 'CTBT: Science and Technology Conference 2025',
      sessions,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1]
      },
      totalDays: uniqueDates.length,
      totalSessions: sessions.length
    };
  }

  // Get specific session by ID
  getSessionById(sessionId: string): SessionCardData | undefined {
    return this.timetableData.entries.find(session => session.session_id === sessionId);
  }

  // Get sessions by speaker
  getSessionsBySpeaker(speakerName: string): SessionCardData[] {
    return this.timetableData.entries.filter(session => 
      session.speakers.includes(speakerName)
    );
  }

  // Get sessions by venue
  getSessionsByVenue(venueName: string): SessionCardData[] {
    return this.timetableData.entries.filter(session => 
      session.venue === venueName
    );
  }

  // Get sessions by theme
  getSessionsByTheme(theme: string): SessionCardData[] {
    return this.timetableData.entries.filter(session => 
      session.theme === theme
    );
  }

  // Helper methods for enriching data
  private generateSpeakerBio(speakerName: string): string {
    const titles = ['Dr.', 'Prof.', 'Ambassador', 'CEO', 'CTO', 'Col.'];
    const hasTitle = titles.some(title => speakerName.includes(title));
    
    if (hasTitle) {
      if (speakerName.includes('Dr.') || speakerName.includes('Prof.')) {
        return `Renowned expert in nuclear monitoring and verification technologies with extensive research experience.`;
      } else if (speakerName.includes('Ambassador')) {
        return `Distinguished diplomat with expertise in international nuclear policy and verification frameworks.`;
      } else if (speakerName.includes('CEO') || speakerName.includes('CTO')) {
        return `Technology leader driving innovation in nuclear monitoring and detection systems.`;
      }
    }
    return `Expert researcher contributing to advancements in nuclear monitoring science and technology.`;
  }

  private extractOrganization(speakerName: string): string {
    // In a real implementation, this could use NLP or a database lookup
    // For now, provide generic organizations based on title
    if (speakerName.includes('Prof.') || speakerName.includes('Dr.')) {
      return 'Research Institution';
    } else if (speakerName.includes('Ambassador')) {
      return 'Government Representative';
    } else if (speakerName.includes('CEO') || speakerName.includes('CTO')) {
      return 'Technology Company';
    }
    return 'CTBTO Organization';
  }

  private getVenueCapacity(venueName: string): number {
    const capacityMap: { [key: string]: number } = {
      'Festsaal': 500,
      'Forum': 300,
      'Conference Room A': 150,
      'Conference Room B': 150,
      'Computer Lab': 50,
      'Training Center': 100,
      'Exhibition Hall': 400,
      'Banquet Hall': 300,
      'Innovation Hub': 75,
      'Simulation Center': 80,
      'Cultural Hall': 250
    };
    return capacityMap[venueName] || 100;
  }

  private getVenueFacilities(venueName: string): string[] {
    const facilityMap: { [key: string]: string[] } = {
      'Computer Lab': ['High-speed Internet', 'Workstations', 'Projection', 'Audio/Visual'],
      'Training Center': ['Interactive Whiteboards', 'Breakout Rooms', 'Equipment Storage'],
      'Exhibition Hall': ['Display Space', 'Catering Area', 'Storage'],
      'Festsaal': ['Stage', 'Audio System', 'Live Streaming', 'VIP Seating'],
      'Innovation Hub': ['Demo Stations', 'Networking Area', 'Flexible Seating']
    };
    return facilityMap[venueName] || ['Standard A/V Equipment', 'WiFi', 'Climate Control'];
  }

  private getVenueDescription(venueName: string): string {
    const descriptionMap: { [key: string]: string } = {
      'Festsaal': 'Grand ceremonial hall perfect for keynotes and major presentations.',
      'Forum': 'Modern conference space designed for panel discussions and collaborative sessions.',
      'Computer Lab': 'State-of-the-art computer laboratory equipped for hands-on technical workshops.',
      'Training Center': 'Dedicated training facility with specialized equipment for practical exercises.',
      'Innovation Hub': 'Dynamic space designed to showcase cutting-edge technologies and startup innovations.'
    };
    return descriptionMap[venueName] || 'Professional conference venue with modern amenities.';
  }

  private getTopicDescription(theme: string): string {
    const descriptionMap: { [key: string]: string } = {
      'Nuclear Monitoring': 'Advanced techniques and technologies for detecting and monitoring nuclear activities.',
      'Quantum Technology': 'Revolutionary quantum sensors and computing applications for nuclear verification.',
      'AI Ethics': 'Ethical considerations and frameworks for deploying AI in nuclear monitoring systems.',
      'Seismic Analysis': 'Seismic detection and analysis methods for nuclear test monitoring.',
      'Signal Processing': 'Advanced signal processing techniques for nuclear monitoring data.',
      'Data Science': 'Data fusion, analysis, and machine learning applications in nuclear verification.'
    };
    return descriptionMap[theme] || `Comprehensive exploration of ${theme} in nuclear monitoring context.`;
  }

  private calculatePopularityScore(theme: string): number {
    // Calculate based on number of sessions, keynotes, etc.
    const themeSessions = this.timetableData.entries.filter(s => s.theme === theme);
    const hasKeynote = themeSessions.some(s => s.session_type === 'Keynote');
    const sessionCount = themeSessions.length;
    
    return hasKeynote ? sessionCount * 1.5 : sessionCount;
  }

  private findRelatedTopics(currentTheme: string, allThemes: string[]): string[] {
    // Simple keyword-based relationship detection
    const keywords = currentTheme.toLowerCase().split(' ');
    return allThemes
      .filter(theme => theme !== currentTheme)
      .filter(theme => {
        const themeWords = theme.toLowerCase().split(' ');
        return keywords.some(keyword => themeWords.some(word => word.includes(keyword)));
      })
      .slice(0, 3); // Limit to 3 related topics
  }

  // Statistics and analysis methods
  getOverallStats() {
    const sessions = this.timetableData.entries;
    const totalSessions = sessions.length;
    const uniqueSpeakers = new Set(sessions.flatMap(s => s.speakers)).size;
    const uniqueVenues = new Set(sessions.map(s => s.venue)).size;
    const uniqueThemes = new Set(sessions.map(s => s.theme)).size;
    const uniqueTracks = new Set(sessions.map(s => s.track)).size;
    const interactiveSessions = sessions.filter(s => s.is_interactive).length;
    const technicalSessions = sessions.filter(s => s.is_technical).length;
    const socialSessions = sessions.filter(s => s.is_social).length;

    return {
      totalSessions,
      uniqueSpeakers,
      uniqueVenues,
      uniqueThemes,
      uniqueTracks,
      interactiveSessions,
      technicalSessions,
      socialSessions,
      averageDuration: sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / totalSessions
    };
  }
} 