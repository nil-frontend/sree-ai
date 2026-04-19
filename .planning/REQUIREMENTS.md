# Milestone v1.2: Integrated Voice & Chat UX Requirements

## Core Objective
Unify the "Immersive Voice" and "Detailed Chat" views into a single cohesive interface where voice interactions happen directly over the chat history.

## Functional Requirements
1. **Dynamic Navigation Transition**
   - Start session at `/voice`.
   - After the 1st voice transcription is processed and a conversation ID is generated, the URL must automatically update to `/voice/:id` without interrupting the audio/recording flow.
   - Subsequent voice messages in the same session must persist on that same ID.

2. **UI Integration: Voice-over-Chat**
   - The `/voice/:id` page should render the `ChatPage` content (messages list) as the background.
   - The `VoiceVisualizer` and status overlays should be rendered as a glassmorphic or semi-transparent layer ON TOP of the chats.
   - As voice is processed, messages should appear in real-time in the background chat log.

3. **Session Management**
   - Provide a "Reset Search" or "New Voice Session" button to quickly clear context and return to `/voice`.
   - Support resuming any existing conversation in "Integrated Voice Mode" by navigating to `/voice/:id`.

## Technical Constraints
- **State Management**: Use `useChatStore` for message persistence.
- **VAD Stability**: Ensure the active MediaRecorder session survives route/state changes if necessary (or re-initialize seamlessly).
- **Z-Index Strategy**: Sidebar and header should stay accessible OR be dimmed during active voice interaction.

## Success Criteria
- [ ] Clicking "Mic" in Chat detail enters Integrated Mode.
- [ ] URL updates from `/voice` to `/voice/:id` on 1st message.
- [ ] User can see chat history scrolling behind the voice circle.
- [ ] AI voice response is synced with the background message appearing.
