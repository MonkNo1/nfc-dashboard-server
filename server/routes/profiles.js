// @desc    Claim profile by slug
// @route   PATCH /api/profiles/claim/:slug
// @access  Private
router.patch('/claim/:slug', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ slug: req.params.slug });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if profile is already claimed
    if (profile.googleId) {
      return res.status(400).json({
        success: false,
        message: 'Profile is already claimed'
      });
    }

    // Update profile with claimer's Google ID
    profile.googleId = req.user.googleId;
    profile.isClaimed = true;
    profile.claimedBy = req.user.id;
    profile.claimedAt = new Date();
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Claim profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}); 