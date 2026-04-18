import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { ApiKeyService } from '../services/apiKey.service';

const router = Router();

// Protected profile route
router.get('/profile', authMiddleware, async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update API Keys
router.post('/settings/keys', authMiddleware, async (req: any, res) => {
  try {
    const { nvidia_api_key, deepgram_api_key, provider, key } = req.body;
    const userId = req.user.id;

    const finalProvider = provider || (nvidia_api_key ? 'nvidia' : (deepgram_api_key ? 'deepgram' : null));
    const finalKey = key || nvidia_api_key || deepgram_api_key;

    if (!finalKey || !finalProvider) {
      return res.status(400).json({ success: false, message: 'Provider and API key are required' });
    }

    const success = await ApiKeyService.saveUserApiKey(userId, finalProvider, finalKey);
    
    if (!success) {
      throw new Error('Failed to encrypt or save API key');
    }

    res.json({ success: true, message: `${finalProvider} API key updated successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List API Keys
router.get('/settings/keys', authMiddleware, async (req: any, res) => {
  try {
    const keys = await ApiKeyService.listUserApiKeys(req.user.id);
    res.json({ success: true, data: keys });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete API Key
router.delete('/settings/keys/:provider', authMiddleware, async (req: any, res) => {
  try {
    const { provider } = req.params;
    const success = await ApiKeyService.deleteUserApiKey(req.user.id, provider);
    
    if (success) {
      res.json({ success: true, message: `${provider} key deleted successfully` });
    } else {
      res.status(500).json({ success: false, message: `Failed to delete ${provider} key` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
