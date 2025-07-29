# FastAPI Backend Implementation Research
*Research Document for CTBTO Avatar Project - Milestone 6*

## Overview

This research document compiles comprehensive FastAPI implementation patterns and best practices gathered from official documentation to support the CTBTO Avatar project's data API backend development. The FastAPI backend serves as the data provider for the Edge Function, handling RAG queries, speaker/session lookups, and Weaviate v4 integration.

## FastAPI Core Features & Benefits

- **High Performance**: On par with NodeJS and Go (thanks to Starlette and Pydantic)
- **Fast to Code**: Increase development speed by 200-300%
- **Fewer Bugs**: Reduce developer-induced errors by ~40%
- **Standards-based**: Built on OpenAPI and JSON Schema specifications
- **Type Safety**: Full Python type hints support with automatic validation

## 1. Error Handling Implementation

### HTTPException Usage
```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/speakers/{speaker_name}")
async def get_speaker(speaker_name: str):
    if speaker_name not in speakers_db:
        raise HTTPException(status_code=404, detail="Speaker not found")
    return {"speaker": speakers_db[speaker_name]}
```

### Custom Exception Handlers
```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class WeaviateConnectionError(Exception):
    def __init__(self, message: str):
        self.message = message

app = FastAPI()

@app.exception_handler(WeaviateConnectionError)
async def weaviate_exception_handler(request: Request, exc: WeaviateConnectionError):
    return JSONResponse(
        status_code=503,
        content={"message": f"Database connection error: {exc.message}"}
    )
```

### Global Exception Handling
```python
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.utcnow().isoformat()}
    )
```

## 2. CORS Configuration

Essential for Edge Function → FastAPI communication:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CTBTO Avatar specific CORS setup
origins = [
    "https://ctbto-avatar.vercel.app",
    "https://*.vercel.app",  # For preview deployments
    "http://localhost:3000",  # Development
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### CORS Parameters
- `allow_origins`: List of permitted origins (avoid `["*"]` with credentials)
- `allow_credentials`: Enable for authentication headers/cookies
- `allow_methods`: HTTP methods (`["*"]` for all standard methods)
- `allow_headers`: Request headers (`["*"]` for all headers)
- `max_age`: Browser cache time for CORS responses (default: 600s)

## 3. Dependencies & Dependency Injection

### Basic Dependency Pattern
```python
from typing import Annotated
from fastapi import Depends, FastAPI

app = FastAPI()

async def get_weaviate_client():
    # Initialize Weaviate client with connection pooling
    return weaviate.Client(
        url=settings.weaviate_url,
        auth_client_secret=weaviate.AuthApiKey(api_key=settings.weaviate_key)
    )

@app.get("/speakers/{name}")
async def get_speaker(
    name: str,
    weaviate_client: Annotated[weaviate.Client, Depends(get_weaviate_client)]
):
    # Use dependency-injected client
    result = weaviate_client.query.get("Speaker").where(...).do()
    return result
```

### Shared Dependencies with Type Aliases
```python
from typing import Annotated
from fastapi import Depends

# Create reusable dependency type
WeaviateClientDep = Annotated[weaviate.Client, Depends(get_weaviate_client)]
SettingsDep = Annotated[Settings, Depends(get_settings)]

@app.get("/rag/search")
async def rag_search(
    weaviate_client: WeaviateClientDep,
    settings: SettingsDep,
    query: str
):
    # Both dependencies injected automatically
    pass
```

### Hierarchical Dependencies
```python
async def verify_api_key(api_key: str = Header(...)):
    if api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key

async def get_authenticated_weaviate_client(
    api_key: str = Depends(verify_api_key)
):
    # This dependency depends on verify_api_key
    return get_weaviate_client()
```

## 4. Background Tasks & Async Operations

### Background Task Implementation
```python
from fastapi import BackgroundTasks

def log_search_analytics(query: str, results_count: int):
    with open("analytics.log", mode="a") as log:
        log.write(f"{datetime.utcnow()}: query='{query}', results={results_count}\n")

@app.post("/rag/search")
async def search_knowledge_base(
    query: str,
    background_tasks: BackgroundTasks
):
    # Perform main search
    results = await weaviate_search(query)
    
    # Log analytics in background
    background_tasks.add_task(log_search_analytics, query, len(results))
    
    return {"results": results}
```

### Background Tasks with Dependencies
```python
async def update_search_cache(
    query: str,
    results: list,
    background_tasks: BackgroundTasks,
    cache_client: RedisDep
):
    if cache_client:
        background_tasks.add_task(
            cache_client.set,
            f"search:{hash(query)}",
            json.dumps(results),
            ex=3600  # 1 hour TTL
        )
```

## 5. Settings & Environment Variables

### Pydantic Settings for CTBTO Project
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class CTBTOSettings(BaseSettings):
    # API Configuration
    app_name: str = "CTBTO Avatar Data API"
    debug: bool = False
    api_version: str = "v1"
    
    # Database & Search
    weaviate_url: str
    weaviate_api_key: str
    openai_api_key: str
    
    # Conference Data
    conference_data_path: str = "./source_data"
    speakers_json_path: str = "./source_data/speakers/snt2025_speaker_profiles.json"
    
    # Performance
    max_search_results: int = 100
    cache_ttl_seconds: int = 3600
    
    # Logging
    log_level: str = "INFO"
    log_search_queries: bool = True
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

@lru_cache
def get_settings():
    return CTBTOSettings()

# Usage in dependencies
SettingsDep = Annotated[CTBTOSettings, Depends(get_settings)]
```

### Environment Variable Examples
```bash
# .env file for CTBTO Avatar
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_key
OPENAI_API_KEY=your_openai_key
DEBUG=false
MAX_SEARCH_RESULTS=50
CONFERENCE_DATA_PATH=./source_data
```

## 6. Deployment Concepts

### Production Deployment Considerations

#### Security - HTTPS
- Use TLS Termination Proxy (Traefik, Caddy, Nginx)
- Automatic certificate renewal with Let's Encrypt
- For Vercel deployment, HTTPS handled automatically

#### Process Management
- **Single Process**: Suitable for Vercel Serverless Functions
- **Multiple Workers**: Use `uvicorn --workers 4` for dedicated servers
- **Memory per Process**: Each worker loads full application (~1GB for ML models)

#### Startup & Restart Strategies
```python
# Lifespan events for initialization
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Weaviate, load data
    await initialize_weaviate_schema()
    await load_conference_data()
    yield
    # Shutdown: Clean up connections
    await cleanup_connections()

app = FastAPI(lifespan=lifespan)
```

#### Resource Utilization
- Target 50-90% CPU/RAM usage
- Monitor with tools like htop or cloud monitoring
- Scale horizontally with load balancers

## 7. CTBTO-Specific Implementation Patterns

### RAG Search Endpoint
```python
from pydantic import BaseModel

class RAGSearchRequest(BaseModel):
    query: str
    category: str | None = None
    max_results: int = 10

class RAGSearchResponse(BaseModel):
    results: list[dict]
    total_count: int
    query_time_ms: float

@app.post("/rag/search", response_model=RAGSearchResponse)
async def rag_search(
    request: RAGSearchRequest,
    weaviate_client: WeaviateClientDep,
    background_tasks: BackgroundTasks,
    settings: SettingsDep
):
    start_time = time.time()
    
    try:
        # Perform hybrid search with Weaviate v4
        results = await perform_hybrid_search(
            client=weaviate_client,
            query=request.query,
            category=request.category,
            limit=min(request.max_results, settings.max_search_results)
        )
        
        query_time_ms = (time.time() - start_time) * 1000
        
        # Log analytics in background
        if settings.log_search_queries:
            background_tasks.add_task(
                log_search_analytics,
                request.query,
                len(results)
            )
        
        return RAGSearchResponse(
            results=results,
            total_count=len(results),
            query_time_ms=query_time_ms
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )
```

### Speaker Lookup Endpoint
```python
@app.get("/speakers/{speaker_name}")
async def get_speaker(
    speaker_name: str,
    weaviate_client: WeaviateClientDep
):
    try:
        # Use Weaviate graph search for speaker data
        speaker_data = await weaviate_client.query.get("Speaker").where({
            "path": ["name"],
            "operator": "Equal",
            "valueText": speaker_name
        }).with_additional(["id"]).do()
        
        if not speaker_data['data']['Get']['Speaker']:
            raise HTTPException(
                status_code=404,
                detail=f"Speaker '{speaker_name}' not found"
            )
        
        return speaker_data['data']['Get']['Speaker'][0]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Speaker lookup failed: {str(e)}"
        )
```

### Conference Session Endpoint
```python
@app.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    weaviate_client: WeaviateClientDep
):
    try:
        session_data = await weaviate_client.query.get("Session").where({
            "path": ["id"],
            "operator": "Equal",
            "valueText": session_id
        }).with_additional(["vector"]).do()
        
        if not session_data['data']['Get']['Session']:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found"
            )
        
        return session_data['data']['Get']['Session'][0]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Session lookup failed: {str(e)}"
        )
```

## 8. Testing & Quality Assurance

### Test Configuration Override
```python
from fastapi.testclient import TestClient

def get_test_settings():
    return CTBTOSettings(
        weaviate_url="http://localhost:8080",
        debug=True,
        log_search_queries=False
    )

# Override dependency for testing
app.dependency_overrides[get_settings] = get_test_settings

client = TestClient(app)

def test_speaker_search():
    response = client.get("/speakers/Dr.%20John%20Smith")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
```

### Async Testing
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_rag_search():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/rag/search", json={
            "query": "nuclear verification",
            "max_results": 5
        })
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
```

## 9. Performance Optimization

### Async Database Operations
```python
import asyncio

async def batch_speaker_lookup(speaker_names: list[str], weaviate_client):
    # Perform concurrent lookups
    tasks = [
        lookup_single_speaker(name, weaviate_client)
        for name in speaker_names
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]
```

### Caching Strategy
```python
from functools import lru_cache
import redis

# In-memory caching for frequently accessed data
@lru_cache(maxsize=1000)
def get_cached_speaker_data(speaker_id: str):
    return load_speaker_from_db(speaker_id)

# Redis caching for search results
async def cached_rag_search(query: str, redis_client):
    cache_key = f"rag:{hash(query)}"
    cached_result = await redis_client.get(cache_key)
    
    if cached_result:
        return json.loads(cached_result)
    
    # Perform search and cache result
    results = await perform_rag_search(query)
    await redis_client.setex(cache_key, 3600, json.dumps(results))
    return results
```

## 10. Security Best Practices

### API Key Authentication
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return x_api_key

@app.get("/protected-endpoint")
async def protected_route(api_key: str = Depends(verify_api_key)):
    return {"message": "Access granted"}
```

### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.get("/rag/search")
@limiter.limit("10/minute")
async def limited_search(request: Request):
    # Limited to 10 requests per minute per IP
    pass
```

## Implementation Checklist for CTBTO Avatar

- [ ] **Error Handling**: Implement HTTPException for 404/500 errors
- [ ] **CORS Setup**: Configure for Vercel Edge Function communication
- [ ] **Dependencies**: Set up Weaviate client injection with connection pooling
- [ ] **Settings**: Create Pydantic settings with .env file support
- [ ] **Background Tasks**: Implement search analytics logging
- [ ] **RAG Endpoints**: Create /rag/search, /speakers/{name}, /sessions/{id}
- [ ] **Async Operations**: Use async/await for all I/O operations
- [ ] **Testing**: Set up test client with dependency overrides
- [ ] **Security**: Add API key authentication if needed
- [ ] **Performance**: Implement caching for frequent queries
- [ ] **Monitoring**: Add request logging and health check endpoint
- [ ] **Deployment**: Configure for Vercel Serverless or dedicated server

This research provides the foundation for implementing a robust, scalable FastAPI backend that meets the requirements outlined in the CTBTO Avatar development plan. 