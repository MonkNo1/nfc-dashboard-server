import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/google-auth.js';
import errorHandler from './middleware/error.js';
import { verifyGoogleToken } from './middleware/auth.js';

// Import routes
import profileRoutes from './routes/profile.js';
import appointmentRoutes from './routes/appointments.js';
import authRoutes from './routes/auth.js';
import slugRoutes from './routes/slug.js';
import v1Routes from './routes/v1/index.js';
import dashboardRoutes from './routes/dashboards.js';

dotenv.config();

// Models
import './models/UserProfile.js';
import './models/Appointment.js';
import './models/Profile.js';
import './models/Dashboard.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers middleware
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS configuration
const allowedOrigins = [
  'https://nfc-dashboard-five.vercel.app',
  process.env.FRONTEND_BASE_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'admin-token'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Debug logs (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log("Using MONGODB_URI:", process.env.MONGODB_URI ? "**configured**" : "**missing**");
  console.log("Using FRONTEND_BASE_URL:", process.env.FRONTEND_BASE_URL || "Not set");
}

// DB connection using correct env variable:
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/v1', v1Routes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/slugs', verifyGoogleToken, slugRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to NFC Dashboard API',
    status: 'running',
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});