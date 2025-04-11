const Profile = require('../models/Profile');
const Slug = require('../models/Slug');

// @desc    Create or update a profile
// @route   POST /api/profile
// @access  Public
exports.createProfile = async (req, res, next) => {
  try {
    const { username, deviceId, ...profileData } = req.body;

    if (!username || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Username and deviceId are required'
      });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ username });

    if (profile) {
      // Only allow updates if deviceId matches
      if (profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this profile'
        });
      }

      // Update profile
      profile = await Profile.findOneAndUpdate(
        { username },
        { ...profileData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await Profile.create({
        username,
        ownerDeviceId: deviceId,
        ...profileData
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get profile by username
// @route   GET /api/profile/:username
// @access  Public
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get profile by slug
// @route   GET /api/profile/slug/:slug
// @access  Public
exports.getProfileBySlug = async (req, res, next) => {
  try {
    const slug = await Slug.findOne({ 
      slug: req.params.slug,
      isActive: true
    });

    if (!slug) {
      return res.status(404).json({
        success: false,
        message: 'Slug not found or inactive'
      });
    }

    let profile;
    
    if (slug.profileId) {
      // If slug is already linked to a profile
      profile = await Profile.findById(slug.profileId);
    } else {
      // Create a new profile with this slug
      profile = await Profile.create({
        username: `user_${Date.now()}`,
        name: 'New User',
        slug: req.params.slug,
        ownerDeviceId: ''  // Empty initially, will be claimed
      });
      
      // Link the slug to the new profile
      slug.profileId = profile._id;
      await slug.save();
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile by slug
// @route   POST /api/profile/slug/:slug
// @access  Public (with device ownership check)
exports.updateProfileBySlug = async (req, res, next) => {
  try {
    const { deviceId, ...profileData } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }
    
    // Find the profile by slug
    let profile = await Profile.findOne({ slug: req.params.slug });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Check ownership
    if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    // Update profile
    profile = await Profile.findOneAndUpdate(
      { slug: req.params.slug },
      profileData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// @desc    Claim ownership of a profile by slug
// @route   POST /api/profile/slug/:slug/claim
// @access  Public
exports.claimProfileBySlug = async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }
    
    // Find the profile by slug
    let profile = await Profile.findOne({ slug: req.params.slug });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Check if already owned
    if (profile.ownerDeviceId && profile.ownerDeviceId !== '') {
      // Already claimed, only update if current device is the owner
      if (profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({
          success: false,
          message: 'This profile has already been claimed'
        });
      }
    } else {
      // Set ownership
      profile = await Profile.findOneAndUpdate(
        { slug: req.params.slug },
        { ownerDeviceId: deviceId },
        { new: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile claimed successfully',
      data: profile
    });
  } catch (err) {
    next(err);
  }
}; 