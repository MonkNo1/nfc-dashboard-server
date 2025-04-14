import express from 'express';
import {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  claimProfile,
  getUserProfiles,
  getClaimedProfiles
} from '../../controllers/v1/profiles.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

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
  .put(protect, claimProfile);

router
  .route('/user/:userId')
  .get(protect, getUserProfiles);

router
  .route('/claimed')
  .get(protect, getClaimedProfiles);

export default router; 