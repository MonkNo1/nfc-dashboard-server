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
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: (value) => value >= new Date(),
      message: 'Appointment date must be in the future.'
    }
  },
  time: { 
    type: String, 
    required: true,
    match: [/^\d{2}:\d{2}$/, 'Time must be in HH:mm format.']
  },
  status: { type: String, default: 'pending' }, // "pending" or "confirmed"
  ownerResponse: { type: String, default: '' }  // Optional: approval note/message
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
