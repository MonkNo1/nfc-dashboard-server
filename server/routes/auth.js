// nfc-dashboard-server/server/routes/auth.js
import express from 'express';
import passport from 'passport';
import UserProfile from '../models/UserProfile.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/admin
 * @desc    Admin login
 * @access  Public
 */
router.post('/admin', (req, res) => {
  try {
    const { password } = req.body;
    
    // Log attempt details without exposing the actual password
    console.log(`Admin login attempt - Password provided: ${password ? 'Yes' : 'No'}`);
    console.log(`Expected password from env: ${process.env.ADMIN_PASSWORD ? 'Configured' : 'Missing'}`);

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a password' 
      });
    }

    // Strict equality check
    if (password === process.env.ADMIN_PASSWORD) {
      console.log('Admin login successful');
      return res.status(200).json({ 
        success: true, 
        token: process.env.ADMIN_TOKEN 
      });
    }

    console.log('Admin login failed - Invalid password');
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify admin token
 * @access  Public
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers['admin-token'];
    
    if (token === process.env.ADMIN_TOKEN) {
      return res.status(200).json({ 
        success: true, 
        isValid: true 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      isValid: false 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    successRedirect: '/dashboard'
  })
);

// Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check if user can edit profile
router.get('/can-edit/:profileId', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ canEdit: false });
    }

    const profile = await UserProfile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // User can edit if they are the owner (Google ID match)
    const canEdit = profile.googleId === req.user.googleId;
    res.json({ canEdit });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Google token verification endpoint
router.post('/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    }).catch(error => {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    });
    
    const payload = ticket.getPayload();
    
    // Check if user exists in our database
    let userProfile = await UserProfile.findOne({ googleId: payload.sub });
    
    // If user doesn't exist, create a new one
    if (!userProfile) {
      userProfile = await UserProfile.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isOwner: false // Default to not owner until claimed
      });
    }
    
    res.json({
      success: true,
      user: {
        id: userProfile._id,
        googleId: userProfile.googleId,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        isOwner: userProfile.isOwner
      }
    });
  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: error.message || 'Invalid token'
    });
  }
});

export default router;