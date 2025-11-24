const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require('express-validator');

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
        const { otp } = req.body;  // driver enters this OTP
        const captainId = req.captain._id;

        // 1️⃣ Find ride first
        const ride = await rideModel.findOne({
            _id: rideId,
            captain: captainId,
            status: "accepted",
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be started",
            });
        }

        console.log(`🔍 Starting ride ${rideId} - OTP exists: ${!!ride.startOtp}, OTP value: "${ride.startOtp}"`);

        // 2️⃣ OTP validation
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required",
            });
        }

        // 3️⃣ OTP match? (normalize both to strings and trim whitespace)
        const storedOtp = String(ride.startOtp || '').trim();
        const enteredOtp = String(otp || '').trim();
        
        if (!ride.startOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this ride. Please contact support.",
            });
        }

        if (storedOtp !== enteredOtp) {
            console.log(`OTP mismatch - Stored: "${storedOtp}" (type: ${typeof storedOtp}), Entered: "${enteredOtp}" (type: ${typeof enteredOtp})`);
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check and try again.",
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
        ride.status = "in_progress";
        ride.startedAt = new Date();
        await ride.save();

        res.status(200).json({
            success: true,
            message: "Ride started successfully",
            data: ride,
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

module.exports.usercompleteRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { otp } = req.body;  // User enters this OTP
        const userId = req.user._id;

        // 1️⃣ Find ride first
        const ride = await rideModel.findOne({
            _id: rideId,
            user: userId,
            status: 'in_progress'
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

        // 3️⃣ OTP match? (normalize both to strings and trim whitespace)
        const storedOtp = String(ride.startOtp || '').trim();
        const enteredOtp = String(otp || '').trim();
        
        if (!ride.startOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this ride. Please contact support."
            });
        }

        if (storedOtp !== enteredOtp) {
            console.log(`OTP mismatch - Stored: "${storedOtp}" (type: ${typeof storedOtp}), Entered: "${enteredOtp}" (type: ${typeof enteredOtp})`);
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
        ).populate('captain', 'fullname email');

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
        const { pickup, destination, fare } = req.body;
        const userId = req.user._id;

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        const ride = await rideModel.create({
            user: userId,
            pickup,
            destination,
            fare,
            status: "pending",
            startOtp: otp,
            otpExpiresAt: otpExpiry
        });

        console.log(`✅ Ride ${ride._id} created with OTP: "${otp}"`);

        const populatedRide = await ride.populate("user", "fullname email");

        res.status(201).json({
            success: true,
            message: "Ride booked successfully",
            data: populatedRide,
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
            status: { $in: ['pending', 'accepted'] } // Only allow cancellation of pending or accepted rides
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be cancelled"
            });
        }

        // Update ride status to cancelled
        const updatedRide = await rideModel.findByIdAndUpdate(
            rideId,
            {
                status: 'cancelled',
                cancelledAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Ride cancelled successfully",
            data: updatedRide
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
            status: { $in: ['pending', 'accepted','in_progress'] } // Only allow cancellation of pending or accepted rides
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found or cannot be cancelled"
            });
        }

        // Update ride status to cancelled
        const updatedRide = await rideModel.findByIdAndUpdate(
            rideId,
            {
                status: 'cancelled',
                cancelledAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Ride cancelled successfully",
            data: updatedRide
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
