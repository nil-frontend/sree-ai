# Phase Plan: 4.4 — Profile & Auth Actions

## Objective
Finalize the core user lifecycle by implementing settings management, upgrade flows, and refining authentication actions.

## Tasks
1. [ ] **Frontend: Settings Modal**
   - Create `SettingsModal.tsx` in `frontend/src/features/dashboard/`.
   - Include user profile info (email, plan type).
   - Add a placeholders for "API Key Management" (future feature).
2. [ ] **Frontend: Upgrade Flow**
   - Implement a simple "Upgrade to Pro" action that updates the `users` table via Supabase RPC or direct update.
   - Use a premium-looking pricing card or simple confirmation.
3. [ ] **Frontend: UI Integration**
   - Connect the "Settings" button in the Sidebar to open the modal.
   - Connect the "Upgrade" button in the Profile card to the upgrade flow.
4. [ ] **Database: Plan Type Updates**
   - Ensure the frontend can update `plan_type` successfully and the UI reacts immediately.

## Verification
- [ ] Clicking "Settings" opens a cleanly designed modal.
- [ ] "Upgrade" action successfully changes "Free Plan" to "Pro Member" in the sidebar.
- [ ] Logout works and clears all local storage/session state.
