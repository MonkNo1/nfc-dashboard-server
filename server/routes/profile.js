// server/routes/profile.js
import express from 'express';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// GET /api/profiles/:username
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const profile = await UserProfile.findOne({ username });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profiles
router.post('/', async (req, res) => {
  try {
    const { username, deviceId, ...rest } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    let profile = await UserProfile.findOne({ username });

    if (!profile) {
      // First-time creation: assign ownership to the current device.
      profile = await UserProfile.create({
        username,
        ownerDeviceId: deviceId,
        ...rest,
      });
    } else {
      // Only allow updates from the original owner device.
      if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({ error: 'You are not the owner of this profile.' });
      }

      profile.set({ ...rest });
      await profile.save();
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("POST profile error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;