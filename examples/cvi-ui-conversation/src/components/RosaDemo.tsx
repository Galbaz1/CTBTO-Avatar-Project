import React, { useState } from 'react';
import { Conversation } from './cvi/components/conversation';
import { CVIProvider } from './cvi/components/cvi-provider';

interface RosaDemoProps {
  conversation: any;
  onLeave: () => void;
}

export const RosaDemo: React.FC<RosaDemoProps> = ({ conversation, onLeave }) => {
  const [currentContent, setCurrentContent] = useState<'welcome' | 'speaker' | 'location' | 'weather'>('welcome');

  // Sample content for Rosa's split-screen interface
  const contentData = {
    welcome: {
      title: "Welcome to CTBTO SnT 2025",
      content: (
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white', height: '400px' }}>
          <h2 style={{ marginTop: 0 }}>Comprehensive Nuclear-Test-Ban Treaty Organization</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Science and Technology Conference 2025<br/>
            Vienna International Centre
          </p>
          <div style={{ marginTop: '40px' }}>
            <h3>Conference Topics:</h3>
            <ul style={{ fontSize: '16px' }}>
              <li>Nuclear Verification Technologies</li>
              <li>Seismic Monitoring Systems</li>
              <li>Radionuclide Detection</li>
              <li>Hydroacoustic Monitoring</li>
              <li>International Monitoring System</li>
            </ul>
          </div>
        </div>
      )
    },
    speaker: {
      title: "Featured Speaker",
      content: (
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', height: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#007bff', borderRadius: '50%', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
              DS
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#333' }}>Dr. Sarah Chen</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>Lead Nuclear Verification Scientist</p>
              <p style={{ margin: 0, color: '#666' }}>CTBTO Preparatory Commission</p>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#333' }}>Presentation:</h4>
            <p style={{ color: '#666' }}>"Advanced Seismic Analysis for Nuclear Test Detection"</p>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '2px solid #007bff' }}>
            <p style={{ margin: 0, textAlign: 'center', color: '#007bff', fontWeight: 'bold' }}>📱 Scan for Speaker Bio</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <div style={{ width: '120px', height: '120px', background: '#007bff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                QR CODE
              </div>
            </div>
          </div>
        </div>
      )
    },
    location: {
      title: "Conference Location",
      content: (
        <div style={{ padding: '20px', background: '#e8f5e8', borderRadius: '12px', height: '400px' }}>
          <h3 style={{ marginTop: 0, color: '#2d5a2d' }}>Vienna International Centre (VIC)</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#333' }}>📍 Wagramer Strasse 5, 1400 Vienna, Austria</p>
          </div>
          <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#155724', textAlign: 'center', fontWeight: 'bold' }}>🗺️ Interactive Map</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
              <div style={{ width: '200px', height: '150px', background: '#28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: '8px' }}>
                Vienna Map View
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#2d5a2d' }}>Transportation:</h4>
            <ul style={{ color: '#333' }}>
              <li>🚇 Metro: U1 to Kaisermühlen-VIC</li>
              <li>🚌 Bus: 79A, 25A to VIC</li>
              <li>🚗 Parking: Available on-site</li>
            </ul>
          </div>
        </div>
      )
    },
    weather: {
      title: "Vienna Weather",
      content: (
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', borderRadius: '12px', color: 'white', height: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>Current Weather in Vienna</h3>
            <div style={{ fontSize: '48px', margin: '20px 0' }}>☀️</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>22°C</div>
            <p style={{ fontSize: '18px', margin: '10px 0' }}>Sunny</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '30px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px' }}>🌡️</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>Feels like</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>25°C</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px' }}>💨</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>Wind</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>12 km/h</div>
            </div>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            Perfect weather for the conference! 🌟
          </div>
        </div>
      )
    }
  };

  return (
    <CVIProvider key={conversation.conversation_id}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Rosa with Transparent Background */}
        <div style={{ 
          position: 'relative', 
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Rosa Title */}
          <div style={{ 
            padding: '20px', 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 10
          }}>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px', fontWeight: 'bold' }}>
              🌹 ROSA
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
              Diplomatic Conference Assistant
            </p>
          </div>

          {/* Rosa Video - Transparent Background */}
          <div style={{ 
            flex: 1, 
            position: 'relative',
            background: 'transparent' // This allows Rosa to overlay on the gradient
          }}>
            <Conversation
              conversationUrl={conversation.conversation_url}
              onLeave={onLeave}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ 
            padding: '20px', 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 10
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>
              Try asking Rosa about:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['CTBTO', 'Nuclear verification', 'Vienna weather', 'Conference speakers'].map((topic) => (
                <button
                  key={topic}
                  style={{
                    padding: '6px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2980b9'}
                  onMouseOut={(e) => e.target.style.background = '#3498db'}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Dynamic Content */}
        <div style={{ 
          background: '#ffffff', 
          borderLeft: '3px solid #3498db',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Content Navigation */}
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #ecf0f1',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              {Object.keys(contentData).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrentContent(key as any)}
                  style={{
                    padding: '8px 16px',
                    background: currentContent === key ? '#3498db' : '#ecf0f1',
                    color: currentContent === key ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {key === 'welcome' ? '🏛️ Welcome' : 
                   key === 'speaker' ? '👨‍🎓 Speaker' :
                   key === 'location' ? '📍 Location' : '🌤️ Weather'}
                </button>
              ))}
            </div>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>
              {contentData[currentContent].title}
            </h2>
          </div>

          {/* Dynamic Content Area */}
          <div style={{ 
            flex: 1, 
            padding: '20px',
            overflow: 'auto'
          }}>
            {contentData[currentContent].content}
          </div>

          {/* Footer */}
          <div style={{ 
            padding: '15px 20px', 
            background: '#f8f9fa',
            borderTop: '1px solid #ecf0f1',
            fontSize: '12px',
            color: '#7f8c8d',
            textAlign: 'center'
          }}>
            CTBTO Science & Technology Conference 2025 • Vienna International Centre
          </div>
        </div>
      </div>
    </CVIProvider>
  );
}; 