import { useEffect, useState } from 'react'
import { StagewiseToolbar } from '@stagewise/toolbar-react'
import ReactPlugin from '@stagewise-plugins/react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { createConversation, endConversation } from './api/createConversation.pattern1'
import type { IConversation } from './types'
import { Conversation } from './components/cvi/components/conversation'
import { useRequestPermissions } from './components/cvi/hooks/use-request-permissions';
import { SimpleConversationLogger } from './components/SimpleConversationLogger';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [screen, setScreen] = useState<'welcome' | 'call'>('welcome')
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)

  const requestPermissions = useRequestPermissions();

  useEffect(() => {
    return () => {
      if (conversation && apiKey) {
        void endConversation(conversation.conversation_id, apiKey)
      }
    }
  }, [conversation, apiKey])

  const handleEnd = async () => {
    try {
      console.log('🔄 User ending conversation...');
      setScreen('welcome')
      if (!conversation || !apiKey) return
      console.log('📞 Ending conversation:', conversation.conversation_id);
      await endConversation(conversation.conversation_id, apiKey)
      console.log('✅ Conversation ended successfully');
    } catch (error) {
      console.error('❌ Error ending conversation:', error)
    } finally {
      setConversation(null)
    }
  }

  const handleJoin = async (token: string) => {
    try {
      console.log('🚀 Starting ROSA Pattern 1 conversation...');
      setApiKey(token)
      localStorage.setItem('token', token);
      setLoading(true)
      
      await requestPermissions();
      console.log('✅ Permissions granted');
      
      console.log('📞 Creating Pattern 1 conversation...');
      const data = await createConversation(token)
      console.log('✅ Pattern 1 conversation created:', data);
      
      setConversation(data)
      setScreen('call')
    } catch (error) {
      console.error('❌ Error joining conversation:', error)
      alert('Failed to start conversation. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StagewiseToolbar plugin={ReactPlugin} />
      <div className="app">
        {screen === 'welcome' && (
          <WelcomeScreen onJoin={handleJoin} loading={loading} />
        )}
        
        {screen === 'call' && conversation && (
          <div style={{ position: 'relative' }}>
            {/* Pattern 1: All responses flow through Rosa backend */}
            <Conversation 
              key={conversation.conversation_id}
              conversationUrl={conversation.conversation_url} 
              onLeave={handleEnd} 
            />
            
            {/* Pattern 1: Simple logging only - no function call handlers */}
            <SimpleConversationLogger />
            
            {/* Pattern 1 Info Display */}
            <div style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(0, 210, 211, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 1000
            }}>
              🧠 Pattern 1: Custom LLM
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App 