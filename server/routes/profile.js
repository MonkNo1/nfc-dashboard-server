// server/routes/profile.js
import express from 'express';
import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// GET /api/profile/:id (by MongoDB _id)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const profile = await UserProfile.findById(id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error("GET profile error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profile/:id (update profile if device is owner)
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const { deviceId, ...updateData } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const profile = await UserProfile.findById(id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Check device ownership
    if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({ error: 'You are not the owner of this profile.' });
    }

    Object.assign(profile, updateData);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("POST profile error:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;