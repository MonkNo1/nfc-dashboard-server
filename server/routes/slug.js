// server/routes/slug.js
import express from 'express';
import UserProfile from '../models/UserProfile.js';
import { nanoid } from 'nanoid';

const router = express.Router();

// POST /api/generate-slug
// This endpoint creates a new profile with a custom slug and returns the link.
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Generate a slug based on the name and a random nanoid suffix
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
    const slug = `${slugBase}-${nanoid(5)}`;

    // Create new profile. Initially, ownerDeviceId is empty.
    const newProfile = await UserProfile.create({
      slug,
      username: slug, // You can default username to slug if desired.
      name,
      ownerDeviceId: "", // Will be set on first visit.
    });

    // Construct full URL using FRONTEND_BASE_URL from env variables.
    const fullLink = `${process.env.FRONTEND_BASE_URL}/p/${slug}`;
    res.status(201).json({ link: fullLink, slug });
  } catch (err) {
    console.error("Slug creation error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;