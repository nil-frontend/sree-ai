# Roadmap: Milestone 4 — Dynamic Integration & Supabase Sync

## Milestone 4: Integration
| Phase | Title | Status | Description | Requirements |
|---|---|---|---|---|
| 4.1 | DB Hooks & API Key Logic | ✅ COMPLETED | Create Supabase hooks for user and key management. | SYNC-04 |
| 4.2 | Dynamic Sidebar History | ✅ COMPLETED | Fetch and group conversations by date in the sidebar. | SYNC-01, SYNC-02, SYNC-03 |
| 4.3 | Session Management | ✅ COMPLETED | Implement "+ New Chat" and session switching. | SESS-01, SESS-02, SYNC-05 |
| 4.4 | Profile & Auth Actions | ✅ COMPLETED | Hook up Logout, Settings, and Upgrade flows. | ACT-01, ACT-02, ACT-03 |

## Success Criteria per Phase

### Phase 4.1: DB Hooks
1. User can see their real email in the sidebar.
2. Premium status is pulled from the DB.
3. Backend successfully decrypts Keys for AI calls.

### Phase 4.2: Dynamic Sidebar
1. Sidebar shows "Today", "Yesterday", and "Older" categories.
2. Voice AI and Text chats are separated visually.
3. Three-dot menu appears on hover for each chat item.
4. Clicking "Delete" in the menu removes the conversation from DB and UI.

### Phase 4.3: Session Management
1. Clicking "+ New Chat" resets the input but DOES NOT create a DB entry yet.
2. DB entry is created only when the first AI request is sent.
3. Sidebar history refreshes immediately after the first message.

### Phase 4.4: Profile & Auth
1. Logout button terminates the session and redirects to sign-in.
2. Settings button opens the settings modal/page.
3. Upgrade status is reflected if changed in the DB.
