# Requirements: Milestone 5 — Advanced Voice AI & Unified Intelligence Navigation

## 1. 🎙️ AI Voice Processing

### Voice Engine
- **VOICE-01**: Functional Voice AI integration. Must handle microphone input, real-time transcription (stt), and AI response streaming.
- **VOICE-02**: Real-time voice activity visualization. Implement small, animated UI elements that react dynamically to audio input (Perplexity-style "breathing" or "pulsing" dots).

## 2. 🧭 Sidebar & Navigation Intelligence

### Contextual Filtering
- **NAV-01**: Dynamic Sidebar Filtering. When on the Voice page, the history sidebar must ONLY show conversations where `type === 'voice'`. When on Chat, show `type === 'chat'`.
- **NAV-02**: Session Persistence. Clicking a history item must load the specific session ID and restore the conversation state.

## 3. 🛣️ Advanced Routing & Session Handoff

### URL Identifiers
- **ROUT-01**: Implement URL-based session tracking for standard chats: `/dashboard/chat/:id`.
- **ROUT-02**: Implement URL-based session tracking for voice handoffs: `/dashboard/voice/chat/:id`.

### User Experience Handoff
- **ROUT-03**: Post-Voice Transcript View. After a voice conversation ends, automatically navigate to `/dashboard/voice/chat/:id`.
- **ROUT-04**: Transcript Aesthetics. On the voice chat handoff page, the transcript text must be styled in **Italic** to distinguish it from manual chat text.

## 4. 📊 Data Architecture

### Logical Segregation
- **DATA-01**: Strict data segregation between `chat` and `voice` types in the `conversations` table.
- **DATA-02**: Ensure the sidebar "New Chat" vs "New Voice Session" correctly initializes the `type` column.

## 5. Traceability Matrix

| REQ-ID | Phase | Status |
|--------|-------|--------|
| VOICE-01| 5.3   | Pending|
| VOICE-02| 5.3   | Pending|
| NAV-01 | 5.2   | Pending|
| NAV-02 | 5.4   | Pending|
| ROUT-01| 5.1   | Pending|
| ROUT-02| 5.1   | Pending|
| ROUT-03| 5.4   | Pending|
| ROUT-04| 5.4   | Pending|
| DATA-01| 5.2   | Pending|
