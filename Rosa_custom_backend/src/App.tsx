import { useState, useCallback } from 'react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { RosaDemo } from './components/RosaDemo'

function App() {
  const [screen, setScreen] = useState<'welcome' | 'call'>('welcome')
  const [loading, setLoading] = useState(false)

  const handleJoin = useCallback(async (apiKey: string) => {
    setLoading(true)
    try {
      // Store API key for Rosa to use
      localStorage.setItem('TAVUS_API_KEY', apiKey)
      setScreen('call')
    } catch (error) {
      console.error('Error starting Rosa:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <main style={{ height: '100vh' }}>
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '12px 20px', 
        textAlign: 'center', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>
          🤖 Rosa - Enhanced with Weather Intelligence
        </h1>
      </div>

      <div style={{ paddingTop: '60px', height: 'calc(100vh - 60px)' }}>
        {screen === 'welcome' && <WelcomeScreen onStart={handleJoin} loading={loading} />}
        {screen === 'call' && <RosaDemo />}
      </div>
    </main>
  )
}

export default App
