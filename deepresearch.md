# Final Research Mandate for CTBTO-Avatar-Project Architectural Refactor

## 1. Research Objective

This document outlines a final, unified research task for an advanced AI agent. The objective is to analyze the provided project documentation and produce a definitive, optimal architectural blueprint for refactoring the CTBTO-Avatar-Project. This blueprint must resolve the critical architectural conflicts identified in the source materials while adhering to the project's non-negotiable constraints.

## 2. Foundational Constraints & Assumptions

The research must be conducted with the following constraints as ground truth:

*   **Non-Negotiable Voice Pipeline**: The **Tavus CVI**, running on **Daily.co**, is the exclusive, immutable system for all voice I/O (STT/TTS) and real-time conversation events. All other systems must integrate with it as the primary constraint.
*   **Mandatory Design Standards**: All UI components and design choices must strictly adhere to the standards outlined in `slap_bitch_team_complete.md`: zero interactivity (`onClick`, `hover`, etc.), WCAG AAA accessibility (>=18px fonts, >=7:1 contrast), and atomic, non-interactive component design.
*   **Baseline Assumption**: The research shall assume that the current UI **contains interactive elements** that must be removed. The goal is to refactor the application to meet the "voice-only" vision.

## 3. Proposed Unified Architecture (Target Hypothesis)

The following five-point architecture is the proposed target state. The research questions below are designed to validate and refine the implementation details of this specific architecture.

1.  **Voice I/O Layer (Immutable Core)**: **Tavus CVI** on **Daily.co** for all voice and real-time event handling.
2.  **Frontend Application Layer**: A **React/TypeScript** application using the **Vercel AI SDK v5**. The `useChat` hook will manage generative UI state via **SSE streaming**, completely replacing the old polling mechanism.
3.  **Design & Accessibility Layer**: UI will be composed of non-interactive, **Radix-based components** that meet the mandatory design and accessibility standards.
4.  **Backend Logic Layer**: A new **Vercel Edge Function** will serve as the primary conversational backend, orchestrating logic via the Vercel AI SDK's `streamText` and `tools` features.
5.  **Data Provider Layer**: The existing **Python/FastAPI backend** is refocused into a stable, headless data API for the Vercel Edge Function's tools to query (e.g., accessing the Weaviate RAG).

## 4. Contentious Research Questions & Mandates

The AI agent must investigate the following architectural conflicts and provide a definitive, research-backed recommendation for each.

---

### **Question 1: The "Dual Stream" Architectural Conflict**

*   **Context**: Tavus CVI provides a real-time, event-driven stream of conversation events via its `useObservableEvent` hook. The Vercel AI SDK proposes its own real-time SSE stream via `useChat` to render generative UI. Integrating both naively creates a "dual stream" problem: one for voice events and another for UI updates.
*   **Contentious Question**: Is the Vercel AI SDK's SSE streaming (`useChat`) a **redundant and unnecessarily complex layer** on top of the native Tavus CVI event stream? Or, is it a **necessary state management abstraction** for orchestrating the complex, multi-part generative UI components, for which the Tavus event model is too primitive?
*   **Research Mandate**:
    1.  **Path A (Tavus-Native)**: Architect a solution where the frontend listens *only* to the Tavus `useObservableEvent` stream. When a tool result is needed, the FastAPI backend (called as a tool by Tavus) would return a complete JSON payload for the UI card, which is then passed back through the Tavus event loop and rendered directly. Evaluate if this approach can handle the progressive, multi-part rendering that Vercel's SDK excels at.
    2.  **Path B (Hybrid Stream)**: Architect the solution as described in `vercel-sdk-claude/examples/voice-first-kiosk-template.tsx`. The Tavus `useObservableEvent` (`conversation.utterance`) triggers the Vercel `useChat.sendMessage`. The Vercel SSE stream then handles all UI generation. Evaluate the latency overhead and state synchronization risks of this two-stream system.
    3.  **Synthesize**: Provide a definitive recommendation on which architecture minimizes latency, reduces complexity, and remains most faithful to the voice-first, real-time principle, given the non-negotiable Tavus pipeline.

---

### **Question 2: The Backend Orchestration Battle & API Contract**

*   **Context**: The original architecture places the FastAPI backend as the central conversation orchestrator. The Tavus documentation implies demoting our backend to a simple "tool provider" called by the Tavus-managed LLM.
*   **Contentious Question**: Should the core "brain" of the application—the logic that decides which cards to show and what to say—reside within the **Tavus Persona's `system_prompt` and tool definitions**, making our backend a dumb data source? Or, should the Tavus LLM be given a minimal, generic prompt, with the **FastAPI backend performing all sophisticated reasoning** and simply returning a final payload for the Tavus TTS to speak?
*   **Research Mandate**:
    1.  **Path A (Tavus-Centric Intelligence)**: Develop a sophisticated Tavus `Persona` configuration where the `system_prompt` contains all complex logic. The FastAPI backend only exposes simple data retrieval tools (e.g., `get_speaker_by_id`). **You must define the simple, granular OpenAPI specification for the Python API in this scenario.**
    2.  **Path B (Backend-Centric Intelligence)**: Define a minimal Tavus `Persona` with a single, powerful tool called `get_assistant_response`. This tool passes the user utterance to the FastAPI backend, which performs the entire RAG and card-selection logic. **You must define the comprehensive, high-level OpenAPI specification for the Python API in this scenario.**
    3.  **Synthesize**: Evaluate the trade-offs. Does the Tavus-centric approach offer better latency? Or does the Backend-centric approach provide superior maintainability, testability, and control over the sophisticated RAG system? Recommend the pattern that best serves a complex, data-rich application.

---

### **Question 3: The State Management Schism**

*   **Context**: The research mandates the use of Jotai for atomic state. The proposed Vercel AI SDK architecture relies on the `useChat` hook's internal state management. These two systems must coexist cleanly.
*   **Contentious Question**: Is it better to have a **single, unified state** where `useChat`'s state is mirrored into Jotai atoms, making Jotai the single source of truth for the entire application? Or, is a **decoupled, dual-state approach** superior, where `useChat` manages its own lifecycle and Jotai is strictly for global state unrelated to the conversation stream?
*   **Research Mandate**:
    1.  **Path A (Unified State)**: Architect a solution where a custom hook synchronizes the `messages` and `isLoading` properties from `useChat` into a set of Jotai atoms. Components would consume the Jotai atoms, not the `useChat` hook directly. Evaluate the performance and complexity of this synchronization layer.
    2.  **Path B (Decoupled State)**: Architect a solution where `useChat` manages the conversation stream and components that need this data consume the hook directly. Jotai is used *only* for unrelated global state (e.g., session ID, API keys). Evaluate the developer experience and potential for state conflicts.
    3.  **Synthesize**: Recommend the most robust and maintainable state management pattern. Provide code examples demonstrating the chosen pattern's implementation.

---

## 5. Final Deliverable

The AI agent's final output should be a single, comprehensive document titled **"CTBTO-Avatar-Project: Definitive Architectural Blueprint"**. This document must present the winning architectural choices from the research above, providing code examples, sequence diagrams, and a clear, unambiguous guide for the development team to implement the refactor. 