import type { IConversation } from '@/types';

export const createConversation = async (
  apiKey: string
): Promise<IConversation> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        persona_id: 'pc50ef44d21c', // ROSA persona ID
        replica_id: 'rb67667672ad', // ROSA replica ID (green screen)
        conversation_name: 'ROSA - Diplomatic Conference Assistant',
        properties: {
          apply_greenscreen: true, // Enable green screen for custom backgrounds
          max_call_duration: 1800, // 30 minutes max
          participant_left_timeout: 60, // End call 60s after participant leaves
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
