const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require('express-validator');

// Get available rides for captain (pending rides)
module.exports.getAvailableRides = async (req, res, next) => {
    try {
        const rides = await rideModel.find({ 
            status: 'pending' 
        })
        .populate('user', 'fullname email')
        .sort({ createdAt: -1 })
        .limit(20);
  
        res.status(200).json({
            success: true,
            data: rides
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching available rides",
            error: error.message
        });
    }
};

module.exports.acceptRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain._id;

        const activeRide = await rideModel.findOne({
            captain: captainId,
            status: { $in: ['accepted', 'in_progress'] }
        });

        if (activeRide) {
            return res.status(400).json({
                success: false,
                message: "You already have an active ride"
            });
        }

        const ride = await rideModel.findOneAndUpdate(
            { 
                _id: rideId, 
                status: 'pending' 
            },
            {
                captain: captainId,
                status: 'accepted',
                acceptedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or already accepted"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ride accepted successfully",
            data: ride
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error accepting ride",
            error: error.message
        });
    }
};

module.exports.startRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain._id;

        const ride = await rideModel.findOneAndUpdate(
            { 
                _id: rideId, 
                captain: captainId,
                status: 'accepted' 
            },
            {
                status: 'in_progress',
                startedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be started"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ride started successfully",
            data: ride
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error starting ride",
            error: error.message
        });
    }
};

module.exports.completeRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain._id;

        const ride = await rideModel.findOneAndUpdate(
            { 
                _id: rideId, 
                captain: captainId,
                status: 'in_progress' 
            },
            {
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be completed"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ride completed successfully",
            data: ride
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error completing ride",
            error: error.message
        });
    }
};

module.exports.getCurrentRide = async (req, res, next) => {
    try {
        const captainId = req.captain._id;

        const ride = await rideModel.findOne({
            captain: captainId,
            status: { $in: ['accepted', 'in_progress'] }
        }).populate('user', 'fullname email');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "No active ride found"
            });
        }

        res.status(200).json({
            success: true,
            data: ride
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching current ride",
            error: error.message
        });
    }
};

module.exports.getRideHistory = async (req, res, next) => {
    try {
        const captainId = req.captain._id;
        const { page = 1, limit = 10 } = req.query;

        const rides = await rideModel.find({
            captain: captainId,
            status: 'completed'
        })
        .populate('user', 'fullname email')
        .sort({ completedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await rideModel.countDocuments({
            captain: captainId,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            data: rides,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRides: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching ride history",
            error: error.message
        });
    }
};

module.exports.updateRideLocation = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { lat, lng } = req.body;
        const captainId = req.captain._id;

        const ride = await rideModel.findOneAndUpdate(
            { 
                _id: rideId, 
                captain: captainId,
                status: { $in: ['accepted', 'in_progress'] }
            },
            {
                currentLocation: {
                    lat,
                    lng,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Location updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating location",
            error: error.message
        });
    }
};

module.exports.bookRide = async (req, res, next) => {
    try {
        const { pickup, destination, fare } = req.body;
        const userId = req.user._id;

        const ride = await rideModel.create({
            user: userId,
            pickup,
            destination,
            fare,
            status: 'pending'
        });

        const populatedRide = await ride.populate('user', 'fullname email');

        res.status(201).json({
            success: true,
            message: "Ride booked successfully",
            data: populatedRide
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error booking ride",
            error: error.message
        });
    }
};

module.exports.getUserCurrentRide = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const ride = await rideModel.findOne({
            user: userId,
            status: { $in: ['pending', 'accepted', 'in_progress'] }
        }).populate('captain', 'fullname vehicle');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "No active ride found"
            });
        }

        res.status(200).json({
            success: true,
            data: ride
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching current ride",
            error: error.message
        });
    }
};

module.exports.getUserRideHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const rides = await rideModel.find({
            user: userId,
            status: 'completed'
        })
        .populate('captain', 'fullname vehicle')
        .sort({ completedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await rideModel.countDocuments({
            user: userId,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            data: rides,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRides: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching ride history",
            error: error.message
        });
    }
}; 