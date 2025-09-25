import React, { useEffect, useState } from "react";
import {
  Phone,
  MessageSquare,
  X,
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCaptainStore } from "../Zustand/useCaptainStore";
import { useRideStore } from "../Zustand/useRideStore";
import MagicBento from "./MagicBento";
import EnhancedMap from "./EnhancedMap";
const weeklyEarnings = [
  { day: "Mon", earnings: 120 },
  { day: "Tue", earnings: 95 },
  { day: "Wed", earnings: 140 },  
  { day: "Thu", earnings: 110 },
  { day: "Fri", earnings: 156 },
  { day: "Sat", earnings: 180 },
  { day: "Sun", earnings: 85 },
];

const recentTrips = [
  { name: "Mike Chen", time: "2:30 PM", id: "R123455", fare: 18.25, rating: 5 },
  { name: "Emma Davis", time: "1:45 PM", id: "R123454", fare: 32.1, rating: 4 },
  { name: "John Smith", time: "12:20 PM", id: "R123453", fare: 15.8, rating: 5 },
];

// Card wrapper
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
    {children}
  </div>
);

const CaptainDashboard = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const {captain,active, isAuthenticated, token,availableRides,
    currentRide,rideHistory,login,toggleActive ,fetchCaptainProfile, logout, fetchAvailableRides,acceptRide, fetchCurrentRide, fetchRideHistory} = useCaptainStore();

     const { 
      
        rideStatus, 
        isLoading, 
        error,
        bookRide 
      } = useRideStore();

  // Debug authentication state
  console.log('🔍 Dashboard - Auth state:', { 
    isAuthenticated, 
    hasToken: !!token, 
    hasCaptain: !!captain,
    active 
  });

  // Calculate values once to avoid recalculation on every render
  const totalEarnings = Number((rideHistory || []).reduce((s, t) => s + (Number(t?.fare) || 0), 0)).toFixed(2);
  const tripCount = (rideHistory || []).length;
  const averageRating = (() => {
    const trips = rideHistory || [];
    if (!trips.length) return '0.0';
    const total = trips.reduce((s, t) => s + (Number(t?.rating) || 0), 0);
    return (total / trips.length).toFixed(1);
  })();
  const recentTrip = rideHistory && rideHistory.length > 0 ? rideHistory[0] : null;

  // Captain-specific bento card data with rich content
  const captainBentoData = [
    {
      color: currentRide ? '#10b981' : '#6b7280',
      title: currentRide ? 'Active Ride' : 'No Active Ride',
      description: currentRide 
        ? `${currentRide?.pickup?.address || 'Pickup'} → ${currentRide?.destination?.address || 'Destination'}`
        : 'Waiting for next ride',
      label: currentRide ? 'In Progress' : 'Idle',
      extraInfo: currentRide ? `₹${Number(currentRide?.fare || 0).toFixed(2)}` : null
    },
    {
      color: '#3b82f6',
      title: 'Today\'s Revenue',
      description: `₹${totalEarnings} earned`,
      label: 'Earnings',
      extraInfo: `${tripCount} trips`
    },
    {
      color: '#8b5cf6',
      title: 'Recent Trip',
      description: recentTrip 
        ? `${recentTrip?.user?.fullname?.firstname || 'Rider'} ${recentTrip?.user?.fullname?.lastname || ''}`.trim()
        : 'No trips yet',
      label: 'Latest',
      extraInfo: recentTrip 
        ? `₹${Number(recentTrip?.fare || 0).toFixed(2)}`
        : null
    },
    {
      color: active ? '#10b981' : '#ef4444',
      title: 'Status',
      description: active ? 'Online and ready' : 'Offline',
      label: active ? 'Online' : 'Offline',
      extraInfo: active ? '6.5h today' : 'Inactive'
    },
    {
      color: '#f59e0b',
      title: 'Available Rides',
      description: `${availableRides?.length || 0} rides waiting for pickup`,
      label: 'Pending',
      extraInfo: availableRides?.length > 0 ? 'Tap to view' : 'None'
    },
    {
      color: '#ec4899',
      title: 'Performance',
      description: `${averageRating} avg rating`,
      label: 'Quality',
      extraInfo: `${tripCount} completed`
    }
  ];

       useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoaded(false);
        await Promise.all([
          fetchCaptainProfile(),
          fetchAvailableRides(),
          fetchCurrentRide(),
          fetchRideHistory()
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDataLoaded(true); // Still show the dashboard even if there's an error
      }
    };
    
    loadData();
  }, [fetchCaptainProfile, fetchAvailableRides, fetchCurrentRide, fetchRideHistory]);

  return (
     <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-semibold text-gray-600">Captain Dashboard</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Status:</span>


         <button
  onClick={async () => {
    if (isToggling) return;
    console.log('Toggle clicked, current active state:', active);
    setIsToggling(true);
    try {
      const result = await toggleActive();
      console.log('Toggle result:', result);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsToggling(false);
    }
  }}
  disabled={isToggling}
  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
    active ? "bg-green-500" : "bg-gray-400"
  } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
>
  <span
    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
      active ? "translate-x-6" : "translate-x-1"
    }`}
  />
</button>

          <span
            className={`flex items-center font-medium ${
              active ? "text-green-600" : "text-red-600"
            }`}
          >
            ● {active ? "Online" : "Offline"}
          </span>
          <img
            src="https://i.pravatar.cc/40"
            alt="Captain"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
        </div>
      </div>

      {/* Magic Bento Section */}
      <div className="mb-8">
        {!dataLoaded ? (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-2xl">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        ) : (
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
            cardData={captainBentoData}
          />
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Current Ride</h2>
              <span className={`px-3 py-1 text-xs rounded-full ${currentRide ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                {currentRide ? (currentRide.status || rideStatus || "In Progress") : "No Active Ride"}
              </span>
            </div>
            {currentRide ? (
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://i.pravatar.cc/100?img=5"
                  alt="Passenger"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-gray-800 font-medium">{currentRide?.rider?.name || currentRide?.user?.name || "Rider"}</h3>
                  <p className="text-sm text-gray-500">Ride ID: {currentRide?._id || currentRide?.id || "—"}</p>
                </div>
              </div>
            ) : null}
            {currentRide ? (
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-gray-700">{currentRide?.pickup?.address || currentRide?.pickupAddress || "Pickup not set"}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-gray-700">{currentRide?.dropoff?.address || currentRide?.destination?.address || currentRide?.dropoffAddress || "Dropoff not set"}</p>
                </div>
              </div>
            ) : null}
            {currentRide ? (
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4" /> <p>{currentRide?.distance || currentRide?.estimatedDistance || "—"} km</p>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" /> <p>{currentRide?.duration || currentRide?.estimatedDuration || "—"} min</p>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" /> <p>${Number(currentRide?.fare || currentRide?.estimatedFare || 0).toFixed(2)}</p>
                </span>
              </div>
            ) : null}
            <div className="flex space-x-3">
              <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Trips</h2>
            <div className="space-y-4">
              {(!rideHistory || rideHistory.length === 0) && (
                <div className="text-sm text-gray-500">No trips yet.</div>
              )}
              {rideHistory && rideHistory.map((trip, idx) => {
                const time = trip?.createdAt ? new Date(trip.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div
                    key={trip?._id || idx}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{
                          trip?.rider?.name ||
                          trip?.user?.name ||
                          (trip?.user?.fullname ? `${trip.user.fullname.firstname || ""} ${trip.user.fullname.lastname || ""}`.trim() : null) ||
                          "Rider"
                        }</p>
                        <p className="text-sm text-gray-500">
                          {time} • {trip?._id || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-medium">₹{Number(trip?.fare || 0).toFixed(2)}</p>
                      <p className="text-sm text-green-600 flex items-center justify-end">
                        <Star className="w-4 h-4 mr-1" /> {trip?.rating || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
         <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">₹{Number((rideHistory || []).reduce((s, t) => s + (Number(t?.fare) || 0), 0)).toFixed(2)}</p>
                <p className="text-sm text-gray-500">Earnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{(rideHistory || []).length}</p>
                <p className="text-sm text-gray-500">Trips</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">6.5h</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{(() => {
                  const trips = rideHistory || [];
                  if (!trips.length) return 0;
                  const total = trips.reduce((s, t) => s + (Number(t?.rating) || 0), 0);
                  return (total / trips.length).toFixed(1);
                })()}</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Earnings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(rideHistory && rideHistory.length) ? (() => {
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const map = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
                (rideHistory || []).forEach((trip) => {
                  const date = trip?.createdAt ? new Date(trip.createdAt) : null;
                  const d = date ? days[date.getDay()] : null;
                  if (d) map[d] += Number(trip?.fare) || 0;
                });
                return days.map((d) => ({ day: d, earnings: Number(map[d]?.toFixed?.(2) || map[d]) }));
              })() : [
                { day: "Mon", earnings: 0 },
                { day: "Tue", earnings: 0 },
                { day: "Wed", earnings: 0 },
                { day: "Thu", earnings: 0 },
                { day: "Fri", earnings: 0 },
                { day: "Sat", earnings: 0 },
                { day: "Sun", earnings: 0 },
              ]}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Go to Popular Area
              </button>
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Break Time
              </button>
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                View Analytics
              </button>
            </div>
          </Card>

          {/* Enhanced Map Integration for Captain Dashboard */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Location & Ride Map</h2>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
              <EnhancedMap
                center={
                  currentRide?.pickup?.coordinates
                    ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
                    : [28.6139, 77.209] // Default center (Delhi)
                }
                zoom={currentRide ? 15 : 12}
                userLocation={
                  currentRide?.pickup?.coordinates
                    ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
                    : null
                }
                driverLocation={
                  currentRide?.captain?.location || captain?.location
                    ? [currentRide?.captain?.location?.lat || captain?.location?.lat, 
                       currentRide?.captain?.location?.lng || captain?.location?.lng]
                    : null
                }
                pickupLocation={
                  currentRide?.pickup?.coordinates
                    ? [currentRide.pickup.coordinates.lat, currentRide.pickup.coordinates.lng]
                    : null
                }
                destinationLocation={
                  currentRide?.destination?.coordinates
                    ? [currentRide.destination.coordinates.lat, currentRide.destination.coordinates.lng]
                    : null
                }
                showRoute={!!currentRide}
                rideStatus={currentRide?.status || 'idle'}
              />
            </div>
            {currentRide && (
              <div className="mt-3 text-sm text-gray-600">
                <p>📍 Pickup: {currentRide?.pickup?.address || 'Location not set'}</p>
                <p>🎯 Destination: {currentRide?.destination?.address || 'Location not set'}</p>
                <p>🚗 Status: <span className="font-medium capitalize">{currentRide?.status || 'Unknown'}</span></p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
