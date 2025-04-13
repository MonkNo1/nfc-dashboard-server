import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please use a valid URL'
    ]
  },
  social: {
    twitter: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please use a valid URL'
      ]
    },
    facebook: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please use a valid URL'
      ]
    },
    linkedin: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please use a valid URL'
      ]
    },
    instagram: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please use a valid URL'
      ]
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  claimedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one profile
ProfileSchema.index({ user: 1 }, { unique: true });

export default mongoose.model('Profile', ProfileSchema); 