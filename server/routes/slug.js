// routes/slug.js
import express from 'express';
import crypto from 'crypto';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Generate a random 16-character slug (8 bytes → 16 hex characters)
const generateRandomSlug = () => crypto.randomBytes(8).toString('hex').toLowerCase();

router.post('/', async (req, res) => {
  try {
    let slug;
    let attempts = 0;
    const maxAttempts = 10;

    // Retry until a unique slug is found
    while (attempts < maxAttempts) {
      slug = generateRandomSlug();
      const existing = await UserProfile.findOne({ slug });
      if (!existing) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate a unique slug. Please try again later.' });
    }

    // Create new profile with only the slug set
    const profile = new UserProfile({
      slug,
      username: "", // default empty
      ownerDeviceId: "" // will be claimed on first access
    });

    await profile.save();

    // Optionally use an environment variable for the base URL
    const baseUrl = process.env.BASE_URL || 'https://nfc-dashboard-five.vercel.app';

    return res.status(201).json({
      slug,
      link: `${baseUrl}/p/${slug}`
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Slug already exists. Please try again.' });
    }
    console.error("Slug generation error:", error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;