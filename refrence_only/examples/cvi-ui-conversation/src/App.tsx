import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RosaDemo } from './components/RosaDemo';
import { createConversation } from './api/createConversation';
import { endConversation } from './api/endConversation';

function App() {
  const [conversation, setConversation] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStartConversation = async (key: string) => {
    setIsLoading(true);
    setApiKey(key);
    
    try {
      const conversationData = await createConversation(key);
      setConversation(conversationData);
      
      console.log('🎯 ROSA conversation created:', {
        conversationId: conversationData.conversation_id,
        features: 'STT, TTS, Perception, Function Calling all active'
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to create conversation. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveConversation = async () => {
    if (conversation?.conversation_id) {
      try {
        await endConversation(apiKey, conversation.conversation_id);
        console.log('🏁 ROSA conversation ended:', {
          conversationId: conversation.conversation_id
        });
      } catch (error) {
        console.error('Failed to end conversation:', error);
      }
    }
    setConversation(null);
    setApiKey('');
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      position: 'relative'
    }}>
      {!conversation ? (
        <WelcomeScreen 
          onStart={handleStartConversation} 
          loading={isLoading}
        />
      ) : (
        <RosaDemo 
          conversation={conversation} 
          onLeave={handleLeaveConversation}
        />
      )}
    </div>
  );
}

export default App;
