import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Crosshair,
  Car,
  Zap,
  Users,
  CheckCircle2,
  Radio,
  ArrowRight,
  ArrowUpDown,
  Lock,
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

const QUICK_ROUTES = [
  {
    label: "CP → IGI T3",
    pickup: "Connaught Place, New Delhi",
    destination: "IGI Airport Terminal 3, New Delhi",
    pCoords: { lat: 28.6315, lng: 77.2167 },
    dCoords: { lat: 28.5562, lng: 77.1 },
  },
  {
    label: "Hauz Khas → CyberHub",
    pickup: "Hauz Khas Village, New Delhi",
    destination: "DLF CyberHub, Gurugram",
    pCoords: { lat: 28.5494, lng: 77.2001 },
    dCoords: { lat: 28.495, lng: 77.0895 },
  },
  {
    label: "Indiranagar → MG Road",
    pickup: "100 Feet Rd, Indiranagar, Bengaluru",
    destination: "MG Road Metro, Bengaluru",
    pCoords: { lat: 12.9784, lng: 77.6408 },
    dCoords: { lat: 12.9756, lng: 77.6066 },
  },
];

const RIDE_STAGE_STEPS = [
  { key: "requested", label: "Matching" },
  { key: "accepted", label: "Assigned" },
  { key: "driver_en_route", label: "En Route" },
  { key: "arrived", label: "At Pickup" },
  { key: "in_ride", label: "On Trip" },
  { key: "completed", label: "Arrived" },
];

const getStageIndex = (status) => {
  switch (status) {
    case "pending":
    case "requested":
      return 0;
    case "accepted":
      return 1;
    case "driver_en_route":
      return 2;
    case "arrived":
      return 3;
    case "in_ride":
    case "in_progress":
      return 4;
    case "completed":
      return 5;
    default:
      return 0;
  }
};

const parseLatLngPair = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/[()]/g, "").trim();
  const parts = cleaned.split(",").map((s) => parseFloat(s.trim()));
  if (
    parts.length === 2 &&
    !Number.isNaN(parts[0]) &&
    !Number.isNaN(parts[1]) &&
    parts[0] >= -90 &&
    parts[0] <= 90 &&
    parts[1] >= -180 &&
    parts[1] <= 180
  ) {
    return { lat: Number(parts[0].toFixed(4)), lng: Number(parts[1].toFixed(4)) };
  }
  return null;
};

const getCoordinates = async (place) => {
  const directCoord = parseLatLngPair(place);
  if (directCoord) return directCoord;

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
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  const {
    currentRide,
    bookRide,
    fetchCurrentRide,
    cancelRideUser,
    calculatetheprice,
  } = useRideStore();

  const { isAuthenticated } = useUserStore();

  // Initialize with two coordinates (from router state if navigated from Launchpage, or Delhi NCR default)
  const initialP = location.state?.pickupCoords || { lat: 28.6315, lng: 77.2167 };
  const initialD = location.state?.destinationCoords || { lat: 28.5562, lng: 77.1 };

  const [pickup, setPickup] = useState(
    location.state?.pickup || "Connaught Place, New Delhi"
  );
  const [destination, setDestination] = useState(
    location.state?.destination || "IGI Airport Terminal 3, New Delhi"
  );
  const [pickupCoords, setPickupCoords] = useState(initialP);
  const [destinationCoords, setDestinationCoords] = useState(initialD);

  // Explicit Two-Coordinate inputs (Lat, Lng)
  const [coord1Input, setCoord1Input] = useState(`${initialP.lat}, ${initialP.lng}`);
  const [coord2Input, setCoord2Input] = useState(`${initialD.lat}, ${initialD.lng}`);
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: 16.4, durationMin: 29 });

  const [baseFare, setBaseFare] = useState(240);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTier, setSelectedTier] = useState(location.state?.selectedTier || "economy");
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "info" });
  const [driverRating, setDriverRating] = useState(5);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide]);

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

  // Update Coordinate 1 from input box
  const handleCoord1Change = (val) => {
    setCoord1Input(val);
    const parsed = parseLatLngPair(val);
    if (parsed) {
      setPickupCoords(parsed);
      setPickup(`Coord 1 (${parsed.lat}, ${parsed.lng})`);
    }
  };

  // Update Coordinate 2 from input box
  const handleCoord2Change = (val) => {
    setCoord2Input(val);
    const parsed = parseLatLngPair(val);
    if (parsed) {
      setDestinationCoords(parsed);
      setDestination(`Coord 2 (${parsed.lat}, ${parsed.lng})`);
    }
  };

  // Update Coordinate 1 when user clicks or drags on Map
  const handleMapPickupChange = (latLngArray) => {
    const next = { lat: latLngArray[0], lng: latLngArray[1] };
    setPickupCoords(next);
    setCoord1Input(`${next.lat}, ${next.lng}`);
    setPickup(`Coord 1 (${next.lat}, ${next.lng})`);
  };

  // Update Coordinate 2 when user clicks or drags on Map
  const handleMapDestChange = (latLngArray) => {
    const next = { lat: latLngArray[0], lng: latLngArray[1] };
    setDestinationCoords(next);
    setCoord2Input(`${next.lat}, ${next.lng}`);
    setDestination(`Coord 2 (${next.lat}, ${next.lng})`);
  };

  const handleSwapCoordinates = () => {
    if (!pickupCoords || !destinationCoords) return;
    const prevP = pickupCoords;
    const prevD = destinationCoords;
    const prevPText = pickup;
    const prevDText = destination;

    setPickupCoords(prevD);
    setDestinationCoords(prevP);
    setCoord1Input(`${prevD.lat}, ${prevD.lng}`);
    setCoord2Input(`${prevP.lat}, ${prevP.lng}`);
    setPickup(prevDText);
    setDestination(prevPText);
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setPickupCoords({ lat, lng });
          setCoord1Input(`${lat}, ${lng}`);
          setPickup(`Current GPS (${lat}, ${lng})`);
          showToast("Coordinate 1 pinned to your current GPS spot", "success");
        },
        () => {
          showToast("Location access is turned off in your browser", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      showToast("GPS not supported by this browser", "error");
    }
  };

  const applyQuickRoute = async (preset) => {
    setPickup(preset.pickup);
    setDestination(preset.destination);
    setPickupCoords(preset.pCoords);
    setDestinationCoords(preset.dCoords);
    setCoord1Input(`${preset.pCoords.lat}, ${preset.pCoords.lng}`);
    setCoord2Input(`${preset.dCoords.lat}, ${preset.dCoords.lng}`);
    setIsCalculating(true);
    try {
      const result = await calculatetheprice(preset.pCoords, preset.dCoords);
      setBaseFare(result?.fare || 240);
      showToast("Two-coordinate route plotted & upfront fare locked", "success");
    } catch {
      setBaseFare(260);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculateFare = async () => {
    const parsed1 = parseLatLngPair(coord1Input);
    const parsed2 = parseLatLngPair(coord2Input);

    if (!parsed1 && !pickup) {
      showToast("Enter Coordinate 1 or a pickup address", "warning");
      return;
    }
    if (!parsed2 && !destination) {
      showToast("Enter Coordinate 2 or a drop-off address", "warning");
      return;
    }

    setIsCalculating(true);
    try {
      const pCoords = parsed1 || (await getCoordinates(pickup)) || pickupCoords || { lat: 28.6139, lng: 77.209 };
      const dCoords = parsed2 || (await getCoordinates(destination)) || destinationCoords || { lat: 28.5355, lng: 77.391 };

      setPickupCoords(pCoords);
      setDestinationCoords(dCoords);
      setCoord1Input(`${pCoords.lat}, ${pCoords.lng}`);
      setCoord2Input(`${dCoords.lat}, ${dCoords.lng}`);

      const result = await calculatetheprice(pCoords, dCoords);
      const computedFare =
        result?.fare ||
        result?.estimatedFare ||
        Math.max(80, Math.round(50 + (routeMetrics.distanceKm || 10) * 14));
      setBaseFare(computedFare);
      showToast("Route mapped between coordinates. Upfront price locked.", "info");
    } catch {
      const fallback = Math.max(80, Math.round(50 + (routeMetrics.distanceKm || 10) * 14));
      setBaseFare(fallback);
      showToast("Upfront per-km fare calculated from route distance", "info");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRouteCalculated = (metrics) => {
    setRouteMetrics(metrics);
    if (metrics.distanceKm) {
      setBaseFare(Math.max(75, Math.round(50 + metrics.distanceKm * 14)));
    }
  };

  const handleConfirmRide = async () => {
    if (!selectedTier || baseFare === 0) {
      showToast("Check the fare first and pick a car", "warning");
      return;
    }

    setIsBooking(true);
    try {
      const pCoords = pickupCoords || { lat: 28.6139, lng: 77.209 };
      const dCoords = destinationCoords || { lat: 28.5355, lng: 77.391 };

      const tierMultiplier = selectedTier === "premium" ? 1.45 : selectedTier === "shared" ? 0.78 : 1.0;
      const finalFare = Math.round(baseFare * tierMultiplier);

      await bookRide({
        pickup: {
          address: pickup || `${pCoords.lat}, ${pCoords.lng}`,
          coordinates: pCoords,
        },
        destination: {
          address: destination || `${dCoords.lat}, ${dCoords.lng}`,
          coordinates: dCoords,
        },
        fare: finalFare,
        vehicleType: selectedTier === "shared" ? "auto" : "car",
      });

      showToast("Ride requested! Notifying nearby drivers.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not place booking", "error");
    } finally {
      setIsBooking(false);
    }
  };

  const currentStatus = currentRide?.status?.toLowerCase() || "idle";
  const activeStageIdx = getStageIndex(currentStatus);

  const tiers = [
    {
      id: "economy",
      name: "Comfort Electric",
      tag: "Most popular",
      desc: "BYD e6 or Tigor EV • Quiet AC cabin",
      price: Math.round(baseFare * 1.0) || 180,
      eta: "3 mins away",
      icon: Car,
    },
    {
      id: "premium",
      name: "Executive Sedan",
      tag: "Top 5% drivers",
      desc: "Honda City Hybrid / Ioniq 5 • Extra legroom",
      price: Math.round(baseFare * 1.45) || 265,
      eta: "4 mins away",
      icon: Zap,
    },
    {
      id: "shared",
      name: "City Hatchback",
      tag: "Quickest",
      desc: "Swift / Tiago • Nimble for short hops",
      price: Math.round(baseFare * 0.78) || 140,
      eta: "2 mins away",
      icon: Users,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col overflow-hidden">
      <UserDashboardHeader />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <div className="relative flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* LEFT BOOKING & LIVE STEP-BY-STEP RIDE PANEL */}
        <aside className="hidden lg:flex w-[440px] xl:w-[470px] bg-[#09090B] border-r border-white/[0.08] flex-col z-20 overflow-y-auto">
          <div className="p-6 space-y-5 flex-1">
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#FAFAFA]">
                  {currentRide ? "Your Active Trip" : "Route & Coordinates"}
                </h1>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {currentRide
                    ? `Booking #${currentRide._id?.slice(-6).toUpperCase()}`
                    : "Enter two coordinates, type addresses, or click the map"}
                </p>
              </div>
              {currentRide && <RideStatusBadge status={currentStatus} />}
            </div>

            {/* Animated Step-by-Step Progress Bar during Active Ride */}
            {currentRide && (
              <div className="p-3.5 rounded-xl bg-[#121215] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                  <span>STAGE {activeStageIdx + 1} OF 6</span>
                  <span className="text-[#10B981] font-semibold">
                    {RIDE_STAGE_STEPS[activeStageIdx]?.label}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {RIDE_STAGE_STEPS.map((st, idx) => {
                    const isDone = idx <= activeStageIdx;
                    return (
                      <div key={st.key} className="space-y-1">
                        <div className="h-1.5 rounded-full bg-[#18181C] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isDone ? "100%" : "0%" }}
                            transition={{ duration: 0.4 }}
                            className={`h-full ${
                              idx === activeStageIdx ? "bg-[#10B981]" : "bg-[#FAFAFA]"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!currentRide ? (
                /* --- STEP 0: TWO-COORDINATE & ADDRESS SELECTION --- */
                <motion.div
                  key="booking-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* 1-Click Sample Corridors */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                      Quick-fill sample coordinates
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ROUTES.map((qr) => (
                        <button
                          key={qr.label}
                          type="button"
                          onClick={() => applyQuickRoute(qr)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#121215] hover:bg-[#18181C] border border-white/[0.08] text-[11px] font-medium text-[#FAFAFA] transition-colors cursor-pointer"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Two Coordinates & Address Box */}
                  <div className="space-y-3.5 p-4 rounded-2xl bg-[#121215] border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#10B981]">
                        Two-Coordinate Route Input
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="text-[#10B981] hover:underline flex items-center gap-1 text-[11px] font-mono font-semibold cursor-pointer"
                        >
                          <Crosshair className="w-3 h-3" /> My GPS
                        </button>
                        <button
                          type="button"
                          onClick={handleSwapCoordinates}
                          className="px-2 py-0.5 rounded bg-[#18181C] hover:bg-[#27272A] text-[10px] font-mono text-[#FAFAFA] border border-white/[0.08] flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUpDown className="w-3 h-3 text-[#10B981]" /> Swap
                        </button>
                      </div>
                    </div>

                    {/* Coordinate 1: Pickup */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full border-2 border-[#FAFAFA]" />
                          Coordinate 1 (Pickup Lat, Lng)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 28.6315, 77.2167"
                        value={coord1Input}
                        onChange={(e) => handleCoord1Change(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-white/[0.1] font-mono text-xs text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#FAFAFA] transition-all"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Pickup address or landmark"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#09090B]/60 border border-white/[0.07] text-xs text-[#A1A1AA] placeholder:text-[#52525B] focus:outline-none focus:border-white/25 transition-all"
                        />
                        <MapPin className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    {/* Coordinate 2: Destination */}
                    <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-[#10B981]" />
                          Coordinate 2 (Drop-off Lat, Lng)
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 28.5562, 77.1000"
                        value={coord2Input}
                        onChange={(e) => handleCoord2Change(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#09090B] border border-white/[0.1] font-mono text-xs text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981] transition-all"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Drop-off address or landmark"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#09090B]/60 border border-white/[0.07] text-xs text-[#A1A1AA] placeholder:text-[#52525B] focus:outline-none focus:border-white/25 transition-all"
                        />
                        <Navigation className="w-3.5 h-3.5 text-[#10B981] absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    {/* Live Route Distance & Duration Summary */}
                    {routeMetrics.distanceKm && (
                      <div className="px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.07] flex items-center justify-between text-xs">
                        <span className="text-[#A1A1AA]">Calculated Road Route</span>
                        <span className="font-mono font-bold text-[#10B981]">
                          {routeMetrics.distanceKm} km • {routeMetrics.durationMin} min
                        </span>
                      </div>
                    )}

                    {/* Check Fare Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCalculateFare}
                      disabled={isCalculating}
                      className="w-full py-2.5 rounded-xl bg-[#18181C] hover:bg-[#27272A] text-xs font-bold text-[#FAFAFA] border border-white/[0.1] flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isCalculating ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Plot Coordinates & Lock Upfront Fare</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Vehicle Options */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                        Choose a ride
                      </p>
                      {baseFare > 0 && (
                        <span className="text-[11px] font-mono text-[#10B981]">
                          Fare locked for 10m
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {tiers.map((t) => {
                        const Icon = t.icon;
                        const isSelected = selectedTier === t.id;

                        return (
                          <motion.div
                            key={t.id}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedTier(t.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#121215] border-[#FAFAFA]"
                                : "bg-[#09090B] border-white/[0.07] hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2.5 rounded-lg border ${
                                    isSelected
                                      ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                                      : "bg-[#121215] text-[#A1A1AA] border-white/[0.08]"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-[#FAFAFA]">{t.name}</h4>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181C] text-[#A1A1AA]">
                                      {t.tag}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#A1A1AA] mt-0.5">{t.desc}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-base font-extrabold font-mono text-[#FAFAFA] tabular-nums">
                                  ₹{t.price}
                                </p>
                                <p className="text-[11px] font-mono text-[#10B981]">{t.eta}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Book CTA */}
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmRide}
                    disabled={isBooking || baseFare === 0}
                    className="w-full py-4 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] text-sm font-extrabold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {isBooking
                        ? "Requesting your ride..."
                        : `Book ${tiers.find((t) => t.id === selectedTier)?.name} • ₹${
                            tiers.find((t) => t.id === selectedTier)?.price
                          }`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                /* --- ACTIVE TRIP STAGES (ANIMATED STEP TRANSITIONS) --- */
                <motion.div
                  key={currentStatus}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-5"
                >
                  {/* STAGE 1: LOOKING FOR A DRIVER */}
                  {(currentStatus === "requested" || currentStatus === "pending") && (
                    <div className="flex flex-col items-center justify-center p-7 text-center space-y-6 rounded-2xl bg-[#121215] border border-white/[0.08]">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute w-20 h-20 rounded-full border border-[#10B981]/40 animate-radar-ring" />
                        <div className="absolute w-20 h-20 rounded-full border border-[#10B981]/30 animate-radar-ring [animation-delay:0.8s]" />
                        <div className="w-14 h-14 rounded-full bg-[#18181C] border border-[#10B981] flex items-center justify-center">
                          <Radio className="w-6 h-6 text-[#10B981] animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#FAFAFA]">
                          Looking for a nearby driver...
                        </h3>
                        <p className="text-xs text-[#A1A1AA] max-w-xs">
                          Drivers within 5 km are seeing your route and locked fare right now.
                        </p>
                      </div>

                      <div className="w-full p-3.5 rounded-xl bg-[#09090B] border border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-[#A1A1AA]">Locked Trip Fare</span>
                        <span className="font-mono font-bold text-sm text-[#FAFAFA]">
                          ₹{Number(currentRide.fare || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => cancelRideUser(currentRide._id)}
                        className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}

                  {/* STAGE 2: DRIVER ASSIGNED */}
                  {currentStatus === "accepted" && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981] text-[#09090B] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#10B981]">Driver matched</p>
                          <p className="text-xs text-[#FAFAFA]">
                            Your driver has confirmed the route and is getting ready.
                          </p>
                        </div>
                      </div>

                      <DriverCard
                        driver={currentRide.captain}
                        eta="4"
                        onCall={() => showToast("Connecting masked call to driver...")}
                        onChat={() => showToast("Use the chat button in the corner")}
                      />

                      <div className="p-4 rounded-xl bg-[#121215] border border-white/[0.08] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#FAFAFA]">Your 4-Digit Boarding PIN</p>
                          <p className="text-[11px] text-[#A1A1AA]">Share when you sit inside the car</p>
                        </div>
                        <span className="font-mono font-extrabold text-xl tracking-widest text-[#10B981] bg-[#09090B] border border-[#10B981]/40 px-3.5 py-1.5 rounded-lg">
                          {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STAGE 3: DRIVER EN ROUTE */}
                  {currentStatus === "driver_en_route" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#121215] border border-white/[0.1] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#FAFAFA]">
                            Driver is heading to your pickup spot
                          </span>
                          <span className="text-xs font-mono font-bold text-[#10B981]">
                            ~3 mins away
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-[#09090B] rounded-full overflow-hidden">
                          <motion.div
                            animate={{ x: ["0%", "85%"] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 left-0 w-10 h-full bg-[#10B981] rounded-full"
                          />
                        </div>
                      </div>

                      <DriverCard
                        driver={currentRide.captain}
                        eta="3"
                        onCall={() => showToast("Calling driver...")}
                        onChat={() => showToast("Opening chat...")}
                      />

                      <div className="p-3.5 rounded-xl bg-[#121215] border border-white/[0.08] flex justify-between items-center text-xs">
                        <span className="text-[#A1A1AA]">Boarding PIN</span>
                        <span className="font-mono text-base font-extrabold text-[#10B981]">
                          {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STAGE 4: DRIVER ARRIVED AT PICKUP */}
                  {currentStatus === "arrived" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#10B981] text-[#09090B] flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#10B981]">
                            Your driver is at the pickup point
                          </h4>
                          <p className="text-xs text-[#FAFAFA]">
                            Check the license plate and share your PIN once seated.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-[#121215] border border-white/[0.1] text-center space-y-2">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                          Boarding PIN
                        </p>
                        <p className="text-3xl font-extrabold font-mono tracking-widest text-[#10B981]">
                          {currentRide.otp || localStorage.getItem("rideOtp") || "••••"}
                        </p>
                        <p className="text-xs text-[#A1A1AA]">
                          The trip meter starts only after the driver enters this PIN.
                        </p>
                      </div>

                      <DriverCard driver={currentRide.captain} />
                    </div>
                  )}

                  {/* STAGE 5: IN RIDE */}
                  {(currentStatus === "in_ride" || currentStatus === "in_progress") && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#121215] border border-white/[0.1] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#10B981] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                            On the way to destination
                          </span>
                          <span className="text-xs font-mono text-[#A1A1AA]">Fare locked</span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-[#A1A1AA]">
                            <span className="truncate max-w-[140px]">
                              {currentRide.pickup?.address || "Pickup"}
                            </span>
                            <span className="truncate max-w-[140px] text-right text-[#FAFAFA]">
                              {currentRide.destination?.address || "Destination"}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[#09090B] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: "15%" }}
                              animate={{ width: "72%" }}
                              transition={{ duration: 8, ease: "easeOut" }}
                              className="h-full bg-[#10B981] rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      <DriverCard driver={currentRide.captain} />
                    </div>
                  )}

                  {/* STAGE 6: COMPLETED */}
                  {currentStatus === "completed" && (
                    <div className="p-5 rounded-2xl bg-[#121215] border border-white/[0.1] space-y-5">
                      <div className="text-center space-y-1">
                        <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-extrabold text-[#FAFAFA]">You’ve arrived</h3>
                        <p className="text-xs text-[#A1A1AA]">Here is your final fare summary</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] space-y-2 text-xs">
                        <div className="flex justify-between text-[#A1A1AA]">
                          <span>Base Fare</span>
                          <span className="font-mono text-[#FAFAFA]">₹50.00</span>
                        </div>
                        <div className="flex justify-between text-[#A1A1AA]">
                          <span>Distance & Time</span>
                          <span className="font-mono text-[#FAFAFA]">
                            ₹{Math.max(0, Number(currentRide.fare || 210) - 50).toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-sm text-[#FAFAFA]">
                          <span>Total Paid</span>
                          <span className="font-mono text-[#10B981]">
                            ₹{Number(currentRide.fare || 210).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-xs font-semibold text-[#A1A1AA]">
                          How was your trip with {currentRide.captain?.fullname?.firstname || "your driver"}?
                        </p>
                        <div className="flex justify-center">
                          <RatingStars rating={driverRating} onChange={setDriverRating} size={26} />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate("/order-confirmation", {
                            state: { method: "Razorpay", paymentId: `NEX-${Date.now()}` },
                          })
                        }
                        className="w-full py-3.5 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        View Tax Receipt & Invoice
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* RIGHT AREA: LIVE INTERACTIVE MAP WITH TWO-COORDINATE ROUTING */}
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
              onPickupChange={!currentRide ? handleMapPickupChange : undefined}
              onDestinationChange={!currentRide ? handleMapDestChange : undefined}
              onRouteCalculated={handleRouteCalculated}
            />
          </MapContainer>

          {/* MOBILE SHEET */}
          <div className="lg:hidden">
            <BottomSheet
              isOpen={isMobileSheetOpen}
              onClose={() => setIsMobileSheetOpen(false)}
              title={currentRide ? "Your Active Trip" : "Enter Two Coordinates"}
            >
              {!currentRide ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Coord 1 (e.g. 28.6315, 77.2167)"
                    value={coord1Input}
                    onChange={(e) => handleCoord1Change(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#09090B] border border-white/[0.1] font-mono text-xs text-[#FAFAFA]"
                  />
                  <input
                    type="text"
                    placeholder="Coord 2 (e.g. 28.5562, 77.1000)"
                    value={coord2Input}
                    onChange={(e) => handleCoord2Change(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#09090B] border border-white/[0.1] font-mono text-xs text-[#FAFAFA]"
                  />
                  <button
                    onClick={handleCalculateFare}
                    className="w-full py-3 rounded-xl bg-[#18181C] text-xs font-bold text-[#FAFAFA]"
                  >
                    Plot Route & Check Fare
                  </button>
                  <button
                    onClick={handleConfirmRide}
                    className="w-full py-3.5 rounded-xl bg-[#FAFAFA] text-sm font-bold text-[#09090B]"
                  >
                    Book Ride • ₹{tiers.find((t) => t.id === selectedTier)?.price}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <RideStatusBadge status={currentStatus} />
                  {currentRide.otp && (
                    <p className="text-2xl font-mono font-extrabold text-[#10B981]">
                      PIN: {currentRide.otp}
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
