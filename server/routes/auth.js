// nfc-dashboard-server/server/routes/auth.js
const express = require('express');
const router = express.Router();

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

module.exports = router;