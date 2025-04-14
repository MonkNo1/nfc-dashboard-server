import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateNfcLink,
  getNfcLinks,
  assignNfcLink,
  deactivateNfcLink
} from '../controllers/nfcLinks.js';

const router = express.Router();

// Generate a new NFC link
router.post('/', protect, generateNfcLink);

// Get all NFC links
router.get('/', protect, getNfcLinks);

// Assign NFC link to a profile
router.put('/:slug/assign', protect, assignNfcLink);

// Deactivate an NFC link
router.put('/:slug/deactivate', protect, deactivateNfcLink);

export default router; 