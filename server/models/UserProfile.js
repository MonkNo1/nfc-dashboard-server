import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
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
  
  // 🔐 Ownership enforcement
  ownerDeviceId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("UserProfile", UserProfileSchema);