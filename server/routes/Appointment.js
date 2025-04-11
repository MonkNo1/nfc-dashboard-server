import express from 'express';
import Appointment from '../models/Appointment.js';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// 📨 Create a new appointment request (status: "pending")
router.post('/', async (req, res) => {
  try {
    const { username, name, email, date, time } = req.body;

    // Validate required fields
    if (!username || !name || !email || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the username/profile exists
    const profileExists = await UserProfile.findOne({ username });
    if (!profileExists) {
      return res.status(404).json({ error: "Profile not found with this username" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate date and time format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (parsedDate < currentDate) {
      return res.status(400).json({ error: "Appointment date must be in the future" });
    }
    
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: "Invalid time format (HH:mm expected)" });
    }

    // Check for duplicate appointments
    const existingAppt = await Appointment.findOne({ username, date, time });
    if (existingAppt) {
      return res.status(409).json({ error: "An appointment already exists for this time slot" });
    }

    const appt = new Appointment({
      username,
      name,
      email,
      date: parsedDate,
      time,
      status: "pending"
    });

    await appt.save();
    res.status(201).json({ message: "Appointment request sent", appointment: appt });
  } catch (err) {
    console.error("Error saving appointment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Confirm appointment (used by profile owner)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerResponse, deviceId } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    // Get the appointment
    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify owner (optional enhancement)
    if (deviceId) {
      const profile = await UserProfile.findOne({ username: appt.username });
      if (profile && profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({ error: "You are not authorized to approve this appointment" });
      }
    }

    appt.status = "confirmed";
    appt.ownerResponse = ownerResponse || "Accepted";

    await appt.save();
    res.status(200).json({ message: "Appointment confirmed", appointment: appt });
  } catch (err) {
    console.error("Error approving appointment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ❌ Decline/Cancel appointment
router.patch('/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerResponse, deviceId } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    // Get the appointment
    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify owner (optional enhancement)
    if (deviceId) {
      const profile = await UserProfile.findOne({ username: appt.username });
      if (profile && profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({ error: "You are not authorized to decline this appointment" });
      }
    }

    appt.status = "declined";
    appt.ownerResponse = ownerResponse || "Declined";

    await appt.save();
    res.status(200).json({ message: "Appointment declined", appointment: appt });
  } catch (err) {
    console.error("Error declining appointment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📋 Get all appointments for a user (pending + confirmed)
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { status } = req.query;

    // Build query
    const query = { username };
    if (status && ['pending', 'confirmed', 'declined'].includes(status)) {
      query.status = status;
    }

    const appointments = await Appointment.find(query).sort({
      date: 1,
      time: 1
    });

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🗑️ Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    // Get the appointment
    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify owner (if deviceId provided)
    if (deviceId) {
      const profile = await UserProfile.findOne({ username: appt.username });
      if (profile && profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({ error: "You are not authorized to delete this appointment" });
      }
    }

    await Appointment.findByIdAndDelete(id);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;