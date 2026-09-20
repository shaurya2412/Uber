import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { API_BASE_URL } from "../config";
import {
  ArrowLeft,
  Car,
  RefreshCw,
  Navigation,
  MapPin,
  Clock,
  Radio,
  Compass,
  Zap,
} from "lucide-react";
import RideStatusBadge from "../components/ui/RideStatusBadge";

// Markers definition
const pickupIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: iconShadow,
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  shadowSize: [36, 36],
});

const dropoffIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: iconShadow,
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  shadowSize: [36, 36],
});

const carIcon = new L.DivIcon({
  html: `<div style="font-size: 22px; line-height: 1; transform: translate(-11px, -11px); filter: drop-shadow(0 0 8px rgba(6,182,212,0.8));">🚖</div>`,
  className: "admin-car-icon",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const CenterOnRide = ({ targetCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && targetCoords[0] && targetCoords[1]) {
      map.flyTo(targetCoords, 14, { duration: 1.2 });
    }
  }, [map, targetCoords]);
  return null;
};

const AdminLiveMap = () => {
  const [activeRides, setActiveRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [targetFocus, setTargetFocus] = useState(null);

  const fetchActiveRides = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("captaintoken");
      const res = await axios.get(`${API_BASE_URL}/api/admin/rides/active`, {
        headers: {
          Authorization: `Bearer ${token || "nexus-admin-token"}`,
          "x-admin-key": "nexus-admin-secret",
        },
      });
      setActiveRides(res.data.data || []);
    } catch (err) {
      console.error("Failed to load active rides for map:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRides();
    const interval = setInterval(fetchActiveRides, 5000);
    return () => clearInterval(interval);
  }, []);

  const defaultCenter = [28.6139, 77.209]; // Delhi NCR fallback

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-[#F8FAFC] overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      {/* Top Bar */}
      <header className="bg-[#0A0A0F]/90 backdrop-blur-md px-6 py-3.5 border-b border-[#1E1E2E] flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 bg-[#111118] hover:bg-[#1A1A24] border border-[#2D2D3F] rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Nexus Ops</span>
          </Link>
          <div className="h-4 w-px bg-[#1E1E2E]" />
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#06B6D4] animate-pulse" />
            <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">
              Live Fleet Operations Map
            </h1>
            <span className="px-2.5 py-0.5 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs rounded-full font-semibold">
              {activeRides.length} Active Trips
            </span>
          </div>
        </div>

        <button
          onClick={fetchActiveRides}
          className="px-3.5 py-1.5 bg-[#111118] hover:bg-[#1A1A24] border border-[#2D2D3F] text-xs font-medium text-[#F8FAFC] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#06B6D4] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Main Grid: Sidebar + Map */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Drawer: Active Rides List */}
        <aside className="w-80 md:w-96 bg-[#111118] border-r border-[#1E1E2E] flex flex-col z-10 overflow-y-auto">
          <div className="p-4 border-b border-[#1E1E2E] bg-[#0A0A0F]/60 flex items-center justify-between">
            <p className="text-[11px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Real-Time Fleet Streams
            </p>
            <span className="text-[10px] text-[#475569] font-mono">Auto-sync 5s</span>
          </div>

          <div className="divide-y divide-[#1E1E2E] flex-1 overflow-y-auto">
            {activeRides.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8] text-xs space-y-2">
                <Compass className="w-8 h-8 text-[#475569] mx-auto animate-pulse" />
                <p className="font-medium text-[#F8FAFC]">No active rides in progress</p>
                <p className="text-[#475569]">Trips will stream here in real-time when booked.</p>
              </div>
            ) : (
              activeRides.map((ride) => {
                const isSelected = selectedRide?._id === ride._id;

                return (
                  <div
                    key={ride._id}
                    onClick={() => {
                      setSelectedRide(ride);
                      if (ride.driverLocation?.lat) {
                        setTargetFocus([ride.driverLocation.lat, ride.driverLocation.lng]);
                      } else if (ride.pickup?.coordinates) {
                        setTargetFocus([
                          ride.pickup.coordinates[1],
                          ride.pickup.coordinates[0],
                        ]);
                      }
                    }}
                    className={`p-4 cursor-pointer transition-all hover:bg-[#1A1A24] ${
                      isSelected
                        ? "bg-[#1A1A24] border-l-4 border-[#7C3AED] shadow-inner"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <div className="font-semibold text-xs text-[#F8FAFC]">
                          {ride.user?.fullname?.firstname || "Rider"}{" "}
                          {ride.user?.fullname?.lastname || ""}
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Driver: {ride.captain?.fullname?.firstname || "Matching..."}
                        </div>
                      </div>
                      <RideStatusBadge status={ride.status} />
                    </div>

                    <div className="space-y-1.5 text-xs text-[#94A3B8] mt-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate text-[#F8FAFC]">
                          {ride.pickup?.address || "Pickup Point"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Navigation className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                        <span className="truncate text-[#F8FAFC]">
                          {ride.destination?.address || "Dropoff Destination"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1E1E2E] text-xs text-[#94A3B8]">
                      <span>
                        Fare: <strong className="text-[#10B981] font-mono">₹{Number(ride.fare || 0).toFixed(2)}</strong>
                      </span>
                      {ride.surgeMultiplier > 1 && (
                        <span className="inline-flex items-center gap-1 text-[#06B6D4] font-semibold text-[11px] bg-[#06B6D4]/10 px-2 py-0.5 rounded-full border border-[#06B6D4]/30">
                          <Zap className="w-3 h-3" />
                          {ride.surgeMultiplier}x Surge
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Map Container with Dark Matter Tiles */}
        <div className="flex-1 h-full w-full relative bg-[#0A0A0F]">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#0A0A0F" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <CenterOnRide targetCoords={targetFocus} />

            {activeRides.map((ride) => {
              const pickupCoords =
                ride.pickup?.coordinates &&
                ride.pickup.coordinates.length === 2 &&
                [ride.pickup.coordinates[1], ride.pickup.coordinates[0]];

              const destCoords =
                ride.destination?.coordinates &&
                ride.destination.coordinates.length === 2 &&
                [ride.destination.coordinates[1], ride.destination.coordinates[0]];

              const driverCoords =
                ride.driverLocation && ride.driverLocation.lat
                  ? [ride.driverLocation.lat, ride.driverLocation.lng]
                  : null;

              return (
                <React.Fragment key={ride._id}>
                  {pickupCoords && (
                    <Marker position={pickupCoords} icon={pickupIcon}>
                      <Popup>
                        <div className="p-1 text-xs">
                          <strong className="text-emerald-400">Pickup:</strong>{" "}
                          <span className="text-gray-200">{ride.pickup.address}</span>
                          <br />
                          <strong className="text-gray-400">Rider:</strong>{" "}
                          <span className="text-gray-200">{ride.user?.fullname?.firstname}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {destCoords && (
                    <Marker position={destCoords} icon={dropoffIcon}>
                      <Popup>
                        <div className="p-1 text-xs">
                          <strong className="text-purple-400">Dropoff:</strong>{" "}
                          <span className="text-gray-200">{ride.destination.address}</span>
                          <br />
                          <strong className="text-emerald-400">Fare:</strong>{" "}
                          <span className="text-gray-200">₹{Number(ride.fare || 0).toFixed(2)}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {driverCoords && (
                    <Marker position={driverCoords} icon={carIcon}>
                      <Popup>
                        <div className="p-1 text-xs">
                          <strong className="text-cyan-400">Driver:</strong>{" "}
                          <span className="text-gray-200">{ride.captain?.fullname?.firstname || "Matching"}</span>
                          <br />
                          <strong className="text-gray-400">Status:</strong>{" "}
                          <span className="text-gray-200">{ride.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {pickupCoords && destCoords && (
                    <Polyline
                      positions={[pickupCoords, destCoords]}
                      color="#06B6D4"
                      dashArray="6, 8"
                      weight={3}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveMap;
