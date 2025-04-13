import express from 'express';
import {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  claimProfile,
  getUserProfiles
} from '../controllers/profile.js';

import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getProfiles)
  .post(protect, createProfile);

router
  .route('/:id')
  .get(getProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteProfile);

router
  .route('/:id/claim')
  .post(protect, claimProfile);

router
  .route('/user/:userId')
  .get(protect, getUserProfiles);

export default router; 