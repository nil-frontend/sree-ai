import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { supabaseAdmin } from '../lib/supabase';
import { aiService } from '../services/ai.service';

vi.mock('../services/ai.service', () => ({
  aiService: {
    streamChat: vi.fn(),
    generateImage: vi.fn(),
    transcribeAudio: vi.fn(),
  },
}));

describe('AI API', () => {
  it('should return 400 if NVIDIA API key is missing in DB', async () => {
    (supabaseAdmin.from as any).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Not found') })),
          })),
        })),
      })),
    }));

    const response = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ messages: [{ role: 'user', content: 'hello' }] });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('NVIDIA API Key not found');
  });

  it('should call aiService.streamChat if key is found', async () => {
    (supabaseAdmin.from as any).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { encrypted_key: 'mock-encrypted-key' }, 
              error: null 
            })),
          })),
        })),
      })),
    }));

    // Mock stream
    const mockStream = (async function* () {
      yield { choices: [{ delta: { content: 'Hi' } }] };
    })();
    (aiService.streamChat as any).mockResolvedValue(mockStream);

    const response = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ messages: [{ role: 'user', content: 'hello' }] });
    
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/event-stream');
  });
});
