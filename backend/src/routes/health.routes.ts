import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Check Supabase connection
    const { data, error } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true });
    
    if (error) throw error;

    res.json({ 
      success: true, 
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health Check Failed:', error);
    res.status(503).json({ 
      success: false, 
      status: 'DOWN',
      message: error.message 
    });
  }
});

export default router;
