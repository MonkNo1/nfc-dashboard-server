// server/routes/profile.js

import express from 'express';
import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// GET profile by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const profile = await UserProfile.findById(id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (update) profile by ID
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const updated = await UserProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// routes/profile.js
router.post('/set-owner', async (req, res) => {
    const { username, deviceId } = req.body;  // Device ID sent from the frontend
  
    try {
      let userProfile = await UserProfile.findOne({ username });
  
      if (!userProfile) {
        return res.status(404).json({ message: 'User profile not found' });
      }
  
      // Check if there is already an owner set
      if (!userProfile.ownerDeviceId) {
        // If there's no owner, set the current device as the owner
        userProfile.ownerDeviceId = deviceId;
        await userProfile.save();
      }
  
      res.status(200).json({ ownerDeviceId: userProfile.ownerDeviceId });
    } catch (error) {
      res.status(500).json({ message: "Error setting owner device", error });
    }
  });
  
  router.get('/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
      const userProfile = await UserProfile.findOne({ username });
  
      if (!userProfile) {
        return res.status(404).json({ message: 'User profile not found' });
      }
  
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile', error });
    }
  });
  
export default router;