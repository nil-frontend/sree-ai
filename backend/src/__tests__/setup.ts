import { vi } from 'vitest';

// Mock environment variables
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
process.env.ENCRYPTION_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

// Mock encryption utils
vi.mock('../utils/encryption', () => ({
  encrypt: vi.fn((text) => `encrypted-${text}`),
  decrypt: vi.fn((text) => text.replace('encrypted-', '')),
}));
