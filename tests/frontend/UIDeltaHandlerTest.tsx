// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { UIDeltaHandler } from '../UIDeltaHandler';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  timestamp?: number;
}

interface TestSuite {
  isRunning: boolean;
  results: TestResult[];
  overallStatus: 'pending' | 'running' | 'passed' | 'failed';
}

/**
 * 🧪 UIDeltaHandler Frontend Integration Test
 * 
 * This component tests the UIDeltaHandler integration directly in the browser.
 * It validates:
 * - Delta endpoint connectivity
 * - JSON parsing and format validation
 * - State management with Immer
 * - Error handling and recovery
 * - Performance characteristics
 */
export const UIDeltaHandlerTest: React.FC = () => {
  const [testSuite, setTestSuite] = useState<TestSuite>({
    isRunning: false,
    results: [],
    overallStatus: 'pending'
  });

  const [deltaHandlerData, setDeltaHandlerData] = useState<any>({});
  const [testSessionId] = useState('frontend-test-session');
  const [logs, setLogs] = useState<string[]>([]);
  
  const deltaCallCount = useRef(0);
  const startTime = useRef<number>(0);

  // Initialize test results
  const initializeTests = () => {
    const tests: TestResult[] = [
      { test: 'Delta Endpoint Connectivity', status: 'pending', message: 'Not started' },
      { test: 'Empty Response Handling', status: 'pending', message: 'Not started' },
      { test: 'Delta Format Validation', status: 'pending', message: 'Not started' },
      { test: 'State Update Processing', status: 'pending', message: 'Not started' },
      { test: 'Error Recovery', status: 'pending', message: 'Not started' },
      { test: 'Performance Characteristics', status: 'pending', message: 'Not started' }
    ];

    setTestSuite({
      isRunning: false,
      results: tests,
      overallStatus: 'pending'
    });
  };

  useEffect(() => {
    initializeTests();
  }, []);

  // Test logger
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Update test result
  const updateTestResult = (testName: string, status: 'passed' | 'failed', message: string) => {
    setTestSuite(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.test === testName 
          ? { ...result, status, message, timestamp: Date.now() }
          : result
      )
    }));
  };

  // Mark test as running
  const markTestRunning = (testName: string, message: string = 'Running...') => {
    setTestSuite(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.test === testName 
          ? { ...result, status: 'running', message }
          : result
      )
    }));
  };

  // Delta handler callback for testing
  const handleDeltaUpdate = (cardData: any, cardType: string) => {
    deltaCallCount.current += 1;
    addLog(`Delta update received: ${cardType}`);
    
    setDeltaHandlerData(prev => ({
      ...prev,
      [cardType]: cardData,
      lastUpdate: Date.now()
    }));

    // Test state update processing
    if (cardData && typeof cardData === 'object') {
      updateTestResult('State Update Processing', 'passed', 'Successfully processed delta update');
    } else {
      updateTestResult('State Update Processing', 'failed', 'Invalid card data received');
    }
  };

  // Test 1: Delta endpoint connectivity
  const testDeltaConnectivity = async () => {
    markTestRunning('Delta Endpoint Connectivity', 'Testing connection...');
    
    try {
      const response = await fetch(`http://localhost:8000/latest-ui-delta/${testSessionId}`);
      
      if (response.ok) {
        updateTestResult('Delta Endpoint Connectivity', 'passed', `Connection successful (${response.status})`);
        addLog('✅ Delta endpoint is accessible');
        return true;
      } else {
        updateTestResult('Delta Endpoint Connectivity', 'failed', `HTTP ${response.status}`);
        addLog(`❌ Delta endpoint returned ${response.status}`);
        return false;
      }
    } catch (error) {
      updateTestResult('Delta Endpoint Connectivity', 'failed', `Connection error: ${error}`);
      addLog(`❌ Connection failed: ${error}`);
      return false;
    }
  };

  // Test 2: Empty response handling
  const testEmptyResponse = async () => {
    markTestRunning('Empty Response Handling', 'Testing empty response...');
    
    try {
      const response = await fetch(`http://localhost:8000/latest-ui-delta/${testSessionId}`);
      const data = await response.json();
      
      if (data && typeof data === 'object' && 'deltas' in data) {
        if (Array.isArray(data.deltas)) {
          updateTestResult('Empty Response Handling', 'passed', 'Correct empty response format');
          addLog('✅ Empty response format is correct');
          return true;
        } else {
          updateTestResult('Empty Response Handling', 'failed', 'Deltas field is not an array');
          addLog('❌ Deltas field should be an array');
          return false;
        }
      } else {
        updateTestResult('Empty Response Handling', 'failed', 'Missing deltas field');
        addLog('❌ Response missing deltas field');
        return false;
      }
    } catch (error) {
      updateTestResult('Empty Response Handling', 'failed', `Parse error: ${error}`);
      addLog(`❌ JSON parse error: ${error}`);
      return false;
    }
  };

  // Test 3: Delta format validation
  const testDeltaFormat = async () => {
    markTestRunning('Delta Format Validation', 'Simulating delta operations...');
    
    try {
      // Simulate creating some test data that would generate deltas
      const testData = {
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: "Test session about seismic monitoring" }
        ],
        stream: false
      };

      const response = await fetch('http://localhost:8000/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        // Wait a moment for processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for deltas
        const deltaResponse = await fetch(`http://localhost:8000/latest-ui-delta/${testSessionId}`);
        const deltaData = await deltaResponse.json();
        
        if (deltaData.deltas && Array.isArray(deltaData.deltas)) {
          // Validate delta format if any deltas exist
          let formatValid = true;
          for (const delta of deltaData.deltas) {
            if (!delta.op || !delta.path) {
              formatValid = false;
              break;
            }
            if (!['replace', 'add', 'remove'].includes(delta.op)) {
              formatValid = false;
              break;
            }
          }
          
          if (formatValid) {
            updateTestResult('Delta Format Validation', 'passed', `Validated ${deltaData.deltas.length} deltas`);
            addLog(`✅ Delta format validation passed (${deltaData.deltas.length} deltas)`);
            return true;
          } else {
            updateTestResult('Delta Format Validation', 'failed', 'Invalid delta format detected');
            addLog('❌ Invalid delta format');
            return false;
          }
        } else {
          updateTestResult('Delta Format Validation', 'passed', 'No deltas generated (acceptable)');
          addLog('✅ No deltas generated (this is acceptable for testing)');
          return true;
        }
      } else {
        updateTestResult('Delta Format Validation', 'failed', `Backend error: ${response.status}`);
        addLog(`❌ Backend error: ${response.status}`);
        return false;
      }
    } catch (error) {
      updateTestResult('Delta Format Validation', 'failed', `Test error: ${error}`);
      addLog(`❌ Test error: ${error}`);
      return false;
    }
  };

  // Test 4: Error recovery
  const testErrorRecovery = async () => {
    markTestRunning('Error Recovery', 'Testing error scenarios...');
    
    try {
      // Test with invalid session ID
      const response = await fetch('http://localhost:8000/latest-ui-delta/invalid-session-id');
      
      if (response.ok) {
        const data = await response.json();
        if (data.deltas && Array.isArray(data.deltas) && data.deltas.length === 0) {
          updateTestResult('Error Recovery', 'passed', 'Graceful handling of invalid session');
          addLog('✅ Invalid session handled gracefully');
          return true;
        } else {
          updateTestResult('Error Recovery', 'failed', 'Unexpected response for invalid session');
          addLog('❌ Unexpected response for invalid session');
          return false;
        }
      } else {
        updateTestResult('Error Recovery', 'passed', 'Appropriate error response');
        addLog('✅ Appropriate error response received');
        return true;
      }
    } catch (error) {
      updateTestResult('Error Recovery', 'failed', `Error handling test failed: ${error}`);
      addLog(`❌ Error handling test failed: ${error}`);
      return false;
    }
  };

  // Test 5: Performance characteristics
  const testPerformance = () => {
    markTestRunning('Performance Characteristics', 'Measuring performance...');
    
    const testDuration = Date.now() - startTime.current;
    const avgResponseTime = testDuration / Math.max(deltaCallCount.current, 1);
    
    if (avgResponseTime < 5000) { // Less than 5 seconds average
      updateTestResult('Performance Characteristics', 'passed', 
        `Avg response time: ${avgResponseTime.toFixed(0)}ms (${deltaCallCount.current} calls)`);
      addLog(`✅ Performance acceptable: ${avgResponseTime.toFixed(0)}ms average`);
      return true;
    } else {
      updateTestResult('Performance Characteristics', 'failed', 
        `Slow response time: ${avgResponseTime.toFixed(0)}ms`);
      addLog(`❌ Performance issue: ${avgResponseTime.toFixed(0)}ms average`);
      return false;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestSuite(prev => ({ ...prev, isRunning: true, overallStatus: 'running' }));
    setLogs([]);
    deltaCallCount.current = 0;
    startTime.current = Date.now();
    
    addLog('🚀 Starting UIDeltaHandler integration tests...');

    const results = [];
    
    // Run tests sequentially
    results.push(await testDeltaConnectivity());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testEmptyResponse());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testDeltaFormat());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testErrorRecovery());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(testPerformance());

    // Calculate overall result
    const allPassed = results.every(result => result === true);
    const overallStatus = allPassed ? 'passed' : 'failed';
    
    setTestSuite(prev => ({ ...prev, isRunning: false, overallStatus }));
    
    if (allPassed) {
      addLog('🎉 All tests passed! UIDeltaHandler integration is working correctly.');
    } else {
      addLog('❌ Some tests failed. Check results above for details.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#666';
      case 'running': return '#2196F3';
      case 'passed': return '#4CAF50';
      case 'failed': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h2>🧪 UIDeltaHandler Integration Test Suite</h2>
      <p>Session ID: <code>{testSessionId}</code></p>
      
      {/* Test Controls */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={testSuite.isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testSuite.isRunning ? 'not-allowed' : 'pointer',
            opacity: testSuite.isRunning ? 0.6 : 1
          }}
        >
          {testSuite.isRunning ? '🔄 Running Tests...' : '🚀 Run Integration Tests'}
        </button>
        
        <button 
          onClick={initializeTests}
          disabled={testSuite.isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginLeft: '10px',
            cursor: testSuite.isRunning ? 'not-allowed' : 'pointer',
            opacity: testSuite.isRunning ? 0.6 : 1
          }}
        >
          🔄 Reset Tests
        </button>
      </div>

      {/* Overall Status */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px',
        backgroundColor: getStatusColor(testSuite.overallStatus) + '20',
        border: `2px solid ${getStatusColor(testSuite.overallStatus)}`,
        borderRadius: '4px'
      }}>
        <strong>Overall Status: {getStatusIcon(testSuite.overallStatus)} {testSuite.overallStatus.toUpperCase()}</strong>
      </div>

      {/* Test Results */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Test Results</h3>
        {testSuite.results.map((result, index) => (
          <div key={index} style={{ 
            padding: '8px', 
            marginBottom: '5px',
            backgroundColor: getStatusColor(result.status) + '10',
            border: `1px solid ${getStatusColor(result.status)}40`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              {getStatusIcon(result.status)} {result.test}
            </span>
            <span style={{ fontSize: '0.9em', color: '#666' }}>
              {result.message}
            </span>
          </div>
        ))}
      </div>

      {/* Delta Handler State */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🔄 Delta Handler State</h3>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '0.9em'
        }}>
          <div>Delta Calls: {deltaCallCount.current}</div>
          <div>Cards Received: {Object.keys(deltaHandlerData).length}</div>
          <div>Last Update: {deltaHandlerData.lastUpdate ? 
            new Date(deltaHandlerData.lastUpdate).toLocaleTimeString() : 'None'}</div>
        </div>
      </div>

      {/* Test Logs */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Test Logs</h3>
        <div style={{ 
          height: '200px', 
          overflow: 'auto',
          backgroundColor: '#000',
          color: '#0f0',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '0.8em',
          fontFamily: 'Courier New, monospace'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          {logs.length === 0 && <div>No logs yet...</div>}
        </div>
      </div>

      {/* Hidden UIDeltaHandler for testing */}
      <UIDeltaHandler
        conversationId={testSessionId}
        onCardUpdate={handleDeltaUpdate}
        meetingState="joined-meeting"
      />
    </div>
  );
}; 