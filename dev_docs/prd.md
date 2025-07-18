# Product Requirements Document (PRD)

## CTBTO Multilingual Avatar System — SnT 2025

**Version:** 1.3  
**Date:** 2 July 2025  
**Owner:** Step Into Liquid BV for the CTBTO

---

## 1. Executive Summary

The CTBTO Multilingual Avatar System will deliver a real-time, touchless, voice-driven digital operator at the SnT 2025 conference in Vienna. Across three kiosk terminals, the system enables seamless, safe access to conference and Treaty information in all six official UN languages, serving 1,500+ diplomats, scientists, and officials. It enforces strict privacy, diplomatic “red zone” filtering, and resilience requirements.

---

## 2. Target Users & Personas

- **Diplomats:** Need up-to-date, sensitive info, privacy, protocol compliance.
- **Scientists/Delegates:** Require event schedules, speaker bios, venue navigation, multi-language support.
- **Non-English Speakers:** Rely on real-time language switching and accessible voice interfaces.
- **Accessibility Users:** Need hands-free, inclusive, keyboardless operation.
- **Organizers/Staff:** Require operational updates, crowd management, and live announcements.

---

## 3. User Needs / Use Cases

- Ask for information, directions, or FAQs in any UN language—receive instant, voice/visual answers.
- Get schedules, session info, or navigation as QR codes (for mobile use).
- Expect cultural and “red zone” safety: no accidental offense, political error, or unfiltered responses.



---

## 4. Functional Requirements

### 4.1 Voice Interaction

- Kiosk listens for wake word (“Hi Rosa”) in any supported language.
- Entire session is voice-driven—no keyboard, touchscreen, or camera.

### 4.2 Multilingual Support

- Full support for Arabic, Chinese, English, French, Russian, and Spanish at all stages: STT/ASR, TTS, logic, and UI.
- Dynamic language switching within session or via UI.

### 4.3 Personalized QR Output

- All complex/private outputs (directions, schedules, bios, contacts) can be delivered as on-screen QR codes for mobile use.

### 4.4 Red Zone Filtering and Safety Guardrails

- All user input and system output checked for forbidden topics (“red zone”), political/cultural sensitivity, and privacy violations—before response is shown or spoken.
- Filters are language- and context-aware, configurable by CTBTO, and enforced at multiple stages (input, processing, output).

### 4.5 Real-Time/Speculative Streaming

- Responses (avatar, UI, TTS) start streaming as soon as intent is clear—“speculative” answers are updated/overridden if final result differs.
- No “dead air” while waiting for tool or plan results.

### 4.6 Multi-Agent Orchestration

- Internal agents handle: triage/intent, planning, tool invocation, memory, status/distraction (for slow paths), response assembly, and session caching.
- This multi-agent orchestration, possibly written in Python, because we're more familiar with that, can be possibly just exposed to our Tavus example by just leveraging function calling and then call a function and by calling a function we're calling our Python pipeline. This is an idea.

### 4.7 UI & User Experience

- Four main screen states:  
  1. **Idle:** Multilingual onboarding, usage disclaimer, language selection (by voice).  
  2. **Active:** Avatar ready, language-specific UI, session ongoing.  
  3. **Status/Distraction:** For complex queries, pre-made animation/joke/status content for zero-latency feedback.  
  4. **Dynamic Output:** Agent-generated content, dynamic split-screen UI, avatar streams answer, QR/bios/maps/etc.

- Split-screen: Left = avatar video; Right = dynamic agent-generated UI (QR, maps, speaker info, etc).
- No persistent personal user data is stored.

### 4.8 Error Handling & Recovery

- Any violation (red zone or technical): output is cut, fallback message shown, session resets or re-triages.
- All violations and session errors are logged for audit and continuous improvement.

---

## 5. Non-Functional Requirements

- **Latency:**  low latency
- **Reliability:** All parallel/async flows; speculative streaming (tavus provides)
- **Scalability:** Supports concurrent sessions; agent upgrades without downtime.
- **Accessibility:** Voice-only, high-contrast UI, no keyboard/camera dependency.
- **Compliance:** CTBTO/UN privacy and data protection policies met or exceeded.

---

## 6. Success Criteria / KPIs

- Time-to-first-avatar-response <200ms for >95% of queries.
- Multilingual coverage: >98% accuracy (live test) across six UN languages.
- Zero “red zone” or cultural violations in >99.9% of live sessions.
- Session error/drop rate <2%.
- 24/7 reliability during conference days.
- User satisfaction >95% in post-event surveys.

---

## 7. Dependencies

- Tavus AI (ASR/TTS/avatar video)
- OpenAI, (agent LLMs)
- Weaviate (vector DB), Redis (cache)
- LangWatch (observability/logging)
- Access to CTBTO event data, floorplans, red zone/cultural guide, and language testers.

---

## 8. Out of Scope

- Mobile or web version (initial deployment is kiosk only, which is essentially just a computer with a screen)
- Persistent attendee accounts or tracking
- Use of cameras for user identification

---

## 9. User Journey (Summary)

- **Idle:** Multilingual onboarding (“Say ‘Hi Rosa i'd like to speak in {chosen_language} woth you’ to begin”) in langiuage of choice 
- **Session Start:** Language detected; UI transitions to active
- **Status/Distraction:** Pre-made content shown for complex/slow queries
- **Dynamic Output:** Avatar streams answer, UI updates with agent-generated content (maps, QR, bios, etc.)
- **Session End/Error:** “Bye Rosa” or violation resets to idle/safe fallback

---

