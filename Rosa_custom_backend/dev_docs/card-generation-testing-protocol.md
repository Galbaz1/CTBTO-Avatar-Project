# Card Generation Testing Protocol

## 🎯 Testing Objective

Verify that the async card generation system works correctly after the format specifier bug fix. This protocol tests all card types (session, speaker, topic) and ensures the 2-second response + 10-15 second card generation timeline.

## 📋 Pre-Test Setup

1. **Start the system**: `bun start` in Rosa_custom_backend directory
2. **Open frontend**: Navigate to `http://localhost:5173`
3. **Start conversation**: Join the meeting and wait for Rosa to be ready
4. **Monitor logs**: Keep terminal visible to watch for log patterns

## 🧪 Test Cases

### Test 1: Weather Tool (Baseline - Should Already Work)

**User Input:**
```
"What's the weather like in Vienna tonight for dinner?"
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: get_weather(location="Vienna")
💾 Stored weather data for session [session-id]: Vienna
📱 Stored weather data for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 1-3s
```

**Expected Result:**
- ✅ Response in 1-3 seconds
- ✅ Weather card appears immediately in UI
- ✅ No errors in logs

---

### Test 2: Conference Session Query (Session Cards)

**User Input:**
```
"I'm interested in seismology and earthquake detection. What sessions are available at the conference?"
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="seismology earthquake detection sessions", type="comprehensive")
🔍 RAG function called with args: {...}, session_id: [session-id]
🔍 RAG data received: True, session_id: [session-id]
💾 Stored RAG data for session [session-id]: seismology earthquake detection sessions
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 2-4s
[10-15 seconds later]
📊 Generated cards for session [session-id]: [card details]
💾 Stored session cards for [session-id]
```

**Expected Result:**
- ✅ RAG response in 2-4 seconds
- ✅ Session cards appear 10-15 seconds later
- ✅ No "Async card generation failed" errors
- ✅ Cards show seismology-related sessions

---

### Test 3: Speaker-Focused Query (Speaker Cards)

**User Input:**
```
"Who are the experts presenting on nuclear verification technologies?"
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="nuclear verification technology experts speakers", type="comprehensive")
🔍 RAG function called with args: {...}, session_id: [session-id]
🔍 RAG data received: True, session_id: [session-id]
💾 Stored RAG data for session [session-id]: nuclear verification technology experts speakers
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 2-4s
[10-15 seconds later]
📊 Generated cards for session [session-id]: [card details]
💾 Stored speaker cards for [session-id]
```

**Expected Result:**
- ✅ RAG response in 2-4 seconds
- ✅ Speaker cards appear 10-15 seconds later
- ✅ Cards show nuclear verification experts
- ✅ No format specifier errors

---

### Test 4: Topic/Theme Query (Topic Cards)

**User Input:**
```
"Tell me about atmospheric monitoring and radionuclide detection at the conference."
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="atmospheric monitoring radionuclide detection", type="comprehensive")
🔍 RAG function called with args: {...}, session_id: [session-id]
🔍 RAG data received: True, session_id: [session-id]
💾 Stored RAG data for session [session-id]: atmospheric monitoring radionuclide detection
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 2-4s
[10-15 seconds later]
📊 Generated cards for session [session-id]: [card details]
💾 Stored topic cards for [session-id]
```

**Expected Result:**
- ✅ RAG response in 2-4 seconds
- ✅ Topic cards appear 10-15 seconds later
- ✅ Cards show atmospheric monitoring themes
- ✅ Relevant session recommendations

---

### Test 5: Mixed Query (Multiple Card Types)

**User Input:**
```
"I want to attend workshops on hydroacoustic monitoring. Who's teaching them and when are they scheduled?"
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="hydroacoustic monitoring workshops schedule speakers", type="comprehensive")
🔍 RAG function called with args: {...}, session_id: [session-id]
🔍 RAG data received: True, session_id: [session-id]
💾 Stored RAG data for session [session-id]: hydroacoustic monitoring workshops schedule speakers
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 2-4s
[10-15 seconds later]
📊 Generated cards for session [session-id]: [multiple card types]
💾 Stored mixed cards for [session-id]
```

**Expected Result:**
- ✅ RAG response in 2-4 seconds
- ✅ Multiple card types appear (sessions + speakers)
- ✅ Cards show hydroacoustic workshops
- ✅ UI handles multiple cards gracefully

---

### Test 6: Edge Case - Vague Query

**User Input:**
```
"What's happening at the conference tomorrow?"
```

**Expected Logs:**
```
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge(query="conference schedule tomorrow", type="comprehensive")
🔍 RAG function called with args: {...}, session_id: [session-id]
🔍 RAG data received: True, session_id: [session-id]
💾 Stored RAG data for session [session-id]: conference schedule tomorrow
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
🤖 ROSA [session-id] ⏱️ Total response time: 2-4s
[10-15 seconds later]
📊 UI Intelligence decision: Low confidence, minimal cards or fallback
💾 Stored session cards for [session-id] (or fallback cards)
```

**Expected Result:**
- ✅ RAG response in 2-4 seconds
- ✅ Either minimal cards or fallback behavior
- ✅ No system crashes or errors
- ✅ Graceful handling of vague input

---

### Test 7: Rapid-Fire Questions (Stress Test)

**User Input Sequence (ask quickly, one after another):**
```
1. "Tell me about infrasound technology"
2. "Who's the keynote speaker?"
3. "What time are the poster sessions?"
```

**Expected Logs:**
```
[Multiple concurrent RAG calls and async card generations]
🤖 ROSA [session-id] [MAIN_ROSA] ℹ️ 🔧 Tool call: search_conference_knowledge...
🤖 Starting async card generation for session [session-id]
🚀 Started async card generation in background thread for session [session-id]
[Repeat for each query]
📊 Generated cards for session [session-id]: [multiple sets]
```

**Expected Result:**
- ✅ Each response in 2-4 seconds
- ✅ Cards appear for each query independently
- ✅ No race conditions or session confusion
- ✅ Session isolation maintained

---

## 🚨 Critical Success Indicators

### ✅ PASS Criteria:
1. **No format specifier errors** in any logs
2. **RAG responses under 4 seconds** consistently
3. **Cards appear within 15 seconds** of RAG queries
4. **Session isolation works** (no cross-contamination)
5. **UI displays cards correctly** without layout issues
6. **Fallback system works** for edge cases

### ❌ FAIL Indicators:
- `ValueError: Invalid format specifier` errors
- Card generation consistently failing
- Response times over 6 seconds for RAG
- Cards not appearing after 20+ seconds
- Session data mixing between conversations
- UI crashes or layout breaks

## 📊 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Weather Tool Response | 1-3 seconds | < 5 seconds |
| RAG Response Time | 2-4 seconds | < 6 seconds |
| Card Generation Delay | 10-15 seconds | < 20 seconds |
| Error Rate | 0% | < 5% |
| Session Isolation | 100% | 100% |

## 🔄 Test Execution Process

1. **Run Test**: Execute user input exactly as written
2. **Monitor Logs**: Watch for expected log patterns
3. **Time Performance**: Note actual vs expected timing
4. **Verify UI**: Check card appearance and functionality
5. **Document Results**: Record PASS/FAIL for each test
6. **Move to Next Test**: Wait 30 seconds between tests for clarity

## 📝 Results Template

For each test, record:
```
Test X: [Description]
Status: PASS/FAIL
Response Time: [actual]s (target: [target]s)
Cards Appeared: YES/NO at [time]s
Errors: [any errors from logs]
Notes: [observations]
```

## 🎯 Success Definition

**System is considered WORKING when:**
- All 7 tests show PASS status
- No format specifier errors in logs
- Cards consistently appear for RAG queries
- Performance stays within target ranges
- UI handles all card types gracefully

**Ready for production when:**
- 5+ consecutive test runs show 100% success rate
- Stress test (Test 7) passes without issues
- Memory usage remains stable across tests
- No resource leaks or orphaned tasks detected 