// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Cardcomponent from "./Cardcomponent";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import RobustMap from "./RobustMap"; // ✅ Import robust map with fallbacks
import MapDebug from "./MapDebug"; // ✅ Import debug component
import CoordinatesDisplay from "./CoordinatesDisplay"; // ✅ Import coordinates display
import { useUserStore } from "../Zustand/useUserstore";
import { useRideStore } from "../Zustand/useRideStore";
import fareService from "../services/fareService";

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

  const { isAuthenticated } = useUserStore();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState("");
  const [fareData, setFareData] = useState(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
      fetchRideHistory();
    }
  }, [isAuthenticated, fetchCurrentRide, fetchRideHistory]);

  // Calculate fare when both pickup and destination are entered
  const calculateFare = async () => {
    if (!pickup || !destination) return;
    
    setIsCalculatingFare(true);
    try {
      const calculatedFare = await fareService.calculateFareForRide(pickup, destination);
      setFareData(calculatedFare);
      setFare(calculatedFare.fare);
    } catch (error) {
      console.error("Failed to calculate fare:", error);
      alert("Failed to calculate fare: " + error.message);
    } finally {
      setIsCalculatingFare(false);
    }
  };

  // Auto-calculate fare when both fields are filled
  useEffect(() => {
    if (pickup && destination) {
      const timer = setTimeout(() => {
        calculateFare();
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timer);
    } else {
      setFareData(null);
      setFare("");
    }
  }, [pickup, destination]);

  const handleBookRide = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    if (!fareData) {
      alert("Please wait for fare calculation to complete");
      return;
    }

    try {
      await bookRide({
        pickup: fareData.pickup,
        destination: fareData.destination,
        fare: fareData.fare,
        distance: fareData.distanceKm,
      });

      setPickup("");
      setDestination("");
      setFare("");
      setFareData(null);
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

        <div className="text flex flex-col mt-4">
          <label className="text-white">Fare ({fareData?.currency || 'INR'})</label>
          <input
            className="border mt-3 w-90 placeholder-amber-50 bg-transparent px-3 py-2 text-white"
            type="text"
            placeholder={isCalculatingFare ? "Calculating..." : "Auto-calculated"}
            value={fare}
            readOnly
          />
          {fareData && (
            <div className="text-xs text-green-400 mt-1">
              Distance: {fareData.distanceKm} km • Auto-calculated
            </div>
          )}
          
          {/* Selected Coordinates Display */}
          {fareData && fareData.pickup && fareData.destination && (
            <div className="text-xs text-blue-300 mt-2 p-2 bg-gray-800 rounded">
              <div className="font-medium mb-1">📍 Selected Coordinates:</div>
              <div className="mb-1">
                <span className="text-yellow-400">Pickup:</span> {fareData.pickup.coordinates.lat.toFixed(6)}, {fareData.pickup.coordinates.lng.toFixed(6)}
              </div>
              <div>
                <span className="text-red-400">Destination:</span> {fareData.destination.coordinates.lat.toFixed(6)}, {fareData.destination.coordinates.lng.toFixed(6)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center m-4 bg-black"></div>
      </div>

      <button
        className="mt-8 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        onClick={handleBookRide}
        disabled={isLoading || isCalculatingFare || !fareData}
      >
        {isLoading ? "Booking..." : isCalculatingFare ? "Calculating..." : "Find rides"}
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

  return (
    <div>
      <MapDebug />
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
          
          {/* Coordinates Display */}
          {fareData && fareData.pickup && fareData.destination && (
            <div className="col-span-full">
              <CoordinatesDisplay
                pickupLocation={[
                  fareData.pickup.coordinates.lat,
                  fareData.pickup.coordinates.lng
                ]}
                destinationLocation={[
                  fareData.destination.coordinates.lat,
                  fareData.destination.coordinates.lng
                ]}
                className="mt-4"
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Map Integration */}
      <div className="min-h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-white">
        <RobustMap
          center={
            currentRide?.pickup?.coordinates
              ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
              : fareData?.pickup?.coordinates
              ? [fareData.pickup.coordinates.lat, fareData.pickup.coordinates.lng]
              : [28.6139, 77.2090] // default center (Delhi, India)
          }
          zoom={currentRide ? 15 : 12}
          userLocation={
            currentRide?.pickup?.coordinates
              ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
              : null
          }
          driverLocation={
            currentRide?.driver?.location
              ? [currentRide.driver.location.lat, currentRide.driver.location.lng]
              : null
          }
          pickupLocation={
            currentRide?.pickup?.coordinates
              ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
              : fareData?.pickup?.coordinates
              ? [fareData.pickup.coordinates.lat, fareData.pickup.coordinates.lng]
              : null
          }
          destinationLocation={
            currentRide?.destination?.coordinates
              ? [currentRide.destination.coordinates.lat, currentRide.destination.coordinates.lng]
              : fareData?.destination?.coordinates
              ? [fareData.destination.coordinates.lat, fareData.destination.coordinates.lng]
              : null
          }
          showRoute={!!currentRide || (fareData && fareData.pickup && fareData.destination)}
          rideStatus={rideStatus}
          height="500px"
        />
      </div>
    </div>
  );
};

export default Dashboard;
