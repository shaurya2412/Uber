// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Cardcomponent from "./Cardcomponent";
import OSMMap from "./Map";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import { useUserStore } from "../Zustand/useUserstore";
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
  } = useRideStore();

  const { isAuthenticated ,logout} = useUserStore();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
      fetchRideHistory();
    }
  }, [isAuthenticated, fetchCurrentRide, fetchRideHistory]);

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
    <div className="bg-black p-4 mt-4 ml-4 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed">
      <div className="flex justify-between items-center mb-2">
        <div className="text-2xl font-bold flex flex-row mr-2">
          <span className="font-semibold mr-2">🚗</span>
          Book a new ride
        </div>
      </div>

      <div className="flex flex-col">
        <input
          className="border mt-6 w-90 rounded text-white placeholder-amber-50 bg-transparent px-3 py-2"
          type="text"
          placeholder="Starting ride from"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />

        <p className="text flex flex-col mt-4">
          Destination
          <input
            className="border mt-3 w-90 placeholder-amber-50 bg-transparent px-3 py-2"
            type="text"
            placeholder="Final Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </p>

        <p className="text flex flex-col mt-4">
          Fare (USD)
          <input
            className="border mt-3 w-90 placeholder-amber-50 bg-transparent px-3 py-2"
            type="number"
            placeholder="15.50"
            value={fare}
            onChange={(e) => setFare(parseFloat(e.target.value))}
            min="1"
            step="0.01"
          />
        </p>
      </div>

      <button
        className="mt-8 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        onClick={handleBookRide}
        disabled={isLoading}
      >
        {isLoading ? "Booking..." : "Find rides"}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );

  const renderRideTracking = () => (
    <div className="bg-black p-4 mt-4 ml-4 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed">
      <div className="flex justify-between items-center mb-2">
        <div className="text-2xl font-bold flex flex-row mr-2">
          <span className="font-semibold mr-2">🚗</span>
          Current Ride
        </div>
      </div>

      {currentRide ? (
        <div className="text-white">
          <p>
            <strong>Status:</strong> {currentRide.status}
          </p>
          <p>
            <strong>Pickup:</strong> {currentRide.pickup.address}
          </p>
          <p>
            <strong>Destination:</strong> {currentRide.destination.address}
          </p>
          <p>
            <strong>Fare:</strong> ${currentRide.fare}
          </p>
        </div>
      ) : (
        <p className="text-white">No active ride</p>
      )}
    </div>
  );

  console.log(
    "Pickup Lat:",
    currentRide?.pickup?.coordinates?.lat,
    "Pickup Lng:",
    currentRide?.pickup?.coordinates?.lng
  );
  console.log(
    "Destination Lat:",
    currentRide?.destination?.coordinates?.lat,
    "Destination Lng:",
    currentRide?.destination?.coordinates?.lng
  );

  return (
    <div>
      <div className="bg-black min-h-screen flex items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

          {rideStatus === "idle" || rideStatus === "searching"
            ? renderRideForm()
            : renderRideTracking()}
          {currentRide && <Currentride />}
          <RecentRides rides={rideHistory} />
       <div className="flex justify-end p-4">
  <button
    onClick={() => {
      useUserStore.getState().logout();
      // optional: clear ride state too
      useRideStore.getState().clearCurrentRide();
      window.location.href = "/login"; // redirect to login page
    }}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Logout
  </button>
</div>

        </div>
      </div>

      {/* Map Integration */}
      <div className="h-[500px] w-full rounded-lg overflow-hidden">
        <OSMMap
          center={
            currentRide
              ? [
                  currentRide.pickup?.coordinates?.lat,
                  currentRide.pickup?.coordinates?.lng,
                ]
              : [28.6139, 77.2090]
          }
          zoom={13}
          userLocation={
            currentRide
              ? [
                  currentRide.pickup?.coordinates?.lat,
                  currentRide.pickup?.coordinates?.lng,
                ]
              : [28.6139, 77.2090]
          }
          driverLocation={
            currentRide
              ? [
                  currentRide.destination?.coordinates?.lat,
                  currentRide.destination?.coordinates?.lng,
                ]
              : [28.5355, 77.3910]
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;
