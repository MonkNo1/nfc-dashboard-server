const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // For handling large image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Use morgan logger only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        // Add your frontend URL when deployed
        'https://nfc-dashboard.onrender.com', 
        'https://nfc-dashboard-frontend.onrender.com',
        'https://nfc-dashboard-five.vercel.app',
        // Keep localhost for development
        'http://localhost:3000'
      ] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'admin-token'],
  credentials: true
};

app.use(cors(corsOptions));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Define API Routes
app.use('/api/profile', require('./routes/profile'));
app.use('/api/slugs', require('./routes/slugs'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/auth', require('./routes/auth'));

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to NFC Dashboard API',
    status: 'running',
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 