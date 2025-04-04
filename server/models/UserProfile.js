import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: String,
  title: String,
  company: String,
  phone: String,
  email: String,
  website: String,
  linkedin: String,
  instagram: String,
  x: String,
  profileImage: String
}, { timestamps: true });

export default mongoose.model("UserProfile", UserProfileSchema);
