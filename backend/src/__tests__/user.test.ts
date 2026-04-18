import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { supabaseAdmin } from '../lib/supabase';

describe('User API', () => {
  it('should return 401 if no token provided for /api/user/profile', async () => {
    const response = await request(app).get('/api/user/profile');
    expect(response.status).toBe(401);
  });

  it('should return 200 and user profile if token is valid', async () => {
    // Mock user database response
    const mockProfile = { id: 'test-user-id', email: 'test@example.com' };
    (supabaseAdmin.from as any).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
        })),
      })),
    }));

    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockProfile);
  });

  it('should successfully update API keys', async () => {
    (supabaseAdmin.from as any).mockImplementationOnce(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    }));

    const response = await request(app)
      .post('/api/user/settings/keys')
      .set('Authorization', 'Bearer valid-token')
      .send({ nvidia_api_key: 'new-key' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API key updated successfully');
  });
});
