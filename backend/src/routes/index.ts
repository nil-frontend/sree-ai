import { Router } from 'express';
import healthRoutes from './health';
import userRoutes from './user';
import aiRoutes from './ai';

const router = Router();

router.use('/health', healthRoutes);
router.use('/user', userRoutes);
router.use('/ai', aiRoutes);

export default router;
