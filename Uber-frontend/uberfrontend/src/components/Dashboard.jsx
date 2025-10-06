// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Cardcomponent from "./Cardcomponent";
import OSMMap from "./Map";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import { useUserStore } from "../Zustand/useUserStore";
import { useRideStore } from "../zustand/useRideStore";

const getCoordinates = async (place) => {
  try {
    const API_KEY = "pk.d4d3cce23c00c2d9e20ac1070c22cc5d";
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(
        place
      )}&format=json`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

const Dashboard = () => {
  const {
    currentRide,
    rideHistory,
    rideStatus,
    isLoading,
    error,
    bookRide,
    fetchCurrentRide,
    fetchRideHistory,
    calculatetheprice,
  } = useRideStore();

  const { isAuthenticated } = useUserStore();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
      fetchRideHistory();
    }
  }, [isAuthenticated, fetchCurrentRide, fetchRideHistory]);

  // 🔹 Calculate Fare
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Could not fetch coordinates. Please check the place names.");
        return;
      }

      const result = await calculatetheprice(pickupCoords, destCoords);

      if (result?.fare || result?.estimatedFare) {
        setFare(result.fare || result.estimatedFare);
      } else {
        alert("Failed to calculate fare");
      }
    } catch (error) {
      console.error("Error calculating fare:", error);
    }
  };

  console.log("ride history:", rideHistory);

  // 🔹 Book Ride
  const handleBookRide = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Could not fetch coordinates. Please check the place names.");
        return;
      }

      await bookRide({
        pickup: {
          address: pickup,
          coordinates: pickupCoords,
        },
        destination: {
          address: destination,
          coordinates: destCoords,
        },
        fare: fare,
      });

      setPickup("");
      setDestination("");
      setFare(0);
    } catch (error) {
      console.error("Failed to book ride:", error);
    }
  };

  const renderRideForm = () => (
    <div className="bg-white/95 backdrop-blur p-5 mt-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full max-w-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          Book a new ride
        </div>
      </div>

      <div className="flex flex-col">
        <input
          className="mt-4 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Starting ride from"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />

        <p className="text-sm text-gray-600 flex flex-col mt-4">
          Destination
          <input
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Final Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </p>

        <p className="text-sm text-gray-600 flex flex-col mt-4">
          Fare (USD)
          <input
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            placeholder="15.50"
            value={fare}
            onChange={(e) => setFare(parseFloat(e.target.value) || 0)}
            min="1"
            step="0.01"
          />
        </p>

        <button
          onClick={handleCalculateFare}
          className="mt-4 bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-900 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Calculate Fare"}
        </button>
      </div>

      <button
        className="mt-6 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors w-full"
        onClick={handleBookRide}
        disabled={isLoading}
      >
        {isLoading ? "Booking..." : "Find Rides"}
      </button>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Cardcomponent
            t1="Total Rides"
            t2="🚘"
            t3="This month"
            t4={rideHistory.length}
          />
          <Cardcomponent
            t1="Active Ride"
            t2="⏱️"
            t3="Current"
            t4={currentRide ? "Yes" : "No"}
          />
          <Cardcomponent
            t1="Total Spent"
            t2="💵"
            t3="This month"
            t4={`$${rideHistory
              .reduce((sum, ride) => sum + (ride.fare || 0), 0)
              .toFixed(2)}`}
          />
        </div>

        {/* Map + Ride Info */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="col-span-1 space-y-6">
          {!currentRide
  ? renderRideForm()
  : <Currentride />}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  useUserStore.getState().logout();
                  useRideStore.getState().clearCurrentRide();
                  window.location.href = "/login";
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="ml-24">
            <div className="p-4 h-[520px] w-[120vh] rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100 bg-white">
              <OSMMap
                center={
                  currentRide
                    ? [
                        currentRide.pickup?.coordinates?.lat,
                        currentRide.pickup?.coordinates?.lng,
                      ]
                    : [28.6139, 77.209]
                }
                zoom={13}
                userLocation={
                  currentRide
                    ? [
                        currentRide.pickup?.coordinates?.lat,
                        currentRide.pickup?.coordinates?.lng,
                      ]
                    : [28.6139, 77.209]
                }
                driverLocation={
                  currentRide
                    ? [
                        currentRide.destination?.coordinates?.lat,
                        currentRide.destination?.coordinates?.lng,
                      ]
                    : [28.5355, 77.391]
                }
              />
            </div>
          </div>
        </div>

        {/* Ride History */}
        <div className="mt-6">
          <RecentRides rides={rideHistory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
