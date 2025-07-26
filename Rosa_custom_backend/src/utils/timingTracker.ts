// ROSA Conversation Timing Tracker
// Tracks key latencies in the conversation pipeline

interface TimingEvent {
  timestamp: number;
  sessionId: string;
  data?: any;
}

interface ConversationTiming {
  userStoppedSpeaking?: TimingEvent;
  backendReceived?: TimingEvent;
  llmFirstToken?: TimingEvent;
  avatarStartedSpeaking?: TimingEvent;
  cardDisplayed?: TimingEvent;
}

class ConversationTimingTracker {
  private sessions: Map<string, ConversationTiming> = new Map();

  // Record when user stops speaking
  recordUserStoppedSpeaking(sessionId: string) {
    if (!sessionId) return;
    
    const timing = this.getOrCreateTiming(sessionId);
    timing.userStoppedSpeaking = {
      timestamp: performance.now(),
      sessionId
    };
    
    console.log(`⏱️ [${sessionId.slice(0, 8)}] USER_STOPPED_SPEAKING`);
  }

  // Record when backend receives request
  recordBackendReceived(sessionId: string, userMessage: string) {
    if (!sessionId) return;
    
    const timing = this.getOrCreateTiming(sessionId);
    timing.backendReceived = {
      timestamp: performance.now(),
      sessionId,
      data: { userMessage: userMessage.slice(0, 50) }
    };
    
    // Calculate speech-to-backend latency
    if (timing.userStoppedSpeaking) {
      const latency = timing.backendReceived.timestamp - timing.userStoppedSpeaking.timestamp;
      console.log(`⏱️ [${sessionId.slice(0, 8)}] SPEECH_TO_BACKEND: ${latency.toFixed(0)}ms`);
    }
  }

  // Record when LLM starts streaming response
  recordLLMFirstToken(sessionId: string) {
    if (!sessionId) return;
    
    const timing = this.getOrCreateTiming(sessionId);
    timing.llmFirstToken = {
      timestamp: performance.now(),
      sessionId
    };
    
    // Calculate processing latency (user stop → LLM start)
    if (timing.userStoppedSpeaking) {
      const latency = timing.llmFirstToken.timestamp - timing.userStoppedSpeaking.timestamp;
      console.log(`⏱️ [${sessionId.slice(0, 8)}] USER_TO_LLM: ${latency.toFixed(0)}ms`);
    }
  }

  // Record when avatar starts speaking
  recordAvatarStartedSpeaking(sessionId: string) {
    if (!sessionId) return;
    
    const timing = this.getOrCreateTiming(sessionId);
    timing.avatarStartedSpeaking = {
      timestamp: performance.now(),
      sessionId
    };
    
    // Calculate total response latency (user stop → avatar start)
    if (timing.userStoppedSpeaking) {
      const totalLatency = timing.avatarStartedSpeaking.timestamp - timing.userStoppedSpeaking.timestamp;
      console.log(`⏱️ [${sessionId.slice(0, 8)}] 🎯 TOTAL_RESPONSE_TIME: ${totalLatency.toFixed(0)}ms`);
    }
    
    // Calculate TTS latency (LLM → avatar speech)
    if (timing.llmFirstToken) {
      const ttsLatency = timing.avatarStartedSpeaking.timestamp - timing.llmFirstToken.timestamp;
      console.log(`⏱️ [${sessionId.slice(0, 8)}] LLM_TO_SPEECH: ${ttsLatency.toFixed(0)}ms`);
    }
  }

  // Record when card is displayed
  recordCardDisplayed(sessionId: string, cardType: string) {
    if (!sessionId) return;
    
    const timing = this.getOrCreateTiming(sessionId);
    timing.cardDisplayed = {
      timestamp: performance.now(),
      sessionId,
      data: { cardType }
    };
    
    // Calculate card rendering latency
    if (timing.llmFirstToken) {
      const cardLatency = timing.cardDisplayed.timestamp - timing.llmFirstToken.timestamp;
      console.log(`⏱️ [${sessionId.slice(0, 8)}] CARD_RENDER_TIME: ${cardLatency.toFixed(0)}ms (${cardType})`);
    }
  }

  // Get comprehensive timing summary
  getTimingSummary(sessionId: string): string | null {
    const timing = this.sessions.get(sessionId);
    if (!timing || !timing.userStoppedSpeaking || !timing.avatarStartedSpeaking) {
      return null;
    }

    const total = timing.avatarStartedSpeaking.timestamp - timing.userStoppedSpeaking.timestamp;
    const parts = [];
    
    if (timing.llmFirstToken) {
      const processing = timing.llmFirstToken.timestamp - timing.userStoppedSpeaking.timestamp;
      const tts = timing.avatarStartedSpeaking.timestamp - timing.llmFirstToken.timestamp;
      parts.push(`Processing: ${processing.toFixed(0)}ms`);
      parts.push(`TTS: ${tts.toFixed(0)}ms`);
    }
    
    return `Total: ${total.toFixed(0)}ms (${parts.join(', ')})`;
  }

  // Clean up old sessions
  cleanup(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  private getOrCreateTiming(sessionId: string): ConversationTiming {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {});
    }
    return this.sessions.get(sessionId)!;
  }
}

// Global timing tracker instance
export const timingTracker = new ConversationTimingTracker();

// Helper function for backend timing
export const markBackendTiming = (sessionId: string, event: string) => {
  if (!sessionId) return;
  
  const timestamp = performance.now();
  console.log(`⏱️ [${sessionId.slice(0, 8)}] BACKEND_${event.toUpperCase()}: ${timestamp.toFixed(0)}ms`);
}; 