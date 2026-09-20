const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require('express-validator');

const redisClient = require("../db/redis");
const { getIo, emitRideStatus } = require("../services/socket.service");
const { findNearestCaptains } = require("../services/captain.service");
const { scheduleRideTimeout, cancelRideTimeout } = require("../services/rideTimeout.service");
const { processRideRefund } = require("../services/refund.service");
const { calculateSurgeMultiplier } = require("../services/surge.service");

module.exports.getAvailableRides = async (req, res, next) => {
    try {
        const cachedRides = await redisClient.get("available_rides");
        if (cachedRides) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedRides)
            });
        }

        const rides = await rideModel.find({ 
            status: { $in: ['pending', 'requested'] }
        })
        .populate('user', 'fullname email')
        .sort({ createdAt: -1 })
        .limit(20);
  
        await redisClient.set("available_rides", JSON.stringify(rides), {
            EX: 15 // Cache for 15 seconds to avoid stale data while improving performance
        });

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
            status: { $in: ['accepted', 'driver_en_route', 'arrived', 'in_ride', 'in_progress'] }
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
                status: { $in: ['pending', 'requested'] }
            },
            {
                captain: captainId,
                status: 'accepted',
                acceptedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email').populate('captain', 'fullname vehicle');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or already accepted"
            });
        }

        // Cancel 60-second auto-cancel background job
        cancelRideTimeout(rideId);

        await redisClient.del("available_rides");
        emitRideStatus(rideId, "ride:accepted", ride);
        emitRideStatus(rideId, "ride:status_changed", ride);

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

module.exports.setDriverEnRoute = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain._id;

        const ride = await rideModel.findOneAndUpdate(
            { _id: rideId, captain: captainId, status: 'accepted' },
            { status: 'driver_en_route', driverEnRouteAt: new Date() },
            { new: true }
        ).populate('user', 'fullname email').populate('captain', 'fullname vehicle');

        if (!ride) {
            return res.status(404).json({ success: false, message: "Ride not found or invalid transition" });
        }

        emitRideStatus(rideId, "ride:status_changed", ride);
        emitRideStatus(rideId, "ride:updated", ride);

        res.status(200).json({ success: true, message: "Driver is en route to pickup", data: ride });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status", error: error.message });
    }
};

module.exports.setDriverArrived = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain._id;

        const ride = await rideModel.findOneAndUpdate(
            { _id: rideId, captain: captainId, status: { $in: ['accepted', 'driver_en_route'] } },
            { status: 'arrived', arrivedAt: new Date() },
            { new: true }
        ).populate('user', 'fullname email').populate('captain', 'fullname vehicle');

        if (!ride) {
            return res.status(404).json({ success: false, message: "Ride not found or invalid transition" });
        }

        emitRideStatus(rideId, "ride:status_changed", ride);
        emitRideStatus(rideId, "ride:updated", ride);

        res.status(200).json({ success: true, message: "Driver has arrived at pickup location", data: ride });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status", error: error.message });
    }
};

module.exports.startRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { otp } = req.body;  // driver enters this OTP
        const captainId = req.captain._id;

        // 1️⃣ Find ride first
        const ride = await rideModel.findOne({
            _id: rideId,
            captain: captainId,
            status: { $in: ["accepted", "driver_en_route", "arrived"] }
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be started",
            });
        }

        // Check if OTP verification is currently locked due to 3 failed attempts
        if (ride.otpBlockedUntil && new Date(ride.otpBlockedUntil) > new Date()) {
            const remainingMins = Math.ceil((new Date(ride.otpBlockedUntil) - new Date()) / 60000);
            return res.status(429).json({
                success: false,
                message: `Too many failed attempts. Verification locked for ${remainingMins} more minute(s).`
            });
        }

        // 2️⃣ OTP validation
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required",
            });
        }

        // 3️⃣ OTP match?
        const storedOtp = String(ride.startOtp || '').trim();
        const enteredOtp = String(otp || '').trim();
        
        if (!ride.startOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this ride. Please contact support.",
            });
        }

        if (storedOtp !== enteredOtp) {
            ride.otpAttempts = (ride.otpAttempts || 0) + 1;
            if (ride.otpAttempts >= 3) {
                ride.otpBlockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lock
                await ride.save();
                return res.status(429).json({
                    success: false,
                    message: "Maximum OTP attempts exceeded (3). Locked for 10 minutes.",
                    blockedUntil: ride.otpBlockedUntil
                });
            }
            await ride.save();
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - ride.otpAttempts} attempt(s) remaining before lockout.`
            });
        }

        // 4️⃣ OTP expired?
        if (ride.otpExpiresAt && new Date(ride.otpExpiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new ride.",
            });
        }

        // 5️⃣ Mark ride started
        ride.otpAttempts = 0;
        ride.otpBlockedUntil = null;
        ride.status = "in_ride";
        ride.startedAt = new Date();
        await ride.save();

        const populatedRide = await rideModel.findById(rideId).populate('user', 'fullname email').populate('captain', 'fullname vehicle');
        emitRideStatus(rideId, "ride:status_changed", populatedRide);
        emitRideStatus(rideId, "ride:updated", populatedRide);

        res.status(200).json({
            success: true,
            message: "Ride started successfully",
            data: populatedRide,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error starting ride",
            error: error.message,
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
                status: { $in: ['in_progress', 'in_ride'] } 
            },
            {
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email').populate('captain', 'fullname vehicle');

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be completed"
            });
        }

        emitRideStatus(rideId, "ride:status_changed", ride);
        emitRideStatus(rideId, "ride:updated", ride);

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

module.exports.usercompleteRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { otp } = req.body;  // User enters this OTP
        const userId = req.user._id;

        // 1️⃣ Find ride first
        const ride = await rideModel.findOne({
            _id: rideId,
            user: userId,
            status: { $in: ['in_progress', 'in_ride'] }
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be completed"
            });
        }

        // 2️⃣ OTP validation
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required to complete the ride"
            });
        }

        // 3️⃣ OTP match?
        const storedOtp = String(ride.startOtp || '').trim();
        const enteredOtp = String(otp || '').trim();
        
        if (!ride.startOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this ride. Please contact support."
            });
        }

        if (storedOtp !== enteredOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please enter the correct OTP."
            });
        }

        // 4️⃣ OTP expired?
        if (ride.otpExpiresAt && new Date(ride.otpExpiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please contact support."
            });
        }

        // 5️⃣ Mark ride completed
        const updatedRide = await rideModel.findByIdAndUpdate(
            rideId,
            {
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        ).populate('user', 'fullname email').populate('captain', 'fullname vehicle');

        emitRideStatus(rideId, "ride:status_changed", updatedRide);
        emitRideStatus(rideId, "ride:updated", updatedRide);

        res.status(200).json({
            success: true,
            message: "Ride completed successfully",
            data: updatedRide
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

const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports.bookRide = async (req, res, next) => {
    try {
        const { pickup, destination, fare, surgeMultiplier } = req.body;
        const userId = req.user._id;

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        // Calculate dynamic surge multiplier if not provided in body
        const computedSurge = surgeMultiplier || await calculateSurgeMultiplier({
            lat: pickup.coordinates.lat,
            lng: pickup.coordinates.lng
        });

        const finalFare = fare ? Number(fare) : 50;

        const ride = await rideModel.create({
            user: userId,
            pickup,
            destination,
            fare: finalFare,
            surgeMultiplier: computedSurge,
            status: "requested",
            startOtp: otp,
            otpExpiresAt: otpExpiry
        });

        console.log(`✅ Ride ${ride._id} created with OTP: "${otp}" and surge: ${computedSurge}x`);

        const populatedRide = await ride.populate("user", "fullname email");
        await redisClient.del("available_rides");

        // 1. Geospatial Nearest Driver Matching: find captains within 5000 meters using $nearSphere
        const nearbyCaptains = await findNearestCaptains({
            lng: pickup.coordinates.lng,
            lat: pickup.coordinates.lat,
            maxDistanceMeters: 5000
        });

        console.log(`📍 Found ${nearbyCaptains.length} nearby captain(s) within 5km.`);

        // Notify nearby captains in their personal socket rooms
        if (nearbyCaptains.length > 0) {
            nearbyCaptains.forEach(captain => {
                getIo().to(captain._id.toString()).emit("ride:created", populatedRide);
            });
        } else {
            // If no immediate drivers found via $nearSphere, emit to available captains
            getIo().emit("ride:created", populatedRide);
        }

        // Notify rider in personal room and ride room
        getIo().to(userId.toString()).emit("ride:created", populatedRide);

        // 2. Schedule Auto-Cancel background timer (60 seconds)
        scheduleRideTimeout(ride._id, 60000);

        res.status(201).json({
            success: true,
            message: "Ride booked successfully",
            data: populatedRide,
            surgeMultiplier: computedSurge,
            otp: otp // send to rider only
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

// Stream a PDF receipt for a given ride
module.exports.getRideReceiptPdf = async (req, res, next) => {
    try {
        const PDFDocument = require('pdfkit');
        const rideId = req.params.rideId;

        const ride = await rideModel.findOne({ _id: rideId, user: req.user._id })
            .populate('captain', 'fullname vehicleNumber rating')
            .lean();

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${rideId}.pdf`);

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);

        // Header
        doc
          .fontSize(20)
          .text('Ride Receipt', { align: 'left' })
          .moveDown(0.5);

        doc
          .fontSize(10)
          .text(`Receipt ID: RCP-${String(ride._id).slice(-8).toUpperCase()}`)
          .text(`Date: ${(ride.completedAt || ride.updatedAt || ride.createdAt).toLocaleString()}`)
          .text(`Payment: ${ride.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`)
          .text(`Payment ID: ${ride.paymentId || '—'}`)
          .moveDown();

        // Trip details
        doc.fontSize(12).text('Trip Details', { underline: true }).moveDown(0.5);
        doc.fontSize(10)
          .text(`Pickup: ${ride.pickup?.address}`)
          .text(`Drop: ${ride.destination?.address}`)
          .text(`Distance: ${ride.distance ?? 0} km`)
          .text(`Fare: ₹${Number(ride.fare).toFixed(2)}`)
          .moveDown();

        // Captain details
        doc.fontSize(12).text('Captain Details', { underline: true }).moveDown(0.5);
        doc.fontSize(10)
          .text(`Name: ${ride.captain?.fullname || '—'}`)
          .text(`Vehicle Number: ${ride.captain?.vehicleNumber || '—'}`)
          .text(`Rating: ${ride.captain?.rating ?? '—'}`)
          .moveDown();

        // Footer
        doc.moveDown().fontSize(9).fillColor('gray')
          .text('Thank you for riding with us.', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate receipt' });
    }
};

module.exports.cancelUserRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const userId = req.user._id;

        const ride = await rideModel.findOne({
            _id: rideId,
            user: userId,
            status: { $in: ['pending', 'requested', 'accepted', 'driver_en_route', 'arrived'] }
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be cancelled"
            });
        }

        // Cancel timeout if any
        cancelRideTimeout(rideId);

        // Process automatic refund if ride was paid
        let refundInfo = null;
        if (ride.paymentStatus === 'paid') {
            refundInfo = await processRideRefund(ride);
        }

        // Update ride status to cancelled
        ride.status = 'cancelled';
        ride.cancelledAt = new Date();
        await ride.save();

        const populatedRide = await rideModel.findById(rideId).populate('user', 'fullname email').populate('captain', 'fullname vehicle');
        emitRideStatus(rideId, "ride:cancelled", populatedRide);
        emitRideStatus(rideId, "ride:status_changed", populatedRide);

        res.status(200).json({
            success: true,
            message: "Ride cancelled successfully" + (refundInfo?.success ? " and refund processed" : ""),
            data: populatedRide,
            refund: refundInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error cancelling ride",
            error: error.message
        });
    }
}; 

module.exports.cancelcaptainRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain?._id;

        const ride = await rideModel.findOne({
            _id: rideId,
            captain: captainId,
            status: { $in: ['pending', 'requested', 'accepted', 'driver_en_route', 'arrived', 'in_progress', 'in_ride'] }
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be cancelled"
            });
        }

        // Cancel timeout if any
        cancelRideTimeout(rideId);

        // Process automatic refund if ride was paid
        let refundInfo = null;
        if (ride.paymentStatus === 'paid') {
            refundInfo = await processRideRefund(ride);
        }

        // Update ride status to cancelled
        ride.status = 'cancelled';
        ride.cancelledAt = new Date();
        await ride.save();

        const populatedRide = await rideModel.findById(rideId).populate('user', 'fullname email').populate('captain', 'fullname vehicle');
        emitRideStatus(rideId, "ride:cancelled", populatedRide);
        emitRideStatus(rideId, "ride:status_changed", populatedRide);

        res.status(200).json({
            success: true,
            message: "Ride cancelled successfully" + (refundInfo?.success ? " and refund processed" : ""),
            data: populatedRide,
            refund: refundInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error cancelling ride",
            error: error.message
        });
    }
};

module.exports.getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req?.user._id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalRides, totalSpentAgg, activeRide] = await Promise.all([
      rideModel.countDocuments({
        user: userId,
        createdAt: { $gte: startOfMonth },
      }),

      rideModel.aggregate([
        { $match: { user: userId, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$fare" } } },
      ]),

      rideModel.findOne({
        user: userId,
        status: { $in: ["accepted", "in_progress"] },
      }).select("pickupLocation dropoffLocation status fare"),
    ]);

    const totalSpent =
      totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRides,
        totalSpent: Number(totalSpent.toFixed(2)),
        activeRide: activeRide || null,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
