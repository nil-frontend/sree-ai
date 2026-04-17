import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { encrypt } from '../utils/encryption';

const router = Router();

// Protected profile route
router.get('/profile', authMiddleware, async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
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
    const { nvidia_api_key } = req.body;
    const userId = req.user.id;

    if (!nvidia_api_key) {
      return res.status(400).json({ success: false, message: 'API key is required' });
    }

    const encryptedKey = encrypt(nvidia_api_key);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ nvidia_api_key: encryptedKey })
      .eq('id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'API key updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
