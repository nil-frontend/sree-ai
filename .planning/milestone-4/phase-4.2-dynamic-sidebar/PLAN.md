# Phase Plan: 4.2 — Dynamic Sidebar History

## Objective
Enable real-time synchronization of chat history in the application sidebar, replacing static mocks with dynamic data from Supabase.

## Tasks
1. [ ] **Frontend: Database Service Update**
   - Enhance `frontend/src/lib/database.ts` (or equivalent) to include methods for fetching conversations.
2. [ ] **Frontend: Zustand Store Integration**
   - Update `useChatStore` to handle loading, errors, and fetched conversation list.
3. [ ] **Frontend: Sidebar Component Refactor**
   - Update `Sidebar.tsx` (and `HistoryItem.tsx`) to iterate over fetched data.
   - Implement date grouping (Today, Yesterday, Older).
   - Hook up the "Delete" action in the three-dot menu.
4. [ ] **Database: Indexing**
   - Ensure `conversations` table has an index on `user_id` and `created_at` for performant listing.

## Verification
- [ ] Sidebar shows "Loading..." state while fetching.
- [ ] Sidebar displays actual conversation titles from the DB.
- [ ] Deleting an item removes it from the UI immediately and from the DB.
