import express from 'express';
import UserProfile from '../models/UserProfile.js';
import crypto from 'crypto';

const router = express.Router();

// Utility to generate a random 6-10 character slug
const generateRandomSlug = () => {
  return crypto.randomBytes(6).toString('hex'); // 12-char slug
};

// POST /api/slugs -> returns a unique slug + profile link
router.post('/', async (req, res) => {
  let slug;
  let tries = 0;

  // Retry if slug already exists
  do {
    slug = generateRandomSlug();
    const exists = await UserProfile.findOne({ slug });
    if (!exists) break;
    tries++;
  } while (tries < 5);

  if (tries === 5) return res.status(500).json({ error: 'Failed to generate a unique slug' });

  // Create a new empty profile with slug only
  const profile = new UserProfile({ slug });
  await profile.save();

  return res.json({
    slug,
    link: `https://nfc-dashboard-five.vercel.app/p/${slug}`
  });
});

export default router;