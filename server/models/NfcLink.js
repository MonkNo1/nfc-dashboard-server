import mongoose from 'mongoose';

const NfcLinkSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    minlength: 16,
    maxlength: 16
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    default: null
  },
  createdBy: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: String,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
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

// Update the updatedAt field on save
NfcLinkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('NfcLink', NfcLinkSchema); 