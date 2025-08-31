const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test credentials (make sure these users exist in your DB)
const testUser = {
  email: 'testuser@example.com',
  password: 'password123'
};

const testCaptain = {
  email: 'testcaptain@example.com', 
  password: 'password123'
};

let userToken = '';
let captainToken = '';
let rideId = '';

async function testRideFlow() {
  try {
    console.log('🚀 Starting Ride API Tests...\n');

    // Step 1: Login as User
    console.log('1️⃣ Logging in as User...');
    const userLogin = await axios.post(`${BASE_URL}/users/login`, testUser);
    userToken = userLogin.data.token;
    console.log('✅ User login successful\n');

    // Step 2: Login as Captain  
    console.log('2️⃣ Logging in as Captain...');
    const captainLogin = await axios.post(`${BASE_URL}/captains/login`, testCaptain);
    captainToken = captainLogin.data.token;
    console.log('✅ Captain login successful\n');

    // Step 3: Book a Ride
    console.log('3️⃣ Booking a ride...');
    const rideData = {
      pickup: {
        address: "123 Main Street, New York",
        coordinates: { lat: 40.7128, lng: -74.006 }
      },
      destination: {
        address: "456 Oak Avenue, New York",
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      fare: 15.50
    };

    const bookRide = await axios.post(`${BASE_URL}/rides/book`, rideData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    rideId = bookRide.data.data._id;
    console.log('✅ Ride booked successfully');
    console.log('📋 Ride ID:', rideId, '\n');

    console.log('4️⃣ Getting available rides...');
    const availableRides = await axios.get(`${BASE_URL}/rides/available`, {
      headers: { Authorization: `Bearer ${captainToken}` }
    });
    console.log('✅ Available rides fetched');
    console.log('📋 Found', availableRides.data.data.length, 'available rides\n');

    console.log('5️⃣ Accepting the ride...');
    const acceptRide = await axios.post(`${BASE_URL}/rides/${rideId}/accept`, {}, {
      headers: { Authorization: `Bearer ${captainToken}` }
    });
    console.log('✅ Ride accepted successfully\n');

    console.log('6️⃣ Starting the ride...');
    const startRide = await axios.post(`${BASE_URL}/rides/${rideId}/start`, {}, {
      headers: { Authorization: `Bearer ${captainToken}` }
    });
    console.log('✅ Ride started successfully\n');

    console.log('7️⃣ Completing the ride...');
    const completeRide = await axios.post(`${BASE_URL}/rides/${rideId}/complete`, {}, {
      headers: { Authorization: `Bearer ${captainToken}` }
    });
    console.log('✅ Ride completed successfully\n');

    console.log('8️⃣ Getting ride history...');
    const userHistory = await axios.get(`${BASE_URL}/rides/user-history`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const captainHistory = await axios.get(`${BASE_URL}/rides/history`, {
      headers: { Authorization: `Bearer ${captainToken}` }
    });
    console.log('✅ User history:', userHistory.data.data.length, 'rides');
    console.log('✅ Captain history:', captainHistory.data.data.length, 'rides\n');

    console.log('🎉 All tests passed! Your ride system is working perfectly! 🚗');

  } catch (error) {
    console.error(' Test failed:', error.response?.data?.message || error.message);
    console.error(' Error details:', error.response?.data || error.message);
  }
}

testRideFlow();


