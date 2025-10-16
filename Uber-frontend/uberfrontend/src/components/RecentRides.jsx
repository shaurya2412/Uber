import React, { useEffect } from "react";
import { useRideStore } from "../zustand/useRideStore";

const RecentRides = () => {
  const {
    rideHistory,
    fetchRideHistory,
    isLoading,
    error,
  } = useRideStore();

  // Fetch history if empty
  useEffect(() => {
    if (!rideHistory || rideHistory.length === 0) {
      fetchRideHistory();
    }
  }, [fetchRideHistory, rideHistory]);

  if (isLoading) {
    return (
      <div className="rounded-2xl m-4 bg-white p-6 text-center text-gray-500">
        Loading recent rides...
      </div>
    );
  }

 

  if (!rideHistory || rideHistory.length === 0) {
    return (
      <div className="rounded-2xl m-4 bg-white p-6 text-center text-gray-500">
        No recent rides found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl m-4 bg-white/95 backdrop-blur shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">Recent Rides</h3>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-white h-9 px-3 transition-colors">
          View All
        </button>
      </div>

      {/* Ride List */}
      <div className="p-5 pt-0 space-y-3">
        {rideHistory.slice(0, 5).map((ride) => (
          <div
            key={ride._id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow cursor-pointer"
          >
            {/* Left side (Ride Info) */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                {new Date(ride.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div className="space-y-1">
                {/* Pickup */}
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-green-600"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="capitalize text-gray-700">{ride.pickup?.address || "—"}</span>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-red-600"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="capitalize text-black">
                    {ride.destination?.address || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side (Fare + Status) */
            }
            <div className="text-right space-y-1">
              <p className="font-semibold text-gray-900">
                ₹{ride.fare?.toFixed(2)}
              </p>
              <p
                className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                  ride.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : ride.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {ride.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentRides;
