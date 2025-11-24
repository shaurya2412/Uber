import React, { useEffect, useState } from "react";
import {
  Phone,
  MessageSquare,
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCaptainStore } from "../Zustand/useCaptainStore";
import { useRideStore } from "../zustand/useRideStore";
import CaptainDashboardHeader from "./captaindashboardHeader";
// Card wrapper
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
    {children}
  </div>
);

const CaptainDashboard = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [otp, setOtp] = useState("");
  const [showAllAvailableRides, setShowAllAvailableRides] = useState(false);

  const {
    captain,
    active,
    isAuthenticated,
    token,
    availableRides,
    currentRide,
    rideHistory,
    login,
    fetchCaptainProfile,
    fetchAvailableRides,
    acceptRide,
    fetchCurrentRide,
    fetchRideHistory,
  } = useCaptainStore();

  const { finishRide, rideStatus, cancelRidecaptain, StartRide, isLoading: rideLoading, error: rideError } = useRideStore();

  console.log("🔍 Dashboard - Auth state:", {
    captain,
    isAuthenticated,
    hasToken: !!token,
    hasCaptain: !!captain,
    active,
  });
  console.log("Ride user:", availableRides?.[0]?.user?._id);
  console.log(currentRide)
  console.log(token);
  console.log(currentRide?._id);

  const totalEarnings = Number(
    (rideHistory || []).reduce((s, t) => s + (Number(t?.fare) || 0), 0)
  ).toFixed(2);
  const tripCount = (rideHistory || []).length;

  const averageRating = (() => {
    const trips = rideHistory || [];
    if (!trips.length) return "0.0";
    const total = trips.reduce((s, t) => s + (Number(t?.rating) || 0), 0);
    return (total / trips.length).toFixed(1);
  })();

  const recentTrip =
    rideHistory && rideHistory.length > 0 ? rideHistory[0] : null;

  useEffect(() => {
    console.log("Available rides:", availableRides);
  }, [availableRides]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoaded(false);
        await Promise.all([
          fetchCaptainProfile(),
          fetchAvailableRides(),
          fetchCurrentRide(),
          fetchRideHistory(),
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setDataLoaded(true); // Still show the dashboard even if there's an error
      }
    };

    loadData();
  }, [fetchCaptainProfile, fetchAvailableRides, fetchCurrentRide, fetchRideHistory]);

  // Auto-refresh polling - fetch latest status every 5 seconds
  useEffect(() => {
    if (!isAuthenticated || !active) return; // Only poll when captain is authenticated and active

    const pollInterval = setInterval(async () => {
      try {
        // Only refresh current ride and available rides (lightweight updates)
        await Promise.all([
          fetchCurrentRide(),
          fetchAvailableRides(),
        ]);
      } catch (error) {
        console.error("Error polling ride data:", error);
        // Don't spam errors for polling failures
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(pollInterval);
  }, [isAuthenticated, active, fetchCurrentRide, fetchAvailableRides]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <CaptainDashboardHeader />
      <div className="p-6">

      {/* Available Rides */}
      <div className="mb-8">
        {!dataLoaded ? (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-2xl">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Available Rides
            </h2>

            {(!availableRides || availableRides.length === 0) && (
              <div className="text-sm text-gray-500">
                No available rides right now.
              </div>
            )}

            <div className="space-y-3">
              {availableRides &&
                (showAllAvailableRides
                  ? availableRides
                  : availableRides.slice(0, 3)
                ).map((ride, idx) => (
                  <div
                    key={ride?._id || idx}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-800">
                        {ride?.user?.fullname
                          ? `${ride.user.fullname.firstname || ""} ${
                              ride.user.fullname.lastname || ""
                            }`.trim()
                          : "Unknown Rider"}
                      </p>
                      <span className="text-xs text-gray-500">
                        Ride ID: {ride?._id || "—"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      <strong>Pickup:</strong>{" "}
                      {ride?.pickup?.address || "—"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Destination:</strong>{" "}
                      {ride?.destination?.address || "—"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fare:</strong> ₹
                      {Number(ride?.fare || 0).toFixed(2)}
                    </p>

                    <button
                      className="mt-2 w-full py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                      onClick={async () => {
                        try {
                          await acceptRide(ride._id);
                          // Immediately refresh data after accepting
                          await Promise.all([
                            fetchAvailableRides(),
                            fetchCurrentRide(),
                            fetchRideHistory()
                          ]);
                        } catch (error) {
                          console.error('Failed to accept ride:', error);
                          alert('Failed to accept ride: ' + (error.response?.data?.message || error.message));
                        }
                      }}
                     
                    >
                      Accept Ride
                    </button>
                  </div>
                ))}

              {availableRides && availableRides.length > 3 && (
                <button
                  onClick={() =>
                    setShowAllAvailableRides(!showAllAvailableRides)
                  }
                  className="mt-3 w-full py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {showAllAvailableRides
                    ? "See Less"
                    : "See All Rides"}
                </button>
              )}
            </div>
          </Card>
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
                  <h3 className="text-gray-800 font-medium">{currentRide.user.fullname.firstname || "Rider"}</h3>
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
                {/* <span className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4" /> <p>{currentRide?.distance || currentRide?.estimatedDistance || "—"} km</p>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" /> <p>{Date.now() || "—"} min</p>
                </span> */}
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" /> <p>{Number(currentRide?.fare || currentRide?.estimatedFare || 0).toFixed(2)}</p>
                </span>
              </div>
            ) : null}
            {rideError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {rideError}
              </div>
            )}
            <div className="flex space-x-3">

              {currentRide && currentRide.status === "accepted" && (
  <div className="mb-2">
    <label className="text-sm font-medium">Enter Ride OTP</label>
    <input
      type="text"
      maxLength={4}
      placeholder="1234"
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      className="w-full p-2 mt-1 border rounded-lg"
    />
  </div>
)}

{currentRide && currentRide.status === "accepted" && (
  <button
    onClick={async () => {
      try {
        if (!otp || otp.length < 4) {
          alert("Please enter a valid 4-digit OTP");
          return;
        }

        await StartRide(currentRide._id, otp);
        // Immediately refresh to show updated status
        await Promise.all([
          fetchCurrentRide(),
          fetchAvailableRides()
        ]);
        setOtp(""); // Clear OTP input after successful start
      } catch (error) {
        console.error("Failed to start ride:", error);
        alert("Failed to start ride: " + (error.response?.data?.message || error.message));
      }
    }}
    disabled={rideLoading}
    className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
  >
    {rideLoading ? "Starting..." : "Start Ride"}
  </button>
)}

  {/* Start Ride */}
  {/* {currentRide && currentRide.status === "accepted" && (
    <button
      onClick={async () => {
        try {
          await StartRide(currentRide._id);
          // Refresh the current ride after starting
          await fetchCurrentRide();
        } catch (error) {
          console.error('Failed to start ride:', error);
          alert('Failed to start ride: ' + (error.response?.data?.message || error.message));
        }
      }}
      disabled={rideLoading}
      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
    >
      {rideLoading ? 'Starting...' : 'Start Ride'}
    </button>
  )} */}

  {currentRide && currentRide.status === "in_progress" && (
    <button
      onClick={async () => {
        try {
          await finishRide(currentRide._id);
          // Immediately refresh all data after finishing
          await Promise.all([
            fetchCurrentRide(),
            fetchRideHistory(),
            fetchAvailableRides()
          ]);
        } catch (error) {
          console.error('Failed to finish ride:', error);
          alert('Failed to finish ride: ' + (error.response?.data?.message || error.message));
        }
      }}
      disabled={rideLoading}
      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
    >
      {rideLoading ? 'Finishing...' : 'Finish Ride'}
    </button>
  )}

  {/* Cancel Ride */}
  {currentRide && currentRide.status !== "completed" && (
    <button
      onClick={async () => {
        try {
          await cancelRidecaptain(currentRide._id);
          // Immediately refresh all data after canceling
          await Promise.all([
            fetchCurrentRide(),
            fetchAvailableRides(),
            fetchRideHistory()
          ]);
        } catch (error) {
          console.error('Failed to cancel ride:', error);
          alert('Failed to cancel ride: ' + (error.response?.data?.message || error.message));
        }
      }}
      disabled={rideLoading}
      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
    >
      {rideLoading ? 'Canceling...' : 'Cancel Ride'}
    </button>
  )}
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
        </div>
      </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
