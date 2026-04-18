import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('Auth Middleware - Error verifying token:', error?.message || 'No user found');
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Invalid token',
        debug: process.env.NODE_ENV === 'development' ? error?.message : undefined 
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
