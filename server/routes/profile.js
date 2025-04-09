// server/routes/profile.js
import express from 'express';
import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// GET /api/profile/slug/:slug (fetch profile by custom slug)
router.post('/slug/:slug/claim', async (req, res) => {
    const { slug } = req.params;
    const { deviceId } = req.body;
  
    try {
      const profile = await UserProfile.findOne({ slug });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
  
      if (!profile.ownerDeviceId) {
        profile.ownerDeviceId = deviceId;
        await profile.save();
      }
  
      res.json({ success: true });
    } catch (err) {
      console.error("Claim error:", err.message);
      res.status(500).json({ error: 'Server error' });
    }
  });  

// POST /api/profile/slug/:slug (update profile if device is owner)
router.post('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const { deviceId, ...updateData } = req.body;

  try {
    const profile = await UserProfile.findOne({ slug });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Check ownership
    if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({ error: 'You are not the owner of this profile.' });
    }

    // Validate updateData fields
    const allowedFields = ['name', 'title', 'subtitle', 'email', 'website', 'linkedin', 'instagram', 'twitter'];
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    Object.assign(profile, updateData);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("POST profile error:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;