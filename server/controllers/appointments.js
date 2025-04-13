import Appointment from '../models/Appointment.js';
import Profile from '../models/Profile.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public
export const createAppointment = async (req, res, next) => {
  try {
    const { name, email, date, time, username, profileName } = req.body;
    
    // Basic validation
    if (!name || !email || !date || !time || !username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate date/time is in the future
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid future date and time'
      });
    }
    
    // Verify profile exists
    const profile = await Profile.findOne({ username });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      name,
      email,
      date,
      time,
      username,
      profileName: profileName || profile.name,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all appointments for a profile
// @route   GET /api/appointments/profile/:username
// @access  Public (with device ownership check)
export const getProfileAppointments = async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID required'
      });
    }
    
    // Verify profile exists and check ownership
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    if (profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these appointments'
      });
    }
    
    // Get appointments for this profile
    const appointments = await Appointment.find({ 
      username: req.params.username 
    }).sort({ date: 1, time: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Public (with device ownership check)
export const updateAppointment = async (req, res, next) => {
  try {
    const { status, deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID required'
      });
    }
    
    // Verify appointment exists
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check ownership
    const profile = await Profile.findOne({ username: appointment.username });
    if (!profile || profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    // Update status
    appointment.status = status;
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};