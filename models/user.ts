// models/User.ts
import { model, Schema, models } from 'mongoose';

const userSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  username: { 
    type: String, 
    unique: true 
  },
  isBot: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: Number,
    unique: true,
    default: 0
  },
  profile_url: {
    type: String,
  },
  balance: { 
    type: Number, 
    default: 0.5 
  },
  referrals: { 
    type: Number, 
    default: 0 
  },
  referredUsers: {
    type: [Number],
    default: []
  },
  referredBy: { 
    type: Number, 
    default: null 
  }, 
  startedTasks: [{
    taskId: String,
    startedAt: Date
  }],
  verifiedTasks: [String],
  claimedTasks: [String],
  taskCompleted: { 
    type: Number, 
    default: 0 
  },
  completedTasks: [{ 
    type: String 
  }],
  refCode: {
    type: String,
    unique: true
  },
  adsWatchedToday: { 
    type: Number, 
    default: 0 
  },
  // lastRewardAt: { type: Date, default: null },
  lastAdWatchedAt: { 
    type: Date, 
    default: null 
  },
  lastClaimedAt: { 
    type: Date, 
    default: null 
  },
  starsPaidToday: {
    type: Number,
    default: 0
  },
  lastStarsPaidAt: {
    type: Date,
    default: null
  },
  lastClaimedAtStars: {
    type: Date,
    default: null
  },

  // latestPayment: {
  //   date: Date,
  //   amount: Number,
  //   currency: String,
  //   payload: String,
  //   telegramChargeId: String,
  //   providerChargeId: String
  // }
});

export const User = models.User || model('User', userSchema);
