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
import { useRideStore } from "../Zustand/useRideStore";
import CaptainDashboardHeader from "./captaindashboardHeader";

// Card wrapper
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}>
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
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <CaptainDashboardHeader />
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* HERO STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Earnings - monochrome hero card */}
          <div className="col-span-2 bg-white rounded-3xl p-5 md:p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Today's Earnings
              </span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              ₹{totalEarnings}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Across {tripCount} trip{tripCount === 1 ? "" : "s"}
            </p>
          </div>

          {/* Rating - monochrome hero card */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Rating
              </span>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 tracking-tight">
              {averageRating}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Based on {tripCount} trip{tripCount === 1 ? "" : "s"}
            </p>
          </div>

          {/* Online status - monochrome card, colored dot only */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Status
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Availability</span>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 bg-white"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    active ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-gray-800">
                  {active ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* Available Rides */}
      <div className="mb-8">
        {!dataLoaded ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-200">
            <div className="text-gray-500 text-sm">Loading dashboard data...</div>
          </div>
        ) : (
          <Card className="shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
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
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
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

                    <p className="text-sm text-gray-700">
                      <strong>Pickup:</strong>{" "}
                      {ride?.pickup?.address || "—"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Destination:</strong>{" "}
                      {ride?.destination?.address || "—"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Fare:</strong> ₹
                      {Number(ride?.fare || 0).toFixed(2)}
                    </p>

                    <button
                      className="mt-3 w-full py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow-lg hover:bg-black disabled:opacity-60 transition-all"
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
                  className="mt-3 w-full py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm transition-colors"
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
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                Current Ride
              </h2>
              <span className="px-3 py-1 text-xs rounded-full border border-gray-200 bg-gray-100 text-gray-900">
                <span
                  className={
                    currentRide &&
                    (currentRide.status || rideStatus) === "accepted"
                      ? "text-green-600"
                      : currentRide &&
                        (currentRide.status || rideStatus) === "cancelled"
                      ? "text-red-600"
                      : ""
                  }
                >
                  {currentRide
                    ? currentRide.status || rideStatus || "In Progress"
                    : "No Active Ride"}
                </span>
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
                  <h3 className="text-gray-900 font-medium">
                    {currentRide.user.fullname.firstname || "Rider"}
                  </h3>
                  <p className="text-sm text-gray-900">
                    Ride ID: {currentRide?._id || currentRide?.id || "—"}
                  </p>
                </div>
              </div>
            ) : null}
            {currentRide ? (
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {currentRide?.pickup?.address ||
                      currentRide?.pickupAddress ||
                      "Pickup not set"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {currentRide?.dropoff?.address ||
                      currentRide?.destination?.address ||
                      currentRide?.dropoffAddress ||
                      "Dropoff not set"}
                  </p>
                </div>
              </div>
            ) : null}
            {currentRide ? (
              <div className="flex items-center justify-between text-sm text-gray-900 mb-4">
                {/* <span className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4" /> <p>{currentRide?.distance || currentRide?.estimatedDistance || "—"} km</p>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" /> <p>{Date.now() || "—"} min</p>
                </span> */}
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />{" "}
                  <p>
                    {Number(
                      currentRide?.fare ||
                        currentRide?.estimatedFare ||
                        0
                    ).toFixed(2)}
                  </p>
                </span>
              </div>
            ) : null}
            {rideError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {rideError}
              </div>
            )}
            <div className="flex space-x-3">

              {currentRide && currentRide.status === "accepted" && (
  <div className="mb-2">
    <label className="text-sm font-medium text-gray-900">Enter Ride OTP</label>
    <input
      type="text"
      maxLength={4}
      placeholder="1234"
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      className="w-full p-2 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
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
    className="px-4 py-2 rounded-md border border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-60 transition-colors"
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
      className="px-4 py-2 rounded-md border border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white disabled:opacity-60 transition-colors"
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
      className="px-4 py-2 rounded-md border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition-colors"
    >
      {rideLoading ? 'Canceling...' : 'Cancel Ride'}
    </button>
  )}
</div>

          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
              Recent Trips
            </h2>
            <div className="space-y-4">
              {(!rideHistory || rideHistory.length === 0) && (
                <div className="text-sm text-gray-500">No trips yet.</div>
              )}
              {rideHistory && rideHistory.map((trip, idx) => {
                const time = trip?.createdAt ? new Date(trip.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div
                    key={trip?._id || idx}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{
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
                      <p className="text-gray-900 font-medium">
                        ₹{Number(trip?.fare || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center justify-end">
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
         <Card className="shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
              Today's Summary
            </h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹
                  {Number(
                    (rideHistory || []).reduce(
                      (s, t) => s + (Number(t?.fare) || 0),
                      0
                    )
                  ).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Earnings</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {(rideHistory || []).length}
                </p>
                <p className="text-sm text-gray-500">Trips</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">6.5h</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{(() => {
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
              Weekly Earnings
            </h2>
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
                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e5e7eb",
                    borderRadius: 10,
                    color: "#111827",
                  }}
                />
                <Bar
                  dataKey="earnings"
                  fill="#111827"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

        {/*    */}
        </div>
      </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
