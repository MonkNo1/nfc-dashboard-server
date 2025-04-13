import express from 'express';
import {
  createAppointment,
  getProfileAppointments,
  updateAppointment
} from '../controllers/appointments.js';
import { checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createAppointment);

// Routes with ownership check
router.post('/profile/:username', checkOwnership, getProfileAppointments);
router.put('/:id', checkOwnership, updateAppointment);

export default router; 