const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Test ride booking functionality
async function testRideBooking() {
    try {
        console.log('🚗 Testing Ride Booking API...\n');
        
        // Test 1: Book a ride (without auth - should fail)
        console.log('Test 1: Booking ride without authentication...');
        try {
            const response = await axios.post(`${API_BASE}/rides/book`, {
                pickup: {
                    address: "123 Main St, New York, NY",
                    coordinates: { lat: 40.7128, lng: -74.0060 }
                },
                destination: {
                    address: "456 Broadway, New York, NY",
                    coordinates: { lat: 40.7589, lng: -73.9851 }
                },
                fare: 15.50
            });
            console.log('❌ Should have failed - got response:', response.data);
        } catch (error) {
            console.log('✅ Correctly failed with status:', error.response?.status);
            console.log('Message:', error.response?.data?.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 2: Check server status
        console.log('Test 2: Checking server status...');
        try {
            const response = await axios.get(`${API_BASE}/`);
            console.log('✅ Server is running:', response.data);
        } catch (error) {
            console.log('❌ Server error:', error.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 3: Check available rides endpoint
        console.log('Test 3: Checking available rides endpoint...');
        try {
            const response = await axios.get(`${API_BASE}/rides/available`);
            console.log('❌ Should have failed - got response:', response.data);
        } catch (error) {
            console.log('✅ Correctly failed with status:', error.response?.status);
            console.log('Message:', error.response?.data?.message);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testRideBooking();
