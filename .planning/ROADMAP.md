# Roadmap: Milestone 5 — Advanced Voice AI & Unified Intelligence Navigation

## Milestone v1.1 Goals
Enhance the Voice AI experience with real-time functionality and implement persistent, ID-based routing for all conversations.

---

## Phase 5.1: Routing & ID-based State Implementation
**Goal:** Enable unique session tracking via URLs for all intelligence sessions.

### Requirements
- **ROUT-01**: Implement URL-based session tracking for standard chats: `/dashboard/chat/:id`.
- **ROUT-02**: Implement URL-based session tracking for voice handoffs: `/dashboard/voice/chat/:id`.

### Success Criteria
1. Navigating to `/dashboard/chat` with an ID loads the specific conversation from Supabase.
2. The "New Chat" workflow correctly generates a UUID and updates the URL.
3. Page refreshes preserve the active conversation context.

---

## Phase 5.2: SideBar Context & Data Segregation
**Goal:** Filter conversation history based on the active domain context.

### Requirements
- **NAV-01**: Dynamic Sidebar Filtering (Filter by `type` in history).
- **DATA-01**: Strict data segregation between `chat` and `voice` types.
- **DATA-02**: Correct initialization of conversation types in store actions.

### Success Criteria
1. On the Voice page, the sidebar history only shows past voice sessions.
2. Conversation type ('chat' or 'voice') is correctly persisted upon creation.
3. Sidebar navigation items correctly distinguish between intelligence modes.

---

## Phase 5.3: Voice AI Interaction & Visualizer
**Goal:** Implement real-time voice processing and reactive UI elements.

### Requirements
- **VOICE-01**: Functional Voice AI integration (Streaming transcribe + talk).
- **VOICE-02**: Real-time voice activity visualization (Perplexity-style pulsing elements).

### Success Criteria
1. Web Speech API or NVIDIA NIM integration successfully captures and transcribes audio.
2. Animated elements react dynamically to the microphone's input volume (decibel-based scaling).
3. "Thinking" state maintains visual feedback during neural processing.

---

## Phase 5.4: Session Handoff & UI Polish
**Goal:** Seamless transition from voice interaction to text-based review.

### Requirements
- **ROUT-03**: Post-Voice Transcript View (Automatic handoff).
- **ROUT-04**: Transcript Aesthetics (Italicized text styling).
- **NAV-02**: Session Persistence (Loading voice history sessions from sidebar).

### Success Criteria
1. Voice session termination triggers a redirect to the transcript chat view.
2. All messages in the voice-to-chat handoff view are rendered in **Italic**.
3. Users can revisit voice transcripts from the sidebar history smoothly.

---

## Traceability Summary
- **VOICE**: 5.3
- **NAV**: 5.2, 5.4
- **ROUT**: 5.1, 5.4
- **DATA**: 5.2
