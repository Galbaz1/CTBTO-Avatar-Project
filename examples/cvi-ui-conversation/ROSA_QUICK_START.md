# Rosa Pattern 1 - Quick Start Guide

> **🎉 One-Command Startup Available!**

## 🚀 **Super Quick Start**

```bash
cd examples/cvi-ui-conversation
bun start
# or: npm start
# or: ./start-rosa-pattern1-complete.sh
```

**That's it!** This single command will:
- ✅ Start Rosa Pattern 1 Backend (port 8000)
- ✅ Start Frontend with Avatar UI (port 5173)  
- ✅ Handle all setup and dependencies
- ✅ Show clear status updates

## 🎯 **How to Use**

1. **Visit**: http://localhost:5173
2. **Enter** your Tavus API key from `.env.local`
3. **Start conversation** with Rosa!

## 🧠 **What You Get**

- **👤 Rosa Avatar**: Diplomatic CTBTO conference assistant
- **🧠 Custom Backend**: All responses via our Agent1.py
- **⚡ Pattern 1**: Direct Custom LLM architecture
- **🎯 Complete Control**: Every message through our backend

## 🛑 **To Stop**

Press **Ctrl+C** in the terminal running the startup script.

## 📋 **Alternative Commands**

```bash
# Start just backend
bun run rosa:pattern1

# Start just frontend  
bun run dev

# Stop all Rosa services
bun run rosa:stop

# Backend-only startup script
./start-rosa-pattern1.sh
```

## 🏗️ **Architecture**

```
User Speech → Tavus STT → Rosa Backend → Agent1.py → GPT-4o → Tavus Avatar
```

## ⚙️ **Configuration**

- **Backend**: http://localhost:8000 (OpenAI-compatible)
- **Frontend**: http://localhost:5173 (React + Tavus CVI)
- **Persona ID**: `p95517e0594f` (Rosa Pattern 1 Custom LLM)
- **Auth Key**: `rosa-backend-key-2025` (from `.env.local`)

---

**🎉 Rosa Pattern 1 is ready!** The simplest way to get Rosa running with full CTBTO intelligence and custom backend control. 