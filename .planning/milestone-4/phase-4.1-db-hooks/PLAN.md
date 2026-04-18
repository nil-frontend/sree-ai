# Phase Plan: 4.1 — DB Hooks & API Key Logic

## Objective
Establish the database infrastructure for secure API key management and ensure user profile synchronization.

## Context
- `auth.users` -> `public.profiles` sync is already implemented.
- `public.api_keys` table exists but is empty.
- Need a secure way to store and retrieve third-party API keys (OpenAI, Anthropic, Nvidia).

## Tasks
1. [x] **Backend: Encryption Utility**
   - Create `backend/src/lib/encryption.ts` using Node `crypto` (AES-256-GCM).
   - Use `ENCRYPTION_KEY` from environment variables.
2. [x] **Backend: API Key Service**
   - Create `backend/src/services/apiKeys.service.ts` to manage CRUD operations for encrypted keys.
3. [x] **Backend: Route Integration**
   - Update AI route handlers (e.g., Nvidia) to try fetching keys from the DB before falling back to env vars.
4. [x] **Database: RLS Verification**
   - Verify `api_keys` RLS policies allow users to read only their own keys.

## Verification
- [ ] Run unit test for `encryption.ts` (encrypt -> decrypt match).
- [ ] Manually add a key to Supabase and verify the AI bridge uses it correctly.
