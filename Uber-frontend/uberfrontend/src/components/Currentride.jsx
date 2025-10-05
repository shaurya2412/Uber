import React, { useEffect, useState } from 'react'
import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from '../Zustand/useUserStore';
const Currentride = () => {
  
    const { 
    currentRide, 
calculatetheprice,
    isLoading, 
    error,
    fetchCurrentRide, 
    cancelRideUser,
    cancelRide,
    bookRide
  } = useRideStore();
  const { isAuthenticated } = useUserStore();

  // Local state for booking when there is no active ride
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);

  // Helper to fetch coordinates (same as Dashboard)
  const getCoordinates = async (place) => {
    try {
      const API_KEY = "pk.d4d3cce23c00c2d9e20ac1070c22cc5d";
      const response = await fetch(`https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(place)}&format=json`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return null;
    }
  };
const handleBookRide = async () => {
  if (!pickup || !destination) return;

  try {
    const pickupCoords = await getCoordinates(pickup);
    const destCoords = await getCoordinates(destination);

    if (!pickupCoords || !destCoords) return;

   const fareData = await calculatetheprice(
      { lat: pickupCoords.lat, lng: pickupCoords.lng },
      { lat: destCoords.lat, lng: destCoords.lng }
    );
    console.log(fareData);

    if (!fareData?.fare) {
      console.error("❌ Fare calculation failed");
      return;
    }

    setFare(parseFloat(fareData.fare));

    await bookRide({
      pickup: { address: pickup, lat: pickupCoords.lat, lng: pickupCoords.lng },
      destination: {
        address: destination,
        lat: destCoords.lat,
        lng: destCoords.lng,
      },
      fare: fareData.fare,
    });

      setPickup("");
    setDestination("");
    setFare(0);
  } catch (err) {
    console.error("Failed to book ride:", err);
  }
};


  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide]);



  console.log("current ride display: ",currentRide);

  if (!currentRide) {
    return (
      <div className="rounded-2xl m-4 border border-gray-100 bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              Book a new rides
            </h3>
            <button 
              onClick={fetchCurrentRide}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 h-8 px-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="flex flex-col">
            <input
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Starting ride from"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            <input
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Final Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <input
  className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-100 text-gray-900 px-4 py-3 focus:outline-none"
  type="number"
  placeholder="Fare (INR)"
  value={fare}
  readOnly
/>
            <input
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              placeholder="Fare (USD)"
              value={fare}
              onChange={(e) => setFare(parseFloat(e.target.value))}
              min="1"
              step="0.01"
            />
          </div>
          <button
            className="mt-5 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors w-full"
            onClick={handleBookRide}
            disabled={isLoading}
          >
            {isLoading ? 'Booking...' : 'Find rides'}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }


  // Helper function to get captain initials
  const getCaptainInitials = (captain) => {
    if (!captain?.fullname) return 'NA';
    const { firstname, lastname } = captain.fullname;
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper function to get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Searching';
      case 'accepted': return 'Accepted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return(
<div className="rounded-2xl ml-3 border border-gray-100 bg-white shadow-sm">
  <div className="p-5">
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.5-1.6h-1.1c-.9 0-1.7.5-2.1 1.4L14.6 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-3 2h-7a3 3 0 0 0-3 3" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="18" cy="17" r="2" /></svg>
        Current Ride
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600">{currentRide.captain ? 'Ride Accepted' : 'Searching driver'}</span>
        <button onClick={fetchCurrentRide} disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-white hover:border-gray-300 hover:bg-gray-50 text-white h-8 px-2 transition-colors disabled:opacity-50" title="Refresh ride status">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
        </button>
      </div>
    </div>

    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></span>
        <div>
          <div className="text-xs text-gray-500">Pickup</div>
          <div className="text-gray-900">{currentRide.pickup?.address || 'Pickup address'}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></span>
        <div>
          <div className="text-xs text-gray-500">Destination</div>
          <div className="text-gray-900">{currentRide.destination?.address || 'Destination address'}</div>
        </div>
      </div>
    </div>

    <div className="my-5 h-px bg-gray-100" />

    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500"><span>$</span><span>Est. Fare</span></div>
        <div className="text-lg font-semibold text-gray-900">${currentRide.fare?.toFixed(2) || '0.00'}</div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></svg><span>Est. Distance</span></div>
        <div className="text-lg font-semibold text-gray-900">{currentRide.distance || '—'}</div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Est. Time</span></div>
        <div className="text-lg font-semibold text-gray-900">{currentRide.eta || 'Calculating'}</div>
      </div>
    </div>

    <div className="my-5 h-px bg-gray-100" />

    {currentRide.captain ? (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 text-gray-700 items-center justify-center">
          {getCaptainInitials(currentRide.captain)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 flex items-center gap-2">
            {currentRide.captain.fullname?.firstname} {currentRide.captain.fullname?.lastname}
            <span className="inline-flex items-center text-xs text-gray-500 gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              {currentRide.captain.rating || '4.8'}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            {currentRide.captain.vehicle?.vehiclemodel} • {currentRide.captain.vehicle?.plate}
          </p>
        </div>  
      </div>
    ) : (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /><line x1="9" x2="15" y1="22" y2="22" /></svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Searching for driver...</p>
          <p className="text-sm text-gray-500">Please wait while we find you a ride</p>
        </div>
      </div>
    )}

    <div className="mt-4 rounded-xl bg-gray-50 text-gray-700 text-sm px-4 py-3 border border-gray-100">
      {currentRide.status === 'accepted' && (
        <span>Driver arriving in <span className="font-semibold">{currentRide.eta || 'a few minutes'}</span></span>
      )}
      {currentRide.status === 'pending' && (
        <span>Searching for drivers nearby...</span>
      )}
      {currentRide.status === 'in_progress' && (
        <span>Ride in progress</span>
      )}
      {currentRide.status === 'completed' && (
        <span>Ride completed</span>
      )}
    </div>

    <div className="mt-5 flex items-center gap-3">
      <button className="flex-1 inline-flex items-center justify-center rounded-xl bg-gray-900 text-white h-11 px-4 hover:bg-black transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        Call Driver
      </button>
      <button className="inline-flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 h-11 px-4 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Message
      </button>
      {currentRide.status === 'pending' && (
        <button onClick={() => cancelRideUser(currentRide._id)} disabled={isLoading} className="inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-700 h-11 px-4 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors disabled:opacity-50">
          Cancel
        </button>
      )}
    </div>
  </div>
</div>  )
}

export default Currentride