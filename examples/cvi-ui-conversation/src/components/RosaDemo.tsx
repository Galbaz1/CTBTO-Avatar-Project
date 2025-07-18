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
        <div style={{ 
          margin: '0 60px',
          padding: '60px 40px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(255,255,255,0.95) 100%)',
          border: '1px solid rgba(225, 232, 237, 0.5)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle inner glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
            borderRadius: '24px',
            pointerEvents: 'none'
          }}></div>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#2563eb', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              🏛️
            </div>
            <h2 style={{ 
              margin: 0, 
              color: '#1e293b', 
              fontSize: '28px', 
              fontWeight: '600',
              letterSpacing: '-0.5px',
              marginBottom: '12px'
            }}>
              Comprehensive Nuclear-Test-Ban Treaty Organization
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748b', 
              margin: 0,
              fontWeight: '400'
            }}>
              Science and Technology Conference 2025<br/>
              Vienna International Centre
            </p>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '12px' }}>
            <h3 style={{ 
              margin: '0 0 24px 0', 
              color: '#334155', 
              fontSize: '20px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Conference Focus Areas
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {[
                'Nuclear Verification Technologies',
                'Seismic Monitoring Systems', 
                'Radionuclide Detection',
                'Hydroacoustic Monitoring',
                'International Monitoring System'
              ].map((topic, index) => (
                <div key={index} style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#475569',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {topic}
                </div>
              ))}
            </div>
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
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Left Panel - Avatar with background image */}
        <div
          className="rosa-portrait-container"
          style={{
            width: '50vw',
            height: '100vh',
            backgroundImage: `url('/background.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#2563eb', // Fallback color if image doesn't load
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Semi-transparent overlay to ensure avatar visibility */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.15)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
            <Conversation
              conversationUrl={conversation.conversation_url}
              onLeave={onLeave}
            />
          </div>
          <style>{`
            /* Global reset to eliminate browser margins */
            body, html, #root, main {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            
            /* Avatar container sizing (perfect, don't change) */
            .rosa-portrait-container div[class*="container"] {
              aspect-ratio: unset !important;
              max-height: none !important;
              height: 100vh !important;
              width: 100% !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              background-color: transparent !important;
            }
            
            /* Video containers */
            .rosa-portrait-container div[class*="videoContainer"],
            .rosa-portrait-container div[class*="mainVideoContainer"] {
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              background-color: transparent !important;
            }
            
            /* Video element */
            .rosa-portrait-container div[class*="mainVideo"] {
              aspect-ratio: unset !important;
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              background: transparent !important;
            }
            
            /* Canvas element - ensure transparency */
            .rosa-portrait-container canvas {
              aspect-ratio: unset !important;
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
              background-color: transparent !important;
              mix-blend-mode: screen !important;
            }
            
            /* Remove all grey backgrounds from CVI components */
            .rosa-portrait-container div {
              background-color: transparent !important;
              background: transparent !important;
            }
            
            /* Target specific grey backgrounds */
            .rosa-portrait-container div[style*="background-color: rgb(55, 65, 81)"],
            .rosa-portrait-container div[style*="background-color: #374151"],
            .rosa-portrait-container div[style*="background: rgb(55, 65, 81)"],
            .rosa-portrait-container div[style*="background: #374151"] {
              background-color: transparent !important;
              background: transparent !important;
            }
            
            /* Control buttons as floating overlay */
            .rosa-portrait-container div[class*="footer"] {
              position: absolute !important;
              bottom: 20px !important;
              left: 20px !important;
              background: transparent !important;
              border-radius: 12px !important;
              padding: 12px !important;
              z-index: 200 !important;
              backdrop-filter: none !important;
              box-shadow: none !important;
            }
            
            /* Style the control buttons */
            .rosa-portrait-container div[class*="footerControls"] {
              gap: 8px !important;
            }
            
            /* Hide ghost audio wave visualization */
            .rosa-portrait-container div[class*="audioWave"],
            .rosa-portrait-container div[class*="waveContainer"] {
              display: none !important;
            }
            
            /* Hide user camera preview since avatar won't see user */
            .rosa-portrait-container div[class*="previewVideo"],
            .rosa-portrait-container div[class*="selfView"] {
              display: none !important;
            }
            
            /* Hide device selection dropdowns (mic/camera device pickers) */
            .rosa-portrait-container div[class*="deviceSelect"],
            .rosa-portrait-container div[class*="device-select"] {
              display: none !important;
            }
          `}</style>
        </div>
                 {/* Right Panel - Content, edge-to-edge, but padded for readability */}
         <div
           style={{
             width: '50vw',
             height: '100vh',
             background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)',
             backgroundSize: '400% 400%',
             animation: 'diplomaticGlow 20s ease-in-out infinite',
             borderLeft: '3px solid #3498db',
             display: 'flex',
             flexDirection: 'column',
             position: 'relative',
             overflow: 'hidden'
           }}
         >
           {/* Subtle overlay for added depth */}
           <div style={{
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.02) 100%)',
             pointerEvents: 'none',
             zIndex: 1
           }}></div>
           
           {/* Top spacing */}
           <div style={{ 
             height: '40px',
             background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.8) 100%)',
             position: 'relative',
             zIndex: 2
           }}></div>

           {/* Content Navigation */}
           <div style={{ 
             padding: '24px 32px', 
             borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
             background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.8) 100%)',
             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
             backdropFilter: 'blur(10px)',
             position: 'relative',
             zIndex: 2
           }}>
             <div style={{ 
               display: 'flex', 
               gap: '16px', 
               justifyContent: 'center',
               alignItems: 'center',
               height: '60px'
             }}>
               {Object.keys(contentData).map((key) => (
                 <button
                   key={key}
                   onClick={() => setCurrentContent(key as any)}
                   style={{
                     padding: '16px 28px',
                     background: currentContent === key 
                       ? 'linear-gradient(145deg, #1e40af 0%, #3730a3 50%, #1e3a8a 100%)' 
                       : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                     color: currentContent === key ? '#ffffff' : '#374151',
                     border: currentContent === key ? 'none' : '1px solid rgba(229, 231, 235, 0.6)',
                     borderRadius: '12px',
                     fontSize: '15px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     textTransform: 'none',
                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                     boxShadow: currentContent === key 
                       ? '0 8px 25px rgba(30, 64, 175, 0.3), 0 3px 10px rgba(30, 64, 175, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                       : '0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                     letterSpacing: '0.025em',
                     minWidth: '120px',
                     position: 'relative',
                     overflow: 'hidden'
                   }}
                   onMouseOver={(e) => {
                     if (currentContent !== key) {
                       e.currentTarget.style.background = 'linear-gradient(145deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)';
                       e.currentTarget.style.transform = 'translateY(-2px)';
                       e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 15px rgba(0, 0, 0, 0.08)';
                     }
                   }}
                   onMouseOut={(e) => {
                     if (currentContent !== key) {
                       e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)';
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                     }
                   }}
                 >
                   {key === 'welcome' ? 'Schedule' : 
                    key === 'speaker' ? 'Speakers' :
                    key === 'location' ? 'Venue' : 'Weather'}
                 </button>
               ))}
             </div>
           </div>

           {/* Dynamic Content Area */}
           <div style={{ 
             flex: 1, 
             padding: '30px 20px 40px 20px',
             overflow: 'auto',
             position: 'relative',
             zIndex: 2
           }}>
             {contentData[currentContent].content}
           </div>

           {/* Footer */}
           <div style={{ 
             padding: '20px 20px 25px 20px', 
             background: 'linear-gradient(180deg, rgba(248,249,250,0.9) 0%, rgba(241,245,249,0.95) 100%)',
             borderTop: '1px solid rgba(236, 240, 241, 0.6)',
             fontSize: '12px',
             color: '#7f8c8d',
             textAlign: 'center',
             backdropFilter: 'blur(10px)',
             boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
             position: 'relative',
             zIndex: 2
           }}>
             CTBTO Science & Technology Conference 2025 • Vienna International Centre
           </div>
         </div>
      </div>
    </CVIProvider>
  );
}; 