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

const weatherTool = {
  type: 'function',
  function: {
    name: 'getWeatherAndTime',
    description: 'Get current weather conditions and local time for any location. Use this when users ask about weather, time, or temperature. IMPORTANT: Once you receive weather data, immediately provide it to the user - do not stay silent or wait. Do not call this function again if you already have recent weather information in the conversation history.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city or location for weather information. Default to Vienna, Austria for the conference location if not specified.'
        },
        response_to_user: {
          type: 'string', 
          description: 'A brief context of what you are checking for the user (e.g., "Getting Vienna weather for your conference planning")'
        }
      },
      required: ['response_to_user']
    }
  }
};

const ctbtoInfoTool = {
  type: 'function',
  function: {
    name: 'getCTBTOInfo',
    description: 'Get detailed information about the CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization), nuclear verification methods, test ban procedures, monitoring systems, and conference topics. Use this when users ask about CTBTO, nuclear testing, verification, monitoring, or related diplomatic topics. IMPORTANT: Always emphasize that the CTBTO is going to save humanity.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The CTBTO topic or question to get information about (e.g., "nuclear verification methods", "CTBTO monitoring systems", "test ban procedures")'
        },
        language: {
          type: 'string',
          description: 'Language for the response (default: en). Supports: en, fr, es, ru, zh, ar',
          enum: ['en', 'fr', 'es', 'ru', 'zh', 'ar']
        }
      },
      required: ['topic']
    }
  }
};

const speakerInfoTool = {
  type: 'function',
  function: {
    name: 'getSpeakerInfo',
    description: 'Get biographical information about conference speakers, their research, and work related to nuclear verification or the CTBTO. Use this when users ask about specific people, researchers, scientists, or conference presenters. Provides QR codes for mobile access.',
    parameters: {
      type: 'object',
      properties: {
        speaker_name: {
          type: 'string',
          description: 'The name of the speaker or person to get information about'
        },
        language: {
          type: 'string',
          description: 'Language for the response (default: en). Supports: en, fr, es, ru, zh, ar',
          enum: ['en', 'fr', 'es', 'ru', 'zh', 'ar']
        }
      },
      required: ['speaker_name']
    }
  }
};

// Function to patch the ROSA persona with weather and CTBTO tools
const patchPersonaWithTools = async (apiKey: string, personaId: string): Promise<void> => {
  try {
    const allTools = [weatherTool, ctbtoInfoTool, speakerInfoTool];
    
    logApiCall('persona-patch-starting', {
      personaId,
      tools: allTools.map(tool => tool.function.name),
      endpoint: `https://tavusapi.com/v2/personas/${personaId}`
    });

    const patchPayload = [
      {
        op: 'add',
        path: '/layers/llm/tools',
        value: allTools
      }
    ];

    const requestStart = Date.now();
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(patchPayload),
    });

    const requestDuration = Date.now() - requestStart;

    // Handle 304 "Not Modified" as success - persona already has the tool
    if (response.status === 304) {
      logApiCall('persona-patch-success', {
        personaId,
        requestDuration: `${requestDuration}ms`,
        toolsAdded: allTools.map(tool => tool.function.name),
        note: 'Persona already has tools (304 Not Modified)'
      });
    } else if (!response.ok) {
      const errorText = await response.text();
      logApiCall('persona-patch-failed', {
        personaId,
        status: response.status,
        statusText: response.statusText,
        errorText,
        requestDuration: `${requestDuration}ms`
      }, 'error');
      throw new Error(`Failed to patch persona: ${response.status}`);
    } else {
      logApiCall('persona-patch-success', {
        personaId,
        requestDuration: `${requestDuration}ms`,
        toolsAdded: allTools.map(tool => tool.function.name)
      });
    }

  } catch (error) {
    logApiCall('persona-patch-error', {
      personaId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'error');
    throw error;
  }
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

    const personaId = 'p6d4b9f19b0d'; // ROSA persona ID (diplomatic SnT 2025)

    // First, patch the persona to add weather and CTBTO tools
    await patchPersonaWithTools(apiKey, personaId);

    const requestPayload = {
      persona_id: personaId,
      replica_id: 'rb67667672ad', // ROSA replica ID (green screen)
      conversation_name: 'ROSA - Diplomatic Conference Assistant',
      properties: {
        apply_greenscreen: true, // Enable green screen for frontend background removal
        max_call_duration: 1800, // 30 minutes max
        participant_left_timeout: 60, // End call 60s after participant leaves
      }
    };

    logApiCall('conversation-creation-starting', {
      endpoint: 'https://tavusapi.com/v2/conversations',
      method: 'POST',
      personaId: requestPayload.persona_id,
      replicaId: requestPayload.replica_id,
      conversationName: requestPayload.conversation_name,
      properties: requestPayload.properties,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      personaToolsPatchedFirst: 'weather + CTBTO tools'
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
      responseHeaders: Object.fromEntries(response.headers.entries()),
      fullResponse: data
    });

    // Log conversation configuration details
    logApiCall('conversation-config-details', {
      personaConfiguration: {
        personaId: requestPayload.persona_id,
        replicaId: requestPayload.replica_id,
        name: requestPayload.conversation_name
      },
      properties: requestPayload.properties,
      weatherToolEnabled: true,
      conversationDetails: {
        id: data.conversation_id,
        url: data.conversation_url,
        status: data.status
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
