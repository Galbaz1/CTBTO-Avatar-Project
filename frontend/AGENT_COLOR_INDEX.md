# 🎨 ROSA Agent Color Index & Reference

## 🤖 Agent Colors (LLM Instances)

| Agent | Color | Purpose | GPT Model |
|-------|--------|---------|-----------|
| **MAIN_ROSA** | 🔵 **Blue** | Primary conversation agent handling user interactions | GPT-4.1 |
| **UI_INTEL** | 🟣 **Magenta** | UI Intelligence agent deciding when to show cards | GPT-4.1 Mini |
| **WARMUP** | 🟡 **Yellow** | Backend warmup calls on startup | GPT-4.1 |

## 📊 Log Level Colors

| Level | Color | Usage |
|-------|--------|-------|
| **DEBUG** | ⚫ Dark Gray | Detailed debugging information |
| **INFO** | ⚪ White | Normal operational messages |
| **WARN** | 🟡 Yellow | Warning messages |
| **ERROR** | 🔴 Red | Error messages |

## 🎯 Special Colors

| Type | Color | Purpose |
|------|--------|---------|
| **SESSION** | 🟢 **Green** | Session IDs and session-related info |
| **PERFORMANCE** | 🔵 **Cyan** | Timing and performance metrics |
| **ROSA PREFIX** | **Bold White** | Always bold for "🤖 ROSA" prefix |

## 📋 Log Format Examples

### Conversation Flow
```bash
🤖 ROSA [c79f1c95] [MAIN_ROSA] ℹ️ Processing: I'm a student in nuclear physics...
🤖 ROSA [c79f1c95] [MAIN_ROSA] ℹ️ ⚡ Processing conversation (gpt-4.1)
🤖 ROSA [c79f1c95] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="quantum sensing")
🤖 ROSA [c79f1c95] [MAIN_ROSA] ℹ️ ✅ Response complete (4.38s)
```

### UI Intelligence Decision
```bash
🤖 ROSA [c79f1c95] [UI_INTEL] ℹ️ 🧠 Decision: True | Confidence: 0.98
🤖 ROSA [c79f1c95] [UI_INTEL] ℹ️ 🧠 Reasoning: User exploring quantum sensing (context). Session cards highly relevant to query (relevance). Context + relevance = high → show cards (logic).
🤖 ROSA [c79f1c95] [UI_INTEL] ℹ️ 🎴 Card decision: show 3 cards (confidence=0.98)
```

### Performance Metrics
```bash
🤖 ROSA [c79f1c95] ⏱️ Total response time: 4.38s
```

### Warmup Sequence
```bash
🤖 ROSA [no-session] [WARMUP] ℹ️ 🔥 Warming up backend
🤖 ROSA [no-session] [WARMUP] ℹ️ ✅ Backend warmed up (2.03s)
```

## 🔍 Quick Visual Guide

In your terminal, you'll see:

- **🔵 Blue text**: Main conversation processing (MAIN_ROSA)
- **🟣 Magenta text**: UI card decisions and reasoning (UI_INTEL)
- **🟡 Yellow text**: Startup warmup calls (WARMUP)
- **🟢 Green text**: Session IDs like `[c79f1c95]`
- **🔵 Cyan text**: Performance timings like `⏱️ Total response time: 4.38s`
- **Bold white**: The "🤖 ROSA" prefix on every log line

## 🛠️ Debugging Tips

1. **Follow a conversation**: Look for the same green session ID across different colored agents
2. **Track UI decisions**: Magenta logs show when and why cards are displayed
3. **Monitor performance**: Cyan logs show timing bottlenecks
4. **Trace tool calls**: Blue logs show function calls and their arguments
5. **Check reasoning**: UI_INTEL magenta logs include full decision reasoning

## 🔧 Configuration

Colors can be disabled by setting the environment variable:
```bash
NO_COLOR=1  # Disables all terminal colors
```

Or adjust logging levels:
```bash
ROSA_LOG_LEVEL=debug     # See all agent interactions
ROSA_LOG_LEVEL=info      # Normal operational view (default)
ROSA_LOG_LEVEL=warn      # Minimal output
```

This color system makes it easy to visually distinguish between different parts of the system and quickly debug conversation flows, UI decisions, and performance issues. 