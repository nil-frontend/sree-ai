# Requirements: Milestone 4 — Dynamic Integration & Supabase Sync

## 1. Data Sync Requirements

### Sidebar Sync
- **SYNC-01**: Components must fetch active user conversations from the Supabase `conversations` table.
- **SYNC-02**: History list must group items by relative time (Today, Yesterday, Older).
- **SYNC-03**: Clicking a history item must navigate to the specific chat session.

### User Profile Sync
- **SYNC-04**: Fetch user display name, avatar, and plan status (Free/Pro) from the `users` table.
- **SYNC-05**: Profile card in sidebar must reflect real-time subscription status.
- **SYNC-06**: Three-dot menu on hover for chat listings with delete action.
- **SYNC-07**: Categorize and separate Voice AI chats from normal chats in the sidebar.

## 2. Interactive Features

### Session Management
- **SESS-01**: "+ New Chat" button must trigger a route/helper to create a new record in the `conversations` table.
- **SESS-02**: Handle empty states when a user has no previous history.
- **SESS-03**: Conversations must only be persisted in the database after the first message is sent.

### User Actions
- **ACT-01**: Implement "Logout" functionality using Supabase Auth.
- **ACT-02**: Link "Settings" to the profile management page.
- **ACT-03**: Upgrade button must link to a simulated/actual payment gateway or plan selection.

## 3. Technical Constraints
- Use React hooks (useState/useEffect) or a state manager (Zustand) for global user state.
- Handle loading states with skeleton screens or spinners during data fetching.
- Implement error boundaries for failed DB requests.

## 4. Traceability
| REQ-ID | Phase | Status |
|--------|-------|--------|
| SYNC-01| TBD   | Pending|
| SYNC-02| TBD   | Pending|
| SYNC-03| TBD   | Pending|
| SYNC-04| TBD   | Pending|
| SYNC-05| TBD   | Pending|
| SESS-01| TBD   | Pending|
| SESS-02| TBD   | Pending|
| ACT-01 | TBD   | Pending|
| ACT-02 | TBD   | Pending|
| ACT-03 | TBD   | Pending|
