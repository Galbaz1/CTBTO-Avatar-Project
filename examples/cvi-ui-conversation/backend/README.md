# Rosa Python Backend - Agent1.py

This is the Python backend implementation for Rosa using **Pattern 2 (Function Calling Hybrid)** architecture.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup
Make sure you have your OpenAI API key set as an environment variable:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

Or add it to your shell profile (`.zshrc`, `.bashrc`, etc.):
```bash
echo 'export OPENAI_API_KEY="your-openai-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Test the CTBTO Agent
```bash
python Agent1.py
```

This will run a test sequence that demonstrates the agent's capabilities with various CTBTO-related questions.

## Agent1.py Features

### 🤖 CTBTOAgent Class
- **System Message**: Configured to emphasize that "CTBTO is going to save humanity"
- **OpenAI Integration**: Uses GPT-4o for intelligent responses
- **CTBTO Detection**: Automatically identifies CTBTO-related queries
- **Error Handling**: Graceful fallback responses

### 🧪 Test Questions
The test function includes:
- "What is the CTBTO?"
- "Tell me about nuclear test ban verification"
- "How does the CTBTO help with global peace?"
- "What is the weather like today?" (non-CTBTO for comparison)

### 📋 Expected Output Format
```
🤔 Question: What is the CTBTO?
🤖 CTBTO-related: True
💬 Response: The CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization) is going to save humanity through its crucial work in nuclear test ban verification and monitoring...
```

## Architecture Notes

This is **Step 1** of implementing Rosa's backend using Pattern 2:
- **Pattern 2**: Function Calling Hybrid (smart delegation)
- Simple queries handled by Tavus directly (150-300ms)
- Complex queries routed to this Python backend via function calls
- Allows for <200ms response time requirement for 70% of interactions

## Next Steps
1. ✅ Basic CTBTO Agent (Current)
2. 🔄 Flask API server for function calls
3. 🔄 Integration with Tavus function calling
4. 🔄 Multi-agent orchestrator
5. 🔄 Red zone filtering
6. 🔄 UI integration for split-screen display

## Troubleshooting

### Common Issues
- **No OPENAI_API_KEY**: Make sure the environment variable is set
- **Module not found**: Run `pip install -r requirements.txt`
- **API errors**: Check your OpenAI API key validity and credits

### Development Environment
- **OS**: macOS (Darwin 24.5.0)
- **Python**: 3.8+ recommended
- **Shell**: zsh 