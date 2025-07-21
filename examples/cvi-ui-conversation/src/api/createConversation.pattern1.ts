import type { IConversation } from '@/types';

// Enhanced logging for API calls
const logApiCall = (event: string, data: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const logPrefix = `🌐 TAVUS API ${event.toUpperCase()}`;
  const style = level === 'error' ? 'color: #ff4757; font-weight: bold;' : 
                level === 'warn' ? 'color: #ffa502; font-weight: bold;' :
                'color: #00d2d3; font-weight: bold;';
  
  console.group(`%c${logPrefix} [${timestamp}]`, style);
  console.log('📋 Data:', data);
  console.groupEnd();
};

export const createConversation = async (
  apiKey: string
): Promise<IConversation> => {
  try {
    if (!apiKey) {
      logApiCall('validation-error', {
        error: 'API key is required',
        provided: !!apiKey
      }, 'error');
      throw new Error('API key is required');
    }

    // TODO: Replace with actual Pattern 1 persona ID
    // This persona should be configured with:
    // - base_url: "http://localhost:8000"
    // - api_key: "rosa-backend-key-2025" 
    // - model: "rosa-ctbto-agent"
    const personaId = 'p95517e0594f'; // Rosa Pattern 1 Custom LLM Persona

    const requestPayload = {
      persona_id: personaId,
      replica_id: 'rb67667672ad', // ROSA replica ID (green screen)
      conversation_name: 'ROSA - Pattern 1 Custom LLM',
      properties: {
        apply_greenscreen: true,
        max_call_duration: 1800, // 30 minutes max
        participant_left_timeout: 60, // End call 60s after participant leaves
      }
      // NO TOOLS - Pattern 1 uses custom LLM backend instead
    };

    logApiCall('conversation-creation-starting', {
      endpoint: 'https://tavusapi.com/v2/conversations',
      method: 'POST',
      personaId: requestPayload.persona_id,
      replicaId: requestPayload.replica_id,
      conversationName: requestPayload.conversation_name,
      properties: requestPayload.properties,
      pattern: 'Pattern 1 - Custom LLM',
      backendUrl: 'http://localhost:8000',
      note: 'All responses flow through our Rosa backend'
    });

    const requestStart = Date.now();
    
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
    });

    const requestDuration = Date.now() - requestStart;

    if (!response.ok) {
      const errorText = await response.text();
      logApiCall('conversation-creation-failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries()),
        requestDuration: `${requestDuration}ms`
      }, 'error');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    logApiCall('conversation-creation-success', {
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url,
      status: data.status,
      requestDuration: `${requestDuration}ms`,
      pattern: 'Pattern 1 - Custom LLM',
      backendIntegration: {
        rosaBackend: 'http://localhost:8000',
        authKey: 'rosa-backend-key-2025',
        model: 'rosa-ctbto-agent'
      }
    });

    return data;
  } catch (error) {
    logApiCall('conversation-creation-error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      apiKeyProvided: !!apiKey,
      timestamp: new Date().toISOString()
    }, 'error');
    console.error('Error:', error);
    throw error;
  }
}; 