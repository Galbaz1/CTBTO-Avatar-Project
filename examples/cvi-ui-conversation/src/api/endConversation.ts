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

export const endConversation = async (
  conversationId: string,
  apiKey: string
) => {
  try {
    if (!conversationId || !apiKey) {
      logApiCall('end-conversation-validation-error', {
        error: 'Conversation ID and API key are required',
        conversationIdProvided: !!conversationId,
        apiKeyProvided: !!apiKey
      }, 'error');
      throw new Error('Conversation ID and API key are required');
    }

    logApiCall('end-conversation-starting', {
      conversationId,
      endpoint: `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      method: 'POST',
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + '...'
    });

    const requestStart = Date.now();

    const response = await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    const requestDuration = Date.now() - requestStart;

    if (!response.ok) {
      const errorText = await response.text();
      logApiCall('end-conversation-failed', {
        conversationId,
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries()),
        requestDuration: `${requestDuration}ms`
      }, 'error');
      throw new Error('Failed to end conversation');
    }

    logApiCall('end-conversation-success', {
      conversationId,
      status: response.status,
      requestDuration: `${requestDuration}ms`,
      responseHeaders: Object.fromEntries(response.headers.entries())
    });

    return null;
  } catch (error) {
    logApiCall('end-conversation-error', {
      conversationId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      apiKeyProvided: !!apiKey,
      timestamp: new Date().toISOString()
    }, 'error');
    console.error('Error:', error);
    throw error;
  }
};
