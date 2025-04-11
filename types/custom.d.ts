import { IUserProfile } from '../server/models/UserProfile.js';
import { IAppointment } from '../server/models/Appointment.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserProfile;
      deviceId?: string;
    }
  }
}

// Custom error interface
export interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Profile response interface
export interface ProfileResponse {
  profile: IUserProfile;
  isOwner: boolean;
}

// Appointment response interface
export interface AppointmentResponse {
  appointment: IAppointment;
  profile?: IUserProfile;
}

// Slug response interface
export interface SlugResponse {
  slug: string;
  link: string;
} 