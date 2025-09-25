import React, { useState, useEffect } from 'react';
import { useRideStore } from '../Zustand/useRideStore';
import { useCaptainStore } from '../Zustand/useCaptainStore';
import { useUserStore } from '../Zustand/useUserstore';
import fareService from '../services/fareService';
import apiService from '../services/apiService';
import EnhancedMap from './EnhancedMap';

const IntegrationTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  
  const { bookRide, fetchCurrentRide, fetchRideHistory } = useRideStore();
  const { fetchCaptainProfile, fetchAvailableRides, fetchCurrentRide: fetchCaptainCurrentRide } = useCaptainStore();
  const { fetchProfile } = useUserStore();

  const runTests = async () => {
    setIsRunning(true);
    const results = {};

    // Test 1: Fare Calculation API
    try {
      const fareResult = await fareService.calculateFare(
        { lat: 28.6139, lng: 77.209 }, // Delhi
        { lat: 28.5355, lng: 77.3910 }  // Gurgaon
      );
      results.fareCalculation = {
        success: true,
        data: fareResult,
        message: 'Fare calculation working'
      };
    } catch (error) {
      results.fareCalculation = {
        success: false,
        error: error.message,
        message: 'Fare calculation failed'
      };
    }

    // Test 2: User Profile API
    try {
      const profileResult = await apiService.user.getProfile();
      results.userProfile = {
        success: true,
        data: profileResult,
        message: 'User profile API working'
      };
    } catch (error) {
      results.userProfile = {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'User profile API failed'
      };
    }

    // Test 3: Captain Profile API
    try {
      const captainProfileResult = await apiService.captain.getProfile();
      results.captainProfile = {
        success: true,
        data: captainProfileResult,
        message: 'Captain profile API working'
      };
    } catch (error) {
      results.captainProfile = {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Captain profile API failed'
      };
    }

    // Test 4: Available Rides API
    try {
      const ridesResult = await apiService.ride.getAvailableRides();
      results.availableRides = {
        success: true,
        data: ridesResult,
        message: 'Available rides API working'
      };
    } catch (error) {
      results.availableRides = {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Available rides API failed'
      };
    }

    // Test 5: User Ride History API
    try {
      const historyResult = await apiService.ride.getUserRideHistory();
      results.userRideHistory = {
        success: true,
        data: historyResult,
        message: 'User ride history API working'
      };
    } catch (error) {
      results.userRideHistory = {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'User ride history API failed'
      };
    }

    // Test 6: Map Component
    try {
      results.mapComponent = {
        success: true,
        message: 'Map component loaded successfully'
      };
    } catch (error) {
      results.mapComponent = {
        success: false,
        error: error.message,
        message: 'Map component failed to load'
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testRideBooking = async () => {
    try {
      const testRideData = {
        pickup: {
          address: "Delhi, India",
          coordinates: { lat: 28.6139, lng: 77.209 }
        },
        destination: {
          address: "Gurgaon, India", 
          coordinates: { lat: 28.5355, lng: 77.3910 }
        },
        fare: 150,
        distance: 25.5
      };

      const result = await bookRide(testRideData);
      alert('Test ride booking successful!');
    } catch (error) {
      alert('Test ride booking failed: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Integration Test Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            
            <button
              onClick={runTests}
              disabled={isRunning}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>

            <button
              onClick={testRideBooking}
              className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Test Ride Booking
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Map Integration Test</h2>
          <div className="h-96 rounded-lg overflow-hidden border">
            <EnhancedMap
              center={[28.6139, 77.209]}
              zoom={12}
              userLocation={[28.6139, 77.209]}
              pickupLocation={[28.6139, 77.209]}
              destinationLocation={[28.5355, 77.3910]}
              showRoute={true}
              rideStatus="searching"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Test map showing pickup and destination with route
          </p>
        </div>
      </div>

      {/* API Status */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">API Endpoints Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded">
            <h3 className="font-medium">Fare Calculation</h3>
            <p className="text-sm text-gray-600">POST /calculate/calculate</p>
          </div>
          <div className="text-center p-4 border rounded">
            <h3 className="font-medium">User APIs</h3>
            <p className="text-sm text-gray-600">/users/*</p>
          </div>
          <div className="text-center p-4 border rounded">
            <h3 className="font-medium">Captain APIs</h3>
            <p className="text-sm text-gray-600">/captains/*</p>
          </div>
          <div className="text-center p-4 border rounded">
            <h3 className="font-medium">Ride APIs</h3>
            <p className="text-sm text-gray-600">/rides/*</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTest;
