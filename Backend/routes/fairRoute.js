const express = require("express");
const router = express.Router();

function getDistanceInKm(coord1, coord2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const { calculateSurgeMultiplier } = require("../services/surge.service");

router.post("/calculate", async (req, res) => {
  try {
    const { pickup, destination } = req.body;

    if (!pickup || !destination || !pickup.lat || !destination.lat) {
      return res
        .status(400)
        .json({ message: "Pickup and destination coordinates are required." });
    }

    const distanceKm = getDistanceInKm(pickup, destination);
    const baseFare = 50;
    const perKmRate = 12;
    const standardFare = baseFare + distanceKm * perKmRate;

    // Calculate surge multiplier dynamically based on active requests vs online drivers
    const surgeMultiplier = await calculateSurgeMultiplier({
      lat: pickup.lat,
      lng: pickup.lng
    });

    const finalFare = Number((standardFare * surgeMultiplier).toFixed(2));

    res.json({
      success: true,
      distanceKm: Number(distanceKm.toFixed(2)),
      baseFare,
      standardFare: Number(standardFare.toFixed(2)),
      surgeMultiplier,
      fare: finalFare,
      currency: "INR",
      breakdown: {
        base: baseFare,
        distanceCharge: Number((distanceKm * perKmRate).toFixed(2)),
        surgeMultiplier: surgeMultiplier
      }
    });
  } catch (err) {
    console.error("Fare calculation error:", err);
    res
      .status(500)
      .json({ message: "Server error during fare calculation." });
  }
});

module.exports = router;
