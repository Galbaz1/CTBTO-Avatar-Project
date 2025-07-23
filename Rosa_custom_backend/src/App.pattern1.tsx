import { useEffect, useState } from 'react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { createConversation, endConversation } from './api';
import type { IConversation } from './types'
import { Conversation } from './components/cvi/components/conversation'
import { useRequestPermissions } from './components/cvi/hooks/use-request-permissions';
import { SimpleConversationLogger } from './components/SimpleConversationLogger';

function App() {
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Auto-grant permissions for Pattern 1
    const requestPermissions = useRequestPermissions();
    requestPermissions();
  }, []);

  const handleJoin = async (token: string) => {
    setLoading(true)
    try {
      const conv = await createConversation(token)
      setConversation(conv)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    if (!conversation) return
    
    try {
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (apiKey) {
        await endConversation(conversation.conversation_id, apiKey)
      }
      setConversation(null)
    } catch (error) {
      console.error('Failed to end conversation:', error)
    }
  }

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <h1>🤖 Rosa Pattern 1 - Custom LLM</h1>
        <p>Enhanced with Weather Intelligence & Generative UI</p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!conversation ? (
          <WelcomeScreen onStart={handleJoin} loading={loading} />
        ) : (
          <div style={{ width: '100%', height: '100%' }}>
            <Conversation 
              conversationUrl={conversation.conversation_url}
              onLeave={handleEnd}
            />
            <SimpleConversationLogger 
              conversationId={conversation.conversation_id}
              enabled={true}
            />
          </div>
        )}
      </div>
    </main>
  )
}

export default App 