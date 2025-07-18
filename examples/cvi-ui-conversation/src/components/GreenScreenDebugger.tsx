import React, { useState, useCallback } from 'react';
import ParameterTester from './ParameterTester';
import { ManualParameterControls } from './ManualParameterControls';

interface ParameterSet {
  id: number;
  name: string;
  similarity: number;
  smoothness: number;
  spill: number;
  edgeSoftness: number;
  description: string;
}

interface GreenScreenDebuggerProps {
  onSettingsChange: (settings: { debugMode: boolean; disableGreenScreen: boolean; useWebGL: boolean; showRawVideo: boolean }) => void;
  onParametersChange?: (params: ParameterSet) => void;
  onManualParametersChange?: (params: { similarity: number; smoothness: number; spill: number }) => void;
  currentParameters?: { similarity: number; smoothness: number; spill: number };
}

export const GreenScreenDebugger: React.FC<GreenScreenDebuggerProps> = ({ 
  onSettingsChange, 
  onParametersChange, 
  onManualParametersChange,
  currentParameters = { similarity: 0.4, smoothness: 0.08, spill: 0.15 }
}) => {
  const [debugMode, setDebugMode] = useState(true);
  const [disableGreenScreen, setDisableGreenScreen] = useState(false);
  const [useWebGL, setUseWebGL] = useState(true);
  const [showRawVideo, setShowRawVideo] = useState(false);
  const [isParameterTesting, setIsParameterTesting] = useState(false);
  const [showManualControls, setShowManualControls] = useState(false);

  const handleDebugModeChange = (enabled: boolean) => {
    setDebugMode(enabled);
    onSettingsChange({ debugMode: enabled, disableGreenScreen, useWebGL, showRawVideo });
  };

  const handleGreenScreenToggle = (disabled: boolean) => {
    setDisableGreenScreen(disabled);
    onSettingsChange({ debugMode, disableGreenScreen: disabled, useWebGL, showRawVideo });
  };

  const handleWebGLToggle = (enabled: boolean) => {
    setUseWebGL(enabled);
    onSettingsChange({ debugMode, disableGreenScreen, useWebGL: enabled, showRawVideo });
  };

  const handleRawVideoToggle = () => {
    const newShowRawVideo = !showRawVideo;
    setShowRawVideo(newShowRawVideo);
    onSettingsChange({ debugMode: true, disableGreenScreen: true, useWebGL, showRawVideo: newShowRawVideo });
  };

  const handleStartParameterTesting = () => {
    console.log('🧪 DEBUG: Parameter testing button clicked');
    setIsParameterTesting(true);
    console.log('🧪 DEBUG: isParameterTesting set to true');
    // Ensure we're in WebGL mode and debug mode for parameter testing
    setUseWebGL(true);
    setDebugMode(true);
    setDisableGreenScreen(false);
    setShowRawVideo(false);
    onSettingsChange({ debugMode: true, disableGreenScreen: false, useWebGL: true, showRawVideo: false });
    console.log('🧪 DEBUG: Settings changed for parameter testing');
  };

  const handleParameterChange = useCallback((params: ParameterSet) => {
    if (onParametersChange) {
      onParametersChange(params);
    }
  }, [onParametersChange]);

  const handleParameterTestingComplete = useCallback(() => {
    setIsParameterTesting(false);
  }, []);

  return (
    <>
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 1000,
      fontSize: '14px',
      fontFamily: 'monospace',
      minWidth: '250px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔧 Green Screen Debugger</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => handleDebugModeChange(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          🔍 Debug Mode (show original video)
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={disableGreenScreen}
            onChange={(e) => handleGreenScreenToggle(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          ⚠️ Disable Green Screen Processing
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useWebGL}
            onChange={(e) => handleWebGLToggle(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          🎮 Use WebGL (recommended)
        </label>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
        <div>🟡 Yellow border = Original video</div>
        <div>🟢 Green border = Processed video</div>
        <div>📊 Check console for pixel statistics</div>
      </div>

      <div style={{ marginTop: '10px', padding: '8px', background: '#333', borderRadius: '4px', fontSize: '11px' }}>
        <strong>Current Settings:</strong><br/>
        Mode: {showRawVideo ? '🎬 RAW VIDEO TEST' : 'Normal'}<br/>
        Debug: {debugMode ? '✅ ON' : '❌ OFF'}<br/>
        Green Screen: {disableGreenScreen ? '❌ DISABLED' : '✅ ENABLED'}<br/>
        Renderer: {useWebGL ? '🎮 WebGL' : '🖼️ Canvas2D'}
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#ffa500' }}>
        💡 If you see black screen, try disabling green screen processing first
      </div>

      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={() => setShowManualControls(!showManualControls)}
          style={{
            width: '100%',
            padding: '8px',
            background: showManualControls ? '#00aa00' : '#0066ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}
        >
          {showManualControls ? '🎛️ Hide Manual Controls' : '🎛️ Show Manual Controls'}
        </button>
        
        <button 
          onClick={handleStartParameterTesting}
          disabled={isParameterTesting || showManualControls}
          style={{
            width: '100%',
            padding: '8px',
            background: (isParameterTesting || showManualControls) ? '#888' : '#ff9500',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: (isParameterTesting || showManualControls) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginBottom: '8px',
            opacity: showManualControls ? 0.5 : 1
          }}
        >
          {isParameterTesting ? '🧪 Testing in Progress...' : '🧪 Auto Parameter Testing'}
        </button>
        
        <button 
          onClick={handleRawVideoToggle}
          disabled={isParameterTesting}
          style={{
            width: '100%',
            padding: '8px',
            background: showRawVideo ? '#ff6b6b' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: isParameterTesting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isParameterTesting ? 0.5 : 1
          }}
        >
          {showRawVideo ? '🔴 Hide Raw Video Test' : '🎬 Show Raw Video Test'}
        </button>
      </div>

      <div style={{ marginTop: '10px', padding: '8px', background: '#1a1a1a', borderRadius: '4px', fontSize: '10px' }}>
        <strong style={{ color: '#00ff00' }}>Quick Fixes:</strong><br/>
        <div style={{ color: '#ffffff', marginTop: '4px' }}>
          • Black screen? Click "Show Raw Video Test"<br/>
          • WebGL not working? Switch to Canvas2D<br/>
          • Canvas2D slow? Switch to WebGL<br/>
          • No transparency? Check console logs
        </div>
      </div>

      {isParameterTesting && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          background: '#ff9500', 
          borderRadius: '4px', 
          fontSize: '11px',
          color: 'black',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🧪 PARAMETER TESTING ACTIVE<br/>
          Take screenshots for comparison!
        </div>
      )}
    </div>
    
    {/* Parameter Tester Component */}
    <ParameterTester
      isActive={isParameterTesting}
      onParametersChange={handleParameterChange}
      onComplete={handleParameterTestingComplete}
    />
    
    {/* Manual Parameter Controls */}
    {showManualControls && onManualParametersChange && (
      <ManualParameterControls
        similarity={currentParameters.similarity}
        smoothness={currentParameters.smoothness}
        spill={currentParameters.spill}
        onParametersChange={onManualParametersChange}
      />
    )}
  </>
  );
}; 