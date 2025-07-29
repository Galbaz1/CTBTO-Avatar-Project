import React, { useState, useCallback } from 'react';
import { UIDeltaHandler } from '../UIDeltaHandler';
import { HandlerIntegrationManager } from './HandlerIntegrationManager';
import { WeatherHandler } from '../WeatherHandler';

interface IntegrationExampleProps {
  conversationId: string;
  meetingState: string;
}

/**
 * 🎯 ROSA HANDLER INTEGRATION PATTERNS - ARCHITECTURAL DEMONSTRATION
 * 
 * This component demonstrates the three distinct handler patterns in Rosa:
 * 
 * 1. **UIDeltaHandler (Phase 1)** - NEW MICRO-UPDATE PATTERN
 *    - Handles JSON Patch-style micro-updates
 *    - Uses /latest-ui-delta/{session_id} endpoint
 *    - Provides granular, smooth UI updates
 *    - Replaces the old RagHandler
 * 
 * 2. **Individual Card Handlers (Phase 4)** - SPECIFIC POLLING PATTERN  
 *    - SpeakerHandler, TopicHandler, VenueHandler, SessionHandler
 *    - Each polls its own /latest-{type}/{session_id} endpoint
 *    - Provides specific card type data
 *    - Coordinates through HandlerIntegrationManager
 * 
 * 3. **Legacy Tool Handlers** - MAINTAINED FOR COMPATIBILITY
 *    - WeatherHandler (existing tool integration)
 *    - ConferenceHandler (event-based integration)
 * 
 * ARCHITECTURE CHOICE: Use both UIDeltaHandler AND individual handlers
 * - UIDeltaHandler: For AI-driven micro-updates and animations
 * - Individual Handlers: For tool-specific integrations and specific endpoints
 */
export const IntegrationExample: React.FC<IntegrationExampleProps> = ({
  conversationId,
  meetingState
}) => {
  // State for different data sources
  const [deltaCards, setDeltaCards] = useState<any>({});
  const [specificCards, setSpecificCards] = useState<any>({});
  const [weatherData, setWeatherData] = useState<any>(null);

  // Handler for UIDeltaHandler updates (micro-updates)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDeltaUpdate = useCallback((cardData: any, cardType: string) => {
    console.log(`🔄 Delta Update: ${cardType}`, cardData);
    setDeltaCards((_prev: any) => ({
      ..._prev,
      [cardType]: cardData
    }));
  }, []);

  // Handler for specific card type updates (direct endpoints)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSpecificCardUpdate = useCallback((cardData: any, cardType: string) => {
    console.log(`📊 Specific Card Update: ${cardType}`, cardData);
    setSpecificCards((_prev: any) => ({
      ..._prev,
      [cardType]: cardData
    }));
  }, []);

  // Handler for weather updates (legacy pattern)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWeatherUpdate = useCallback((weatherData: any) => {
    console.log('🌤️ Weather Update:', weatherData);
    setWeatherData(weatherData);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🎯 Rosa Handler Integration Architecture</h2>
      
      {/* PATTERN 1: UIDeltaHandler - Phase 1 Micro-Updates */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px' }}>
        <h3>🔄 UIDeltaHandler (Phase 1 - NEW PATTERN)</h3>
        <p>Handles micro-updates via JSON Patch operations from /latest-ui-delta/{conversationId}</p>
        <UIDeltaHandler
          conversationId={conversationId}
          onCardUpdate={handleDeltaUpdate}
          meetingState={meetingState}
        />
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          <strong>Delta Cards:</strong> {Object.keys(deltaCards).join(', ') || 'None'}
        </div>
      </section>

      {/* PATTERN 2: Individual Card Handlers - Phase 4 Specific Polling */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '2px solid #2196F3', borderRadius: '8px' }}>
        <h3>📊 Individual Card Handlers (Phase 4 - SPECIFIC PATTERN)</h3>
        <p>Specific handlers for each card type, coordinated through HandlerIntegrationManager</p>
        <HandlerIntegrationManager
          conversationId={conversationId}
          meetingState={meetingState}
          onCardUpdate={handleSpecificCardUpdate}
          enabledHandlers={{
            session: true,
            speaker: true,
            topic: true,
            venue: true
          }}
        />
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          <strong>Specific Cards:</strong> {Object.keys(specificCards).join(', ') || 'None'}
        </div>
      </section>

      {/* PATTERN 3: Legacy Tool Handlers - Maintained for Compatibility */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '2px solid #FF9800', borderRadius: '8px' }}>
        <h3>🌤️ Legacy Tool Handlers (COMPATIBILITY)</h3>
        <p>Existing tool integrations like WeatherHandler</p>
        <WeatherHandler
          conversationId={conversationId}
          onWeatherUpdate={handleWeatherUpdate}
        />
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          <strong>Weather Data:</strong> {weatherData ? 'Available' : 'None'}
        </div>
      </section>

      {/* Architecture Summary */}
      <section style={{ padding: '15px', border: '2px solid #9C27B0', borderRadius: '8px' }}>
        <h3>🏗️ Architecture Summary</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>UIDeltaHandler:</strong> AI-driven micro-updates, animations, Phase 1 delta system</li>
          <li><strong>Individual Handlers:</strong> Tool-specific data, direct endpoints, coordinated polling</li>
          <li><strong>Legacy Handlers:</strong> Existing tools (weather, conference), maintained compatibility</li>
        </ul>
        <p><strong>Key Insight:</strong> All three patterns can coexist. They serve different architectural needs.</p>
      </section>
    </div>
  );
}; 