# Roadmap: Sree AI

## Milestone v1.2: Integrated Voice & Chat UX

### Phase 1: Route Optimization
- [ ] Task 1: Update `App.tsx` routes to handle `/voice` (new) and `/voice/:id` (integrated).
- [ ] Task 2: Implement dynamic `replaceState` or `navigate` logic in `VoicePage.tsx` for URL takeover on first message.

### Phase 2: UI Synthesis
- [ ] Task 3: Split `VoicePage.tsx` into a container that optionally renders `ChatPage` content.
- [ ] Task 4: Apply glassmorphism and layering to the `VoiceVisualizer` to make it an overlay.
- [ ] Task 5: Implement auto-scrolling for the background chat log as voice messages arrive.

### Phase 3: Polish & Continuity
- [ ] Task 6: Add "New Voice Chat" reset button in the integrated UI.
- [ ] Task 7: Verify VAD stability during route transition.
- [ ] Task 8: Final UI audit of the unified "Voice Conversations".

---
## Completed Milestones
### v1.1 Advanced Voice AI & Unified Intelligence Navigation
- [x] Basic Voice Recording/Transcription
- [x] Neural AI Voice Response
- [x] Sidebar Navigation
- [x] Transcription View at `/voice/chat/:id`
