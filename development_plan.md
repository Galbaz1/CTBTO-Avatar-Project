# CTBTO‑Avatar‑Project – Comprehensive Development Plan

> ⚠️ **CURSOR AI AGENT EXECUTION PLAN** ⚠️  
> This document is **exclusively designed for Cursor Background Agents** using models like o3-max, o3-pro-max, and Claude Sonnet-thinking-max. It is NOT a human development guide. All instructions are automated agent tasks with specific model allocation strategies.

This plan synthesises the architectural blueprint from the accompanying report with detailed instructions and patterns from the provided project documentation and official libraries. It outlines how to build the CTBTO Avatar kiosk in a maintainable, accessible and voice‑first manner using Tavus CVI and the Vercel AI SDK v5.

## 1. Project Scope & Objectives

The goal is to refactor the existing CTBTO Avatar into a **voice‑only, AI‑driven kiosk** that:

1. **Adheres to non‑negotiable voice and accessibility standards:** Tavus CVI on Daily.co is the exclusive voice pipeline.  All UI must be non‑interactive, meet WCAG AAA contrast and font requirements and use semantic ARIA roles【377295101540233†L24-L67】.
2. **Eliminates polling and interactive controls:** Replace 2‑second polling with server‑sent event (SSE) streaming and remove all `onClick`, `hover` and scroll behaviours【790907776847388†L146-L160】.
3. **Centralises intelligence in a Vercel Edge Function:** The backend orchestrates conversation logic via Vercel’s `streamText` and tools; the Python/FastAPI service acts only as a data provider.
4. **Leverages generative UI:** Use Vercel AI SDK’s tools and `useChat` to stream dynamic UI components based on voice commands【generative-ui-documentation.md†L1-L20】.

## 1.1 Mandatory Documentation & Research Requirements

The following project documents are **mandatory reading** for the advanced coding agent executing this plan. **Each reference includes an exact line range** so the agent can jump straight to the relevant snippet. The agent **MUST open, read, and internally research** the full context of every cited document (and any links contained within) before writing code.

- Tavus CVI Hooks – core integration patterns 【docs_important/tavus-cvi-hooks.md†L1-L60】
- Tavus CVI Components overview 【docs_important/tavus-cvi-components.md†L10-L40】
- Generative UI documentation (Vercel AI SDK) 【docs_important/vercel-sdk-claude/official-docs/generative-ui-documentation.md†L1-L50】
- OpenAI Structured Outputs Guide – structured streams & tool usage 【docs_important/openai-structured-outputs-guide.md†L1-L40】
- Weaviate v4 Patterns – multimodal graph search examples 【docs_important/WEAVIATE/weaviate-v4-patterns.md†L1-L80】
- System Prompt Management best-practices 【docs_important/SYSTEM_PROMPT_MANAGEMENT.md†L1-L40】

> ℹ️  If additional context is needed, the agent should expand the cited line ranges or explore adjacent sections. **All external URLs referenced in these docs must be visited and studied** to ensure best-practice adherence.

## 1.2 Repository Hygiene & Archiving Policy

To maintain a **clean, minimal working repository**, the coding agent **MUST** perform the following steps at the end of the refactor:

1. Move every file, asset, script, or directory that is **no longer referenced** in the active codebase into a single folder named `/archive/YYYY-MM-DD/` at the repo root (use the actual date of execution).
2. Preserve each item’s original sub-path inside the archive folder for traceability.
3. Ensure **no code outside `/archive/` imports or references anything inside `/archive/`.** Run static analysis to confirm.
4. After archiving, delete any resulting empty directories to keep the active tree tidy.

Failure to archive unused artifacts in this consolidated location will be considered a violation of the development plan.

## 1.3 Current Codebase Understanding & CTBTO Context

The advanced coding agent **MUST understand** the following critical context about the existing implementation and its purpose before proceeding:

### What is the CTBTO Avatar?
The CTBTO (Comprehensive Nuclear-Test-Ban Treaty Organization) Avatar is **Rosa**, an AI-powered conversational kiosk designed to host the **SnT2025 conference** (8-12 September 2025) at **Hofburg Palace, Vienna**. The conference expects **1000+ participants** and focuses on nuclear-test-ban monitoring, verification technologies, and scientific applications 【source_data/ctbto_external_info/snt2025_event_page.md†L7-L15】.

### Current Implementation Analysis
The existing codebase is a **hybrid React-Python system** with critical architectural flaws that this refactor will address:

**Frontend (React 19 + Vite):**
- Current entry point: `frontend/src/App.tsx` with WelcomeScreen → RosaDemo flow 【frontend/src/App.tsx†L22-L44】
- Uses Tavus CVI integration via `@daily-co/daily-js` and custom hooks 【frontend/package.json†L13-L14】
- **Problems:** Contains `framer-motion`, polling architecture, and interactive elements that violate voice-first principles 【docs_important/vercel-sdk-claude/migration-guide/ctbto-migration-plan.md†L11-L14】

**Backend (Python FastAPI):**
- Main conversation agent: `backend/main_conversation_agent.py` with OpenAI function calling 【backend/main_conversation_agent.py†L82-L798】
- **Capabilities:** Weather data, RAG conference search, and graph lookups for speakers/sessions 【backend/main_conversation_agent.py†L21-L80】
- **Data Sources:** Rich speaker profiles, session data, and venue information 【source_data/speakers/snt2025_speaker_profiles.json†L1-L30】

### What Rosa Must Do
Rosa serves as a **diplomatic conference host** capable of:
1. **Speaker Information:** Answer queries about 100+ conference speakers, their expertise, sessions, and CTBTO involvement
2. **Session Management:** Provide schedules, topics, room locations, and presentation details
3. **Conference Navigation:** Guide attendees through Hofburg Palace venues and logistics
4. **Weather & Local Info:** Vienna weather and conference logistics support
5. **Scientific Context:** Explain CTBTO technologies, verification systems, and nuclear monitoring

**Key Data Rosa Manages:**
- **774 speaker profiles** with detailed expertise, affiliations, and session assignments 【source_data/speakers/snt2025_speaker_profiles.json†L1-L774】
- **Conference program** with session schedules, topics, and room mappings 【source_data/event_info/snt2025_program.json】
- **Venue navigation** for Hofburg Palace complex with accessibility guides 【source_data/floorplan_info/】
- **CTBTO glossary** and technical terminology for diplomatic conversations 【source_data/glossaries/ctbto_glossary.json】

## 1.4 Virtual Environment & Dependency Management

The coding agent **MUST create a fresh virtual environment** to ensure clean dependency management:

### Python Environment Setup
```bash
# Create new Python virtual environment at project root (uses Python 3.13.5)
# Note: Structure will change drastically, so venv should be at root level
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Upgrade pip and install backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Verify OpenAI version matches requirement
pip show openai | grep Version  # Should show 1.97.1 or higher
```

### Node.js Frontend Environment
```bash
# Navigate to frontend directory
cd frontend/

# Remove node_modules and package-lock for clean install
rm -rf node_modules package-lock.json

# Install current dependencies
npm install

# The migration will later remove framer-motion and add:
# ai @ai-sdk/react @ai-sdk/openai zod @tavus/cvi-ui
```

### Environment Variables Setup
**Important:** The project already has existing `.env` files at root (`./.env`) and frontend (`./frontend/.env`) containing critical API keys and configuration. **DO NOT overwrite these files.** Instead, verify they contain the required variables:

**Root `.env` (already exists):**
```bash
# Verify these variables exist in ./.env:
# OPENAI_API_KEY=your_openai_key
# TAVUS_API_KEY=your_tavus_key  
# NGROK_AUTH_TOKEN=your_ngrok_token
# (plus other existing variables)
```

**Frontend `.env` (already exists):**
```bash
# Verify these variables exist in ./frontend/.env:
# OPENAI_API_KEY=your_openai_key
# DATA_API_URL=http://localhost:8000
# (plus other existing variables)
```

**If missing variables need to be added, append them rather than recreating the files:**
```bash
# Example of adding missing variables (only if needed):
echo "NEW_VARIABLE=value" >> .env
echo "NEW_FRONTEND_VAR=value" >> frontend/.env
```

**Reference Documentation:**
- Current dependency analysis: 【frontend/package.json†L12-L47】, 【backend/requirements.txt†L1-L10】
- Migration dependency changes: 【docs_important/vercel-sdk-claude/migration-guide/ctbto-migration-plan.md†L44-L55】

## 2. Agent Environment Setup (Reference Only)

> **Note:** Sections 2-8 provide **technical reference** for the Cursor agent. The actual execution steps are defined in **Section 9: Cursor AI Agent Execution Phases**.

### 2.1 Dependencies (Agent Reference)

The Cursor agent should install the following packages during Milestone 1:

```bash
# Frontend
npm install react@19 vite @ai-sdk/react @ai-sdk/openai jotai tailwindcss radix-ui @tavus/cvi-ui

# Edge Function (Vercel)
npm install ai zod @ai-sdk/openai

# Python Data API
pip install fastapi uvicorn weaviate-client pydantic
```

Ensure Node ≥ 18 and Python ≥ 3.10.  Use `Vercel` CLI for deploying edge functions and `npm` for frontend bundling.  Create `.env` files for API keys (Tavus API key, OpenAI keys, etc.).

### 2.2 Repository Structure

Organise the project as follows:

```
root/
 ├── frontend/                 # React app (Vite)
 │   ├── src/
 │   │   ├── components/
 │   │   │   ├── voice-first/
 │   │   │   │   ├── core/    # TavusVoiceWrapper
 │   │   │   │   ├── cards/   # VoiceSpeakerCard, VoiceSessionCard, etc.
 │   │   │   │   └── MessageRenderer.tsx
 │   │   ├── ai/
 │   │   │   └── tools.ts      # Zod tool definitions (mirrors Edge)
 │   │   └── state/            # Jotai atoms for global state
 │   └── index.html
 ├── api/voice-chat/route.ts   # Vercel Edge Function for streaming chat
 ├── data-api/
 │   ├── main.py               # FastAPI app
 │   ├── endpoints/
 │   └── models/
 └── .vercel/                  # Vercel configuration
```

### 2.3 Configuring Tavus CVI

1. **Create a Tavus Persona:** On the Tavus platform, configure a persona with a minimal `system_prompt` instructing the replica to forward user utterances to the `/api/voice-chat` tool and to speak the returned reply.  Define one tool called `get_assistant_response` pointing to the Vercel Edge function.  For example:

```json
{
  "name": "get_assistant_response",
  "description": "Send the user's utterance and session ID to the backend and return a reply text",
  "parameters": {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "utterance": { "type": "string" }
    },
    "required": ["session_id", "utterance"]
  }
}
```

2. **Configure the persona’s LLM model** to call only this tool.  Avoid embedding complex logic in the persona prompt.  Set the persona to use audio‑only mode and the Tavus advanced STT engine.

3. **API integration:** The frontend uses `createConversation` to start a session with this persona; Tavus returns a `conversation_url` used by `CVIProvider` to join the call.

## 3. Architectural Overview

The architecture is summarised in the blueprint (see report).  For development purposes:

1. **Frontend**: React 19 + Vite; uses `useChat` to send messages to the Edge Function and receive SSE streams of `UIMessage` parts; renders static, accessible components; uses `TavusVoiceWrapper` to integrate with Tavus CVI.
2. **Edge Function**: Node.js (in Vercel Edge runtime); uses `streamText` to call OpenAI models; defines Zod‑validated tools that query the Python API; orchestrates conversation flow and generates `UIMessage` streams.
3. **Data API**: Python FastAPI; exposes endpoints to fetch speaker/session data and run RAG queries; uses Weaviate client for hybrid and graph searches; returns JSON only.

## 4. Frontend Implementation (Agent Reference)

### 4.1 Tavus Integration – `TavusVoiceWrapper`

The Cursor agent should create a `TavusVoiceWrapper` component that encapsulates all Tavus CVI interaction.  It should:

1. Join the conversation using `useCVICall` when a `conversationUrl` prop is provided.
2. Listen for `conversation.utterance` events via `useObservableEvent` and pass the transcribed text to a callback (`onUtterance`).  The Tavus docs describe `useObservableEvent` as a hook that listens for CVI app messages and handles conversation events like utterances, tool calls and speaking events【882504185444061†L368-L420】.
3. When a reply text is ready, send it back through `useSendAppMessage` using a `conversation.respond` message so the avatar speaks it【882504185444061†L368-L420】.
4. Wrap children inside `<CVIProvider>` so child components have access to the CVI context.

Example implementation (simplified):

```tsx
// src/components/voice-first/core/TavusVoiceWrapper.tsx
'use client'
import { CVIProvider, useCVICall, useObservableEvent, useSendAppMessage } from '@tavus/cvi-ui';
import { useEffect } from 'react';

export function TavusVoiceWrapper({ conversationUrl, onUtterance, reply }) {
  const { joinCall, leaveCall } = useCVICall();
  const sendAppMessage = useSendAppMessage();

  useEffect(() => {
    if (conversationUrl) joinCall({ url: conversationUrl });
    return () => leaveCall();
  }, [conversationUrl]);
  
  useObservableEvent((event) => {
    if (event.event_type === 'conversation.utterance' && event.properties.speech) {
      onUtterance(event.properties.speech);
    }
  });
  
  useEffect(() => {
    if (reply) {
      sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.respond',
        properties: { text: reply }
      });
    }
  }, [reply]);

  return <CVIProvider>{/* child UI here */}</CVIProvider>;
}
```

### 4.2 Generative UI – `useChat` and Tool Rendering

#### 4.2.1 Connecting `useChat`

In the top‑level kiosk component (`VoiceFirstKiosk.tsx`), call `useChat` with the SSE API endpoint and a unique session ID.  The hook returns `messages`, `isLoading` and `sendMessage`.  On receiving a user utterance from `TavusVoiceWrapper`, call `sendMessage({ text: utterance })`.  The final text reply (last assistant message) can be extracted from the message parts and passed to Tavus for TTS.

#### 4.2.2 Rendering `UIMessage` parts

Create a `MessageRenderer` component that iterates through `messages` and for each part renders the appropriate component.  The generative UI documentation explains that tool parts use a typed name (e.g., `tool-displayWeather`) and have states `input-available`, `output-available`, and `output-error`【generative-ui-documentation.md†L120-L220】.  Use this pattern to show loading states and final outputs:

```tsx
function MessageRenderer({ messages }) {
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} role="group" aria-live="polite">
          {msg.parts.map((part, index) => {
            if (part.type === 'text') return <p key={index}>{part.text}</p>;
            if (part.type === 'tool-showSpeaker') {
              switch (part.state) {
                case 'input-available': return <p key={index}>Loading speaker…</p>;
                case 'output-available': return <VoiceSpeakerCard key={index} data={part.output} />;
                case 'output-error': return <p key={index}>Error: {part.errorText}</p>;
              }
            }
            // … handle other tool types …
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
```

#### 4.2.3 Voice‑First Card Components

Implement display components that accept data and have no event handlers.  Use semantic HTML (`article`, `header`, `time`, `section`) and ARIA attributes.  For example, a `VoiceSpeakerCard` may look like:

```tsx
export function VoiceSpeakerCard({ data }) {
  return (
    <article role="article" aria-labelledby={`speaker-${data.id}-title`} aria-live="polite">
      <header>
        <h2 id={`speaker-${data.id}-title`} className="text-2xl font-bold mb-2">{data.name}</h2>
        <p aria-label="Affiliation">{data.affiliation}</p>
      </header>
      <p className="mt-2" aria-label="Biography">{data.bio}</p>
      <section className="mt-4" aria-label="Sessions">
        <h3 className="font-semibold">Sessions:</h3>
        <ul>{data.sessions.map(s => <li key={s.id}>{s.title} ({s.time})</li>)}</ul>
      </section>
    </article>
  );
}
```

Ensure the CSS uses high contrast and large fonts.  For example, a Tailwind class might specify `text-white bg-gray-800 contrast-200` to achieve a 7:1 contrast ratio.  Provide focus outlines for screen‑reader navigation but do not implement hover or click effects.

### 4.3 State Management with Jotai

Use Jotai for global state unrelated to the conversation stream (e.g., `sessionId`, `conversationUrl`, user preferences).  Atoms provide a lightweight, atomic state model that minimises re‑renders【90020787509453†L32-L37】.  Do **not** duplicate `useChat` state into Jotai; instead, use the decoupled pattern described in the blueprint.  For example:

```ts
// src/state/session.ts
import { atom } from 'jotai'
export const sessionIdAtom = atom<string | null>(null)
export const conversationUrlAtom = atom<string | null>(null)

// In VoiceFirstKiosk.tsx
const sessionId = useAtomValue(sessionIdAtom)
const { messages, sendMessage } = useChat({ api: '/api/voice-chat', id: sessionId ?? 'anon' })
```

### 4.4 Accessibility & Voice‑First Patterns

Follow the patterns in the voice‑first interface guide:

1. **Conversation over commands:** Encourage natural utterances like “Show me upcoming sessions” instead of “Click the next button”【voice-first-interface-patterns.md†L1-L23】.
2. **Non‑interactive UI generation:** Components should accept data props and never expose event handlers; rely on voice commands to trigger state changes【voice-first-interface-patterns.md†L24-L32】.
3. **State through voice:** Use the AI to decide when to render new components; never add buttons or scrollbars for navigation【voice-first-interface-patterns.md†L33-L45】.
4. **Semantic structure & ARIA:** Use roles like `article`, `region`, `header` and proper `aria-labelledby`/`aria-describedby` attributes for each card.  Wrap dynamic content in `aria-live="polite"` so screen readers announce updates without interruption.
5. **WCAG AAA compliance:** Use ≥18 px font sizes and maintain a 7:1 contrast ratio; MDN notes that large text (at least 18 pt) has a lower contrast requirement but normal text must meet 7:1【377295101540233†L24-L67】.

## 5. Edge Function Implementation (Agent Reference)

### 5.1 `streamText` and System Prompt

The Cursor agent should implement an Edge Function that accepts POST requests containing `messages` (a history of `UIMessage`s) and calls `streamText` to generate responses.  The agent should provide a system prompt instructing the model to act as a diplomatic conference host, to use available tools for retrieving data, and to speak concisely.  Example:

```ts
import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { tools } from './tools'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are Rosa, the CTBTO conference assistant. Answer briefly and use tools to provide structured information.',
    messages: convertToModelMessages(messages),
    tools,
  })
  return result.toUIMessageStreamResponse()
}
```

### 5.2 Tool Definitions

The Cursor agent should define tools that mirror the Data API endpoints.  Each tool validates input via Zod and fetches data from the data API.  The agent should use descriptive names (e.g., `showSpeaker`, `showSession`).  Example:

```ts
import { tool as createTool } from 'ai'
import { z } from 'zod'

export const showSpeaker = createTool({
  description: 'Get details and sessions for a speaker',
  inputSchema: z.object({ name: z.string() }),
  execute: async ({ name }) => {
    const res = await fetch(`${process.env.DATA_API}/speakers/${encodeURIComponent(name)}`)
    if (!res.ok) throw new Error('Speaker not found')
    return await res.json()
  }
})

export const showSession = createTool({
  description: 'Get details of a session by ID',
  inputSchema: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    const res = await fetch(`${process.env.DATA_API}/sessions/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error('Session not found')
    return await res.json()
  }
})

export const ragSearch = createTool({
  description: 'Search the knowledge base for any question',
  inputSchema: z.object({ query: z.string(), category: z.string().optional() }),
  execute: async ({ query, category }) => {
    const res = await fetch(`${process.env.DATA_API}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category })
    })
    if (!res.ok) throw new Error('RAG search failed')
    return await res.json()
  }
})

export const tools = { showSpeaker, showSession, ragSearch }
```

### 5.3 Error Handling and Safety

The Cursor agent should implement robust error handling:

- Catch network errors and respond with `output-error` state to the client.  Ensure the LLM instructs the user to try again.
- Limit the number of tool invocations per turn (`maxToolsPerStep`) to prevent infinite loops.
- Enforce prompt injection defences: strip unusual prefixes from user input, clamp instructions and ensure the system prompt remains authoritative.
- Log tool calls and responses for auditing.  Avoid logging user utterances to protect privacy (minimise PII retention).

## 6. Data API Implementation (Agent Reference)

### 6.1 FastAPI Service Structure

The Cursor agent should expose the following endpoints:

```python
from fastapi import FastAPI, HTTPException
app = FastAPI()

# Speaker endpoint
@app.get('/speakers/{name}')
async def get_speaker(name: str):
    speaker = await database.fetch_speaker(name)
    if not speaker:
        raise HTTPException(status_code=404, detail='Speaker not found')
    return speaker

# Session endpoint
@app.get('/sessions/{id}')
async def get_session(id: str):
    session = await database.fetch_session(id)
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    return session

# RAG search endpoint
@app.post('/rag/search')
async def rag_search(query: str, category: str | None = None):
    results = await rag_engine.search(query, category)
    return { 'results': results }
```

The Cursor agent should implement Weaviate queries in a separate `rag_engine.py` module.  The agent should provide functions like `search` and `graph_lookup`.  Use asynchronous client methods to avoid blocking.  Do **not** perform any conversation logic here – return raw data only.

### 6.2 Deployment & Scaling

The Cursor agent should deploy the FastAPI service on a separate server or as a Vercel Serverless Function if necessary.  Use caching for repeated queries (e.g., `async_lru` or Redis).  Expose CORS headers since the Edge Function will call it from another domain.

## 7. Performance and Optimisation (Agent Reference)

1. **SSE vs Polling:** The PubNub guide notes that SSE significantly reduces network overhead compared to polling because the server only sends data when new information is available【790907776847388†L146-L160】.  Use SSE exclusively; remove all polling code.
2. **Edge deployment:** Deploy the Edge Function in the region closest to Vienna to minimise round‑trip times.  Use Vercel’s `vercel.json` or project settings to specify `regions`.
3. **Bundle size:** Optimise the frontend by lazy‑loading card components, using `React.memo` and `React.lazy`, and removing unused dependencies.  Target a <500 KB bundle, as recommended in the research.
4. **Resource loading:** Pre‑fetch common queries (e.g., “today’s schedule”) via a `prefetchQueryResponse` utility on app load【voice-first-interface-patterns.md†L198-L205】.
5. **Turn‑taking latency:** Tavus’ smart turn detection ensures natural conversation; the architecture aims for <150 ms from utterance end to UI update.  Monitor latency and adjust region placement or caching accordingly.

## 8. Testing & Quality Assurance (Agent Reference)

The Cursor agent should develop a comprehensive test suite during Milestone 4:

1. **Unit tests:** Test each tool function in isolation; validate Zod schemas; test edge cases and error responses.
2. **Integration tests:** Simulate end‑to‑end voice interactions using Tavus’ testing tools or mocks.  Verify that a sample utterance results in correct tool invocations and UI renderings.
3. **Accessibility tests:** Use Axe and Lighthouse to ensure 0 accessibility violations.  Manually test with screen readers (VoiceOver, NVDA) to confirm ARIA announcements and focus order.
4. **Performance tests:** Use JMeter or k6 to simulate multiple concurrent sessions.  Monitor SSE stream stability and memory usage.
5. **Security tests:** Ensure that only authenticated calls from Tavus can reach the Edge Function.  Validate inputs to avoid injection attacks and enforce rate limiting.

---

> ⚠️ **CURSOR AGENTS: START HERE** ⚠️  
> **Sections 2-8 above are technical reference only.** The actual execution instructions with model allocation start below in Section 9.

## 9. Cursor AI Agent Execution Phases & Model Allocation

This section **supersedes** the human-oriented “Weeks 1–8” timeline. Instead, it instructs the **Cursor Background Agent** how to chunk work into autonomous milestones, choose the optimal model for each, and keep costs predictable.

### Milestone 0 – Pre-Flight Scan & Plan (Budget ≈ $1)
| Duration | Target Model | Rationale |
|----------|--------------|-----------|
| ~30 min  | **o3-max**   | Cheapest option with <2 s TTFT. Adequate for static analysis and to-do generation. |

**Actions**
1. Run repo-wide grep for interactive props (`onClick`, `hover`, `scroll`), `framer-motion` imports, and polling intervals.<br/>Store findings in `.cursor/plan.json` (file, line ranges, fix-type).
2. Measure context usage via Cursor context meter; if >80 %, split the to-do list by package (`frontend`, `backend`).
3. Generate an **Agent To-Do** list and pause for human review.

### Milestone 1 – Foundation Refactor (Heavy)  
| Duration | Target Model | Fallback | Cost Guard-Rail |
|----------|--------------|----------|-----------------|
| 1 agent run (≈45 min) | **o3-pro-max** | o3-max if latency >8 s | $20 ceiling |

**Scope**
- Create root-level `venv/`, install Python deps (OpenAI 1.97.1, FastAPI, Weaviate v4 client).  
- Remove `framer-motion`; install `ai` + `@ai-sdk/react/openai` + `zod` + `@tavus/cvi-ui`.
- Scaffold `TavusVoiceWrapper`, `useChat` Edge Function skeleton, FastAPI backend folder migration.

**Why o3-pro-max?** 78 % patch success on SWE-Bench subset, reliable JSON diff, and can absorb a 150 k-token snapshot (entire repo + plan).

### Milestone 2 – Component Transformation & Generative UI  
| Duration | Target Model | Supplement |
|----------|--------------|------------|
| Split into ≤3 agent runs | **o3-pro-max** | Claude Sonnet-thinking-max for cross-checks |

**Scope**
- Replace interactive cards with `VoiceSpeakerCard`, `VoiceSessionCard`, etc.  
- Implement `MessageRenderer` and AG-UI tool states (`input-available`, `output-available`, `output-error`).
- Remove all polling; introduce SSE endpoints.

**Operational Heuristics**
- Pre-warm `o3-pro-max` with 5-token “pong” to avoid cold-start latency.  
- After each patch, auto-run `npm run typecheck` + `pytest`; iterate until green.

### Milestone 3 – Voice Integration & Data Tools  
| Duration | Target Model | Rationale |
|----------|--------------|-----------|
| 1–2 runs | **o3-pro-max** | Needs robust function-calling |

**Scope**
- Connect Tavus `useObservableEvent` → `useChat` flow.  
- Implement Zod-validated tools (`showSpeaker`, `showSession`, `ragSearch`).
- Integrate Weaviate v4 search with async graph lookups.

### Milestone 4 – Performance, Accessibility & Deployment  
| Duration | Target Model |
|----------|--------------|
| Iterative fast passes | **o3-max** |

**Scope**
- Optimise bundle size (<500 KB), remove dead code, enforce 7:1 contrast.  
- Run Lighthouse & Axe via shared terminal; fix issues on the spot.
- Deploy Edge Function + FastAPI, verify Vienna region latency <150 ms.

### Milestone 5 – Automated Review & Polish  
| Duration | Target Model |
|----------|--------------|
| ≤1 run   | **o3-max** |

**Scope**
- Optimise imports, add JSDoc, run Prettier.  
- Confirm all unused files archived to `/archive/YYYY-MM-DD/` and empty dirs removed.

### Milestone 6 – Cross-Model Audit (Optional)  
| Model | Purpose |
|-------|---------|
| **Claude Sonnet-thinking-max** | Run “diff my branch against main – surface risky regex edits, deep-link to files.” |

Use only if the monthly spend is <70 % of the `$150` guard-rail after Milestone 5.

### Cost & Latency Dashboard
| Model | First-token | Stream | Cost / 10 k in + 10 k out | Use Cases |
|-------|------------|--------|---------------------------|-----------|
| o3-max | 1.8 s | 45-55 t/s | **$0.20** | Planning, hygiene, polish |
| o3-pro-max | 3–4 s | 25-30 t/s | **$2.00** | Heavy refactors, tool generation |
| Claude Sonnet-thinking-max | 3 s | 35-40 t/s | **$0.60** | Long-form audits, legal diff |

> **Checkpoint Policy:** After every milestone, create a **Cursor checkpoint**. If context meter shows >80 % utilisation, start a fresh background run.

> **Rate Limits:** Respect `agent-config.json` guard-rail (`40 req/min`, `600 k tok/min`). Cursor will auto-downgrade to o3-max if latency exceeds 8 s.

---

This phased, model-aware strategy balances **cost (<$150/month)**, **latency**, and **patch success rate**, ensuring the CTBTO Avatar refactor proceeds efficiently under Cursor Background Agent control.

## 10. External Documentation Research Requirements

The coding agent **MUST visit and thoroughly research** every external URL mentioned in the referenced documentation files. This includes but is not limited to:

- **Tavus React Hooks (useObservableEvent, useSendAppMessage):** Official documentation details how to listen for conversation events and send responses【docs_important/tavus-cvi-hooks.md†L1-L227】.
- **Vercel AI SDK v5 – Generative UI:** Explains tools, `useChat`, and streaming patterns for dynamic UI【docs_important/vercel-sdk-claude/official-docs/generative-ui-documentation.md†L1-L50】.
- **Voice‑First Patterns Guide:** Offers patterns for non‑interactive component design, voice state management and semantic structure【docs_important/vercel-sdk-claude/voice-patterns/voice-first-interface-patterns.md†L1-L45】.
- **WCAG Contrast & Font Standards:** W3C guidelines emphasise 7:1 contrast and large fonts for high accessibility.
- **Weaviate V4 Patterns:** Multi-modal graph search and cross-referencing patterns【docs_important/WEAVIATE/weaviate-v4-patterns.md†L1-L303】.

> ⚠️ **CRITICAL:** When reading the mandatory documentation files, **every external link, API reference, or documentation URL mentioned within those files must be visited and studied**. The agent must understand the full context, not just the local summaries. This includes:
> - Official Tavus API documentation and examples (local in tavus.txt -> use targeted search queries as this dfile contains the entire Tavus docs as LLM friendly text)
> - Vercel AI SDK v5 official guides and patterns  
> - Daily.co WebRTC integration guides
> - OpenAI Structured Outputs API specifications
> - Weaviate v4 client documentation and examples

**Failure to research external documentation will result in incomplete or incorrect implementation.**

## 10.1 Leveraging Browser-Based MCP Tools for Research

The Cursor agent **MUST use browser-based MCP tools** to fulfill the external documentation research requirements above. These tools enable autonomous web browsing and content extraction to gather comprehensive information from official documentation sites.

### Available Browser MCP Tools

| Tool Category | When to Use | Key Tools |
|---------------|-------------|-----------|
| **Single Session** | Quick one-off research during milestones | `browserbase_session_create`, `browserbase_stagehand_navigate`, `browserbase_stagehand_extract` |
| **Multi-Session** | Parallel research (comparing multiple docs) | `multi_browserbase_stagehand_session_create`, `multi_browserbase_stagehand_navigate_session` |

### Research Workflow for External URLs

When the agent encounters external URLs in the mandatory documentation files (Section 1.1), follow this pattern:

**Step 1: Create Browser Session**
```bash
# For single research task
/bb-start
# This creates a session and navigates to ngrok URL if available
```

**Step 2: Navigate to Documentation**
```bash
# Navigate to official documentation URLs found in local docs
/bb-open <official_tavus_api_url>
/bb-open <vercel_ai_sdk_guides_url>  
/bb-open <daily_co_webrtc_docs_url>
```

**Step 3: Extract Key Information**
```bash
# Extract structured information for implementation guidance
/bb-extract "Extract all API endpoint examples, authentication methods, and TypeScript interfaces for Tavus CVI integration"
/bb-extract "Get all code examples showing useChat hook usage with streaming and tool definitions"
/bb-extract "Find all accessibility requirements and WCAG AAA compliance examples"
```

**Step 4: Cross-Reference Implementation Patterns**
```bash
# Take screenshots for visual diff or documentation
/bb-screenshot tavus-api-examples
/bb-screenshot vercel-streaming-patterns
```

**Step 5: Clean Up**
```bash
# Always close sessions to avoid unnecessary costs
/bb-close
```

### Specific Research Targets

The agent should prioritize these external research areas:

1. **Tavus CVI Official Documentation**
   - `useObservableEvent` implementation examples
   - `useSendAppMessage` conversation flow patterns
   - Daily.co WebRTC integration specifics
   - Audio-only mode configuration

2. **Vercel AI SDK v5 Official Guides**
   - `streamText` with tool calling examples
   - `useChat` SSE streaming patterns
   - Generative UI component examples
   - Edge Function deployment guides

3. **OpenAI Structured Outputs API**
   - Latest tool calling schemas and validation
   - Function calling best practices
   - Error handling patterns

4. **Weaviate v4 Client Documentation**
   - Multi-modal search implementation
   - Graph cross-referencing patterns
   - Async client usage examples

### Multi-Session Research Strategy

For complex research requiring multiple sources:

```bash
# Create parallel sessions for comparative analysis
/bb-session-create --name="tavus-research"
/bb-session-create --name="vercel-research" 
/bb-session-create --name="weaviate-research"

# Navigate each session to different documentation
/bb-navigate-session tavus-research <tavus_docs_url>
/bb-navigate-session vercel-research <vercel_docs_url>
/bb-navigate-session weaviate-research <weaviate_docs_url>

# Extract information from all sessions in parallel
/bb-extract-session tavus-research "Get all CVI integration patterns"
/bb-extract-session vercel-research "Get all streaming UI examples"
/bb-extract-session weaviate-research "Get all v4 client examples"

# Clean up all sessions
/bb-close-session tavus-research
/bb-close-session vercel-research  
/bb-close-session weaviate-research
```

### Integration with Development Milestones

**Milestone 0 (Pre-Flight):** Use browser tools to validate all external URLs in local documentation are accessible and current.

**Milestone 1 (Foundation):** Extract specific installation guides, dependency versions, and setup examples from official sources.

**Milestone 2-3 (Implementation):** Research real-time API examples, integration patterns, and troubleshooting guides.

**Milestone 4 (Testing):** Gather accessibility testing tools, performance benchmarking examples, and deployment guides.

> **Cost Consideration:** Browser sessions consume additional credits. Use efficiently by batching research tasks and always closing sessions when complete.

## 11. Conclusion

This development plan provides a concrete roadmap for building the CTBTO Avatar kiosk on a modern, voice‑first foundation.  By combining Tavus’ voice pipeline with Vercel’s generative UI and a thin data API, the app achieves real‑time interactivity, accessibility and maintainability.  Following the patterns and guidelines herein ensures a successful migration and sets a template for future AI‑driven kiosks.
