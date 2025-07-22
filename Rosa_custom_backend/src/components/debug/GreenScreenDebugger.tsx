import React, { useState } from 'react';

interface GreenScreenDebuggerProps {
  onParametersChange: (params: {
    keyColor: [number, number, number];
    similarity: number;
    smoothness: number;
    spill: number;
    disableGreenScreen: boolean;
  }) => void;
  initialParams?: {
    keyColor: [number, number, number];
    similarity: number;
    smoothness: number;
    spill: number;
    disableGreenScreen: boolean;
  };
}

export const GreenScreenDebugger: React.FC<GreenScreenDebuggerProps> = ({
  onParametersChange,
  initialParams = {
    keyColor: [0.0, 0.9, 0.2],
    similarity: 0.45,
    smoothness: 0.1,
    spill: 0.2,
    disableGreenScreen: false,
  },
}) => {
  const [params, setParams] = useState(initialParams);
  const [isVisible, setIsVisible] = useState(false);

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParametersChange(newParams);
  };

  const updateKeyColor = (index: number, value: number) => {
    const newKeyColor = [...params.keyColor] as [number, number, number];
    newKeyColor[index] = value;
    updateParam('keyColor', newKeyColor);
  };

  const presets = {
    tavus: { keyColor: [0.0, 0.9, 0.2], similarity: 0.45, smoothness: 0.1, spill: 0.2 },
    standard: { keyColor: [0.0, 1.0, 0.0], similarity: 0.4, smoothness: 0.08, spill: 0.15 },
    aggressive: { keyColor: [0.0, 0.8, 0.1], similarity: 0.6, smoothness: 0.05, spill: 0.3 },
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1001,
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        🎨 Green Screen Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '300px',
      padding: '16px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '12px',
      fontSize: '14px',
      zIndex: 1001,
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🎨 Green Screen Controls</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Enable/Disable Toggle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={!params.disableGreenScreen}
            onChange={(e) => updateParam('disableGreenScreen', !e.target.checked)}
          />
          Enable Green Screen Removal
        </label>
      </div>

      {/* Quick Presets */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
          Quick Presets:
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Object.entries(presets).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => {
                const newParams = { ...params, ...preset };
                setParams(newParams);
                onParametersChange(newParams);
              }}
              style={{
                padding: '4px 8px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Color */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
          Key Color (RGB):
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['R', 'G', 'B'].map((channel, index) => (
            <div key={channel} style={{ flex: 1 }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={params.keyColor[index]}
                onChange={(e) => updateKeyColor(index, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '10px', textAlign: 'center' }}>
                {channel}: {params.keyColor[index].toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similarity */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
          Similarity: {params.similarity.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={params.similarity}
          onChange={(e) => updateParam('similarity', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Smoothness */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
          Smoothness: {params.smoothness.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={params.smoothness}
          onChange={(e) => updateParam('smoothness', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Spill */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
          Spill Suppression: {params.spill.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={params.spill}
          onChange={(e) => updateParam('spill', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Info */}
      <div style={{ 
        fontSize: '10px', 
        opacity: 0.7, 
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }}>
        💡 Tip: Start with Tavus preset, adjust similarity for green screen coverage, 
        smoothness for edge quality.
      </div>
    </div>
  );
}; 