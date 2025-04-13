import express from 'express';
import Dashboard from '../models/Dashboard.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

// Get all dashboards for the authenticated user
router.get('/', verifyGoogleToken, async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ user: req.user._id });
    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single dashboard by ID
router.get('/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Check if dashboard is public or belongs to the authenticated user
    if (!dashboard.isPublic && (!req.user || dashboard.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to access this dashboard' });
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new dashboard
router.post('/', verifyGoogleToken, async (req, res) => {
  try {
    const { name, description, theme } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Create new dashboard
    const dashboard = new Dashboard({
      name,
      description: description || '',
      theme: theme || 'default',
      user: req.user._id
    });
    
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a dashboard
router.put('/:id', verifyGoogleToken, async (req, res) => {
  try {
    const { name, description, theme } = req.body;
    
    // Find the dashboard
    const dashboard = await Dashboard.findById(req.params.id);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Check if user owns the dashboard
    if (dashboard.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this dashboard' });
    }
    
    // Update fields
    if (name) dashboard.name = name;
    if (description !== undefined) dashboard.description = description;
    if (theme) dashboard.theme = theme;
    
    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a dashboard
router.delete('/:id', verifyGoogleToken, async (req, res) => {
  try {
    // Find the dashboard
    const dashboard = await Dashboard.findById(req.params.id);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Check if user owns the dashboard
    if (dashboard.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this dashboard' });
    }
    
    await dashboard.remove();
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 