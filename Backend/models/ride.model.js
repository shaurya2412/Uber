const mongoose = require('mongoose'); // Import Mongoose

const rideSchema = new mongoose.Schema({
  // Essential References
  // 'user' refers to the Rider who requested the ride
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model (your usermodel.js)
    required: true
  },
  // 'captain' refers to the Driver who accepted the ride
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Captain' // References the 'Captain' model (your captain.model.js)
    // Not required here, as a ride starts as 'pending' without a captain
  },

  // Ride Details: Pickup Location
  pickup: {
    address: {
      type: String,
      required: true
    },
    // Coordinates for precise location (latitude, longitude)
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  // Ride Details: Destination Location
  destination: {
    address: {
      type: String,
      required: true
    },
    // Coordinates for precise location (latitude, longitude)
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  // Status of the Ride
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending', // Default status when a ride is first requested
    required: true
  },

  // Financial Information
  fare: {
    type: Number,
    required: true // The calculated cost of the ride
  },
  distance: {
    type: Number // Distance of the ride, e.g., in kilometers or miles
  },

  // Timestamps for tracking ride lifecycle
  createdAt: {
    type: Date,
    default: Date.now // Timestamp when the ride request was created
  },
  acceptedAt: {
    type: Date // Timestamp when a captain accepted the ride
  },
  startedAt: {
    type: Date // Timestamp when the ride officially started (rider picked up)
  },
  completedAt: {
    type: Date // Timestamp when the ride officially ended (rider dropped off)
  },

  // Ratings (to be integrated into logic later, but present in model)
  riderRating: {
    type: Number,
    min: 1,
    max: 5 // Rating given by the captain to the rider (e.g., 1 to 5 stars)
  },
  captainRating: {
    type: Number,
    min: 1,
    max: 5 // Rating given by the rider to the captain (e.g., 1 to 5 stars)
  }
}, { timestamps: true }); // Mongoose option to automatically add `createdAt` and `updatedAt` fields

// Create the Mongoose model from the schema
const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride; // Export the model for use in other parts of the application
