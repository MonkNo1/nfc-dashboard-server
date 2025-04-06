import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// 📨 Create a new appointment request (status: "pending")
router.post('/', async (req, res) => {
  try {
    const { username, name, email, date, time } = req.body;

    if (!username || !name || !email || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const appt = new Appointment({
      username,
      name,
      email,
      date,
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
    const { ownerResponse } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
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

// 📋 Get all appointments for a user (pending + confirmed)
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const appointments = await Appointment.find({ username }).sort({
      date: 1,
      time: 1
    });

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;