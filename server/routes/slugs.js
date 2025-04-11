const express = require('express');
const {
  generateSlug,
  checkSlug,
  deactivateSlug
} = require('../controllers/slugs');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', generateSlug);
router.get('/:slug', checkSlug);

// Admin protected routes
router.delete('/:slug', adminAuth, deactivateSlug);

module.exports = router;