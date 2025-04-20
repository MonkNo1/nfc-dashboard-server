import Profile from '../../models/Profile.js';
import { ErrorResponse } from '../../utils/errorHandler.js';
import asyncHandler from '../../middleware/async.js';

// @desc    Get all profiles
// @route   GET /api/v1/profiles
// @access  Public
export const getProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find().populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
});

// @desc    Get single profile
// @route   GET /api/v1/profiles/:id
// @access  Public
export const getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id).populate('user', 'name email');

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authenticated and is the owner
  let isOwner = false;
  if (req.user && req.user.googleId) {
    isOwner = profile.googleId === req.user.googleId;
  }

  res.status(200).json({
    success: true,
    data: profile,
    isOwner
  });
});

// @desc    Create new profile
// @route   POST /api/v1/profiles
// @access  Private
export const createProfile = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Add Google ID if available
  if (req.user.googleId) {
    req.body.googleId = req.user.googleId;
  }

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
export const updateProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is profile owner by checking Google ID
  if (profile.googleId !== req.user.googleId && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.googleId} is not authorized to update this profile`,
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
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is profile owner by checking Google ID
  if (profile.googleId !== req.user.googleId && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.googleId} is not authorized to delete this profile`,
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
export const claimProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
  }

  // Check if profile is already claimed
  if (profile.isClaimed) {
    return next(new ErrorResponse(`Profile is already claimed by user ${profile.claimedBy}`, 400));
  }

  // Update profile with claimer
  profile.claimedBy = req.user.id;
  profile.claimedAt = Date.now();
  profile.isClaimed = true;
  profile.googleId = req.user.googleId; // Set the Google ID of the claimer
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get user profiles
// @route   GET /api/v1/profiles/user/:userId
// @access  Private
export const getUserProfiles = asyncHandler(async (req, res, next) => {
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
export const getClaimedProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ claimedBy: req.user.id });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
}); 