import express from 'express';
import {
  createAppointment,
  getProfileAppointments,
  updateAppointment
} from '../controllers/appointments.js';
import { checkGoogleOwnership } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createAppointment);

// Routes with ownership check
router.post('/profile/:username', checkGoogleOwnership, getProfileAppointments);
router.put('/:id', checkGoogleOwnership, updateAppointment);

export default router; 