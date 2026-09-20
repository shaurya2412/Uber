import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Crosshair,
  Car,
  Zap,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  Receipt,
  Radio,
  Share2,
} from "lucide-react";
import { useRideStore } from "../Zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserstore";
import { useSocket } from "../context/SocketContext";
import UserDashboardHeader from "./userdashboardHeader";
import OSMMap from "./Map";
import MapContainer from "./ui/MapContainer";
import DriverCard from "./ui/DriverCard";
import RideStatusBadge from "./ui/RideStatusBadge";
import RatingStars from "./ui/RatingStars";
import BottomSheet from "./ui/BottomSheet";
import Toast from "./ui/Toast";
import ChatWidget from "./ChatWidget";

const getCoordinates = async (place) => {
  try {
    const API_KEY = "pk.d4d3cce23c00c2d9e20ac1070c22cc5d";
    const res = await fetch(
      `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(place)}&format=json`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (e) {
    console.error("Geocoding lookup notice:", e);
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const {
    currentRide,
    rideStatus,
    isLoading,
    error,
    bookRide,
    fetchCurrentRide,
    cancelRideUser,
    calculatetheprice,
    finishRideuser,
  } = useRideStore();

  const { isAuthenticated, user } = useUserStore();

  // Booking form states
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [baseFare, setBaseFare] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTier, setSelectedTier] = useState("economy");
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "info" });
  const [driverRating, setDriverRating] = useState(5);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(true);

  // Sync ride on load
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide]);

  // Socket room joining and updates
  useEffect(() => {
    if (!socket || !currentRide?._id) return;

    socket.emit("join_ride", currentRide._id);

    const handleUpdate = () => {
      fetchCurrentRide();
    };

    socket.on("ride:accepted", handleUpdate);
    socket.on("ride:updated", handleUpdate);
    socket.on("ride:status_changed", handleUpdate);
    socket.on("ride:cancelled", handleUpdate);

    return () => {
      socket.off("ride:accepted", handleUpdate);
      socket.off("ride:updated", handleUpdate);
      socket.off("ride:status_changed", handleUpdate);
      socket.off("ride:cancelled", handleUpdate);
      socket.emit("leave_ride", currentRide._id);
    };
  }, [socket, currentRide?._id, fetchCurrentRide]);

  const showToast = (message, type = "info") => {
    setToast({ isVisible: true, message, type });
  };

  // Use current GPS location
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPickupCoords({ lat, lng });
          setPickup(`Current GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          showToast("Location updated to GPS position", "success");
        },
        (err) => {
          showToast("Geolocation access denied or unavailable", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      showToast("Geolocation not supported by browser", "error");
    }
  };

  // Calculate fare
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
      showToast("Please enter both pickup and destination", "warning");
      return;
    }

    setIsCalculating(true);
    try {
      const pCoords = pickupCoords || (await getCoordinates(pickup)) || { lat: 28.6139, lng: 77.209 };
      const dCoords = destinationCoords || (await getCoordinates(destination)) || { lat: 28.5355, lng: 77.391 };

      setPickupCoords(pCoords);
      setDestinationCoords(dCoords);

      const result = await calculatetheprice(pCoords, dCoords);
      const computedFare = result?.fare || result?.estimatedFare || 250;
      setBaseFare(computedFare);
      showToast(`Fares updated! Select your ride tier.`, "info");
    } catch (err) {
      console.error("Fare error:", err);
      setBaseFare(280); // Sensible fallback
      showToast("Estimated standard fare applied", "info");
    } finally {
      setIsCalculating(false);
    }
  };

  // Book ride
  const handleConfirmRide = async () => {
    if (!selectedTier || baseFare === 0) {
      showToast("Please calculate fare and choose a ride tier", "warning");
      return;
    }

    setIsBooking(true);
    try {
      const pCoords = pickupCoords || { lat: 28.6139, lng: 77.209 };
      const dCoords = destinationCoords || { lat: 28.5355, lng: 77.391 };

      const tierMultiplier = selectedTier === "premium" ? 1.45 : selectedTier === "shared" ? 0.75 : 1.0;
      const finalFare = Math.round(baseFare * tierMultiplier);

      await bookRide({
        pickup: { address: pickup, coordinates: pCoords },
        destination: { address: destination, coordinates: dCoords },
        fare: finalFare,
        vehicleType: selectedTier === "shared" ? "auto" : "car",
      });

      showToast("Searching for nearby drivers...", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Booking request failed", "error");
    } finally {
      setIsBooking(false);
    }
  };

  // Normalized ride status for 6 distinct states
  const currentStatus = currentRide?.status?.toLowerCase() || "idle";

  // Tier cards data
  const tiers = [
    {
      id: "economy",
      name: "Nexus Economy",
      tag: "Everyday",
      desc: "Fast, reliable rides in modern sedans",
      price: Math.round(baseFare * 1.0) || 180,
      eta: "3 mins",
      icon: Car,
      color: "#06B6D4",
    },
    {
      id: "premium",
      name: "Nexus Black",
      tag: "VIP Luxury",
      desc: "Top-rated executive drivers in luxury EVs",
      price: Math.round(baseFare * 1.45) || 290,
      eta: "5 mins",
      icon: Zap,
      color: "#7C3AED",
    },
    {
      id: "shared",
      name: "Nexus Pool",
      tag: "Eco Saver",
      desc: "Share route with passengers & save 25%",
      price: Math.round(baseFare * 0.75) || 135,
      eta: "7 mins",
      icon: Users,
      color: "#10B981",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F8FAFC] flex flex-col overflow-hidden">
      <UserDashboardHeader />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      {/* Main Full-Screen Layout */}
      <div className="relative flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
        {/* LEFT DESKTOP SIDEBAR / PANEL */}
        <aside className="hidden lg:flex w-[420px] xl:w-[460px] bg-[#111118]/95 backdrop-blur-2xl border-r border-[#1E1E2E] flex-col z-20 shadow-[10px_0_40px_rgba(0,0,0,0.5)] overflow-y-auto">
          <div className="p-6 space-y-6 flex-1">
            {/* Header Status or Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  {currentRide ? "Live Trip Telemetry" : "Book Your Transit"}
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {currentRide ? `Session ID: ${currentRide._id?.slice(-8)}` : "High-speed dispatch network"}
                </p>
              </div>

              {currentRide && <RideStatusBadge status={currentStatus} />}
            </div>

            {/* RENDER CONTENT BASED ON ACTIVE STATE */}
            {!currentRide ? (
              /* --- STATE 0: BOOKING FORM & TIER SELECTION --- */
              <div className="space-y-5">
                {/* Inputs */}
                <div className="space-y-3 p-4 rounded-2xl bg-[#0A0A0F]/70 border border-[#1E1E2E]">
                  {/* Pickup */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
                        Pickup Point
                      </span>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-[#06B6D4] hover:underline flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Crosshair className="w-3 h-3" /> Use GPS
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Where should we pick you up?"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111118] border border-[#2D2D3F] text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                      <MapPin className="w-4 h-4 text-[#06B6D4] absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                      Drop-off Destination
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Where are you heading?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111118] border border-[#2D2D3F] text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                      <Navigation className="w-4 h-4 text-[#7C3AED] absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Calculate Fare Trigger */}
                  <button
                    onClick={handleCalculateFare}
                    disabled={isCalculating || !pickup || !destination}
                    className="w-full py-2.5 rounded-xl bg-[#1A1A24] hover:bg-[#2D2D3F] text-xs font-bold text-[#F8FAFC] border border-[#2D2D3F] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isCalculating ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Calculate Optimal Route & Fare</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3 Tier Cards (Economy | Premium | Shared) */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Available Vehicle Tiers
                  </p>

                  <div className="space-y-2.5">
                    {tiers.map((t) => {
                      const Icon = t.icon;
                      const isSelected = selectedTier === t.id;

                      return (
                        <motion.div
                          key={t.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedTier(t.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#1A1A24] border-[#7C3AED] shadow-[0_0_25px_rgba(124,58,237,0.25)]"
                              : "bg-[#0A0A0F]/60 border-[#1E1E2E] hover:border-[#2D2D3F]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2.5 rounded-xl"
                                style={{ backgroundColor: `${t.color}15` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: t.color }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-[#F8FAFC]">{t.name}</h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111118] border border-[#2D2D3F] text-[#94A3B8]">
                                    {t.tag}
                                  </span>
                                </div>
                                <p className="text-xs text-[#94A3B8]">{t.desc}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-base font-black text-[#F8FAFC]">₹{t.price}</p>
                              <p className="text-[11px] text-[#06B6D4] font-medium">{t.eta}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Ride CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmRide}
                  disabled={isBooking || baseFare === 0}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-95 text-white text-sm font-bold shadow-[0_0_30px_rgba(124,58,237,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isBooking ? "Broadcasting Request..." : `Confirm ${tiers.find(t => t.id === selectedTier)?.name}`}
                </motion.button>
              </div>
            ) : (
              /* --- STATE 1 TO 6: ACTIVE RIDE EXPERIENCES --- */
              <div className="space-y-6">
                {/* STATE 1: FINDING DRIVER */}
                {(currentStatus === "requested" || currentStatus === "pending") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-8 text-center space-y-6 rounded-3xl bg-[#0A0A0F]/80 border border-[#1E1E2E]"
                  >
                    {/* Pulsing Radar Animation */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full border border-[#7C3AED]/40 animate-radar-ring" />
                      <div className="absolute w-24 h-24 rounded-full border border-[#06B6D4]/40 animate-radar-ring [animation-delay:0.8s]" />
                      <div className="absolute w-24 h-24 rounded-full border border-[#7C3AED]/40 animate-radar-ring [animation-delay:1.6s]" />
                      <div className="w-16 h-16 rounded-full bg-[#1A1A24] border border-[#7C3AED] flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                        <Radio className="w-8 h-8 text-[#7C3AED] animate-pulse" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#F8FAFC]">Connecting with Nearby Drivers</h3>
                      <p className="text-xs text-[#94A3B8] max-w-xs mt-1">
                        Searching high-reputation vehicles within 5km radius via geospatial $nearSphere...
                      </p>
                    </div>

                    <div className="w-full p-3 rounded-xl bg-[#111118] border border-[#2D2D3F] flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Est. Pickup Fare:</span>
                      <span className="font-bold text-[#F8FAFC]">₹{Number(currentRide.fare || 0).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => cancelRideUser(currentRide._id)}
                      className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </motion.div>
                )}

                {/* STATE 2: DRIVER ACCEPTED */}
                {currentStatus === "accepted" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Checkmark Burst */}
                    <div className="p-3 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] text-[#0A0A0F] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#10B981]">Driver Assigned</p>
                        <p className="text-[11px] text-[#F8FAFC]">Your captain accepted your ride request</p>
                      </div>
                    </div>

                    <DriverCard
                      driver={currentRide.captain}
                      eta="4"
                      onCall={() => showToast(`Calling driver at ${currentRide.captain?.phone || "driver phone"}`)}
                      onChat={() => showToast("Opening driver encrypted chat stream")}
                    />

                    <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Pickup:</span>
                        <span className="text-[#F8FAFC] font-medium truncate max-w-[200px]">
                          {currentRide.pickup?.address || "Pickup Point"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Start Verification OTP:</span>
                        <span className="font-mono font-bold text-base text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-lg">
                          {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STATE 3: DRIVER EN ROUTE */}
                {currentStatus === "driver_en_route" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Moving Car animation path banner */}
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-[#1A1A24] border border-[#7C3AED]/40 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                          🚗 Driver En Route
                        </span>
                        <span className="text-xs font-mono font-bold text-[#06B6D4]">
                          Arriving in ~3 mins
                        </span>
                      </div>

                      {/* Animated track with moving car */}
                      <div className="relative h-3 w-full bg-[#0A0A0F] rounded-full overflow-hidden">
                        <motion.div
                          animate={{ x: ["0%", "85%"] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-0 left-0 w-8 h-full bg-[#06B6D4] rounded-full shadow-[0_0_12px_#06B6D4]"
                        />
                      </div>
                    </div>

                    <DriverCard
                      driver={currentRide.captain}
                      eta="2"
                      onCall={() => showToast("Calling driver")}
                      onChat={() => showToast("Opening chat")}
                    />

                    <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1E1E2E] flex justify-between items-center text-xs">
                      <span className="text-[#94A3B8]">Share OTP on boarding:</span>
                      <span className="font-mono text-sm font-black text-[#7C3AED]">
                        {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* STATE 4: DRIVER ARRIVED */}
                {currentStatus === "arrived" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981] text-[#0A0A0F] flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#10B981]">Your Driver Has Arrived!</h4>
                        <p className="text-xs text-[#F8FAFC]">Please board the vehicle at your pickup location.</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#111118] border border-[#2D2D3F] text-center space-y-2">
                      <p className="text-xs uppercase font-semibold text-[#94A3B8]">Boarding Verification OTP</p>
                      <p className="text-3xl font-black font-mono tracking-widest text-[#7C3AED]">
                        {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                      </p>
                      <p className="text-[11px] text-[#475569]">Give this 4-digit key to the driver to start trip</p>
                    </div>

                    <DriverCard driver={currentRide.captain} />
                  </motion.div>
                )}

                {/* STATE 5: IN RIDE */}
                {(currentStatus === "in_ride" || currentStatus === "in_progress") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-[#111118] border border-[#2D2D3F] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                          Trip in Progress
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8]">On Schedule</span>
                      </div>

                      {/* Route progress line */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#94A3B8]">
                          <span className="truncate max-w-[140px]">{currentRide.pickup?.address || "Pickup"}</span>
                          <span className="truncate max-w-[140px] text-right">{currentRide.destination?.address || "Destination"}</span>
                        </div>
                        <div className="h-2 w-full bg-[#0A0A0F] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "10%" }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981] rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <DriverCard driver={currentRide.captain} />
                  </motion.div>
                )}

                {/* STATE 6: COMPLETED */}
                {currentStatus === "completed" && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="p-5 rounded-3xl bg-[#111118] border border-[#2D2D3F] space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-[#F8FAFC]">Trip Completed</h3>
                      <p className="text-xs text-[#94A3B8]">Receipt and fare summary</p>
                    </div>

                    {/* Itemized Fare Receipt */}
                    <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] space-y-2.5 text-xs">
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Base Fare:</span>
                        <span className="text-[#F8FAFC]">₹50.00</span>
                      </div>
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Distance Charge:</span>
                        <span className="text-[#F8FAFC]">₹{Number(currentRide.fare * 0.7 || 140).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#94A3B8]">
                        <span>Platform & Surge:</span>
                        <span className="text-[#F8FAFC]">1.0x</span>
                      </div>
                      <div className="pt-2 border-t border-[#1E1E2E] flex justify-between font-bold text-sm text-[#F8FAFC]">
                        <span>Total Paid:</span>
                        <span className="text-[#10B981]">₹{Number(currentRide.fare || 210).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Interactive 5-Star Rating */}
                    <div className="text-center space-y-2">
                      <p className="text-xs font-semibold text-[#94A3B8]">Rate your driver</p>
                      <div className="flex justify-center">
                        <RatingStars rating={driverRating} onChange={setDriverRating} size={28} />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/order-confirmation", { state: { method: "Razorpay", paymentId: `NEX-${Date.now()}` } })}
                      className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                    >
                      View Receipt & Settlement
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT AREA: FULL-SCREEN MAP CONTAINER */}
        <main className="flex-1 h-full w-full relative">
          <MapContainer className="h-full w-full">
            <OSMMap
              center={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : [28.6139, 77.209]}
              zoom={13}
              userLocation={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : null}
              destinationLocation={destinationCoords ? [destinationCoords.lat, destinationCoords.lng] : null}
              driverLocation={
                currentRide?.driverLocation?.lat
                  ? [currentRide.driverLocation.lat, currentRide.driverLocation.lng]
                  : null
              }
              rideStatus={currentStatus}
            />
          </MapContainer>

          {/* MOBILE BOTTOM SHEET TRIGGER FOR SMALL SCREENS */}
          <div className="lg:hidden">
            <BottomSheet
              isOpen={isMobileSheetOpen}
              onClose={() => setIsMobileSheetOpen(false)}
              title={currentRide ? "Active Ride Telemetry" : "Book Nexus Ride"}
            >
              {!currentRide ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0A0A0F] border border-[#2D2D3F] text-sm text-[#F8FAFC]"
                  />
                  <input
                    type="text"
                    placeholder="Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0A0A0F] border border-[#2D2D3F] text-sm text-[#F8FAFC]"
                  />
                  <button
                    onClick={handleCalculateFare}
                    className="w-full py-3 rounded-xl bg-[#1A1A24] text-xs font-bold"
                  >
                    Calculate Fares
                  </button>
                  <button
                    onClick={handleConfirmRide}
                    className="w-full py-3.5 rounded-xl bg-[#7C3AED] text-sm font-bold text-white shadow-lg"
                  >
                    Confirm Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <RideStatusBadge status={currentStatus} />
                  <p className="text-sm font-bold text-[#F8FAFC]">
                    {currentStatus.replace(/_/g, " ").toUpperCase()}
                  </p>
                  {currentRide.otp && (
                    <p className="text-2xl font-mono font-black text-[#7C3AED]">
                      OTP: {currentRide.otp}
                    </p>
                  )}
                  {currentRide.captain && <DriverCard driver={currentRide.captain} />}
                </div>
              )}
            </BottomSheet>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default Dashboard;
