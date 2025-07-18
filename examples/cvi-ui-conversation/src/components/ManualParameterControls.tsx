import React from 'react';

interface ManualParameterControlsProps {
  similarity: number;
  smoothness: number;
  spill: number;
  onParametersChange: (params: { similarity: number; smoothness: number; spill: number }) => void;
}

export const ManualParameterControls: React.FC<ManualParameterControlsProps> = ({
  similarity,
  smoothness,
  spill,
  onParametersChange
}) => {
  const handleSimilarityChange = (value: number) => {
    onParametersChange({ similarity: value, smoothness, spill });
  };

  const handleSmoothnessChange = (value: number) => {
    onParametersChange({ similarity, smoothness: value, spill });
  };

  const handleSpillChange = (value: number) => {
    onParametersChange({ similarity, smoothness, spill: value });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '400px',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 10001,
      minWidth: '300px',
      border: '2px solid #00ff00'
    }}>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold', 
        marginBottom: '15px',
        color: '#00ff00',
        textAlign: 'center'
      }}>
        🎛️ MANUAL PARAMETER CONTROLS
      </div>
      
      {/* Similarity Slider */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#ffff00' }}>Similarity (Green Detection)</span>
          <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{similarity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.05"
          value={similarity}
          onChange={(e) => handleSimilarityChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 50%, #00ff00 100%)',
            borderRadius: '4px',
            outline: 'none'
          }}
        />
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
          Low = Strict (less green removed) • High = Loose (more green removed)
        </div>
      </div>

      {/* Smoothness Slider */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#ffff00' }}>Smoothness (Edge Softness)</span>
          <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{smoothness.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.3"
          step="0.01"
          value={smoothness}
          onChange={(e) => handleSmoothnessChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 50%, #00ff00 100%)',
            borderRadius: '4px',
            outline: 'none'
          }}
        />
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
          Low = Sharp edges • High = Soft/blurred edges
        </div>
      </div>

      {/* Spill Slider */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#ffff00' }}>Spill Suppression</span>
          <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{spill.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.5"
          step="0.01"
          value={spill}
          onChange={(e) => handleSpillChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 50%, #00ff00 100%)',
            borderRadius: '4px',
            outline: 'none'
          }}
        />
        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
          Low = Keep green reflections • High = Remove green reflections
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
        <div style={{ fontSize: '12px', marginBottom: '10px', color: '#ffff00' }}>Quick Presets:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <button
            onClick={() => onParametersChange({ similarity: 0.4, smoothness: 0.08, spill: 0.15 })}
            style={{
              padding: '8px',
              background: '#444',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            🎯 Normal
          </button>
          <button
            onClick={() => onParametersChange({ similarity: 0.2, smoothness: 0.02, spill: 0.3 })}
            style={{
              padding: '8px',
              background: '#444',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            🔪 Sharp
          </button>
          <button
            onClick={() => onParametersChange({ similarity: 0.6, smoothness: 0.2, spill: 0.1 })}
            style={{
              padding: '8px',
              background: '#444',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            🌊 Soft
          </button>
          <button
            onClick={() => onParametersChange({ similarity: 0.1, smoothness: 0.01, spill: 0.5 })}
            style={{
              padding: '8px',
              background: '#444',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            ⚡ Extreme
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '10px', 
        color: '#888',
        textAlign: 'center',
        borderTop: '1px solid #333',
        paddingTop: '10px'
      }}>
        💡 Adjust sliders and watch Rosa change in real-time!
      </div>
    </div>
  );
}; 