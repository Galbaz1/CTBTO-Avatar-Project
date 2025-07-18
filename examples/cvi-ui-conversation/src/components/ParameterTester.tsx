import React, { useState, useEffect } from 'react';

interface ParameterSet {
  id: number;
  name: string;
  similarity: number;
  smoothness: number;
  spill: number;
  edgeSoftness: number;
  description: string;
}

const PARAMETER_SETS: ParameterSet[] = [
  {
    id: 1,
    name: "Normal",
    similarity: 0.4,
    smoothness: 0.08,
    spill: 0.15,
    edgeSoftness: 0.02,
    description: "Normal settings"
  },
  {
    id: 2,
    name: "EXTREME STRICT",
    similarity: 0.1,
    smoothness: 0.01,
    spill: 0.5,
    edgeSoftness: 0.001,
    description: "EXTREME: Very strict green detection"
  },
  {
    id: 3,
    name: "EXTREME LOOSE",
    similarity: 0.9,
    smoothness: 0.5,
    spill: 0.01,
    edgeSoftness: 0.2,
    description: "EXTREME: Very loose green detection"
  }
];

interface ParameterTesterProps {
  isActive: boolean;
  onParametersChange: (params: ParameterSet) => void;
  onComplete: () => void;
}

const ParameterTester: React.FC<ParameterTesterProps> = ({ 
  isActive, 
  onParametersChange, 
  onComplete 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [hasStarted, setHasStarted] = useState(false);

  // Separate effect for initialization
  useEffect(() => {
    console.log('🧪 DEBUG: ParameterTester useEffect - isActive:', isActive, 'hasStarted:', hasStarted);
    if (!isActive) {
      setCurrentIndex(0);
      setTimeRemaining(10);
      setHasStarted(false);
      return;
    }

    if (!hasStarted) {
      console.log('🧪 DEBUG: Starting parameter testing...');
      setHasStarted(true);
    }
  }, [isActive, hasStarted]);

  // Separate effect for applying parameters (avoids render-time state updates)
  useEffect(() => {
    if (isActive && hasStarted) {
      // Apply current parameter set after render
      console.log('🧪 DEBUG: Applying parameter set', currentIndex + 1, PARAMETER_SETS[currentIndex].name);
      setTimeout(() => {
        onParametersChange(PARAMETER_SETS[currentIndex]);
      }, 0);
    }
  }, [isActive, hasStarted, currentIndex, onParametersChange]);

  // Timer effect
  useEffect(() => {
    if (!isActive || !hasStarted) return;

    console.log('🧪 DEBUG: Starting timer for parameter set', currentIndex + 1);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        console.log('🧪 DEBUG: Timer tick, remaining:', prev - 1);
        if (prev <= 1) {
          // Time for this parameter set is up
          const nextIndex = currentIndex + 1;
          
          if (nextIndex >= PARAMETER_SETS.length) {
            // Testing complete
            console.log('🧪 DEBUG: Testing complete!');
            onComplete();
            return 10;
          } else {
            // Move to next parameter set
            console.log('🧪 DEBUG: Moving to next parameter set:', nextIndex + 1);
            setCurrentIndex(nextIndex);
            return 10;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, hasStarted, currentIndex, onComplete]);

  if (!isActive) {
    console.log('🧪 DEBUG: ParameterTester not active, not rendering');
    return null;
  }

  console.log('🧪 DEBUG: ParameterTester rendering, currentIndex:', currentIndex, 'timeRemaining:', timeRemaining);
  const currentParams = PARAMETER_SETS[currentIndex];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 10000,
      minWidth: '350px',
      border: '2px solid #00ff00'
    }}>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '10px',
        color: '#00ff00'
      }}>
        🎛️ PARAMETER TESTING MODE
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '16px', color: '#ffff00', marginBottom: '5px' }}>
          Set {currentParams.id}/3: {currentParams.name}
        </div>
        <div style={{ color: '#cccccc', fontSize: '12px' }}>
          {currentParams.description}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px',
        marginBottom: '15px',
        fontSize: '12px'
      }}>
        <div>Similarity: <span style={{color: '#00ffff'}}>{currentParams.similarity}</span></div>
        <div>Smoothness: <span style={{color: '#00ffff'}}>{currentParams.smoothness}</span></div>
        <div>Spill: <span style={{color: '#00ffff'}}>{currentParams.spill}</span></div>
        <div>Edge Soft: <span style={{color: '#00ffff'}}>{currentParams.edgeSoftness}</span></div>
      </div>

      <div style={{ 
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: timeRemaining <= 3 ? '#ff0000' : '#00ff00'
      }}>
        ⏱️ {timeRemaining}s remaining
      </div>

      <div style={{ 
        marginTop: '10px',
        fontSize: '11px',
        color: '#888888',
        textAlign: 'center'
      }}>
        Watch for EXTREME visual changes!
      </div>
    </div>
  );
};

export default ParameterTester; 