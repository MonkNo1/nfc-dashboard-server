const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const dashboardRoutes = require('./dashboards');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/dashboards', dashboardRoutes);

module.exports = router; 