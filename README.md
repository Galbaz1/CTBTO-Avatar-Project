# CTBTO Avatar Project

AI-powered voice-controlled kiosk for the CTBTO Science & Technology 2025 conference. Features real-time conversation with Rosa (an AI diplomat) backed by advanced RAG knowledge search using Weaviate v4.

## 🚀 Quick Start

```bash
# 1. Clone and navigate
git clone <repository-url>
cd CTBTO-Avatar-Project

# 2. Set up Python virtual environment for backend
python3 -m venv backend/rosa
source backend/rosa/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt  # Backend dependencies
bun install                               # Root + frontend dependencies

# 4. Set up environment variables
cp frontend/.env.example frontend/.env
# Add your TAVUS_API_KEY, WEAVIATE_URL, OPENAI_API_KEY, etc.

# 5. Launch everything (backend + frontend + ngrok)
bun start
```

## 📁 Project Structure (Post-Refactor)

```
CTBTO-Avatar-Project/
├── backend/                           # 🐍 Python FastAPI backend
│   ├── rosa/                          # Virtual environment
│   ├── rosa_api_server.py             # Main API server
│   ├── main_conversation_agent.py     # OpenAI chat handler
│   ├── smart_card_manager.py          # AI card decision engine
│   ├── async_card_processor.py        # Card generation queue
│   ├── weaviate_knowledge_search.py   # Weaviate v4 search
│   ├── backend_data/                  # Conference data (JSON/SVG)
│   └── requirements.txt               # Python dependencies
├── frontend/                          # ⚛️ React/Vite frontend
│   ├── src/components/                # React components
│   │   ├── handlers/                  # Data logic (polling, API)
│   │   ├── cards/                     # UI components (presentation)
│   │   └── cvi/                       # Tavus video integration
│   ├── package.json                   # Node.js dependencies
│   └── .env                           # Frontend environment variables
├── docs/                              # 📖 Documentation
│   ├── design-patterns/               # Architecture patterns
│   │   └── WEAVIATE/                  # Weaviate v4 implementation
│   └── roadmap_updates/               # Project roadmap
├── tests/                             # 🧪 All test files
│   ├── frontend/                      # Frontend tests
│   └── backend/                       # Backend tests (RAG, etc.)
├── scripts/                           # 🛠️ Development helpers
│   └── start-all.sh                   # Unified startup script
└── package.json                       # Root monorepo config
```

## 🎯 Core Features

- **Voice-First Interface**: Hands-free conversation with Rosa using Tavus CVI
- **Real-Time Cards**: Dynamic UI cards based on conversation context
- **Advanced RAG**: Weaviate v4 knowledge graph with multi-agent search
- **Split-Screen Layout**: 50/50 video chat + contextual information
- **WCAG AAA Compliant**: Full accessibility for kiosk deployment
- **Session-Based Architecture**: Multi-user support with 2-second polling

## 🔧 Development Guide

### Prerequisites

- **Node.js 18+** with Bun package manager
- **Python 3.11+** with pip
- **Weaviate Cloud** account (or local instance)
- **OpenAI API** key
- **Tavus API** key for video avatars

### Virtual Environment Setup

**IMPORTANT**: Always activate the virtual environment before working with the backend:

```bash
# Activate virtual environment (do this every time you work on backend)
source backend/rosa/bin/activate

# You should see (rosa) in your prompt:
(rosa) lab@Mac-Studio-van-HVA CTBTO-Avatar-Project %
```

### Development Workflows

#### **Option 1: Full Development (Recommended)**
```bash
# Starts backend + frontend + ngrok tunnel
bun start
```

#### **Option 2: Development Mode (No Ngrok)**
```bash
# Starts backend + frontend only
npm run dev
```

#### **Option 3: Individual Services**
```bash
# Backend only
source backend/rosa/bin/activate
uvicorn backend.rosa_api_server:app --host 0.0.0.0 --port 8000 --reload

# Frontend only
cd frontend && bun run dev
```

#### **Option 4: Frontend Build**
```bash
# Build frontend for production
cd frontend && bun run build
```

### Environment Variables

Create `frontend/.env` with:
```bash
# Tavus Configuration
VITE_TAVUS_API_KEY=your_tavus_api_key

# Weaviate Configuration  
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your_weaviate_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key

# Development (optional)
NODE_ENV=development
```

## 🧪 Testing

### Running Tests
```bash
# Backend RAG tests
cd tests/backend/RAG-testing && python rag_test_suite.py

# Frontend integration tests
python tests/frontend/test_complete_flow.py

# All frontend tests
cd tests/frontend && python run_integration_tests.py
```

### Test Structure
- **Frontend Tests**: `tests/frontend/` - UI, integration, timing tests
- **Backend Tests**: `tests/backend/RAG-testing/` - RAG system validation
- **Test Documentation**: `tests/README.md`

## 🌐 API Reference

### Health Check
```bash
curl http://localhost:8000/
# Returns: {"status": "Rosa Pattern 1 API running", "version": "1.1.0"}
```

### Key Endpoints
- `POST /chat/completions` - OpenAI-compatible chat with function calling
- `GET /latest-weather/{session_id}` - Weather card data
- `GET /latest-ui-delta/{session_id}` - Micro-update deltas for cards
- `POST /connect-conversation` - Register Tavus conversation session
- `GET /metrics/card-generation` - Performance metrics

### Service URLs (Development)
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Ngrok Tunnel**: Auto-generated URL (check terminal output)

## 📚 Architecture

### Import Standards
The codebase uses **absolute imports with PYTHONPATH**:

```python
# ✅ Correct - always use absolute imports
from backend.main_conversation_agent import CTBTOAgent
from backend.weaviate_knowledge_search import VectorSearchTool

# ❌ Avoid - no relative imports
from .main_conversation_agent import CTBTOAgent
```

### Component Architecture
- **Handlers**: Data fetching and business logic (polling every 2 seconds)
- **Cards**: Pure UI components with compound patterns (Card.Title, Card.Body)
- **Handler/Card Separation**: Clean separation of concerns

### Backend Services
- **rosa_api_server.py**: FastAPI server with OpenAI-compatible endpoints
- **main_conversation_agent.py**: Conversation management with function calling
- **smart_card_manager.py**: AI-driven UI intelligence decisions
- **async_card_processor.py**: Background card generation queue
- **weaviate_knowledge_search.py**: V4-compliant knowledge graph search

## 🚨 Common Issues & Solutions

### "ModuleNotFoundError: No module named 'fastapi'"
**Solution**: Activate the virtual environment
```bash
source backend/rosa/bin/activate
```

### "Script not found 'build'" in backend/
**Solution**: Run build commands from the correct directory
```bash
# ❌ Wrong - backend is Python, not Node.js
cd backend && bun run build

# ✅ Correct - build frontend from frontend directory
cd frontend && bun run build
```

### Backend not starting
**Solution**: Check virtual environment and dependencies
```bash
source backend/rosa/bin/activate
pip install -r backend/requirements.txt
python -c "import fastapi; print('FastAPI working!')"
```

## 📖 Documentation

### Essential Reading
- **Project Roadmap**: `docs/roadmap_updates/ROSA_KIOSK_ROADMAP.md`
- **Architecture Patterns**: `docs/design-patterns/`
- **Weaviate V4 Guide**: `docs/design-patterns/WEAVIATE/weaviate-v4-patterns.md`
- **Multi-Agent RAG**: `docs/design-patterns/multi-agent-rag-architecture.md`

### Development Protocols
Follow the **Development Protocol** in workspace rules:
- Always work from project root with activated venv
- Use Handler/Card separation pattern
- Follow 2-second polling for `meetingState === 'joined-meeting'`
- Maintain accessibility standards (WCAG 2.1 AAA)
- Use Weaviate v4 only, no v3 syntax

## 🤝 Contributing

### Code Standards
- **TypeScript** for frontend with strict type checking
- **Python type hints** for backend
- **Compound components** over monolithic components
- **Absolute imports** with PYTHONPATH
- **WCAG AAA** accessibility compliance

### Before Committing
1. Test on the actual setup flow
2. Verify both backend and frontend start correctly
3. Run the test suite
4. Update documentation if needed

---

**Rosa** represents the cutting edge of AI-driven kiosk interfaces, combining voice interaction, real-time knowledge search, and adaptive UI generation for professional conference environments. 