import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import profileRoutes from './profiles.js';
import dashboardRoutes from './dashboards.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/dashboards', dashboardRoutes);

export default router; 