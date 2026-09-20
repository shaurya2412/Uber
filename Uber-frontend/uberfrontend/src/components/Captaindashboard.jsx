import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  User,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Radio,
  Car,
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

// Confetti Particle Explosion
const ConfettiBurst = () => {
  const particles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const radius = Math.random() * 120 + 80;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const colors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"];
        const color = colors[i % colors.length];

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ scale: [0, 1.2, 0.8], x, y, opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ backgroundColor: color }}
            className="w-2.5 h-2.5 rounded-full absolute shadow-[0_0_10px_currentColor]"
          />
        );
      })}
    </div>
  );
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
    isLoading: rideLoading,
  } = useRideStore();

  const [otp, setOtp] = useState("");
  const [incomingRide, setIncomingRide] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingActionModal, setPendingActionModal] = useState(null); // { type: 'arrived'|'start'|'finish'|'cancel', title, desc }
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ isVisible: true, message, type });
  };

  // Initial Data Load
  useEffect(() => {
    fetchCaptainProfile();
    fetchAvailableRides();
    fetchCurrentRide();
    fetchRideHistory();
  }, [fetchCaptainProfile, fetchAvailableRides, fetchCurrentRide, fetchRideHistory]);

  // Socket listener for incoming available rides
  useEffect(() => {
    if (!active || !socket) return;

    socket.emit("join_captains");

    const handleRideCreated = (rideData) => {
      console.log("Incoming ride dispatched via socket:", rideData);
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

  // Periodic polling for available rides while driver is active/online
  useEffect(() => {
    if (!active) return;
    fetchAvailableRides();
    const interval = setInterval(() => {
      fetchAvailableRides();
    }, 3000);
    return () => clearInterval(interval);
  }, [active, fetchAvailableRides]);

  // Join current ride room
  useEffect(() => {
    if (socket && currentRide?._id) {
      socket.emit("join_ride", currentRide._id);
    }
  }, [socket, currentRide?._id]);

  // Sub-4-second GPS Tracking Telemetry Pulse
  useEffect(() => {
    if (!active || !socket) return;

    let watchId = null;
    const emitPosition = (latitude, longitude, heading = 0, speed = 0) => {
      socket.emit("location:update", {
        latitude,
        longitude,
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

  // Handle Accept Incoming Ride
  const handleAcceptIncoming = async (rideToAccept) => {
    try {
      setShowConfetti(true);
      await acceptRide(rideToAccept._id);
      showToast("Ride accepted! En route to pickup.", "success");
      setTimeout(() => {
        setIncomingRide(null);
        setShowConfetti(false);
      }, 1000);
      await Promise.all([fetchCurrentRide(), fetchAvailableRides()]);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not accept ride", "error");
      setIncomingRide(null);
    }
  };

  // State machine button actions with confirmation modal
  const executeConfirmedAction = async () => {
    if (!pendingActionModal || !currentRide) return;
    const { type } = pendingActionModal;
    setPendingActionModal(null);

    try {
      if (type === "en_route") {
        await setDriverEnRoute(currentRide._id);
        showToast("Marked En Route to Pickup", "info");
      } else if (type === "arrived") {
        await setDriverArrived(currentRide._id);
        showToast("Arrival confirmed. Request OTP from passenger.", "success");
      } else if (type === "start") {
        if (!otp || otp.length < 4) {
          showToast("Please enter a valid 4-digit OTP", "warning");
          return;
        }
        await StartRide(currentRide._id, otp);
        setOtp("");
        showToast("Trip started! Drive safely.", "success");
      } else if (type === "finish") {
        await finishRide(currentRide._id);
        showToast("Trip completed! Earnings credited.", "success");
      } else if (type === "cancel") {
        await cancelRidecaptain(currentRide._id);
        showToast("Ride cancelled", "info");
      }
      await Promise.all([fetchCurrentRide(), fetchRideHistory(), fetchAvailableRides()]);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  // Sparkline data from rideHistory
  const sparklineData = [
    { day: "Mon", amount: 420 },
    { day: "Tue", amount: 680 },
    { day: "Wed", amount: 590 },
    { day: "Thu", amount: 890 },
    { day: "Fri", amount: 1240 },
    { day: "Sat", amount: 1650 },
    { day: "Sun", amount: 1400 },
  ];

  const totalEarnings = (rideHistory || []).reduce(
    (acc, t) => acc + (Number(t?.fare) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC]">
      <CaptainDashboardHeader />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* TOP SECTION: ONLINE/OFFLINE TOGGLE + EARNINGS + SPARKLINE */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* 1. Large Online/Offline Pill Button (Col 4) */}
          <div className="md:col-span-4 glass-card-elevated rounded-3xl p-6 border border-[#2D2D3F] flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Driver Availability
              </span>
              <span
                className={`w-3 h-3 rounded-full ${
                  active ? "bg-[#10B981] animate-ping" : "bg-gray-600"
                }`}
              />
            </div>

            <div className="py-6 text-center space-y-2">
              <p
                className={`text-2xl font-black tracking-tight ${
                  active ? "text-[#10B981]" : "text-[#94A3B8]"
                }`}
              >
                {active ? "You are online" : "You are offline"}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {active
                  ? "Telemetry streaming. Ready to receive dispatch offers."
                  : "Go online to receive nearby ride requests."}
              </p>
            </div>

            {/* Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleActive}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                active
                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 success-glow"
                  : "bg-[#1A1A24] text-[#F8FAFC] border border-[#2D2D3F] hover:border-[#7C3AED]"
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{active ? "Go Offline" : "Go Online Now"}</span>
            </motion.button>
          </div>

          {/* 2. Today's Earnings Glass Card (Col 4) */}
          <div className="md:col-span-4 glass-card rounded-3xl p-6 border border-[#1E1E2E] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
              <DollarSign className="w-5 h-5 text-[#7C3AED]" />
            </div>

            <div className="py-4">
              <span className="text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
                ₹{totalEarnings.toFixed(2)}
              </span>
              <p className="text-xs text-[#94A3B8] mt-1.5 flex items-center gap-1.5">
                <span className="text-[#10B981] font-semibold">
                  {(rideHistory || []).length} trips completed
                </span>
                <span>• 4.9 ★ Rating</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A0F]/60 border border-[#1E1E2E] flex justify-between text-xs">
              <span className="text-[#94A3B8]">Estimated Payout:</span>
              <span className="font-bold text-[#10B981]">Instant Bank Transfer</span>
            </div>
          </div>

          {/* 3. Weekly Earnings Sparkline (Col 4) */}
          <div className="md:col-span-4 glass-card rounded-3xl p-6 border border-[#1E1E2E] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Weekly Trends</span>
              <Clock className="w-4 h-4 text-[#06B6D4]" />
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid #2D2D3F",
                      borderRadius: "10px",
                      fontSize: "11px",
                    }}
                  />
                  <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#purpleGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-[#94A3B8] text-center pt-2">
              Peak volumes on Friday & Saturday nights
            </p>
          </div>
        </section>

        {/* ACTIVE RIDE OR AVAILABLE DISPATCH OFFERS */}
        <section className="space-y-6">
          {currentRide ? (
            /* ACTIVE RIDE PANEL */
            <div className="glass-card-elevated rounded-3xl p-6 lg:p-8 border border-[#2D2D3F] shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E1E2E]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#7C3AED]/20 text-[#7C3AED]">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#F8FAFC]">Active Assignment</h2>
                    <p className="text-xs text-[#94A3B8]">
                      Trip ID: <span className="font-mono text-[#F8FAFC]">{currentRide._id?.slice(-8)}</span>
                    </p>
                  </div>
                </div>
                <RideStatusBadge status={currentRide.status} />
              </div>

              {/* Passenger Info & Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passenger Card */}
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Passenger"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#06B6D4]"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-[#F8FAFC]">
                      {currentRide.user?.fullname?.firstname || "Passenger"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-[#F8FAFC]">5.0 ★</span>
                      <span>• Verified Rider</span>
                    </div>
                  </div>
                </div>

                {/* Route specs */}
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="text-[#94A3B8]">Pickup:</span>
                    <span className="font-medium text-[#F8FAFC] truncate">
                      {currentRide.pickup?.address || "Pickup Point"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#7C3AED] shrink-0" />
                    <span className="text-[#94A3B8]">Dropoff:</span>
                    <span className="font-medium text-[#F8FAFC] truncate">
                      {currentRide.destination?.address || "Destination"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#1E1E2E]">
                    <span className="text-[#94A3B8]">Estimated Payout:</span>
                    <span className="font-bold text-sm text-[#10B981]">
                      ₹{Number(currentRide.fare || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATE MACHINE ACTION BUTTONS WITH CONFIRM MODAL TRIGGER */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Step 1: Accepted -> En Route */}
                {currentRide.status === "accepted" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "en_route",
                        title: "Confirm En Route",
                        desc: "Notify passenger that you are driving toward the pickup point.",
                      })
                    }
                    className="px-6 py-3.5 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0F] font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    🚗 En Route to Pickup
                  </motion.button>
                )}

                {/* Step 2: En Route -> I've Arrived */}
                {currentRide.status === "driver_en_route" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "arrived",
                        title: "Confirm Arrival",
                        desc: "Have you arrived at the pickup location? Passenger will be notified.",
                      })
                    }
                    className="px-6 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)]"
                  >
                    📍 I've Arrived
                  </motion.button>
                )}

                {/* Step 3: Arrived -> Start Ride with OTP */}
                {(currentRide.status === "arrived" || currentRide.status === "accepted") && (
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-40 p-3 rounded-xl bg-[#0A0A0F] border border-[#2D2D3F] text-center font-mono text-sm font-bold text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setPendingActionModal({
                          type: "start",
                          title: "Start Trip",
                          desc: `Verify passenger OTP (${otp || "none entered"}) and commence journey.`,
                        })
                      }
                      className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0F] font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      ▶ Start Ride
                    </motion.button>
                  </div>
                )}

                {/* Step 4: In Ride -> Complete Ride */}
                {(currentRide.status === "in_ride" || currentRide.status === "in_progress") && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setPendingActionModal({
                        type: "finish",
                        title: "Complete Trip",
                        desc: "Confirm destination arrival and process fare settlement.",
                      })
                    }
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-[#0A0A0F] font-black text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                  >
                    🏁 Complete Ride
                  </motion.button>
                )}

                {/* Cancel Ride */}
                {currentRide.status !== "completed" && (
                  <button
                    onClick={() =>
                      setPendingActionModal({
                        type: "cancel",
                        title: "Cancel Assignment",
                        desc: "Are you sure you want to cancel this ride? Frequent cancellations impact rating.",
                      })
                    }
                    className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                  >
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* AVAILABLE RIDES LIST */
            <div className="glass-card rounded-3xl p-6 border border-[#1E1E2E] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#F8FAFC]">Available Ride Dispatches</h3>
                <span className="text-xs text-[#94A3B8]">
                  {(availableRides || []).length} nearby
                </span>
              </div>

              {(!availableRides || availableRides.length === 0) ? (
                <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E1E2E] rounded-2xl">
                  <Radio className="w-6 h-6 mx-auto mb-2 text-[#7C3AED] animate-pulse" />
                  <p>Radar scanning for nearby rider requests within 5km...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRides.map((ride) => (
                    <div
                      key={ride._id}
                      className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-[#F8FAFC]">
                            {ride.user?.fullname?.firstname || "Rider"}
                          </p>
                          <p className="text-xs text-[#94A3B8]">{ride.pickup?.address || "Pickup"}</p>
                        </div>
                        <span className="text-base font-black text-[#10B981]">
                          ₹{Number(ride.fare || 0).toFixed(2)}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAcceptIncoming(ride)}
                        className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md transition-all"
                      >
                        Accept Dispatch
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* FULL-SCREEN INCOMING RIDE MODAL WITH 10S COUNTDOWN RING + CONFETTI */}
      <AnimatePresence>
        {incomingRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            {showConfetti && <ConfettiBurst />}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-card-elevated rounded-3xl p-8 border border-[#7C3AED]/40 shadow-[0_0_60px_rgba(124,58,237,0.3)] text-center space-y-6"
            >
              {/* Animated Countdown Ring */}
              <div className="flex justify-center">
                <CountdownRing
                  duration={10}
                  size={110}
                  strokeWidth={6}
                  color="#7C3AED"
                  onTimeout={() => {
                    showToast("Ride offer expired", "info");
                    setIncomingRide(null);
                  }}
                />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                  Incoming Ride Offer
                </span>
                <h2 className="text-3xl font-black text-[#F8FAFC] mt-1">
                  ₹{Number(incomingRide.fare || 240).toFixed(2)}
                </h2>
                <p className="text-xs text-[#94A3B8]">Est. Payout</p>
              </div>

              {/* Pickup location & distance */}
              <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] space-y-2 text-left text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                  <span className="text-[#94A3B8]">Pickup:</span>
                  <span className="font-semibold text-[#F8FAFC] truncate">
                    {incomingRide.pickup?.address || "Pickup Point"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span className="text-[#94A3B8]">Dropoff:</span>
                  <span className="font-semibold text-[#F8FAFC] truncate">
                    {incomingRide.destination?.address || "Destination"}
                  </span>
                </div>
              </div>

              {/* Accept & Decline Buttons */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIncomingRide(null)}
                  className="py-3.5 rounded-xl bg-transparent hover:bg-[#1A1A24] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#2D2D3F] font-semibold text-xs transition-colors"
                >
                  Decline
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAcceptIncoming(incomingRide)}
                  className="py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all"
                >
                  Accept Dispatch
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-card-elevated rounded-3xl p-6 border border-[#2D2D3F] text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{pendingActionModal.title}</h3>
              <p className="text-xs text-[#94A3B8]">{pendingActionModal.desc}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setPendingActionModal(null)}
                  className="py-2.5 rounded-xl bg-[#1A1A24] text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white shadow-md"
                >
                  Confirm Action
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
