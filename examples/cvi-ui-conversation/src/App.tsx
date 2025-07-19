import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RosaDemo } from './components/RosaDemo';
import { createConversation, createAudioOnlyConversation } from './api/createConversation'; // ✅ Import both functions
import { endConversation } from './api/endConversation';

// ✅ Cost Saving Mode Selector Component
const CostSavingModeSelector: React.FC<{
  costSavingMode: boolean;
  onToggle: (enabled: boolean) => void;
}> = ({ costSavingMode, onToggle }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '16px 20px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
        💰 Cost Optimization
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onToggle(false)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: !costSavingMode 
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
              : '#f3f4f6',
            color: !costSavingMode ? 'white' : '#6b7280',
            boxShadow: !costSavingMode 
              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
              : 'none'
          }}
        >
          🎥 Full Video
        </button>
        
        <button
          onClick={() => onToggle(true)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: costSavingMode 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : '#f3f4f6',
            color: costSavingMode ? 'white' : '#6b7280',
            boxShadow: costSavingMode 
              ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
              : 'none'
          }}
        >
          🎤 Audio Only
        </button>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {costSavingMode 
          ? '💸 Saves video rendering costs' 
          : '🎬 Full experience with live video'
        }
      </div>
    </div>
  );
};

function App() {
  const [conversation, setConversation] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [costSavingMode, setCostSavingMode] = useState<boolean>(false); // ✅ Cost saving mode state

  const handleStartConversation = async (key: string) => {
    setIsLoading(true);
    setApiKey(key);
    
    try {
      // ✅ Use appropriate conversation creation function based on mode
      const conversationData = costSavingMode 
        ? await createAudioOnlyConversation(key)
        : await createConversation(key);
        
      setConversation(conversationData);
      
      console.log(`🎯 ROSA ${costSavingMode ? 'Audio-Only' : 'Full Video'} conversation created:`, {
        mode: costSavingMode ? 'COST_OPTIMIZED_AUDIO_ONLY' : 'FULL_VIDEO',
        conversationId: conversationData.conversation_id,
        costSavings: costSavingMode ? 'Video rendering disabled' : 'Full pipeline active',
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
          conversationId: conversation.conversation_id,
          mode: costSavingMode ? 'AUDIO_ONLY' : 'FULL_VIDEO'
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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* ✅ Cost Saving Mode Selector */}
          <CostSavingModeSelector 
            costSavingMode={costSavingMode}
            onToggle={setCostSavingMode}
          />
          
          <WelcomeScreen 
            onStart={handleStartConversation} 
            loading={isLoading}
          />
        </div>
      ) : (
        <RosaDemo 
          conversation={conversation} 
          onLeave={handleLeaveConversation}
          costSavingMode={costSavingMode} // ✅ Pass cost saving mode to Rosa
        />
      )}
    </div>
  );
}

export default App;
