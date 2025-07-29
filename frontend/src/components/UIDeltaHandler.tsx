import React, { useState, useEffect, useRef } from 'react';
import { produce } from 'immer';

interface DeltaOperation {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value?: any;
  timestamp: number;
}

interface DeltaResponse {
  deltas: DeltaOperation[];
  timestamp: number;
  session_id: string;
  error?: string;
}

interface CardState {
  latest_session?: any;
  latest_speaker?: any;
  latest_topic?: any;
  latest_venue?: any;
}

interface UIDeltaHandlerProps {
  conversationId: string;
  onCardUpdate: (cardData: any, cardType: string) => void;
  meetingState?: string;
}

/**
 * 🆕 PHASE 1: UIDeltaHandler - Intelligent Delta Processing
 * 
 * Replaces RagHandler with sophisticated micro-update capabilities.
 * Implements JSON Patch-style operations for efficient UI updates
 * following 2025 LLM-UI best practices.
 */
export const UIDeltaHandler: React.FC<UIDeltaHandlerProps> = ({
  conversationId,
  onCardUpdate,
  meetingState
}) => {
  const [cardState, setCardState] = useState<CardState>({});
  const [deltaStats, setDeltaStats] = useState({ 
    totalDeltas: 0, 
    lastDeltaCount: 0,
    lastUpdateType: '' 
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const applyDelta = (operation: DeltaOperation, currentState: CardState): CardState => {
    /**
     * Apply a single delta operation to the card state using immer
     * Supports JSON Patch-style operations for granular updates
     */
    return produce(currentState, draft => {
      const pathParts = operation.path.split('/').filter(Boolean);
      
      if (pathParts.length === 0) return;

      try {
        switch (operation.op) {
          case 'replace':
            if (pathParts.length === 1) {
              // Full card replacement
              const cardType = pathParts[0] as keyof CardState;
              draft[cardType] = operation.value;
            } else if (pathParts.length === 2) {
              // Property-level update (micro-update)
              const cardType = pathParts[0] as keyof CardState;
              const property = pathParts[1];
              
              if (draft[cardType]) {
                (draft[cardType] as any)[property] = operation.value;
              }
            }
            break;
            
          case 'add':
            // Handle array additions (e.g., adding speakers)
            if (pathParts.length === 2) {
              const cardType = pathParts[0] as keyof CardState;
              const property = pathParts[1];
              
              if (draft[cardType]) {
                const currentValue = (draft[cardType] as any)[property];
                if (Array.isArray(currentValue)) {
                  currentValue.push(operation.value);
                } else {
                  (draft[cardType] as any)[property] = operation.value;
                }
              }
            }
            break;
            
          case 'remove':
            // Handle removals
            if (pathParts.length === 1) {
              const cardType = pathParts[0] as keyof CardState;
              delete draft[cardType];
            }
            break;
        }
        
        console.log(`🔄 Applied ${operation.op} to ${operation.path}`);
      } catch (error) {
        console.error(`❌ Failed to apply delta ${operation.op} to ${operation.path}:`, error);
      }
    });
  };

  const processDeltaResponse = async (deltaResponse: DeltaResponse) => {
    /**
     * Process a batch of delta operations and trigger UI updates
     */
    if (!deltaResponse.deltas || deltaResponse.deltas.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${deltaResponse.deltas.length} delta operations`);
    
    let newState = cardState;
    const cardTypesUpdated = new Set<string>();

    // Apply all deltas sequentially
    for (const delta of deltaResponse.deltas) {
      newState = applyDelta(delta, newState);
      
      // Track which card types were updated for notifications
      const cardType = delta.path.split('/')[1];
      if (cardType) {
        cardTypesUpdated.add(cardType);
      }
    }

    // Update state once after all deltas are applied
    setCardState(newState);
    setDeltaStats({
      totalDeltas: deltaStats.totalDeltas + deltaResponse.deltas.length,
      lastDeltaCount: deltaResponse.deltas.length,
      lastUpdateType: Array.from(cardTypesUpdated).join(', ')
    });

    // Notify parent component of updates for each card type
    for (const cardType of cardTypesUpdated) {
      const cardData = (newState as any)[cardType];
      if (cardData) {
        onCardUpdate(cardData, cardType.replace('latest_', ''));
      }
    }
  };

  const pollDeltas = async () => {
    /**
     * Poll the new delta endpoint for micro-updates
     */
    if (!conversationId) return;

    try {
      const response = await fetch(`http://localhost:8000/latest-ui-delta/${conversationId}`);
      
      if (response.ok) {
        const deltaResponse: DeltaResponse = await response.json();
        
        if (deltaResponse.error) {
          console.error('❌ Delta endpoint error:', deltaResponse.error);
          return;
        }

        await processDeltaResponse(deltaResponse);
      } else {
        console.warn('⚠️ Delta endpoint returned non-OK status:', response.status);
      }
    } catch (error) {
      console.error('❌ Delta polling failed:', error);
    }
  };

  // Polling effect - only active when in meeting
  useEffect(() => {
    if (meetingState === 'joined-meeting' && conversationId) {
      console.log('🔄 Starting delta polling for session:', conversationId);
      
      // Initial poll
      pollDeltas();
      
      // Set up 2-second polling interval
      intervalRef.current = setInterval(pollDeltas, 2000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          console.log('🛑 Stopped delta polling');
        }
      };
    } else {
      // Clear polling when not in meeting
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [meetingState, conversationId]);

  // Debug info (remove in production)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '100px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '10px',
        zIndex: 9999
      }}>
        <div>🔄 Delta Handler Active</div>
        <div>Session: {conversationId}</div>
        <div>State: {meetingState}</div>
        <div>Total Deltas: {deltaStats.totalDeltas}</div>
        <div>Last Update: {deltaStats.lastDeltaCount} ops ({deltaStats.lastUpdateType})</div>
        <div>Cards: {Object.keys(cardState).length}</div>
      </div>
    );
  }

  return null; // Handler component - no visual output
};

export default UIDeltaHandler; 