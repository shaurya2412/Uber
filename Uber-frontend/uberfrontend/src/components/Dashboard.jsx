// Dashboard.jsx - Updated imports and state
import React, { useState, useEffect } from "react";
import Cardcomponent from "./Cardcomponent";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from "../zustand/useUserStore"; 


const Dashboard = () => {
  const { 
    currentRide, 
    rideHistory, 
    rideStatus, 
    isLoading, 
    error,
    bookRide, 
    fetchCurrentRide, 
    fetchRideHistory 
  } = useRideStore();
  
  const { isAuthenticated } = useUserStore();
  
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(15.50);
  
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
      const pickupCoords = { lat: 40.7128, lng: -74.006 };
      const destCoords = { lat: 40.7589, lng: -73.9851 };
      
      await bookRide({
        pickup: {
          address: pickup,
          coordinates: pickupCoords
        },
        destination: {
          address: destination,
          coordinates: destCoords
        },
        fare: fare
      });
      
      setPickup("");
      setDestination("");
      setFare(15.50);
      
    } catch (error) {
      console.error("Failed to book ride:", error);
    }
  };
  
  const renderRideForm = () => (
    <div className="bg-black p-4 mt-4 ml-4 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed">
      <div className="flex justify-between items-center mb-2">
        <p className="text-2xl font-bold flex flex-row mr-2">
          <p className="font-semibold mr-2">🚗</p>
          Book a new ride
        </p>
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
            onChange={(e) => setFare(parseFloat(e.target.value) || 15.50)}
            min="1"
            step="0.01"
          />
        </p>
        
        <div className="flex flex-col justify-center m-4 bg-black">
          {/* <p className="flex justify-between">
            Ride now 
            <button className="bg-transparent text-white border border-white px-3 py-1 rounded">
              Schedule
            </button>
          </p> */}
        </div>
      </div>
      
      <button 
        className="mt-8 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        onClick={handleBookRide}
        disabled={isLoading}
      >
        {isLoading ? "Booking..." : "Find rides"}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
  
  const renderRideTracking = () => (
    <div className="bg-black p-4 mt-4 ml-4 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed">
      <div className="flex justify-between items-center mb-2">
        <p className="text-2xl font-bold flex flex-row mr-2">
          <p className="font-semibold mr-2">🚗</p>
          Current Ride
        </p>
      </div>
      <currentRide/>
      
      {currentRide ? (
        <div className="text-white">
          <p><strong>Status:</strong> {currentRide.status}</p>
          <p><strong>Pickup:</strong> {currentRide.pickup.address}</p>
          <p><strong>Destination:</strong> {currentRide.destination.address}</p>
          <p><strong>Fare:</strong> ${currentRide.fare}</p>
        </div>
      ) : (
        <p className="text-white">No active ride</p>
      )}
    </div>
  );
    return (
    <div>
      <div className="bg-black min-h-screen flex items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Cardcomponent 
            t1="Total Rides" 
            t2="��" 
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
            t2="��" 
            t3="This month" 
            t4={`$${rideHistory.reduce((sum, ride) => sum + (ride.fare || 0), 0).toFixed(2)}`} 
          />
          
          {rideStatus === 'idle' || rideStatus === 'searching' ? (
            renderRideForm()
          ) : (
            renderRideTracking()
          )}
          
          {currentRide && <Currentride />}
         <Currentride />
                    <RecentRides rides={rideHistory} />
        </div>
      </div>
      
      {/* Map Integration Placeholder */}
      <div className="min-h-[500px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium text-muted-foreground">Map Integration</div>
          <div className="text-sm text-muted-foreground">
            Integrate with Google Maps, Mapbox, or similar service for live tracking
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;