# System Prompt Management & Tavus Synchronization Guide

## 🎯 **Overview**

This guide outlines best practices for managing system prompts and keeping your Tavus persona synchronized with your backend code changes.

## 📋 **Architecture: Backend-Centric Approach**

### **Current Setup:**
- **Tavus Cloud**: Minimal system prompt (basic persona definition)
- **Your Backend**: Detailed system prompts, context, and logic
- **Auto-Sync**: Automatic persona updates on startup

### **Why This Approach?**
1. **Single Source of Truth**: All prompt logic lives in your backend code
2. **Version Control**: System prompts are tracked in git with your code
3. **Dynamic Context**: RAG results and context injection happen in backend
4. **Best Practice**: Avoids dynamic system prompt changes (per Tavus docs)

## 🔧 **Current Implementation**

### **1. Tavus Persona Configuration (Minimal)**
```json
{
  "system_prompt": "You are Rosa, an AI assistant for the CTBTO SnT 2025 conference. Respond diplomatically and use available tools when appropriate.",
  "context": "Basic conference context...",
  "layers": {
    "llm": {
      "base_url": "https://your-ngrok-url.ngrok-free.app",
      "model": "rosa-ctbto-agent"
    }
  }
}
```

### **2. Backend System Prompt (Detailed)**
Located in: `backend/main_conversation_agent.py`

```python
ROSA_SYSTEM_PROMPT = """
You are Rosa, the AI diplomatic assistant for the Comprehensive Nuclear-Test-Ban Treaty Organization (CTBTO) 
Science & Technology 2025 conference in Vienna.

[Detailed persona, guidelines, tools usage, etc.]
"""
```

## 🚀 **Synchronization Workflow**

### **Automatic Sync (Recommended)**
The persona is automatically synchronized when you start the application:

```bash
# Starts backend, frontend, ngrok, AND syncs persona
bun start
```

**What happens:**
1. ✅ Backend starts on port 8000
2. ✅ Frontend starts on port 5173  
3. ✅ Ngrok tunnel created to backend
4. ✅ **Persona automatically updated** with new ngrok URL

### **Manual Sync (When Needed)**
```bash
# Sync persona with current ngrok URL
./scripts/sync-persona.sh
```

### **System Prompt Updates**
When you change system prompts in your backend code:

```bash
# 1. Update your backend system prompt
vim backend/main_conversation_agent.py

# 2. Restart to apply changes  
bun start

# 3. Persona is auto-synced with new ngrok URL
# (System prompt changes are in backend, no sync needed)
```

## 📝 **Best Practices**

### **✅ DO:**

1. **Keep detailed prompts in backend code**
   ```python
   # backend/main_conversation_agent.py
   ROSA_SYSTEM_PROMPT = """
   Detailed instructions...
   """
   ```

2. **Use static system prompts**
   - Don't change system prompts during conversation
   - Put dynamic context in user messages, not system

3. **Auto-sync on deployment**
   ```bash
   # Always run sync after deployment
   ./scripts/sync-persona.sh
   ```

4. **Version control everything**
   ```bash
   git add backend/main_conversation_agent.py
   git commit -m "Update Rosa system prompt"
   ```

### **❌ DON'T:**

1. **Don't put RAG context in system prompts**
   ```python
   # ❌ BAD - Dynamic system prompt
   system_prompt = f"You are Rosa. Context: {dynamic_context}"
   
   # ✅ GOOD - Static system, dynamic user message
   user_message = f"Context: {dynamic_context}\nUser: {question}"
   ```

2. **Don't manually update Tavus persona for system prompts**
   - Keep Tavus persona minimal
   - Let backend handle detailed prompts

3. **Don't forget to sync after ngrok restarts**
   - Use auto-sync in startup script
   - Or run manual sync if needed

## 🔄 **Development Workflow**

### **Daily Development:**
```bash
# 1. Start everything (auto-syncs persona)
bun start

# 2. Make code changes in backend
# 3. Test voice interactions 
# 4. No manual sync needed - ngrok URL stays same
```

### **After Restart/Deployment:**
```bash
# 1. Restart services (new ngrok URL)
bun start  # Auto-syncs persona

# 2. Verify sync worked
curl -H "x-api-key: $TAVUS_API_KEY" \
  https://tavusapi.com/v2/personas/p9c106c443e2
```

### **System Prompt Changes:**
```bash
# 1. Edit backend system prompt
vim backend/main_conversation_agent.py

# 2. Test locally (no sync needed)
# Backend changes are picked up immediately

# 3. Deploy/commit changes
git add -A && git commit -m "Update system prompt"
```

## 🛠 **Tools & Scripts**

### **Auto-Sync Script: `scripts/sync-persona.sh`**
- Updates Tavus persona with current ngrok URL
- Sets minimal system prompt
- Shows current configuration
- Runs automatically on `bun start`

### **Manual Sync:**
```bash
./scripts/sync-persona.sh
```

### **Check Current Configuration:**
```bash
# View current persona config
curl -H "x-api-key: $TAVUS_API_KEY" \
  https://tavusapi.com/v2/personas/p9c106c443e2 | jq

# Check current ngrok URL
curl -s http://127.0.0.1:4040/api/tunnels | jq '.tunnels[0].public_url'
```

## 🚨 **Troubleshooting**

### **Voice Input Ends Immediately:**
1. **Check ngrok URL mismatch:**
   ```bash
   # Get current ngrok URL
   curl -s http://127.0.0.1:4040/api/tunnels | jq '.tunnels[0].public_url'
   
   # Check persona URL
   curl -H "x-api-key: $TAVUS_API_KEY" \
     https://tavusapi.com/v2/personas/p9c106c443e2 | jq '.layers.llm.base_url'
   ```

2. **Re-sync if URLs don't match:**
   ```bash
   ./scripts/sync-persona.sh
   ```

### **System Prompt Not Applied:**
- System prompt changes should be made in **backend code**, not Tavus persona
- Restart backend to apply changes
- Backend system prompt overrides Tavus persona prompt

### **Sync Script Fails:**
```bash
# Check if ngrok is running
curl -s http://127.0.0.1:4040/api/tunnels

# Check if Tavus API key is set
echo $TAVUS_API_KEY

# Run with debug
bash -x scripts/sync-persona.sh
```

## 🎯 **Key Takeaways**

1. **🏠 Backend = Source of Truth**: All detailed prompts live in your code
2. **☁️ Tavus = Minimal Configuration**: Just basic persona definition
3. **🔄 Auto-Sync**: Persona updates automatically on startup
4. **📝 Version Control**: System prompts are tracked with your code
5. **🚀 Fast Iteration**: Change backend prompts → restart → test immediately

This approach ensures your system prompts stay in sync with your codebase while following Tavus best practices for stable, performant conversations. 