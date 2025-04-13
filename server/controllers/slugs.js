import { nanoid } from 'nanoid';
import Slug from '../models/Slug.js';

// @desc    Generate a new unique slug
// @route   POST /api/slugs
// @access  Public (ideally restricted to admin in production)
export const generateSlug = async (req, res, next) => {
  try {
    // Create a short, unique slug (5 characters)
    const slug = nanoid(5);
    
    // Check if slug already exists (unlikely but possible)
    const existingSlug = await Slug.findOne({ slug });
    
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: 'Slug collision, please try again'
      });
    }
    
    // Create new slug record
    const newSlug = await Slug.create({
      slug,
      profileId: null // Will be linked when profile is created
    });
    
    // Generate the full link
    const baseUrl = req.protocol + '://' + req.get('host');
    const link = `${baseUrl}/p/${slug}`;
    
    res.status(201).json({
      success: true,
      slug,
      link
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if a slug is valid and active
// @route   GET /api/slugs/:slug
// @access  Public
export const checkSlug = async (req, res, next) => {
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
    
    res.status(200).json({
      success: true,
      data: slug
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate a slug
// @route   DELETE /api/slugs/:slug
// @access  Admin
export const deactivateSlug = async (req, res, next) => {
  try {
    const slug = await Slug.findOne({ slug: req.params.slug });
    
    if (!slug) {
      return res.status(404).json({
        success: false,
        message: 'Slug not found'
      });
    }
    
    // Deactivate the slug
    slug.isActive = false;
    await slug.save();
    
    res.status(200).json({
      success: true,
      message: 'Slug deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
}; 