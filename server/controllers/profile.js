const Profile = require('../models/Profile');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all profiles
// @route   GET /api/v1/profiles
// @access  Public
exports.getProfiles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single profile
// @route   GET /api/v1/profiles/:id
// @access  Public
exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id).populate({
    path: 'user',
    select: 'name email'
  });

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Create new profile
// @route   POST /api/v1/profiles
// @access  Private
exports.createProfile = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existing profile
  const existingProfile = await Profile.findOne({ user: req.user.id });

  if (existingProfile) {
    return next(new ErrorResponse(`User ${req.user.id} already has a profile`, 400));
  }

  const profile = await Profile.create(req.body);

  res.status(201).json({
    success: true,
    data: profile
  });
});

// @desc    Update profile
// @route   PUT /api/v1/profiles/:id
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is profile owner
  if (profile.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this profile`,
        401
      )
    );
  }

  profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Delete profile
// @route   DELETE /api/v1/profiles/:id
// @access  Private
exports.deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is profile owner
  if (profile.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this profile`,
        401
      )
    );
  }

  await profile.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Claim profile
// @route   PUT /api/v1/profiles/:id/claim
// @access  Private
exports.claimProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  if (profile.isClaimed) {
    return next(new ErrorResponse(`Profile is already claimed`, 400));
  }

  profile.isClaimed = true;
  profile.claimedBy = req.user.id;
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get user profiles
// @route   GET /api/v1/profiles/user/:userId
// @access  Private
exports.getUserProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ user: req.params.userId });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
});

// @desc    Get claimed profiles
// @route   GET /api/v1/profiles/claimed
// @access  Private
exports.getClaimedProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ claimedBy: req.user.id });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
}); 