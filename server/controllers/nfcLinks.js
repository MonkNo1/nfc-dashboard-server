import crypto from 'crypto';
import NfcLink from '../models/NfcLink.js';
import UserProfile from '../models/UserProfile.js';

// Utility to generate a random 16-character slug (8 bytes → 16 hex characters)
const generateRandomSlug = () => crypto.randomBytes(8).toString('hex').toLowerCase();

// @desc    Generate a new NFC link
// @route   POST /api/nfc-links
// @access  Admin only
export const generateNfcLink = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to generate NFC links'
      });
    }

    // Check if user is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can generate NFC links'
      });
    }

    let slug;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Get base URL from environment variable with fallback
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://nfc-dashboard-five.vercel.app';

    // Retry until a unique slug is found
    while (attempts < maxAttempts) {
      slug = generateRandomSlug();
      if (slug.length !== 16) { // Ensure slug length is correct
        console.error("Generated slug has incorrect length.");
        attempts++;
        continue;
      }
      
      // Check if slug already exists
      const existing = await NfcLink.findOne({ slug });
      if (!existing) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.error(`Failed to generate unique slug after ${maxAttempts} attempts.`);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to generate a unique slug. Please try again later.' 
      });
    }

    // Create new NFC link
    const nfcLink = new NfcLink({
      slug,
      createdBy: req.user.email,
      isActive: true
    });

    await nfcLink.save();

    return res.status(201).json({
      success: true,
      data: {
        slug,
        link: `${baseUrl}/p/${slug}`,
        isActive: nfcLink.isActive,
        isAssigned: nfcLink.isAssigned,
        createdAt: nfcLink.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating NFC link:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating NFC link'
    });
  }
};

// @desc    Get all NFC links
// @route   GET /api/nfc-links
// @access  Admin only
export const getNfcLinks = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view NFC links'
      });
    }

    // Check if user is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view NFC links'
      });
    }

    const nfcLinks = await NfcLink.find().sort({ createdAt: -1 });
    
    // Get base URL from environment variable with fallback
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://nfc-dashboard-five.vercel.app';
    
    // Format the response
    const formattedLinks = nfcLinks.map(link => ({
      id: link._id,
      slug: link.slug,
      link: `${baseUrl}/p/${link.slug}`,
      isActive: link.isActive,
      isAssigned: link.isAssigned,
      assignedTo: link.assignedTo,
      assignedAt: link.assignedAt,
      createdAt: link.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedLinks
    });
  } catch (error) {
    console.error('Error fetching NFC links:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching NFC links'
    });
  }
};

// @desc    Assign NFC link to a profile
// @route   PUT /api/nfc-links/:slug/assign
// @access  Admin only
export const assignNfcLink = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to assign NFC links'
      });
    }

    // Check if user is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can assign NFC links'
      });
    }

    const { slug } = req.params;
    const { profileId, assignedTo } = req.body;

    if (!profileId || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID and assigned to are required'
      });
    }

    // Find the NFC link
    const nfcLink = await NfcLink.findOne({ slug });
    if (!nfcLink) {
      return res.status(404).json({
        success: false,
        message: 'NFC link not found'
      });
    }

    // Check if the link is already assigned
    if (nfcLink.isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'This NFC link is already assigned'
      });
    }

    // Check if the profile exists
    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update the NFC link
    nfcLink.profileId = profileId;
    nfcLink.isAssigned = true;
    nfcLink.assignedTo = assignedTo;
    nfcLink.assignedAt = new Date();
    await nfcLink.save();

    // Get base URL from environment variable with fallback
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://nfc-dashboard-five.vercel.app';

    return res.status(200).json({
      success: true,
      data: {
        slug: nfcLink.slug,
        link: `${baseUrl}/p/${nfcLink.slug}`,
        isActive: nfcLink.isActive,
        isAssigned: nfcLink.isAssigned,
        assignedTo: nfcLink.assignedTo,
        assignedAt: nfcLink.assignedAt,
        createdAt: nfcLink.createdAt
      }
    });
  } catch (error) {
    console.error('Error assigning NFC link:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while assigning NFC link'
    });
  }
};

// @desc    Deactivate an NFC link
// @route   PUT /api/nfc-links/:slug/deactivate
// @access  Admin only
export const deactivateNfcLink = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to deactivate NFC links'
      });
    }

    // Check if user is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can deactivate NFC links'
      });
    }

    const { slug } = req.params;

    // Find the NFC link
    const nfcLink = await NfcLink.findOne({ slug });
    if (!nfcLink) {
      return res.status(404).json({
        success: false,
        message: 'NFC link not found'
      });
    }

    // Update the NFC link
    nfcLink.isActive = false;
    await nfcLink.save();

    return res.status(200).json({
      success: true,
      data: {
        slug: nfcLink.slug,
        isActive: nfcLink.isActive,
        isAssigned: nfcLink.isAssigned,
        assignedTo: nfcLink.assignedTo,
        assignedAt: nfcLink.assignedAt,
        createdAt: nfcLink.createdAt
      }
    });
  } catch (error) {
    console.error('Error deactivating NFC link:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deactivating NFC link'
    });
  }
}; 