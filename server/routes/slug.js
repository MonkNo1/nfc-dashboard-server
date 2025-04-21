// routes/slug.js
import express from 'express';
import crypto from 'crypto';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Utility to generate a random 16-character slug (8 bytes → 16 hex characters)
const generateRandomSlug = () => crypto.randomBytes(8).toString('hex').toLowerCase();

// Create a new profile with unique slug
router.post('/', async (req, res) => {
  try {
    let slug = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    // Get base URL from environment variable with fallback
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://nfc-dashboard-five.vercel.app';

    // Retry until a unique slug is found
    while (attempts < maxAttempts) {
      slug = generateRandomSlug();
      if (slug.length !== 16) { // Ensure slug length is correct
        console.error("Generated slug has incorrect length.");
        attempts++;
        continue;
      }
      
      // Check if slug already exists
      const existing = await UserProfile.findOne({ slug });
      if (!existing) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.error(`Failed to generate unique slug after ${maxAttempts} attempts.`);
      return res.status(500).json({ error: 'Failed to generate a unique slug. Please try again later.' });
    }

    // Create new profile with the authenticated user's email
    const profile = new UserProfile({
      slug,
      email: req.user?.email || '', // Use the authenticated user's email
      isOwner: true, // Set ownership to true since this is a new profile
      username: null, // default empty
      ownerDeviceId: null // will be claimed on first access
    });

    try {
      await profile.save();
    } catch (error) {
      if (error.code === 11000) {
        console.warn(`Slug collision at save time: ${slug}`);
        return res.status(409).json({ error: 'Slug already exists. Please try again.' });
      }
      console.error("Error saving slug profile:", error.message || 'Unknown error');
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.status(201).json({
      slug,
      link: `${baseUrl}/p/${slug}`
    });
  } catch (error) {
    console.error("Slug generation error:", error.message || 'Unknown error');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Validate slug format
    if (!slug || slug.length !== 16 || !/^[0-9a-f]{16}$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    
    const profile = await UserProfile.findOne({ slug });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // If user is authenticated, check if they are the owner
    if (req.user && req.user.email === profile.email) {
      profile.isOwner = true;
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error.message || 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;