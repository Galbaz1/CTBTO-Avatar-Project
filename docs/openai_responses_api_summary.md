# OpenAI Responses API (Q2 2025 Release) – Quick Reference

> Last updated: 2025-07-29

The **Responses API** is OpenAI’s new, stateful, agent-centric endpoint that unifies Chat Completions, Assistants, tool use, and streaming into a single workflow. It was launched publicly in **March 2025** and received a major feature update in **May 2025** [[openai.com blog](https://openai.com/index/new-tools-for-building-agents/)].

---
## 1  Why Migrate from `chat.completions`
| Capability | `chat.completions` | `responses` API |
|------------|-------------------|-----------------|
| **State / Threads** | Stateless; you pass all messages every request | Built-in **Threads** → server-side conversation memory |
| **Tool Use** | Function-calling (beta) | First-class **Tools** (web-search, file-search, code-interpreter, remote MCP) |
| **Streaming** | SSE (`stream=true`) | Rich SSE with granular event types (`response.delta`, `response.done`, etc.) |
| **Background Mode** | – | `background: true` for async, long-running tasks |
| **Reasoning Summaries** | – | Incremental reasoning deltas & encrypted reasoning blocks |
| **Multimodal** | Text / images (limited) | Native text, image, audio I/O & “computer-use-preview” model |

---
## 2  Key Endpoints (v1 preview)
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/threads` | Create a thread (conversation container) |
| `POST` | `/v1/threads/{thread_id}/responses` | **Create** a response (equivalent to chat completion) |
| `GET`  | `/v1/threads/{thread_id}/responses/{response_id}/events` | **Stream** response events (SSE) |
| `POST` | `/v1/responses/{response_id}/cancel` | Cancel an in-flight response |

Event taxonomy (partial):
```
response.created → response.delta → response.done
response.output_item.added / done
error, rate_limits.updated, …
```
Full list captured in docs → `docs/openai_responses_api_event_matrix.md` (see below).

---
## 3  Model Support (May 2025)
* `gpt-4o`, `gpt-4o-mini`
* `gpt-4.1`, `gpt-4.1-nano`, `gpt-4.1-mini`
* Tool-specialised models: `computer-use-preview`, `gpt-image-1`

### Region Availability (Azure parity)
> australiaeast, eastus, francecentral, japaneast, … *(see Azure docs)*

---
## 4  Structured Outputs with Pydantic (Beta)
```python
from pydantic import BaseModel, Field
from openai import OpenAI
client = OpenAI()

class SessionCard(BaseModel):
    session_id: str = Field(description="Unique session UUID")
    title: str = Field(description="Session title")
    description: str | None = Field(None, description="Short abstract")

completion = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{"role":"user","content":"Session details:"}],
    response_format=SessionCard,
)
data: SessionCard = completion.choices[0].message.parsed
```
* **Guarantees**: JSON schema enforcement, automatic validation, typed return value.
* **Fallback**: Still possible to use `{"type":"json_object"}` for ad-hoc schemas.

---
## 5  Migration Checklist
1. **Thread Creation** – Persist `conversation_id` from Rosa backend → OpenAI thread.
2. **Response Generation** – Replace `client.chat.completions.create` with `/threads/{id}/responses`.
3. **Streaming Handler** – Adapt frontend SSE handler to new event taxonomy (`response.delta`).
4. **Tool Mapping** – Register Weaviate search as a **remote MCP** tool; map `ui_intelligence_agent` functions to Responses tools.
5. **Structured Output Parsing** – Define shared **Pydantic models** (SessionCard, SpeakerCard, …) & switch to `client.beta.chat.completions.parse`.
6. **Background Mode** – Use for long RAG queries (`background: true`).
7. **Rate Limit Handling** – Subscribe to `rate_limits.updated` events.

---
## 6  Further Reading
* Official docs sitemap snippets (see Context7 extract)
* Blog post “New tools and features in the Responses API” (May 21 2025)
* Azure guide “Responses API” (updated June 2025)

---
*Saved via Context7 extraction on 2025-07-29.* 