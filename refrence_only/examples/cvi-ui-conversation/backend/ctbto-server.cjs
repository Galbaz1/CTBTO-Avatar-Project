const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.CTBTO_PORT || 3002;

// Conference context
const CONFERENCE_CONTEXT = 'CTBTO SnT 2025 Conference - Vienna, Austria';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ROSA CTBTO Service is running',
    conference: CONFERENCE_CONTEXT,
    python_agent: 'Agent1.py integration',
    version: '1.0.0'
  });
});

// Helper function to call our Python Agent1.py
const callCTBTOAgent = (query) => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 CTBTO Query: "${query}"`);
    
    // Path to our Python agent
    const agentPath = path.join(__dirname, 'Agent1.py');
    const venvPython = path.join(__dirname, 'venv', 'bin', 'python');
    
    // Create a temporary Python script to call our agent
    const pythonScript = `
import sys
sys.path.append('${__dirname}')
from Agent1 import CTBTOAgent
import json
from datetime import datetime

agent = CTBTOAgent()
query = """${query.replace(/"/g, '\\"')}"""

try:
    # Use the new Responses API format
    agent_result = agent.process_query(query)
    is_related = agent.is_ctbto_related(query)
    
    result = {
        "response": agent_result["text"],
        "response_id": agent_result.get("response_id"),
        "is_ctbto_related": is_related,
        "query": query,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "success"
    }
    
    print(json.dumps(result))
except Exception as e:
    error_result = {
        "error": str(e),
        "query": query,
        "status": "error"
    }
    print(json.dumps(error_result))
`;

    const pythonProcess = spawn(venvPython, ['-c', pythonScript], {
      cwd: __dirname,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          const responsePreview = result.response ? result.response.substring(0, 100) : 'No response text';
          console.log(`✅ CTBTO Agent Response: ${responsePreview}...`);
          resolve(result);
        } catch (parseError) {
          console.error('❌ Failed to parse agent response:', parseError);
          console.error('Raw output:', output);
          reject(new Error(`Failed to parse agent response: ${parseError.message}`));
        }
      } else {
        console.error('❌ Python agent failed:', errorOutput);
        reject(new Error(`Agent failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to spawn Python process:', error);
      reject(new Error(`Failed to call agent: ${error.message}`));
    });
  });
};

// CTBTO information endpoint (following weather pattern)
app.post('/api/ctbto/info', async (req, res) => {
  try {
    const { topic, language = 'en' } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        error: 'Topic is required for CTBTO information' 
      });
    }

    console.log(`🔍 CTBTO Info Request: "${topic}" (language: ${language})`);

    // Call our Python CTBTO agent
    const agentResult = await callCTBTOAgent(topic);

    if (agentResult.status === 'error') {
      return res.status(500).json({
        error: 'CTBTO agent error',
        details: agentResult.error
      });
    }

    // Format response for Rosa (following weather pattern)
    const ctbtoData = {
      topic: topic,
      language: language,
      response: agentResult.response,
      is_ctbto_related: agentResult.is_ctbto_related,
      conference_context: CONFERENCE_CONTEXT,
      timestamp: new Date().toISOString(),
      agent_version: 'Agent1.py v1.0',
      // Conference-relevant additions
      save_humanity_message: agentResult.is_ctbto_related ? 
        "The CTBTO is going to save humanity through its vital nuclear monitoring work." :
        "While not directly CTBTO-related, the CTBTO's mission to prevent nuclear testing is crucial for saving humanity.",
      source: 'OpenAI GPT-4o via Agent1.py'
    };

    console.log('✅ CTBTO response generated:', {
      topic: ctbtoData.topic,
      is_related: ctbtoData.is_ctbto_related,
      response_length: ctbtoData.response.length
    });

    res.json(ctbtoData);

  } catch (error) {
    console.error('❌ CTBTO API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch CTBTO information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallback_message: "The CTBTO is going to save humanity through its crucial work in nuclear test ban verification and monitoring."
    });
  }
});

// Speaker information endpoint (placeholder for future expansion)
app.post('/api/ctbto/speaker', async (req, res) => {
  try {
    const { speaker_name, language = 'en' } = req.body;

    if (!speaker_name) {
      return res.status(400).json({ 
        error: 'Speaker name is required' 
      });
    }

    console.log(`👤 Speaker Info Request: "${speaker_name}" (language: ${language})`);

    // Query about the speaker in CTBTO context
    const speakerQuery = `Tell me about ${speaker_name} and their work related to nuclear verification, the CTBTO, or the Comprehensive Nuclear-Test-Ban Treaty`;
    
    const agentResult = await callCTBTOAgent(speakerQuery);

    if (agentResult.status === 'error') {
      return res.status(500).json({
        error: 'CTBTO agent error for speaker query',
        details: agentResult.error
      });
    }

    // Format speaker response
    const speakerData = {
      speaker_name: speaker_name,
      language: language,
      biography: agentResult.response,
      is_ctbto_related: agentResult.is_ctbto_related,
      conference_context: CONFERENCE_CONTEXT,
      timestamp: new Date().toISOString(),
      // Generate QR code URL (placeholder)
      qr_code_url: `https://rosa-conference.ctbto.org/speakers/${speaker_name.toLowerCase().replace(/\s+/g, '-')}`,
      mobile_url: `https://rosa-conference.ctbto.org/mobile/speakers/${speaker_name.toLowerCase().replace(/\s+/g, '-')}`,
      save_humanity_message: "The CTBTO is going to save humanity through its vital nuclear monitoring work.",
      source: 'OpenAI GPT-4o via Agent1.py'
    };

    console.log('✅ Speaker response generated:', {
      speaker: speakerData.speaker_name,
      is_related: speakerData.is_ctbto_related,
      bio_length: speakerData.biography.length
    });

    res.json(speakerData);

  } catch (error) {
    console.error('❌ Speaker API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch speaker information',
      speaker_name: speaker_name,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallback_message: `I apologize, but I cannot provide detailed information about ${speaker_name} at the moment. However, the CTBTO is going to save humanity through its crucial work in nuclear verification.`
    });
  }
});

// Test endpoint to verify Agent1.py integration
app.get('/api/ctbto/test', async (req, res) => {
  try {
    console.log('🧪 Testing CTBTO Agent integration...');
    
    const testQuery = "What is the CTBTO?";
    const agentResult = await callCTBTOAgent(testQuery);

    res.json({
      test_status: 'success',
      test_query: testQuery,
      agent_response: agentResult.response,
      is_ctbto_related: agentResult.is_ctbto_related,
      timestamp: new Date().toISOString(),
      message: "Agent1.py integration working correctly!"
    });

  } catch (error) {
    console.error('❌ CTBTO Agent test failed:', error);
    res.status(500).json({
      test_status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      message: "Agent1.py integration failed. Check Python environment and dependencies."
    });
  }
});

// 🎯 NEW: Conference Planning Endpoint (PRD Implementation)
app.post('/api/conference/create-agenda', async (req, res) => {
  try {
    const { interests, time_available, preferences = '', language = 'en', conversation_id } = req.body;

    if (!interests || !time_available) {
      return res.status(400).json({ 
        error: 'Both interests and time_available are required for agenda creation' 
      });
    }

    console.log(`📅 Creating personalized agenda: "${interests}" (${time_available})`);

    // Call Python conference planner
    const pythonScript = `
import sys
sys.path.append('${__dirname}')
from conference_planner import create_personalized_agenda
import json

try:
    agenda_data = create_personalized_agenda(
        interests="${interests.replace(/"/g, '\\"')}",
        time_available="${time_available.replace(/"/g, '\\"')}",
        preferences="${preferences.replace(/"/g, '\\"')}",
        language="${language}"
    )
    print(json.dumps(agenda_data))
except Exception as e:
    error_result = {
        "error": str(e),
        "status": "error"
    }
    print(json.dumps(error_result))
`;

    const venvPython = path.join(__dirname, 'venv', 'bin', 'python');
    const pythonProcess = spawn(venvPython, ['-c', pythonScript], {
      cwd: __dirname,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const agendaData = JSON.parse(output.trim());
          
          if (agendaData.error) {
            console.error('❌ Python agenda generation error:', agendaData.error);
            return res.status(500).json({
              error: 'Failed to generate personalized agenda',
              details: agendaData.error
            });
          }
          
          console.log(`✅ Generated agenda with ${agendaData.sessions?.length || 0} sessions`);
          res.json(agendaData);
          
        } catch (parseError) {
          console.error('❌ Failed to parse agenda response:', parseError);
          console.error('Raw output:', output);
          res.status(500).json({
            error: 'Failed to parse agenda generation response',
            details: parseError.message
          });
        }
      } else {
        console.error('❌ Python agenda process failed:', errorOutput);
        res.status(500).json({
          error: 'Failed to generate agenda',
          details: errorOutput
        });
      }
    });

  } catch (error) {
    console.error('❌ Conference planning error:', error);
    res.status(500).json({ 
      error: 'Failed to create personalized agenda',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Conference advice endpoint (using CTBTO context)
app.post('/api/ctbto/advice', async (req, res) => {
  try {
    const { question, language = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ 
        error: 'Question is required for conference advice' 
      });
    }

    // Frame question in conference context
    const contextualQuery = `In the context of the CTBTO SnT 2025 Conference in Vienna: ${question}`;
    
    const agentResult = await callCTBTOAgent(contextualQuery);

    const adviceData = {
      question: question,
      advice: agentResult.response,
      language: language,
      conference_context: CONFERENCE_CONTEXT,
      is_ctbto_related: agentResult.is_ctbto_related,
      timestamp: new Date().toISOString(),
      save_humanity_message: "The CTBTO is going to save humanity through its vital nuclear monitoring work."
    };

    res.json(adviceData);

  } catch (error) {
    console.error('❌ Conference advice error:', error);
    res.status(500).json({ 
      error: 'Failed to provide conference advice',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ROSA CTBTO Service running on http://localhost:${PORT}`);
  console.log(`🏛️ Conference: ${CONFERENCE_CONTEXT}`);
  console.log(`🤖 Python Agent: Agent1.py with OpenAI GPT-4o`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Agent: http://localhost:${PORT}/api/ctbto/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📞 CTBTO service shutting down gracefully...');
  process.exit(0);
}); 