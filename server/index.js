// index.js

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import slugRoutes from './routes/slug.js';
app.use('/api/slugs', slugRoutes);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import UserProfile from './models/UserProfile.js';
import Appointment from './models/Appointment.js';
import profileRoutes from './routes/profile.js';
import appointmentRoutes from './routes/Appointment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log("Using MONGO_URI:", process.env.MONGO_URI);
console.log("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err.message));

// Mount API routes
app.use('/api/profiles', profileRoutes);
app.use('/api/appointments', appointmentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is working');
});

// Corrected template literal using backticks
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});