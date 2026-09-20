import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Navigation, Download, Receipt, ExternalLink } from "lucide-react";
import { useRideStore } from "../Zustand/useRideStore";
import { API_BASE_URL } from "../config";
import RideStatusBadge from "./ui/RideStatusBadge";
import SkeletonLoader from "./ui/SkeletonLoader";

const API_BASE = API_BASE_URL;

const AllRides = () => {
  const { rideHistory, fetchRideHistory, isLoading, error } = useRideStore();
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchRideHistory();
  }, [fetchRideHistory]);

  const downloadReceipt = async (rideId) => {
    setDownloadingId(rideId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/rides/${rideId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download receipt");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus_ride_${rideId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not download receipt");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] selection:bg-[#7C3AED] selection:text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2E]">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-[#111118] hover:bg-[#1A1A24] border border-[#2D2D3F] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Ride History</h1>
              <p className="text-xs text-[#94A3B8]">Review and download receipts for all completed trips</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#111118] border border-[#2D2D3F] text-[#06B6D4]">
            {rideHistory?.length || 0} Total Trips
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <SkeletonLoader variant="card" className="h-28" />
            <SkeletonLoader variant="card" className="h-28" />
            <SkeletonLoader variant="card" className="h-28" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content list */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {rideHistory && rideHistory.length > 0 ? (
              rideHistory.map((ride, idx) => (
                <motion.div
                  key={ride._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card-elevated rounded-2xl p-5 border border-[#1E1E2E] hover:border-[#2D2D3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <RideStatusBadge status={ride.status || "completed"} />
                      <span className="text-xs text-[#94A3B8] font-mono">
                        {new Date(ride.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-[#94A3B8]">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                        <span className="text-[#F8FAFC] truncate font-medium">
                          {ride.pickup?.address || "Pickup"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#94A3B8]">
                        <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0" />
                        <span className="text-[#F8FAFC] truncate font-medium">
                          {ride.destination?.address || "Destination"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-1">
                      <span>
                        Fare: <strong className="text-[#10B981] font-mono">₹{Number(ride.fare || 0).toFixed(2)}</strong>
                      </span>
                      {ride.paymentId && (
                        <span className="font-mono truncate max-w-[200px] text-[#475569]">
                          ID: {ride.paymentId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => downloadReceipt(ride._id)}
                      disabled={downloadingId === ride._id}
                      className="px-3.5 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#2D2D3F] text-[#F8FAFC] text-xs font-semibold border border-[#2D2D3F] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className={`w-3.5 h-3.5 text-[#06B6D4] ${downloadingId === ride._id ? "animate-bounce" : ""}`} />
                      <span>{downloadingId === ride._id ? "Fetching..." : "Receipt PDF"}</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center text-[#94A3B8]">
                <Receipt className="w-10 h-10 mx-auto text-[#475569] mb-3" />
                <p className="font-semibold text-base text-[#F8FAFC]">No rides found</p>
                <p className="text-xs text-[#475569] mt-1">Book your first trip from the dashboard!</p>
                <Link
                  to="/dashboard"
                  className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold"
                >
                  Book a Ride
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRides;
