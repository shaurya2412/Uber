// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Cardcomponent from "./Cardcomponent";
import OSMMap from "./Map";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import { useUserStore } from "../Zustand/useUserStore";
import { useRideStore } from "../zustand/useRideStore";
import UserdashboardHeader from "./userdashboardHeader";

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
    fetchusermetrics,
    stats
  } = useRideStore();

  const { isAuthenticated,fetchProfile } = useUserStore();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

useEffect(() => {
  if (isAuthenticated) {
    fetchCurrentRide();
    fetchRideHistory();
    fetchusermetrics();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated]);


  // 🔹 Calculate Fare
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    setIsCalculating(true);
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
        console.log("✅ Fare calculated:", result.fare || result.estimatedFare);
      } else {
        alert("Failed to calculate fare");
      }
    } catch (error) {
      console.error("Error calculating fare:", error);
      alert("Failed to calculate fare. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  console.log("ride history:", rideHistory);

  // 🔹 Book Ride
  const handleBookRide = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    if (fare === 0) {
      alert("Please calculate fare first");
      return;
    }

    setIsBooking(true);
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
      console.log("✅ Ride booked successfully");
    } catch (error) {
      console.error("Failed to book ride:", error);
      alert("Failed to book ride. Please try again.");
    } finally {
      setIsBooking(false);
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

        {/* Fare Display */}
        {fare > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>Estimated Fare: ₹{fare}</strong>
            </p>
          </div>
        )}

        {/* Calculate Fare Button */}
        <button
          onClick={handleCalculateFare}
          className="mt-4 bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
          disabled={isCalculating || isBooking || !pickup || !destination}
        >
          {isCalculating ? "Calculating..." : "Calculate Fare"}
        </button>

        {/* Book Ride Button */}
        <button
          className="mt-3 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
          onClick={handleBookRide}
          disabled={isBooking || isCalculating || fare === 0 || !pickup || !destination}
        >
          {isBooking ? "Booking..." : "Book Ride"}
        </button>
      </div>
    </div>
  );

  // metrics are fetched in useEffect and stored in `stats`
  return (

    <div className="bg-gray-50 min-h-screen">
     <UserdashboardHeader/>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         <Cardcomponent
  t1="Total Rides"
  t2="🚘"
  t3="This month"
  t4={stats.totalRides}
/>

<Cardcomponent
  t1="Active Ride"
  t2="⏱️"
  t3="Current"
  t4={stats.activeRide ? "Yes" : "No"}
/>

<Cardcomponent
  t1="Total Spent"
  t2="💵"
  t3="This month"
  t4={`₹${stats.totalSpent.toFixed(2)}`}
/>

        </div>

        {/* Map + Ride Info */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="col-span-1 space-y-6">
          {!currentRide
  ? renderRideForm()
  : <Currentride />}

            
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

        <div className="mt-6">
          <RecentRides rides={rideHistory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
