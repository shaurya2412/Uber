import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  Power,
  AlertTriangle,
  Radio,
  Car,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { useCaptainStore } from "../Zustand/useCaptainStore";
import { useRideStore } from "../Zustand/useRideStore";
import CaptainDashboardHeader from "./captaindashboardHeader";
import ChatWidget from "./ChatWidget";
import CountdownRing from "./ui/CountdownRing";
import RideStatusBadge from "./ui/RideStatusBadge";
import Toast from "./ui/Toast";
import { useSocket } from "../context/SocketContext";

const DRIVER_STAGES = [
  { key: "accepted", label: "1. Accepted" },
  { key: "driver_en_route", label: "2. Heading to Pickup" },
  { key: "arrived", label: "3. At Pickup (Verify PIN)" },
  { key: "in_ride", label: "4. On Trip" },
];

const getDriverStageIdx = (status) => {
  if (status === "accepted") return 0;
  if (status === "driver_en_route") return 1;
  if (status === "arrived") return 2;
  if (status === "in_ride" || status === "in_progress") return 3;
  return 0;
};

const CaptainDashboard = () => {
  const socket = useSocket();

  const {
    captain,
    active,
    toggleActive,
    availableRides,
    currentRide,
    rideHistory,
    fetchCaptainProfile,
    fetchAvailableRides,
    acceptRide,
    fetchCurrentRide,
    fetchRideHistory,
  } = useCaptainStore();

  const {
    finishRide,
    cancelRidecaptain,
    StartRide,
    setDriverEnRoute,
    setDriverArrived,
  } = useRideStore();

  const [otp, setOtp] = useState("");
  const [incomingRide, setIncomingRide] = useState(null);
  const [pendingActionModal, setPendingActionModal] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    fetchCaptainProfile();
    fetchAvailableRides();
    fetchCurrentRide();
    fetchRideHistory();
  }, [fetchCaptainProfile, fetchAvailableRides, fetchCurrentRide, fetchRideHistory]);

  useEffect(() => {
    if (!active || !socket) return;

    socket.emit("join_captains");

    const handleRideCreated = (rideData) => {
      setIncomingRide(rideData);
      fetchAvailableRides();
    };

    const handleRideCancelled = () => {
      setIncomingRide(null);
      fetchCurrentRide();
      fetchAvailableRides();
    };

    const handleRideAccepted = () => {
      fetchAvailableRides();
      fetchCurrentRide();
    };

    socket.on("ride:created", handleRideCreated);
    socket.on("ride:cancelled", handleRideCancelled);
    socket.on("ride:accepted", handleRideAccepted);
    socket.on("ride:updated", fetchCurrentRide);

    return () => {
      socket.off("ride:created", handleRideCreated);
      socket.off("ride:cancelled", handleRideCancelled);
      socket.off("ride:accepted", handleRideAccepted);
      socket.off("ride:updated", fetchCurrentRide);
    };
  }, [active, socket, fetchAvailableRides, fetchCurrentRide]);

  useEffect(() => {
    if (!active) return;
    fetchAvailableRides();
    const interval = setInterval(() => {
      fetchAvailableRides();
    }, 3000);
    return () => clearInterval(interval);
  }, [active, fetchAvailableRides]);

  useEffect(() => {
    if (socket && currentRide?._id) {
      socket.emit("join_ride", currentRide._id);
    }
  }, [socket, currentRide?._id]);

  // Sub-4-second GPS location stream
  useEffect(() => {
    if (!active || !socket) return;

    let watchId = null;
    const emitPosition = (latitude, longitude, heading = 0, speed = 0) => {
      socket.emit("location:update", {
        latitude,
        longitude,
        lat: latitude,
        lng: longitude,
        heading,
        speed,
        rideId: currentRide?._id || null,
        captainId: captain?._id,
      });
    };

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          emitPosition(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.heading || 0,
            pos.coords.speed || 0
          );
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
      );
    }

    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            emitPosition(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.heading || 0,
              pos.coords.speed || 0
            );
          },
          () => {},
          { timeout: 3500 }
        );
      }
    }, 3500);

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(interval);
    };
  }, [active, socket, currentRide?._id, captain?._id]);

  const handleAcceptIncoming = async (rideToAccept) => {
    try {
      await acceptRide(rideToAccept._id);
      showToast("Trip accepted! Head toward the pickup spot.", "success");
      setIncomingRide(null);
      await Promise.all([fetchCurrentRide(), fetchAvailableRides()]);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not accept trip", "error");
      setIncomingRide(null);
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingActionModal || !currentRide) return;
    const { type } = pendingActionModal;
    setPendingActionModal(null);

    try {
      if (type === "en_route") {
        await setDriverEnRoute(currentRide._id);
        showToast("Status updated: Heading to pickup", "info");
      } else if (type === "arrived") {
        await setDriverArrived(currentRide._id);
        showToast("Marked arrived. Ask the rider for their 4-digit PIN.", "success");
      } else if (type === "start") {
        if (!otp || otp.length < 4) {
          showToast("Enter the rider's 4-digit PIN first", "warning");
          return;
        }
        await StartRide(currentRide._id, otp);
        setOtp("");
        showToast("PIN verified! Trip started.", "success");
      } else if (type === "finish") {
        await finishRide(currentRide._id);
        showToast("Trip completed! Fare added to your earnings.", "success");
      } else if (type === "cancel") {
        await cancelRidecaptain(currentRide._id);
        showToast("Trip cancelled", "info");
      }
      await Promise.all([fetchCurrentRide(), fetchRideHistory(), fetchAvailableRides()]);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const sparklineData = [
    { day: "Mon", amount: 1420 },
    { day: "Tue", amount: 1680 },
    { day: "Wed", amount: 1590 },
    { day: "Thu", amount: 1890 },
    { day: "Fri", amount: 2440 },
    { day: "Sat", amount: 2850 },
    { day: "Sun", amount: 2400 },
  ];

  const totalEarnings = (rideHistory || []).reduce(
    (acc, t) => acc + (Number(t?.fare) || 0),
    0
  );

  const stageIdx = currentRide ? getDriverStageIdx(currentRide.status) : 0;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <CaptainDashboardHeader />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <main className="max-w-7xl mx-auto p-5 lg:p-8 space-y-8">
        {/* TOP ROW: DUTY SWITCH + EARNINGS + WEEKLY CHART */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* 1. Online/Offline Switch */}
          <div className="md:col-span-4 rounded-2xl bg-[#121215] p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Duty Status
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  active ? "bg-[#10B981] animate-ping" : "bg-[#52525B]"
                }`}
              />
            </div>

            <div className="py-5 space-y-1">
              <p className="text-2xl font-extrabold tracking-tight text-[#FAFAFA]">
                {active ? "Online — Accepting Trips" : "Currently Offline"}
              </p>
              <p className="text-xs text-[#A1A1AA]">
                {active
                  ? "Showing you nearby requests with upfront drop-off & fare."
                  : "Switch online whenever you’re ready to take bookings."}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={toggleActive}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-[#10B981] text-[#09090B]"
                  : "bg-[#FAFAFA] text-[#09090B] hover:bg-white"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{active ? "Go Offline" : "Go Online"}</span>
            </motion.button>
          </div>

          {/* 2. Earnings Summary */}
          <div className="md:col-span-4 rounded-2xl bg-[#121215] p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#A1A1AA]">
              <span className="text-xs font-mono uppercase tracking-wider">Completed Earnings</span>
              <DollarSign className="w-4 h-4 text-[#10B981]" />
            </div>

            <div className="py-4">
              <span className="text-4xl font-extrabold font-mono text-[#FAFAFA] tabular-nums">
                ₹{totalEarnings.toFixed(2)}
              </span>
              <p className="text-xs text-[#A1A1AA] mt-1.5 flex items-center gap-2">
                <span className="text-[#10B981] font-semibold">
                  {(rideHistory || []).length} trips completed
                </span>
                <span>•</span>
                <span>4.92 ★ Partner Rating</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#09090B] border border-white/[0.07] flex justify-between text-xs">
              <span className="text-[#A1A1AA]">Settlement</span>
              <span className="font-mono font-semibold text-[#10B981]">Direct UPI / Bank</span>
            </div>
          </div>

          {/* 3. Weekly Chart */}
          <div className="md:col-span-4 rounded-2xl bg-[#121215] p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">7-Day Earnings</span>
              <Clock className="w-4 h-4 text-[#FAFAFA]" />
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090B",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <XAxis dataKey="day" stroke="#52525B" tick={{ fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#emeraldGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-[#A1A1AA] pt-2">
              Zero platform commission cuts on airport drops
            </p>
          </div>
        </section>

        {/* ACTIVE TRIP OR NEARBY REQUESTS */}
        <section className="space-y-6">
          {currentRide ? (
            <motion.div
              key={currentRide.status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[#121215] p-6 lg:p-8 border border-white/[0.1] space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981]">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#FAFAFA]">Current Trip</h2>
                    <p className="text-xs font-mono text-[#A1A1AA]">
                      Booking #{currentRide._id?.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <RideStatusBadge status={currentRide.status} />
              </div>

              {/* Animated 4-Stage Driver Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DRIVER_STAGES.map((st, idx) => {
                  const isDone = idx <= stageIdx;
                  const isCurrent = idx === stageIdx;
                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-[#09090B] border-[#10B981] text-[#FAFAFA]"
                          : isDone
                          ? "bg-[#09090B]/60 border-white/[0.1] text-[#10B981]"
                          : "bg-[#09090B]/30 border-white/[0.05] text-[#52525B]"
                      }`}
                    >
                      <span>{st.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Rider & Route Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-white/[0.1] flex items-center justify-center font-extrabold text-base text-[#FAFAFA]">
                    {(currentRide.user?.fullname?.firstname || "R").slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-[#FAFAFA]">
                      {currentRide.user?.fullname?.firstname || "Rider"}{" "}
                      {currentRide.user?.fullname?.lastname || ""}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-[#FAFAFA]">4.9 ★</span>
                      <span>• Verified Account</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FAFAFA] shrink-0" />
                    <span className="text-[#A1A1AA]">Pickup:</span>
                    <span className="font-semibold text-[#FAFAFA] truncate">
                      {currentRide.pickup?.address || "Pickup Point"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span className="text-[#A1A1AA]">Drop-off:</span>
                    <span className="font-semibold text-[#FAFAFA] truncate">
                      {currentRide.destination?.address || "Destination"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/[0.07]">
                    <span className="text-[#A1A1AA]">Trip Payout</span>
                    <span className="font-mono font-bold text-sm text-[#10B981]">
                      ₹{Number(currentRide.fare || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {currentRide.status === "accepted" && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "en_route",
                        title: "Head to Pickup",
                        desc: "Let the rider know you are on the way to their pickup point.",
                      })
                    }
                    className="px-6 py-3.5 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    1. Mark Heading to Pickup
                  </motion.button>
                )}

                {currentRide.status === "driver_en_route" && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "arrived",
                        title: "Confirm Arrival at Pickup",
                        desc: "Notify the rider that your car is waiting at the pickup spot.",
                      })
                    }
                    className="px-6 py-3.5 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    2. I’ve Arrived at Pickup
                  </motion.button>
                )}

                {(currentRide.status === "arrived" || currentRide.status === "accepted") && (
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="4-digit PIN"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-36 p-3 rounded-xl bg-[#09090B] border border-white/[0.15] text-center font-mono text-sm font-bold text-[#FAFAFA] focus:outline-none focus:border-[#10B981]"
                    />
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setPendingActionModal({
                          type: "start",
                          title: "Verify PIN & Start Trip",
                          desc: `Verify rider PIN (${otp || "not entered"}) and begin the trip.`,
                        })
                      }
                      className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Verify PIN & Start
                    </motion.button>
                  </div>
                )}

                {(currentRide.status === "in_ride" || currentRide.status === "in_progress") && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "finish",
                        title: "Complete Trip",
                        desc: "Confirm drop-off arrival and settle the trip fare.",
                      })
                    }
                    className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Complete Trip
                  </motion.button>
                )}

                {currentRide.status !== "completed" && (
                  <button
                    onClick={() =>
                      setPendingActionModal({
                        type: "cancel",
                        title: "Cancel Trip",
                        desc: "Are you sure you want to cancel this assigned trip?",
                      })
                    }
                    className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl bg-[#121215] p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#FAFAFA]">Nearby Ride Requests</h3>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  {(availableRides || []).length} open requests
                </span>
              </div>

              {!availableRides || availableRides.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#A1A1AA] border border-dashed border-white/[0.08] rounded-xl">
                  <Radio className="w-6 h-6 mx-auto mb-2 text-[#10B981] animate-pulse" />
                  <p className="font-medium text-[#FAFAFA]">Waiting for new ride requests nearby</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Requests within 5 km will pop up automatically with upfront payout.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRides.map((ride) => (
                    <motion.div
                      key={ride._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] hover:border-white/20 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 min-w-0 pr-3">
                          <p className="font-bold text-sm text-[#FAFAFA]">
                            {ride.user?.fullname?.firstname || "Rider"}
                          </p>
                          <p className="text-xs text-[#A1A1AA] truncate">
                            From: {ride.pickup?.address || "Pickup"}
                          </p>
                          <p className="text-xs text-[#FAFAFA] truncate">
                            To: {ride.destination?.address || "Destination"}
                          </p>
                        </div>
                        <span className="text-lg font-extrabold font-mono text-[#10B981] shrink-0">
                          ₹{Number(ride.fare || 0).toFixed(0)}
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAcceptIncoming(ride)}
                        className="w-full py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-white text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Accept Trip
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* INCOMING RIDE REQUEST MODAL */}
      <AnimatePresence>
        {incomingRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-[#121215] p-7 border border-white/[0.15] text-center space-y-5 shadow-2xl"
            >
              <div className="flex justify-center">
                <CountdownRing
                  duration={10}
                  size={96}
                  strokeWidth={5}
                  color="#10B981"
                  onTimeout={() => setIncomingRide(null)}
                />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#10B981]">
                  New Trip Request
                </span>
                <h2 className="text-3xl font-extrabold font-mono text-[#FAFAFA] mt-1">
                  ₹{Number(incomingRide.fare || 240).toFixed(0)}
                </h2>
                <p className="text-xs text-[#A1A1AA]">Upfront Locked Payout</p>
              </div>

              <div className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] space-y-2 text-left text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FAFAFA] shrink-0" />
                  <span className="text-[#A1A1AA]">Pickup:</span>
                  <span className="font-semibold text-[#FAFAFA] truncate">
                    {incomingRide.pickup?.address || "Pickup"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span className="text-[#A1A1AA]">Drop-off:</span>
                  <span className="font-semibold text-[#FAFAFA] truncate">
                    {incomingRide.destination?.address || "Destination"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setIncomingRide(null)}
                  className="py-3 rounded-xl bg-[#09090B] hover:bg-[#18181C] text-[#A1A1AA] hover:text-[#FAFAFA] border border-white/[0.1] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Pass
                </button>
                <button
                  onClick={() => handleAcceptIncoming(incomingRide)}
                  className="py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#09090B] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Accept Trip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-[#121215] p-6 border border-white/[0.12] text-center space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FAFAFA]">{pendingActionModal.title}</h3>
              <p className="text-xs text-[#A1A1AA]">{pendingActionModal.desc}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setPendingActionModal(null)}
                  className="py-2.5 rounded-xl bg-[#09090B] border border-white/[0.08] text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-white text-xs font-extrabold text-[#09090B] cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatWidget />
    </div>
  );
};

export default CaptainDashboard;
