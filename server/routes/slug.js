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
      let tries = 0;
      do {
        slug = generateRandomSlug();
        const existing = await UserProfile.findOne({ slug });
        if (!existing) break;
        tries++;
      } while (tries < 5);
  
      if (tries === 5) {
        return res.status(500).json({ error: "Failed to generate unique slug after 5 attempts" });
      }
  
      const profile = new UserProfile({ slug, ownerDeviceId: "", username: "" });
      await profile.save();
      return res.status(201).json({
        slug,
        link: `https://nfc-dashboard-five.vercel.app/p/${slug}`
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: "Slug already exists." });
      }
      console.error("Slug generation error:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  });  

export default router;