import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  name: string;
  email: string;
  date: string;
  time: string;
  username: string;
  profileName?: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  username: {
    type: String, 
    required: [true, 'Username is required']
  },
  profileName: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema); 