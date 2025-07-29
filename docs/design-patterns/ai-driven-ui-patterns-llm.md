# AI-Driven UI Patterns (LLM Era, 2025)

This document aggregates cutting-edge research and best-practice patterns for building **user-interfaces driven by large language models**.  Content was compiled July 2025 using Browserbase MCP extraction.

## 1  UI as a Function of AI  (Chris McKenzie, 2025)

**Source:** Medium – “Practical Guide: UI as a function of AI”  
**Extracted headings:**
- What is “UI as a function of AI”?
- Why UI as a function of AI
- Patterns for Implementing AI-Driven UIs
- Embedded State (AI manages state)
- Dynamic UI Generation (DUG) – real-time component generation
- Restrictive UI Generation (RUG) – AI chooses from whitelisted components
- Architecture Overview → Visual Layer / Intelligence Layer / Knowledge Layer / Component Registry / Client State / Query Routing / AI Orchestration / Client State Updates
- Benefits / Drawbacks / Final Thoughts / Next Steps / Conclusion

**Key Take-aways for Rosa**
1. Rosa’s **Compound Card Library** is the *RUG* palette – the agent selects among vetted components.
2. Our **UIIntelligenceAgent** owns orchestration (Intelligence Layer).  The “Component Registry” maps to `Card.tsx` + badge atoms.
3. We should migrate from whole-object polling → **delta events** (Client State Updates) to minimize visual churn.

## 2  AG-UI Protocol (LinkedIn Article, 2025)
*Standardizes event streams (`runStarted`, `delta`, `runFinished`) that link back-end agents to any front-end.*
- Reinforces need for Rosa to expose **JSON delta feeds** rather than 2-second bulk polling.

## 3  DesignCoder & GUIDE (ArXiv 2025)
*Hierarchy-aware & self-correcting UI code generation frameworks.*  Take-away: **idempotent, granular components** allow the agent to re-compose without layout regressions.

## 4  Systematic LLM-UI Reviews (Ahmed 2025; Lee 2025)
- LLMs now act as *collaborators* in design; human-in-the-loop remains critical (in Rosa, the “loop” is voice dialogue).
- Primary challenges: hallucination, prompt instability, explainability → our use of **Weaviate KG + relevance thresholds** is aligned with suggested defenses.

---
### Implementation Roadmap Recap (applies these patterns)
1. JSON-Patch delta endpoint (`/ui-delta/{session}`)  ➜ `UIDeltaHandler` reducer.
2. Event-stream upgrade (AG-UI style) via SSE for agent→kiosk.
3. Self-correction loop: agent dismisses stale cards automatically.
4. Slot-based partial updates for micro-deltas (e.g., speaker badge count).

> Keep this document updated as new research emerges. 