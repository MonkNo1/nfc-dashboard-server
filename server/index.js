import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Models
import './models/UserProfile.js';
import './models/Appointment.js';

// Routes
import profileRoutes from './routes/profile.js';
import appointmentRoutes from './routes/Appointment.js';
import slugRoutes from './routes/slug.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://nfc-dashboard-five.vercel.app',
        process.env.FRONTEND_BASE_URL
      ].filter(Boolean)
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'admin-token'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Debug log (development only)
if (process.env.NODE_ENV !== 'production') {
  console.log("Using MONGO_URI:", process.env.MONGO_URI ? "**configured**" : "**missing**");
  console.log("Using FRONTEND_BASE_URL:", process.env.FRONTEND_BASE_URL || "Not set");
}

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1); // Exit on DB connection failure
});

// Register routes
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/profiles', slugRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 API is working');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});