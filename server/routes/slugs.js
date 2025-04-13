import express from 'express';
import {
  generateSlug,
  checkSlug,
  deactivateSlug
} from '../controllers/slugs.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', generateSlug);
router.get('/:slug', checkSlug);

// Admin protected routes
router.delete('/:slug', adminAuth, deactivateSlug);

export default router;