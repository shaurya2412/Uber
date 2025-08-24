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
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },

  fare: {
    type: Number,
    required: true
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
  startedAt: {
    type: Date
  },
  completedAt: {
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
  }
}, { timestamps: true }); 
const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride; 
