const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');

/**
 * Calculates dynamic surge multiplier based on active demand vs supply in an area.
 * @param {Object} options
 * @param {number} options.lat - Pickup latitude
 * @param {number} options.lng - Pickup longitude
 * @param {number} options.radiusMeters - Search radius (default 5000m)
 * @returns {Promise<number>} Surge multiplier (1.0 to 3.0)
 */
async function calculateSurgeMultiplier({ lat, lng, radiusMeters = 5000 }) {
  try {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return 1.0;
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Approximate bounding box for query speed (~0.045 deg is ~5km)
    const delta = radiusMeters / 111000;

    const [activeRequests, availableCaptains] = await Promise.all([
      rideModel.countDocuments({
        status: { $in: ['pending', 'requested'] },
        createdAt: { $gte: tenMinutesAgo },
        'pickup.coordinates.lat': { $gte: latNum - delta, $lte: latNum + delta },
        'pickup.coordinates.lng': { $gte: lngNum - delta, $lte: lngNum + delta }
      }),
      captainModel.countDocuments({
        active: true,
        status: 'active',
        approvalStatus: { $ne: 'suspended' }
      })
    ]);

    const supply = Math.max(availableCaptains, 1);
    const ratio = activeRequests / supply;

    if (ratio >= 4.0) return 2.5;
    if (ratio >= 2.5) return 2.0;
    if (ratio >= 1.8) return 1.6;
    if (ratio >= 1.2) return 1.3;
    return 1.0;
  } catch (error) {
    console.error('Error calculating surge multiplier:', error.message);
    return 1.0;
  }
}

function calculateFareWithSurge(distanceKm, durationMin, surgeMultiplier = 1.0, vehicleType = 'car') {
  const baseRates = {
    car: { base: 50, perKm: 12, perMin: 2 },
    auto: { base: 30, perKm: 9, perMin: 1.5 },
    moto: { base: 20, perKm: 6, perMin: 1 },
  };

  const rates = baseRates[vehicleType] || baseRates.car;
  const rawFare = rates.base + (distanceKm * rates.perKm) + (durationMin * rates.perMin);
  const totalFare = Math.round(rawFare * surgeMultiplier);

  return {
    baseFare: rates.base,
    distanceFare: Math.round(distanceKm * rates.perKm),
    timeFare: Math.round(durationMin * rates.perMin),
    surgeMultiplier,
    totalFare,
  };
}

module.exports = {
  calculateSurgeMultiplier,
  calculateFareWithSurge
};

