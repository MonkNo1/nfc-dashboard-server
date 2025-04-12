const express = require('express');
const {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  claimProfile,
  getUserProfiles,
  getClaimedProfiles
} = require('../../controllers/v1/profiles');

const router = express.Router();

const { protect, authorize } = require('../../middleware/auth');

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

module.exports = router; 