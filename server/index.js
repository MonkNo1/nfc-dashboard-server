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

  // Routes (import AFTER app is defined)
  import profileRoutes from './routes/profile.js';
  import appointmentRoutes from './routes/Appointment.js';
  import slugRoutes from './routes/slug.js'; // <-- include this now

  const app = express(); // ✅ Initialize here first
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Debug log
  console.log("Using MONGO_URI:", process.env.MONGO_URI);

  // DB connection
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

  // ✅ Register routes AFTER app is defined
  app.use('/api/profile', profileRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/slugs', slugRoutes); // ✅ Slug endpoint

  // Health check
  app.get('/', (req, res) => {
    res.send('🚀 API is working');
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });