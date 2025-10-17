const { sendEmail } = require('./emailService');
const { generateTripReceiptHTML } = require('./receiptTemplate');
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');

/**
 * Safely format captain information for receipt
 * @param {Object} captain - Captain data from database
 * @returns {Object|null} Formatted captain info or null
 */
function formatCaptainInfo(captain) {
  if (!captain) {
    console.log('🚗 No captain data provided');
    return null;
  }
  
  try {
    console.log('🚗 Raw captain data:', captain);
    
    const formattedInfo = {
      name: captain.fullname && typeof captain.fullname === 'string' && captain.fullname.trim() ? captain.fullname.trim() : null,
      vehicleNumber: captain.vehicleNumber && typeof captain.vehicleNumber === 'string' && captain.vehicleNumber.trim() ? captain.vehicleNumber.trim() : null,
      rating: typeof captain.rating === 'number' && captain.rating > 0 ? captain.rating : 4.5
    };
    
    console.log('🚗 Formatted captain info:', formattedInfo);
    return formattedInfo;
  } catch (error) {
    console.error('❌ Error formatting captain info:', error);
    return null;
  }
}

/**
 * Send ride receipt email to user after successful payment
 * @param {string} rideId - The ride ID
 * @param {string} paymentId - Razorpay payment ID
 */
async function sendRideReceipt(rideId, paymentId) {
  try {
    // Fetch complete ride data with populated user and captain
    const ride = await rideModel.findById(rideId)
      .populate('user', 'fullname email')
      .populate('captain', 'fullname vehicleNumber rating')
      .lean();

    if (!ride) {
      throw new Error('Ride not found');
    }

    if (!ride.user || !ride.user.email) {
      throw new Error('User email not found');
    }

    // Generate receipt number
    const receiptNo = `RCP${Date.now().toString().slice(-6)}`;

    // Debug logging
    console.log('📧 Preparing receipt data for ride:', rideId);
    console.log('👤 User data:', ride.user ? { name: ride.user.fullname, email: ride.user.email } : 'No user data');
    console.log('🚗 Captain data:', ride.captain ? { name: ride.captain.fullname, vehicleNumber: ride.captain.vehicleNumber, rating: ride.captain.rating } : 'No captain data');

    // Prepare trip data for receipt
    const tripData = {
      user: {
        name: ride.user.fullname || 'User',
        email: ride.user.email
      },
      tripId: ride._id.toString().slice(-8).toUpperCase(),
      pickup: ride.pickup.address,
      drop: ride.destination.address,
      fare: ride.fare,
      distance: ride.distance || 0,
      duration: calculateDuration(ride.startedAt, ride.completedAt),
      carType: getVehicleType(ride.captain?.vehicleNumber),
      paymentMethod: `Razorpay - **** ${paymentId.slice(-4)}`,
      receiptNo,
      mapUrl: generateMapUrl(ride.pickup.coordinates, ride.destination.coordinates),
      date: formatDate(ride.completedAt || new Date()),
      fareBreakdown: calculateFareBreakdown(ride.fare, ride.distance),
      captainInfo: formatCaptainInfo(ride.captain)
    };

    // Send email
    await sendEmail({
      to: ride.user.email,
      subject: `Your Ride Receipt - ${tripData.tripId}`,
      html: generateTripReceiptHTML(tripData)
    });

    console.log(`✅ Receipt sent successfully to ${ride.user.email} for ride ${rideId}`);
    return { success: true, receiptNo };

  } catch (error) {
    console.error('❌ Error sending ride receipt:', error);
    throw error;
  }
}

/**
 * Calculate ride duration from start to end time
 */
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return '00:00:00';
  }
  
  const durationMs = new Date(endTime) - new Date(startTime);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Determine vehicle type from vehicle number
 */
function getVehicleType(vehicleNumber) {
  if (!vehicleNumber) return 'Vehicle';
  
  // Simple logic to determine vehicle type based on number
  // In real implementation, you might store this in captain model
  const lastDigit = parseInt(vehicleNumber.slice(-1));
  if (lastDigit <= 3) return 'Economy';
  if (lastDigit <= 6) return 'Comfort';
  if (lastDigit <= 8) return 'Premium';
  return 'Luxury';
}

/**
 * Generate Google Maps static image URL
 */
function generateMapUrl(pickup, destination) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_MAPS_API_KEY';
  const pickupStr = `${pickup.lat},${pickup.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  
  return `https://maps.googleapis.com/maps/api/staticmap?size=300x200&path=color:0x0000ff|weight:3|${pickupStr}|${destStr}&key=${apiKey}`;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculate fare breakdown
 */
function calculateFareBreakdown(totalFare, distance) {
  const baseFare = Math.round(totalFare * 0.4);
  const distanceFare = Math.round(totalFare * 0.5);
  const timeFare = Math.round(totalFare * 0.05);
  const taxes = totalFare - baseFare - distanceFare - timeFare;

  return {
    baseFare,
    distanceFare,
    timeFare,
    taxes: Math.max(0, taxes),
    total: totalFare
  };
}

/**
 * Send test receipt with sample data
 */
async function sendTestReceipt() {
  const tripData = {
    user: { name: "Test User", email: process.env.EMAIL_USER },
    tripId: "TEST001",
    pickup: "Sector 18, Noida",
    drop: "Connaught Place, New Delhi",
    fare: 184.5,
    distance: 12.4,
    duration: "00:22:45",
    carType: "Black Sedan",
    paymentMethod: "Razorpay - **** 3219",
    receiptNo: "RCP1845",
    mapUrl: "https://maps.googleapis.com/maps/api/staticmap?size=300x200&path=color:0x0000ff|weight:3|28.567|77.324|28.628|77.218&key=YOUR_MAPS_API_KEY",
    date: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    fareBreakdown: calculateFareBreakdown(184.5, 12.4),
    captainInfo: formatCaptainInfo({
      fullname: "John Doe",
      vehicleNumber: "DL01AB1234",
      rating: 4.8
    })
  };

  try {
    await sendEmail({
      to: tripData.user.email,
      subject: `Test Ride Receipt - ${tripData.tripId}`,
      html: generateTripReceiptHTML(tripData)
    });
    return { success: true, message: 'Test receipt sent successfully!' };
  } catch (error) {
    console.error('❌ Error sending test receipt:', error);
    throw error;
  }
}

module.exports = {
  sendRideReceipt,
  sendTestReceipt,
  calculateDuration,
  getVehicleType,
  generateMapUrl,
  formatDate,
  calculateFareBreakdown
};
