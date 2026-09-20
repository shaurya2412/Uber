const rideModel = require('../models/ride.model');
const { getIo } = require('./socket.service');
const redisClient = require('../db/redis');

// In-memory timer tracker backed by Redis key
const activeTimers = new Map();

/**
 * Schedules an auto-cancellation check for a ride after specified timeout (default: 60s).
 * @param {string} rideId - The ID of the ride
 * @param {number} timeoutMs - Timeout in milliseconds (default: 60000ms)
 */
function scheduleRideTimeout(rideId, timeoutMs = 60000) {
  const rideIdStr = rideId.toString();

  // Clear existing timer if any
  if (activeTimers.has(rideIdStr)) {
    clearTimeout(activeTimers.get(rideIdStr));
  }

  // Set Redis flag for distributed worker tracking if applicable
  if (redisClient && redisClient.isOpen) {
    redisClient.setEx(`ride_timeout:${rideIdStr}`, Math.ceil(timeoutMs / 1000) + 10, 'scheduled').catch(() => {});
  }

  const timer = setTimeout(async () => {
    try {
      activeTimers.delete(rideIdStr);

      const ride = await rideModel.findById(rideIdStr);
      if (ride && (ride.status === 'pending' || ride.status === 'requested')) {
        console.log(`⏱️ Auto-cancelling unaccepted ride ${rideIdStr} after 60 seconds.`);
        ride.status = 'cancelled';
        ride.cancelledAt = new Date();
        await ride.save();

        // Notify user in their personal room and in ride room
        try {
          const io = getIo();
          if (io) {
            io.to(rideIdStr).emit('ride:cancelled', ride);
            io.to(rideIdStr).emit('ride:auto_cancelled', {
              rideId: rideIdStr,
              message: 'No driver accepted your ride within 60 seconds. Please try again.'
            });
            if (ride.user) {
              io.to(ride.user.toString()).emit('ride:auto_cancelled', {
                rideId: rideIdStr,
                message: 'No driver accepted your ride within 60 seconds. Please try again.'
              });
            }
          }
        } catch (socketErr) {
          console.warn('Socket error on auto-cancel:', socketErr.message);
        }
      }
    } catch (err) {
      console.error(`Error in ride timeout execution for ${rideIdStr}:`, err);
    }
  }, timeoutMs);

  activeTimers.set(rideIdStr, timer);
}

/**
 * Cancels the scheduled timeout when a driver accepts the ride.
 * @param {string} rideId
 */
function cancelRideTimeout(rideId) {
  const rideIdStr = rideId.toString();
  if (activeTimers.has(rideIdStr)) {
    clearTimeout(activeTimers.get(rideIdStr));
    activeTimers.delete(rideIdStr);
  }
  if (redisClient && redisClient.isOpen) {
    redisClient.del(`ride_timeout:${rideIdStr}`).catch(() => {});
  }
}

module.exports = {
  scheduleRideTimeout,
  cancelRideTimeout
};
