const express = require('express');
const {
  createAppointment,
  getProfileAppointments,
  updateAppointment
} = require('../controllers/appointments');
const { checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', createAppointment);

// Routes with ownership check
router.post('/profile/:username', checkOwnership, getProfileAppointments);
router.put('/:id', checkOwnership, updateAppointment);

module.exports = router; 