// server/routes/profile.js
import express from 'express';
import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// GET profile by slug - missing route
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  
  try {
    const profile = await UserProfile.findOne({ slug });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    res.json(profile);
  } catch (err) {
    console.error("GET profile error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profile/slug/:slug/claim (claim profile with device ID)
router.post('/slug/:slug/claim', async (req, res) => {
    const { slug } = req.params;
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required to claim a profile.' });
    }
  
    try {
      const profile = await UserProfile.findOne({ slug });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
  
      // Check if already claimed
      if (profile.ownerDeviceId) {
        if (profile.ownerDeviceId === deviceId) {
          return res.json({ success: true, message: 'You already own this profile' });
        }
        return res.status(403).json({ error: 'This profile is already claimed by another device.' });
      }

      // Claim the profile
      profile.ownerDeviceId = deviceId;
      await profile.save();
  
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

  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required to update the profile.' });
  }

  try {
    const profile = await UserProfile.findOne({ slug });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Check ownership
    if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({ error: 'You are not the owner of this profile.' });
    }

    // If not claimed yet, claim it now
    if (!profile.ownerDeviceId) {
      profile.ownerDeviceId = deviceId;
    }

    // Validate updateData fields
    const allowedFields = ['name', 'title', 'subtitle', 'email', 'website', 'linkedin', 'instagram', 'twitter', 'location', 'upi', 'avatar', 'username'];
    
    // Ensure field values are sanitized
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      } else if (typeof updateData[key] === 'string') {
        updateData[key] = updateData[key].trim();
      }
    });

    // Check if username is being updated
    if (updateData.username !== undefined) {
      // Validate username format
      if (updateData.username && !/^[a-zA-Z0-9_-]+$/.test(updateData.username)) {
        return res.status(400).json({ 
          error: 'Username can only contain alphanumeric characters, dashes, and underscores.' 
        });
      }
      
      // Check if username is already taken
      if (updateData.username) {
        const existingProfile = await UserProfile.findOne({ 
          username: updateData.username, 
          _id: { $ne: profile._id } 
        });
        
        if (existingProfile) {
          return res.status(409).json({ error: 'Username is already taken.' });
        }
      }
    }

    Object.assign(profile, updateData);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("POST profile error:", err.message);
    
    // Return more specific validation errors
    if (err.name === 'ValidationError') {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;