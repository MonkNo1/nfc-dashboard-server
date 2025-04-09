// models/Appointment.js

import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Profile owner receiving request
  name: { type: String, required: true },     // Person requesting appointment
  email: { 
    type: String, 
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address.']
  },
  date: { type: Date, required: true },       // Changed to Date type
  time: { type: String, required: true },
  status: { type: String, default: 'pending' }, // "pending" or "confirmed"
  ownerResponse: { type: String, default: '' }  // Optional: approval note/message
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
