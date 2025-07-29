# Project Documentation Generation Rules

This document outlines the rules and procedures for the AI Agent to generate a comprehensive, atomic-level documentation for the CTBTO-Avatar-Project. The final output will be a single file named `PROJECT_DOCUMENTATION.md`.

## Phase 1: Environment and Technology Stack Analysis

### Objective
Document the complete technology stack, project structure, and key configurations for both the frontend and backend.

### Actions
1.  **Analyze Frontend Dependencies:**
    - Read `frontend/package.json`.
    - Extract and list all `dependencies` and `devDependencies`.
    - Identify major frameworks (React, Vite), UI libraries (Shadcn, Radix), and styling engines (Tailwind CSS).

2.  **Analyze Backend Dependencies:**
    - Read `backend/requirements.txt`.
    - List all Python packages.
    - Identify the web framework (e.g., Flask, FastAPI), database clients (Weaviate), and other critical libraries.

3.  **Map Project Structure:**
    - Generate a tree structure for `frontend/src`.
    - Generate a tree structure for `backend/`.
    - Include these trees in the documentation to provide a visual map of the codebase.

## Phase 2: Backend Architecture Documentation

### Objective
Detail the backend's API endpoints, data processing logic, conversational agent flow, and the RAG (Retrieval-Augmented Generation) system.

### Actions
1.  **Document API and Control Flow:**
    - Read `backend/rosa_api_server.py` and `backend/main_conversation_agent.py`.
    - Identify all API endpoints.
    - Document the request/response schema for each endpoint.
    - Map the main conversation control flow.

2.  **Document Card Generation Logic:**
    - Read `backend/smart_card_manager.py` and `backend/structured_card_processor.py`.
    - Document the logic for creating different UI "cards".
    - List all card types, their required data inputs, and their purpose.

3.  **Document the RAG System:**
    - Read `backend/weaviate_knowledge_search.py`.
    - **Crucially, reference `docs/design-patterns/WEAVIATE/weaviate-v4-patterns.md` for existing patterns.**
    - Document Weaviate client initialization, schema definitions, and query patterns (hybrid, vector search).

4.  **Document Knowledge Sources:**
    - List the contents of `backend/backend_data/` to document the raw sources for the RAG system.

## Phase 3: Frontend Architecture Documentation

### Objective
Detail the frontend's component structure, state management, API interactions, and styling implementation.

### Actions
1.  **Document Application Entry and Structure:**
    - Read `frontend/src/main.tsx` and `frontend/src/App.tsx`.
    - Describe the root component hierarchy, routing, and provider setup.

2.  **Document Component Design Patterns:**
    - Analyze a representative sample of components from `frontend/src/components/cards/`, `frontend/src/components/ui/`, and `frontend/src/components/cvi/`.
    - Document the props interface, state management, and general design philosophy (e.g., Atomic Design).

3.  **Document API Consumption:**
    - Read all files within `frontend/src/api/`.
    - Document how the frontend calls the backend API and handles responses.

4.  **Document Styling and Utilities:**
    - Read `frontend/tailwind.config.js` (or equivalent) and `frontend/src/lib/utils.ts`.
    - Document the design system, theme, and common utility functions.

## Phase 4: System Integration and Data Flow

### Objective
Create a holistic view of the system, showing how the frontend and backend interact, and provide a guide for key library integrations.

### Actions
1.  **Create End-to-End Sequence Diagram:**
    - Synthesize all information from previous phases.
    - Use Mermaid syntax to generate a sequence diagram that shows a user query's entire lifecycle.

2.  **Create Library Integration Guides:**
    - For each major library (Weaviate, Shadcn, Vercel AI SDK, etc.), write a dedicated section.
    - Explain the library's role in the project.
    - Provide concrete code snippets from the codebase showing how it is integrated and used.

## Phase 5: Final Document Assembly

### Objective
Compile all the analyzed information into the final `PROJECT_DOCUMENTATION.md` file.

### Actions
1.  **Create and Structure the Document:**
    - Create the `PROJECT_DOCUMENTATION.md` file in the root directory.
    - Use the section headings from this rules file as the top-level structure.
    - Populate each section with the findings from the corresponding phase.
    - Ensure all code snippets are properly formatted and all explanations are clear and concise. 