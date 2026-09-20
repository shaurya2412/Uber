const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Captain'
  },

  pickup: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  destination: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  status: {
    type: String,
    enum: ['requested', 'pending', 'accepted', 'driver_en_route', 'arrived', 'in_ride', 'in_progress', 'completed', 'cancelled'],
    default: 'requested',
    required: true
  },

  fare: {
    type: Number,
    required: true
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0
  },
  distance: {
    type: Number 
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date 
  },
  driverEnRouteAt: {
    type: Date
  },
  arrivedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date 
  },
  cancelledAt: {
    type: Date 
  },
  riderRating: {
    type: Number,
    min: 1,
    max: 5
  },
  captainRating: {
    type: Number,
    min: 1,
    max: 5 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'solana', 'cash', 'none'],
    default: 'none'
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'refunded', 'failed'],
    default: 'none'
  },
  refundId: {
    type: String
  },
  paidAt: {
    type: Date
  },
  startOtp: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpBlockedUntil: {
    type: Date,
    default: null
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  }
}, { timestamps: true }); 
const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride; 
