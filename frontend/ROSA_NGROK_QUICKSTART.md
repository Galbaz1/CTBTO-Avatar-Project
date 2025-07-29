# 🚀 Rosa Pattern 1 with Ngrok - One Command Setup

This guide shows you how to start Rosa Pattern 1 with ngrok tunneling in **one command**.

## 🎯 What This Does

The `start-rosa-with-ngrok.sh` script automatically:

1. ✅ **Kills** any existing Rosa/ngrok processes
2. ✅ **Starts** Rosa Pattern 1 backend (`localhost:8000`)
3. ✅ **Creates** ngrok public tunnel (e.g., `https://abc123.ngrok-free.app`)
4. ✅ **Updates** Tavus persona to use the tunnel URL
5. ✅ **Starts** React frontend (`localhost:3000`)
6. ✅ **Monitors** all services and provides status

## 🚀 One Command Start

```bash
# Option 1: Direct script
./start-rosa-with-ngrok.sh

# Option 2: npm/bun command
npm start
# or
bun start
```

## 📋 Prerequisites

- ✅ ngrok installed (`brew install ngrok`)
- ✅ ngrok auth token configured
- ✅ `.env.local` with `NEXT_TAVUS_API_KEY` and `ROSA_API_KEY`
- ✅ Rosa backend virtual environment set up

## 🎮 Usage

1. **Start everything:**
   ```bash
   ./start-rosa-with-ngrok.sh
   ```

2. **Wait for setup** (about 15-20 seconds):
   ```
   🚀 Rosa Pattern 1 with Ngrok - Complete Setup
   ==================================================
   📋 Step 1: Checking dependencies...
   ✅ All dependencies found

   📋 Step 2: Stopping existing services...
   
   📋 Step 3: Starting Rosa Pattern 1 Backend...
   ✅ Rosa backend running on http://localhost:8000
   
   📋 Step 4: Creating ngrok tunnel...
   ✅ Ngrok tunnel: https://d9a8299943df.ngrok-free.app
   ✅ Tunnel working correctly
   
   📋 Step 5: Updating Tavus persona...
   ✅ Persona updated successfully!
   ✅ Tavus persona updated
   
   📋 Step 6: Starting frontend...
   
   🎉 Rosa Pattern 1 with Ngrok - READY!
   ==================================================
   📡 Rosa Backend: http://localhost:8000
   🌐 Public Tunnel: https://d9a8299943df.ngrok-free.app
   🖥️  Frontend: http://localhost:3000
   🧠 Persona ID: p9c106c443e2
   
   🎤 Ready to test! Go to http://localhost:3000 and speak to Rosa
   ```

3. **Test Rosa:**
   - Go to `http://localhost:3000`
   - Click to start conversation
   - Speak to Rosa - she should respond with CTBTO knowledge!

4. **Stop everything:**
   - Press `Ctrl+C` in the terminal
   - Or run: `npm run rosa:stop`

## 🔧 What's Different from localhost-only?

| Aspect | localhost-only | with ngrok |
|--------|----------------|------------|
| **Tavus Access** | ❌ Can't reach `localhost:8000` | ✅ Can reach public tunnel |
| **Setup Complexity** | Simple | Automated tunnel + persona update |
| **Connection Errors** | ❌ "Meeting ended in error" | ✅ Works perfectly |
| **Usage** | Development testing only | Works with Tavus cloud |

## 🛠️ Troubleshooting

**Script fails with "ngrok not found":**
```bash
brew install ngrok
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

**"NEXT_TAVUS_API_KEY not found":**
- Make sure `.env.local` exists with your Tavus API key

**Rosa backend fails to start:**
- Check that `backend/venv` exists and has dependencies installed
- Make sure port 8000 is not in use by another process

**Ngrok tunnel fails:**
- Make sure you've configured your ngrok auth token
- Check ngrok.log for detailed error messages

## 📊 Script Features

- 🔄 **Auto-cleanup**: Kills existing processes before starting
- 🎯 **Dependency checking**: Validates all requirements before starting
- 🔗 **Automatic tunnel**: Creates and tests ngrok tunnel
- 🧠 **Persona updates**: Automatically configures Tavus with new URL
- 🔍 **Health monitoring**: Continuously checks that services are running
- 🧹 **Graceful shutdown**: Ctrl+C stops everything cleanly

## 📁 Generated Files

- `ngrok.log` - ngrok tunnel logs
- Process IDs are tracked for proper cleanup

---

**🎉 That's it! One command starts everything for Rosa Pattern 1 with ngrok.** 