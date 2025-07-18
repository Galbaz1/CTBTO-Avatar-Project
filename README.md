# Tavus CVI Examples - ROSA Project

This repository contains Tavus Conversational Video Interface (CVI) examples and the ROSA (Diplomatic Conference Assistant) project for the CTBTO SnT 2025 conference.

## 🚀 Quick Start - ROSA System

The main ROSA development is located in `examples/cvi-ui-conversation/`. Here are the commands to start the system:

### Complete ROSA System (Recommended)
```bash
cd examples/cvi-ui-conversation
bun rosa:complete
```
**OR**
```bash
cd examples/cvi-ui-conversation
./start-rosa-complete.sh
```

This starts all four services:
- **Python FastAPI Backend**: http://localhost:8000
- **CTBTO Express Server**: http://localhost:3002  
- **Weather Service**: http://localhost:3001
- **ROSA Frontend**: http://localhost:5173

### Other ROSA Commands

```bash
# Basic ROSA (subset of services)
bun rosa

# Development mode (weather + frontend only)
bun rosa:dev

# Check service status
bun rosa:check

# Stop all services
./stop-rosa.sh
```

### Health Checks
```bash
curl http://localhost:8000/        # FastAPI health
curl http://localhost:3002/health  # CTBTO health
curl http://localhost:3001/health  # Weather health
```

## 📁 Project Structure

### Main Development
- **`examples/cvi-ui-conversation/`** - Primary ROSA development environment
  - Modern React + TypeScript + Vite + Bun
  - Tavus CVI UI components with Daily.co integration
  - Split-screen UI: avatar + dynamic content
  - Multilingual support (6 UN languages)

### Reference Examples
- **`examples/cvi-frontend-backend-tools/`** - Function calling with e-commerce tools
- **`examples/cvi-hover-over-website/`** - Click interaction tools  
- **`examples/cvi-custom-llm-with-backend/`** - Custom LLM integration
- **`examples/cvi-quickstart-react/`** - Basic CVI React setup
- **`examples/cvi-transparent-background/`** - Green screen/transparency features

### Documentation
- **`dev_docs/tavus.txt`** - Complete Tavus CVI API documentation
- **`dev_docs/PRD.md`** - ROSA project requirements and specifications
- **`examples/cvi-ui-conversation/ROSA_PERSONA_CONFIG.md`** - ROSA persona configuration

## 🏗️ ROSA Architecture

**Frontend**: React + Tavus CVI UI components + Daily.co  
**Backend**: Python multi-agent system with FastAPI  
**Integration**: Tavus function calling bridges React UI to Python logic  
**Deployment**: Touchless, voice-only kiosk for diplomatic conferences

### Key Features
- Diplomatic-grade multilingual conference assistant
- Function calling for Python backend integration  
- Split-screen UI with dynamic content (QR codes, maps, bios)
- Strict "red zone" filtering and <200ms response times
- Vienna-first defaults for conference location queries

## 🛠️ Development Requirements

- **Bun**: JavaScript runtime and package manager (use `bun` instead of `npm`)
- **Python 3.8+**: For backend services
- **Node.js**: For Express servers
- **Tavus API Key**: Required for CVI functionality

## 📖 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tavus-examples
   ```

2. **Navigate to ROSA project**
   ```bash
   cd examples/cvi-ui-conversation
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Tavus API keys
   ```

5. **Start the complete system**
   ```bash
   bun rosa:complete
   ```

6. **Open ROSA Frontend**
   ```
   http://localhost:5173
   ```

## 🔧 Troubleshooting

- **Port conflicts**: The startup script automatically kills existing services on required ports
- **Service issues**: Use `bun rosa:check` to verify all services are running
- **Stop services**: Use `./stop-rosa.sh` or Ctrl+C in the startup terminal

## 📚 Additional Resources

- **Tavus Documentation**: [dev_docs/tavus.txt](dev_docs/tavus.txt)
- **ROSA Requirements**: [dev_docs/PRD.md](dev_docs/PRD.md)  
- **Weather Setup**: [examples/cvi-ui-conversation/WEATHER_SETUP.md](examples/cvi-ui-conversation/WEATHER_SETUP.md)

---

**Built for CTBTO SnT 2025 Conference - Vienna, Austria** 