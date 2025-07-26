import React, { useEffect, useState } from 'react';

import styles from './welcome.module.css';

export const WelcomeScreen = ({ onStart, loading }: { onStart: (key: string) => void, loading: boolean }) => {
  const [apiKey, setApiKey] = useState('');
  // On initial mount, get token from environment or localStorage
  useEffect(() => {
    // First try environment variable
    const envApiKey = import.meta.env.VITE_TAVUS_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
      return;
    }
    
    // Fallback to localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setApiKey(token);
    }
  }, []);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleStart = (event: React.FormEvent) => {
    event.preventDefault();
    if (apiKey) {
      onStart(apiKey);
    } else {
      alert('Please enter your API key');
    }
  };

  // Auto-start if API key is available from environment
  const isEnvApiKey = import.meta.env.VITE_TAVUS_API_KEY && apiKey === import.meta.env.VITE_TAVUS_API_KEY;

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 className={styles.title}>
          Rosa - CTBTO S&T 2025 Event Host
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '1.1rem', 
          margin: '0.5rem 0 0 0',
          position: 'relative',
          zIndex: 1
        }}>
          Science & Technology Conference 2025<br/>
          Hofburg Palace, Vienna | 8-12 September 2025
        </p>
      </div>
      {isEnvApiKey && (
        <div style={{ 
          background: '#e1f5fe', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #01579b'
        }}>
          <p style={{ margin: 0, color: '#01579b', fontSize: '14px' }}>
            API key loaded from environment
          </p>
        </div>
      )}
      <form className={styles.form} >
        <input
          type='text'
          className={styles.input}
          placeholder={isEnvApiKey ? 'API key loaded from .env.local' : 'Enter your API key'}
          onChange={handleInputChange}
          value={apiKey}
          disabled={isEnvApiKey}
        />
        <button type='submit' className={styles.button} onClick={handleStart} disabled={!apiKey || loading}>
          {loading ? 'Connecting to Rosa...' : 'Join Conference with Rosa'}
        </button>
      </form>
    </div >
  );
};
