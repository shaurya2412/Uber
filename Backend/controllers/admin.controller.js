const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const userModel = require("../models/usermodel");

/**
 * Feature 17: Live map of all active rides city-wide (admin only)
 */
module.exports.getActiveCityRides = async (req, res) => {
  try {
    const activeRides = await rideModel.find({
      status: { $in: ['accepted', 'driver_en_route', 'arrived', 'in_ride', 'in_progress', 'requested', 'pending'] }
    })
    .populate('user', 'fullname email')
    .populate('captain', 'fullname vehicle location active')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: activeRides.length,
      data: activeRides
    });
  } catch (error) {
    console.error("Error fetching active city rides:", error);
    res.status(500).json({ success: false, message: "Error fetching active rides", error: error.message });
  }
};

/**
 * Feature 18: Revenue analytics — daily/weekly earnings
 */
module.exports.getRevenueAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [dailyRevenue, weeklyRevenue, overallStats] = await Promise.all([
      // Daily revenue for the last 7 days
      rideModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalRevenue: { $sum: "$fare" },
            rideCount: { $sum: 1 },
            avgFare: { $avg: "$fare" }
          }
        },
        { $sort: { "_id": 1 } }
      ]),

      // Weekly revenue
      rideModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $week: "$createdAt" },
            totalRevenue: { $sum: "$fare" },
            rideCount: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),

      // Overall totals
      rideModel.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$fare" },
            totalCompletedRides: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        daily: dailyRevenue,
        weekly: weeklyRevenue,
        totals: overallStats[0] || { totalEarnings: 0, totalCompletedRides: 0 }
      }
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ success: false, message: "Error fetching analytics", error: error.message });
  }
};

/**
 * Feature 18: Peak hours chart (0 to 23 hours distribution)
 */
module.exports.getPeakHoursAnalytics = async (req, res) => {
  try {
    const peakHours = await rideModel.aggregate([
      { $match: { status: { $in: ['completed', 'in_ride', 'in_progress', 'accepted'] } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          rideCount: { $sum: 1 },
          totalFare: { $sum: "$fare" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Ensure all 24 hours (0-23) are represented
    const hourMap = new Map();
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, { hour: `${i}:00`, rideCount: 0, totalFare: 0 });
    }
    peakHours.forEach(h => {
      hourMap.set(h._id, {
        hour: `${h._id}:00`,
        rideCount: h.rideCount,
        totalFare: Number(h.totalFare.toFixed(2))
      });
    });

    res.status(200).json({
      success: true,
      data: Array.from(hourMap.values())
    });
  } catch (error) {
    console.error("Error fetching peak hours analytics:", error);
    res.status(500).json({ success: false, message: "Error fetching peak hours", error: error.message });
  }
};

/**
 * Feature 19: Driver management — list all drivers with stats
 */
module.exports.getAllDrivers = async (req, res) => {
  try {
    const { status, approvalStatus } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const drivers = await captainModel.find(filter).select('-password');
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ success: false, message: "Error fetching drivers", error: error.message });
  }
};

/**
 * Feature 19: Driver management — approve/suspend drivers
 */
module.exports.updateDriverApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (approvalStatus && !validStatuses.includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid approvalStatus" });
    }

    const updateFields = {};
    if (approvalStatus) updateFields.approvalStatus = approvalStatus;
    if (status) updateFields.status = status;

    const driver = await captainModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    res.status(200).json({
      success: true,
      message: `Driver status updated to ${driver.approvalStatus}`,
      data: driver
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ success: false, message: "Error updating driver", error: error.message });
  }
};

/**
 * Feature 19: Driver management — view any driver's ride history
 */
module.exports.getDriverRideHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const rides = await rideModel.find({ captain: id })
      .populate('user', 'fullname email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error("Error fetching driver ride history:", error);
    res.status(500).json({ success: false, message: "Error fetching driver history", error: error.message });
  }
};
