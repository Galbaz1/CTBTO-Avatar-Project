# Rosa Cursor Rules Organization (2025 Standards)

## 📁 Rule Structure

### Always Applied Rules (Essential Context)
- **`000-core-project-always.mdc`** - Essential Rosa project context, architecture, and requirements ✅

### Auto-Attached Rules (File-specific Patterns)
- **`core-rules/tavus-function-calling-auto.mdc`** - Function calling patterns (handlers, backend, API files)
- **`ts-rules/react-typescript-auto.mdc`** - React + TypeScript patterns (*.ts, *.tsx, *.js, *.jsx)
- **`py-rules/python-backend-auto.mdc`** - Python backend development (*.py)
- **`global-rules/coding-standards-always.mdc`** - Core coding principles (all source files)
- **`global-rules/anti-patterns-always.mdc`** - What NOT to do (all source files)
- **`development-workflow.mdc`** - Development workflow (project files)

### Agent-Select Rules (Context-specific)
- **`ui-rules/split-screen-development-agent.mdc`** - Split-screen UI implementation guidance
- **`rosa-requirements.mdc`** - Project requirements reference (use @rosa-requirements)
- **`backendintegration.mdc`** - Comprehensive backend analysis (use @backendintegration)

### Legacy Rules (Deprecated)
- **`project-overview.mdc`** - ⚠️ DEPRECATED - Content moved to organized files
- **`react-cvi-patterns.mdc`** - ⚠️ DEPRECATED - Content moved to ts-rules/

## 🎯 Usage Guide

### For Stateless AI Context
Since AI agents are stateless, the **Always Applied Rules** provide essential context:
- Rosa project overview and current state
- Tech stack and architecture decisions  
- Key file locations and working examples
- Critical requirements and constraints

### Rule Types Explained

| Type | When Active | Purpose | Example |
|------|-------------|---------|---------|
| **Always** | Every conversation | Core context & standards | Project basics, coding standards |
| **Auto** | Specific file types | Language/framework patterns | TypeScript rules for .tsx files |
| **Agent** | When relevant | Task-specific guidance | Split-screen development help |
| **Manual** | When referenced | On-demand information | @rosa-requirements |

### Development Workflow

1. **Start Here**: Always Applied Rules provide project context
2. **File Work**: Auto-Attached Rules activate based on file type  
3. **Specific Tasks**: Use @rule-name for Agent-Select rules
4. **Reference**: Manual rules for detailed specifications

## 🔧 Rule Updates (2025 Standards)

### What Changed
- **Glob-pattern targeting**: Most rules now use specific file patterns instead of alwaysApply
- **Function calling consolidation**: Merged multiple function calling rules into one comprehensive guide
- **Token optimization**: Concise, actionable content over verbose descriptions  
- **Organizational structure**: Rules grouped by purpose in folders
- **Stateless awareness**: Essential context provided upfront for AI
- **Eliminated duplication**: Removed redundant information across rules

### Migration from Old Rules
- **Function calling**: Consolidated `tavus-function-calling.mdc` + `tavus-function-calling-integration.mdc` → `core-rules/tavus-function-calling-auto.mdc`
- **Core project info**: Moved from `project-overview.mdc` → `000-core-project-always.mdc`
- **React patterns**: Moved from `react-cvi-patterns.mdc` → `ts-rules/react-typescript-auto.mdc`
- **Coding standards**: Extracted to `global-rules/coding-standards-always.mdc`
- **Split-screen development**: Organized in `ui-rules/split-screen-development-agent.mdc`
- **Reference materials**: `rosa-requirements.mdc` and `backendintegration.mdc` converted to manual/agent-select

## 📚 Quick Reference

### For New Development
```bash
# Current Rosa development commands
cd examples/cvi-ui-conversation
bun install
bun dev
```

### Key Working Examples
- **Function calling**: `examples/cvi-frontend-backend-tools/`
- **Working handlers**: `src/components/SimpleWeatherHandler.tsx`, `src/components/CTBTOHandler.tsx`
- **Split-screen base**: `src/components/RosaDemo.tsx`

### Critical Files to Reference
- **Tavus docs**: `dev_docs/tavus.txt`
- **Implementation plan**: `dev_docs/rosa-split-screen-simple-implementation.md`
- **Python backend**: `examples/cvi-ui-conversation/backend/Agent1.py`

## 🎭 Rosa-Specific Reminders

- **Package Manager**: Bun (not npm)
- **Function Calls**: Python backend (not native Tavus models)
- **Architecture**: Extend existing patterns, don't rebuild from scratch
- **Testing**: Weather → CTBTO → New functions (proven working order)
- **Performance**: <200ms response time requirement 