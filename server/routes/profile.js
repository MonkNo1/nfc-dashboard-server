const express = require('express');
const {
  createProfile,
  getProfile,
  getProfileBySlug,
  updateProfileBySlug,
  claimProfileBySlug
} = require('../controllers/profile');

const router = express.Router();

// Public routes
router.post('/', createProfile);
router.get('/:username', getProfile);
router.get('/slug/:slug', getProfileBySlug);
router.post('/slug/:slug', updateProfileBySlug);
router.post('/slug/:slug/claim', claimProfileBySlug);

module.exports = router; 