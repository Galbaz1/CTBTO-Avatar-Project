# NGROK Integration Guide for Rosa Custom Backend

## 🎯 Overview

This document explains how NGROK is used in the Rosa custom backend application to enable client demonstrations and development workflows. NGROK solves the critical problem of making your local backend accessible to Tavus Cloud services.

## 🏗️ Architecture Flow

```
Rosa Frontend (localhost:5173) 
    ↓
Tavus Cloud Service (tavusapi.com)
    ↓
NGROK Tunnel (e.g., https://abc123.ngrok-free.app) 
    ↓
Your Local Backend (localhost:8000)
    ↓ 
Agent1.py (CTBTO Intelligence)
```

### Why NGROK is Required

- **Tavus Cloud** needs to reach your backend via HTTP requests
- **localhost:8000** is not accessible from the internet
- **NGROK creates a secure tunnel** from public internet to your local machine
- **Automatic persona updates** configure Tavus to use the tunnel URL

## 🚀 Current Implementation

### Script: `start-rosa-with-ngrok.sh`

Your production-quality script automatically handles:

1. **Process Management**
   - Kills existing Rosa backend and NGROK processes
   - Prevents port conflicts and stale tunnels

2. **Backend Startup**
   - Starts Rosa Pattern 1 API on `localhost:8000`
   - Validates backend health before proceeding

3. **NGROK Tunnel Creation**
   - Creates secure tunnel: `ngrok http 8000`
   - Generates public URL (e.g., `https://d9a8299943df.ngrok-free.app`)
   - Tests tunnel connectivity

4. **Tavus Integration**
   - Automatically updates persona `peea5e466a91`
   - Patches `base_url` with new NGROK URL
   - Preserves all other persona settings

5. **Frontend Launch**
   - Starts React frontend on `localhost:5173`
   - Provides complete working environment

6. **Health Monitoring**
   - Continuously monitors all services
   - Automatic cleanup on script termination

### Usage Commands

```bash
# Option 1: Direct script execution
./start-rosa-with-ngrok.sh

# Option 2: Package manager commands
npm start
# or
bun start

# Option 3: Stop everything
npm run rosa:stop
```

## 📊 NGROK Free Plan Analysis

### ✅ Perfect for Client Demos

| Feature | Free Plan Limit | Rosa Usage | Status |
|---------|----------------|------------|---------|
| **Data Transfer** | 1 GB/month | ~10-50 MB per demo | ✅ Excellent |
| **Requests** | 20,000/month | ~100-500 per demo | ✅ More than enough |
| **Tunnel Duration** | No timeout | Continuous during dev | ✅ Perfect |
| **Static Domains** | 1 free domain | Can reserve consistent URL | ✅ Professional |
| **Tunnels per Agent** | Up to 3 | Need 1 for Rosa | ✅ Sufficient |

### 🚫 Minor Limitations

- **Interstitial Page**: Visitors see "Continue to site" button (easily bypassed)
- **Random URLs**: Each restart gets new URL (unless static domain reserved)
- **Single Endpoint**: Only 1 tunnel at a time on free plan

### 💡 Removing Interstitial Page

For professional demos, upgrade to any paid plan ($8/month+) to remove the interstitial page.

## 🎯 Client Demonstration Strategies

### **Strategy 1: Live Demo Sessions (Recommended)**

**Best for**: Active development, interactive presentations, technical discussions

```bash
# Start everything with one command
./start-rosa-with-ngrok.sh

# Share frontend URL with client
Frontend: http://localhost:5173
Public Backend: https://xyz123.ngrok-free.app
```

**Pros**: 
- Full control over demo environment
- Real-time interaction and Q&A
- Can show development process and code changes
- Zero cost using free NGROK plan

**Cons**: 
- Requires scheduled meetings
- Computer must stay running during demo
- Network dependency

### **Strategy 2: Persistent Client Access**

**Best for**: Ongoing client testing, asynchronous feedback, 24/7 availability

**Deploy Backend Options:**
- **Heroku** (Free tier available)
- **Railway** (Great Python support)
- **DigitalOcean** ($5/month droplet)
- **Fly.io** (Generous free tier)

**Deploy Frontend:**
- **Vercel/Netlify** (Free static hosting)

**Pros**:
- 24/7 client access
- No dependency on your computer
- Professional deployment experience

**Cons**:
- Setup complexity
- Potential hosting costs
- Environment configuration

### **Strategy 3: Hybrid Approach (Best of Both)**

**Recommended Workflow:**

1. **Development & Live Demos**: Use NGROK setup
2. **Client Testing**: Deploy staging environment
3. **Production**: Full cloud deployment

## 💻 Computer Requirements

### **With NGROK (Current Setup)**

- ✅ **Computer must stay running** for tunnel to work
- ✅ **NGROK agent** maintains persistent connection
- ❌ **Sleep/shutdown** → tunnel dies → client loses access
- ✅ **Network required** for tunnel maintenance

### **For 24/7 Client Access Without Your Computer**

Choose one approach:

1. **Cloud Deployment** (recommended)
   ```bash
   # Deploy backend to Heroku/Railway/DigitalOcean
   # Update Tavus persona with production URL
   # Frontend can be static on Vercel/Netlify
   ```

2. **Dedicated Development Machine**
   - Dedicated computer/server running 24/7
   - NGROK tunnel always active

3. **Cloud Development Environment**
   - GitHub Codespaces
   - GitPod
   - Cloud-based development with persistent tunnels

## 🔧 Professional Demo Setup

### Reserve Static NGROK Domain (FREE)

```bash
# 1. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 2. Reserve domain at https://dashboard.ngrok.com/domains
# Choose something like: rosa-demo-yourname.ngrok-free.app

# 3. Update start-rosa-with-ngrok.sh to use static domain
ngrok http 8000 --url=rosa-demo-yourname.ngrok-free.app
```

### Enhanced Script for Static Domain

```bash
# Modify start-rosa-with-ngrok.sh line 83:
# From: ngrok http 8000 --log=stdout > ngrok.log 2>&1 &
# To: ngrok http 8000 --url=your-reserved-domain.ngrok-free.app --log=stdout > ngrok.log 2>&1 &
```

### Client Demo Checklist

**Before Demo:**
- [ ] Test `./start-rosa-with-ngrok.sh` works completely
- [ ] Verify NGROK tunnel is accessible externally
- [ ] Test complete conversation flow with Rosa
- [ ] Prepare demo script/talking points
- [ ] Have backup plan (screen recording, screenshots)

**During Demo:**
- [ ] Share screen showing frontend
- [ ] Demonstrate voice interaction with Rosa
- [ ] Show CTBTO knowledge responses
- [ ] Highlight split-screen UI design
- [ ] Explain diplomatic privacy features

**After Demo:**
- [ ] Provide NGROK URL for client testing (if appropriate)
- [ ] Schedule follow-up sessions
- [ ] Document feedback and requirements

## 🛡️ Security Considerations

### Current Security Features

- ✅ **HTTPS Encryption**: All NGROK tunnels use TLS encryption
- ✅ **API Key Authentication**: Backend requires `rosa-backend-key-2025`
- ✅ **Tavus Authentication**: Handles user identity and permissions
- ✅ **No Sensitive Data**: Frontend doesn't expose API keys or secrets
- ✅ **Privacy Compliant**: No camera/video capture per diplomatic requirements

### Additional Security for Client Demos

```bash
# Option 1: Add basic auth to NGROK tunnel
ngrok http 8000 --basic-auth "demo:clientpassword"

# Option 2: Use IP restrictions (paid plans)
ngrok http 8000 --cidr-allow "client.office.ip.range/24"

# Option 3: Time-limited access
# Manually start/stop tunnel for scheduled demos only
```

## 🚀 Deployment Alternatives

### **Quick Cloud Deployment (Heroku)**

```bash
# 1. Prepare backend for deployment
cd Rosa_custom_backend/backend
echo "web: python rosa_pattern1_api.py" > Procfile

# 2. Deploy to Heroku
heroku create rosa-demo-app
git add . && git commit -m "Deploy Rosa backend"
git push heroku main

# 3. Update Tavus persona
# base_url: "https://rosa-demo-app.herokuapp.com"
```

### **Professional Production Setup**

1. **Backend**: Deploy to DigitalOcean/AWS/Railway
2. **Frontend**: Static deployment to Vercel/Netlify
3. **Domain**: Custom domain for professional appearance
4. **Monitoring**: Add health checks and logging
5. **CI/CD**: Automated deployments from git

## 🎯 Recommendations

### **For Active Development**
- ✅ Use current NGROK setup with `start-rosa-with-ngrok.sh`
- ✅ Reserve static NGROK domain for consistent URLs
- ✅ Schedule live demo sessions with clients

### **For Client Testing**
- ✅ Deploy staging environment for 24/7 access
- ✅ Use NGROK for development and live presentations
- ✅ Consider removing interstitial page with paid NGROK plan

### **For Production**
- ✅ Full cloud deployment (backend + frontend)
- ✅ Custom domain and SSL certificates
- ✅ Professional monitoring and logging
- ✅ Automated deployment pipeline

## 🔗 Related Documentation

- **Rosa Pattern 1**: `ROSA_PATTERN1_README.md`
- **NGROK Quickstart**: `ROSA_NGROK_QUICKSTART.md`
- **Tavus Integration**: `dev_docs/tavus.txt` (lines 3655-3780)
- **Backend API**: `Rosa_custom_backend/backend/rosa_pattern1_api.py`

## 📞 Support Resources

- **NGROK Documentation**: https://ngrok.com/docs/
- **NGROK Dashboard**: https://dashboard.ngrok.com/
- **Tavus API Docs**: https://docs.tavusapi.com/
- **Rosa Backend Logs**: Check `Rosa_custom_backend/ngrok.log`

---

**🎉 Your NGROK setup is production-quality for development and demos!** For persistent client access, consider cloud deployment while keeping NGROK for development workflows. 