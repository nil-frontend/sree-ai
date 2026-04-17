# Roadmap: Milestone 4 — Dynamic Integration & Supabase Sync

## Milestone 4: Integration
| Phase | Title | Status | Description | Requirements |
|---|---|---|---|---|
| 4.1 | DB Hooks & API Key Logic | ⏳ PENDING | Create Supabase hooks for user and key management. | SYNC-04 |
| 4.2 | Dynamic Sidebar History | ⏳ PENDING | Fetch and group conversations by date in the sidebar. | SYNC-01, SYNC-02, SYNC-03 |
| 4.3 | Session Management | ⏳ PENDING | Implement "+ New Chat" and session switching. | SESS-01, SESS-02, SYNC-05 |
| 4.4 | Profile & Auth Actions | ⏳ PENDING | Hook up Logout, Settings, and Upgrade flows. | ACT-01, ACT-02, ACT-03 |

## Success Criteria per Phase

### Phase 4.1: DB Hooks
1. User can see their real email in the sidebar.
2. Premium status is pulled from the DB.
3. Backend successfully decrypts Keys for AI calls.

### Phase 4.2: Dynamic Sidebar
1. Sidebar shows "Today", "Yesterday", and "Older" categories.
2. Conversation titles are pulled from the `conversations` table.
3. Hovering/Clicking items highlights them and updates the URL.

### Phase 4.3: Session Management
1. Clicking "+ New Chat" creates a new DB entry.
2. Sidebar history refreshes immediately after creation.
3. App navigates to the newly created chat ID.

### Phase 4.4: Profile & Auth
1. Logout button terminates the session and redirects to sign-in.
2. Settings button opens the settings modal/page.
3. Upgrade status is reflected if changed in the DB.
