// Ensure proper DNS resolution (sometimes helps on Windows)
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import UserProfile from './models/UserProfile.js';
import Appointment from './models/Appointment.js';

// Load environment variables from the .env file
dotenv.config();

// Debug: Log the environment variables to ensure .env is loaded
console.log("Using MONGO_URI:", process.env.MONGO_URI);
// Uncomment the following line if you want to see all loaded env variables:
// console.log("All env vars:", process.env);

const app = express();
app.use(cors());
app.use(express.json());

import profileRoutes from './routes/profile.js';
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;

console.log("Connecting to MongoDB:", process.env.MONGO_URI);

// Connect to MongoDB using the SRV URI from your .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Fail fast if MongoDB is unreachable
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err.message));

/* 
  Define the Appointment Schema and Model BEFORE using it in endpoints.
  Use the imported 'mongoose' instead of re-importing.
*/

app.post("/api/profiles", async (req, res) => {
  try {
    const { username, deviceId, ...rest } = req.body;
    let profile = await UserProfile.findOne({ username });

    if (!profile) {
      // First time – assign ownerDeviceId
      profile = await UserProfile.create({
        username,
        ownerDeviceId: deviceId,
        ...rest,
      });
    } else {
      // Check if device is the owner
      if (profile.ownerDeviceId && profile.ownerDeviceId !== deviceId) {
        return res.status(403).json({ error: "You are not the owner of this profile." });
      }

      // Update allowed
      profile.set({ ...rest });
      await profile.save();
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Profile save error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// API route: Get user profile by username
app.get('/u/:username', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).send("User not found");
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API route: Create a new appointment
app.post('/api/appointments', async (req, res) => {
  console.log("🔥 POST /api/appointments hit");
  try {
    const { username, name, email, date, time } = req.body;

    if (!username || !name || !email || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const appt = new Appointment({ username, name, email, date, time });
    await appt.save();

    res.status(201).json({ message: "Appointment saved", appointment: appt });
  } catch (err) {
    console.error("❌ Error saving appointment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Root route for quick testing
app.get('/', (req, res) => {
  res.send('API is working');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
