import express from 'express';
import { protect } from '../../middleware/auth.js';
import Dashboard from '../../models/Dashboard.js';

const router = express.Router();

// Get all dashboards for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ user: req.user.googleId });
    res.json(dashboards);
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

// Get a specific dashboard by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user.googleId
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Create a new dashboard
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Dashboard name is required' });
    }
    
    const dashboard = new Dashboard({
      name,
      description,
      user: req.user.googleId
    });
    
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

// Update a dashboard
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user.googleId
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    if (name) dashboard.name = name;
    if (description !== undefined) dashboard.description = description;
    
    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

// Delete a dashboard
router.delete('/:id', protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user.googleId
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    await dashboard.remove();
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

export default router; 