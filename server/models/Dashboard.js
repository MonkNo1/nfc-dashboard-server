import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'dark', 'light', 'custom']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'UserProfile',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  widgets: [{
    type: {
      type: String,
      required: true,
      enum: ['profile', 'contact', 'social', 'calendar', 'custom']
    },
    title: String,
    content: mongoose.Schema.Types.Mixed,
    position: {
      x: Number,
      y: Number
    },
    size: {
      width: Number,
      height: Number
    }
  }],
  layout: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
DashboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Dashboard', DashboardSchema); 