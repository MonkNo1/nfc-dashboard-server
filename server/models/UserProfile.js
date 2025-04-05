import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  title: String,
  subtitle: String,
  avatar: String,
  email: String,
  instagram: String,
  linkedin: String,
  twitter: String,
  website: String,
  location: String,
  upi: String,
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
export default UserProfile;