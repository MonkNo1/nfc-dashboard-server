// routes/slug.js
import express from 'express';
import crypto from 'crypto';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Utility to generate a random 10-character hex slug
const generateRandomSlug = () => crypto.randomBytes(5).toString('hex');

// POST /api/slugs → generate a new unique slug + blank profile
router.post('/', async (req, res) => {
  try {
    let slug;
    let attempts = 0;

    // Retry up to 5 times to find a unique slug
    do {
      slug = generateRandomSlug();
      const exists = await UserProfile.findOne({ slug });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    if (attempts === 5) {
      console.error("Failed to generate unique slug after 5 tries.");
      return res.status(500).json({ error: "Unable to generate a unique slug." });
    }

    // Create blank profile with slug
    const profile = new UserProfile({
      slug,
      username: "",
      ownerDeviceId: "" // Claimed on first visit
    });

    await profile.save();

    return res.status(201).json({
      slug,
      link: `https://nfc-dashboard-five.vercel.app/p/${slug}`
    });

  } catch (error) {
    console.error("Slug generation error:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;