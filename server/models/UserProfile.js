import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true  // Allows it to be optional and non-conflicting
  },

  name: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  avatar: { type: String, default: "" },

  email: {
    type: String,
    default: "",
    match: [/.+@.+\..+/, "Please enter a valid email address."]
  },

  instagram: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  twitter: { type: String, default: "" },
  website: { type: String, default: "" },
  location: { type: String, default: "" },
  upi: { type: String, default: "" },

  ownerDeviceId: {
    type: String,
    default: null  // This will be set on first tap
  }
}, {
  timestamps: true
});

export default mongoose.model('UserProfile', UserProfileSchema);