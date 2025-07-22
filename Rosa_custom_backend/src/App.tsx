import { useEffect, useState } from 'react'
import { StagewiseToolbar } from '@stagewise/toolbar-react'
import ReactPlugin from '@stagewise-plugins/react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { createConversation, endConversation } from './api'
import type { IConversation } from './types'
import { Conversation } from './components/cvi/components/conversation'
import { useRequestPermissions } from './components/cvi/hooks/use-request-permissions';
// Pattern 1: No function call handlers needed
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
      
      console.log('🎤 Requesting permissions...');
      await requestPermissions()
      
      if (!token) {
        alert('API key not found. Please set your API key.')
        return
      }
      
      console.log('🔗 Creating conversation with Tavus API...');
      const conversation = await createConversation(token)
      console.log('✅ Pattern 1 conversation created:', {
        conversationId: conversation.conversation_id,
        conversationUrl: conversation.conversation_url,
        status: conversation.status
      });
      
      setConversation(conversation)
      setScreen('call')
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      alert('Uh oh! Something went wrong. Check console for details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <StagewiseToolbar 
        config={{
          plugins: [ReactPlugin]
        }}
      />
      {screen === 'welcome' && <WelcomeScreen onStart={handleJoin} loading={loading} />}
      <div>
        {screen === 'call' && conversation && (
          <div style={{ position: 'relative' }}>
            {/* Pattern 1: All responses flow through Rosa backend */}
            <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />
            
            {/* Pattern 1: Simple logging only - no function call handlers */}
            <SimpleConversationLogger 
              conversationId={conversation.conversation_id}
              enabled={true}
            />
            
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
    </main>
  )
}

export default App
