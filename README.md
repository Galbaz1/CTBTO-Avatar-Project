# Rosa CTBTO Avatar Platform

AI-powered voice-controlled kiosk for the CTBTO Science & Technology 2025 conference. Features real-time conversation with Rosa (an AI diplomat) backed by advanced RAG knowledge search.

## 🚀 Quick Start

```bash
# 1. Clone and navigate
git clone <repository-url>
cd CTBTO-Avatar-Project

# 2. Install dependencies
bun install        # Root monorepo deps + frontend workspace
cd backend && pip install -r requirements.txt

# 3. Set up environment
cp frontend/.env.example frontend/.env
# Add your TAVUS_API_KEY, WEAVIATE_URL, etc.

# 4. Launch everything
bun start          # Starts backend + frontend + ngrok
```

## 📁 Project Structure

```
CTBTO-Avatar-Project/
├── frontend/                     # 🌟 React/Vite frontend application
├── backend/                      # 🌟 Python FastAPI backend services
│   ├── rosa_api_server.py        # Main API server
│   ├── main_conversation_agent.py # OpenAI chat handler
│   ├── smart_card_manager.py     # AI card decision engine
│   ├── weaviate_knowledge_search.py # Weaviate v4 search
│   └── backend_data/             # Conference data (JSON/SVG)
├── design-patterns/              # Architecture documentation
└── scripts/                      # Development helpers
```

## 🎯 Core Features

- **Voice-First Interface**: Hands-free conversation with Rosa
- **Real-Time Cards**: Dynamic UI cards based on conversation context
- **Advanced RAG**: Weaviate v4 knowledge graph with multi-agent search
- **Split-Screen Layout**: 50/50 video chat + contextual information
- **WCAG AAA Compliant**: Full accessibility for kiosk deployment

## 🔧 Development

### Backend Development
```bash
# Run backend only (from repo root)
PYTHONPATH=. uvicorn backend.rosa_api_server:app --reload

# Test RAG system
cd backend/RAG-testing && python rag_test_suite.py

# Run integration tests  
python frontend/test_complete_flow.py
```

### Frontend Development
```bash
cd frontend
bun run dev        # Vite dev server only
```

### Full Stack Development
```bash
bun start          # Backend + Frontend + Ngrok (recommended)
# or
bun run dev        # Backend + Frontend only
```

## 📚 Architecture

### Import Standards
The codebase uses **absolute imports with PYTHONPATH**:

```python
# ✅ Correct - always use absolute imports
from backend.main_conversation_agent import CTBTOAgent
from backend.weaviate_knowledge_search import VectorSearchTool

# ❌ Avoid - no relative imports or sys.path manipulation
from .main_conversation_agent import CTBTOAgent
```

### Component Architecture
- **Handlers**: Data fetching and business logic (polling, API calls)
- **Cards**: Pure UI components with compound patterns
- **Atomic Design**: Hierarchical component composition

### Backend Architecture
- **rosa_api_server.py**: FastAPI server with OpenAI-compatible endpoints
- **main_conversation_agent.py**: Function calling and conversation management
- **smart_card_manager.py**: AI-driven UI intelligence decisions
- **weaviate_knowledge_search.py**: V4-compliant knowledge graph search

## 🌐 API Reference

### Key Endpoints
- `POST /chat/completions` - OpenAI-compatible chat with function calling
- `GET /latest-weather/{session_id}` - Weather card data
- `GET /latest-ui-delta/{session_id}` - Micro-update deltas for cards
- `POST /connect-conversation` - Register Tavus conversation session

### Environment Variables
```bash
# Frontend (.env)
VITE_TAVUS_API_KEY=your_tavus_key
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your_weaviate_key
OPENAI_API_KEY=your_openai_key
```

## 📖 Documentation

Comprehensive documentation is available in the frontend:

- `frontend/dev_docs/ROSA_KIOSK_ROADMAP.md` - Development roadmap
- `design-patterns/` - Architecture patterns and best practices
- `design-patterns/WEAVIATE/` - RAG and Weaviate V4 implementation

## 🔧 Environment Setup

### Prerequisites
- **Node.js 18+** with Bun package manager
- **Python 3.11+** with pip
- **Weaviate Cloud** account (or local instance)
- **OpenAI API** key
- **Tavus API** key for video avatars

### Getting Help

1. **Documentation**: Check `frontend/dev_docs/` folder
2. **Patterns**: Study proven patterns in the `design-patterns/` directory
3. **API Reference**: Complete Tavus documentation in `frontend/dev_docs/tavus.txt`

### Contributing

Follow the established patterns:
- Use TypeScript for frontend, Python type hints for backend
- Maintain WCAG AAA accessibility standards
- Write compound components, not monolithic ones
- Use absolute imports with PYTHONPATH
- Test on actual kiosk hardware when possible

---

**Rosa** represents the cutting edge of AI-driven kiosk interfaces, combining voice interaction, real-time knowledge search, and adaptive UI generation for professional conference environments. 