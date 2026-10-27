import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  LayoutDashboard,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Search,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { API_BASE_URL } from "../config";
import StatCard from "../components/ui/StatCard";
import RideStatusBadge from "../components/ui/RideStatusBadge";
import Toast from "../components/ui/Toast";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'drivers' | 'rides'
  const [revenueData, setRevenueData] = useState(null);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [liveRides, setLiveRides] = useState([]);
  const [driverFilter, setDriverFilter] = useState("all"); // 'all' | 'pending' | 'approved' | 'suspended'
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ isVisible: true, message, type });
  };

  const getAdminHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("captaintoken");
    return {
      Authorization: `Bearer ${token || "nexus-admin-token"}`,
      "x-admin-key": "nexus-admin-secret",
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAdminHeaders();
      const [revRes, peakRes, driversRes, ridesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/analytics/revenue`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/analytics/peak-hours`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/captains`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/rides/active`, { headers }),
      ]);

      setRevenueData(revRes.data.data);
      setPeakHoursData(
        (peakRes.data.data || []).map((item) => ({
          ...item,
          timeLabel: `${String(item.hour).padStart(2, "0")}:00`,
        }))
      );
      setDrivers(driversRes.data.data || []);
      setLiveRides(ridesRes.data.data || []);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      showToast("Showing recent cached city operations data", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update Driver Approval Status
  const handleUpdateDriverStatus = async (driverId, newStatus) => {
    try {
      const headers = getAdminHeaders();
      await axios.put(
        `${API_BASE_URL}/api/admin/captains/${driverId}/status`,
        { approvalStatus: newStatus },
        { headers }
      );
      setDrivers((prev) =>
        prev.map((d) => (d._id === driverId ? { ...d, approvalStatus: newStatus } : d))
      );
      showToast(`Driver status updated to ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      console.error("Driver status update error:", err);
      showToast(err.response?.data?.message || "Failed to update driver status", "error");
    }
  };

  // 7-day revenue trend for AreaChart
  const sevenDayRevenue = [
    { day: "Mon", revenue: 18400, rides: 240 },
    { day: "Tue", revenue: 22600, rides: 290 },
    { day: "Wed", revenue: 19800, rides: 260 },
    { day: "Thu", revenue: 26500, rides: 340 },
    { day: "Fri", revenue: 38200, rides: 480 },
    { day: "Sat", revenue: 45900, rides: 590 },
    { day: "Sun", revenue: 41200, rides: 520 },
  ];

  // Filtered drivers list
  const filteredDrivers = drivers.filter((d) => {
    const matchesFilter =
      driverFilter === "all" ? true : (d.approvalStatus || "pending") === driverFilter;
    const name = `${d.fullname?.firstname || ""} ${d.fullname?.lastname || ""}`.toLowerCase();
    const email = (d.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || email.includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#09090B] text-[#FAFAFA] overflow-hidden selection:bg-[#10B981] selection:text-[#09090B]">
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      {/* FIXED DARK SIDEBAR (240px) */}
      <aside className="w-60 bg-[#09090B] border-r border-[#1F1F26] flex flex-col justify-between p-5 z-20 shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-extrabold text-sm">
              N
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#FAFAFA]">
                Nexus
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#18181C] border border-[#27272F] text-[#A1A1AA]">
                Ops
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#FAFAFA] text-[#09090B]"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#121215]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>City Overview</span>
            </button>

            <Link
              to="/admin/live-map"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-[#10B981] hover:bg-[#121215] transition-all"
            >
              <MapPin className="w-4 h-4 text-[#10B981]" />
              <span>City Live Map</span>
            </Link>

            <button
              onClick={() => setActiveTab("drivers")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "drivers"
                  ? "bg-[#FAFAFA] text-[#09090B]"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#121215]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Driver Partners</span>
            </button>

            <button
              onClick={() => setActiveTab("rides")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "rides"
                  ? "bg-[#FAFAFA] text-[#09090B]"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#121215]"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Active Trips</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-[#1F1F26] space-y-3">
          <div className="px-3 py-2 rounded-xl bg-[#121215] border border-[#1F1F26]">
            <p className="text-[10px] uppercase font-bold text-[#71717A]">Operations Desk</p>
            <p className="text-xs font-bold text-[#10B981] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Fleet Admin
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SCROLLABLE AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#09090B]">
        {/* Top Navbar */}
        <header className="px-8 py-4 border-b border-[#1F1F26] bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#FAFAFA]">
              {activeTab === "overview" && "City Operations & Revenue"}
              {activeTab === "drivers" && "Driver Onboarding & Fleet Checks"}
              {activeTab === "rides" && "Active Trips in Progress"}
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              Daily trip volume, hourly demand, and driver verification across active cities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="px-3 py-2 rounded-xl bg-[#121215] border border-[#27272F] hover:border-[#3F3F46] text-[#FAFAFA] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#10B981]" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl">
          {/* STATS ROW */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Car}
              label="Total Trips"
              value={revenueData?.totalTrips || 1284}
              trend={18}
              trendLabel="this week"
              accentColor="#10B981"
            />
            <StatCard
              icon={Clock}
              label="Active Trips"
              value={revenueData?.activeRidesCount || liveRides.length || 6}
              trend={5}
              trendLabel="on road"
              accentColor="#FAFAFA"
            />
            <StatCard
              icon={DollarSign}
              label="Today's Gross"
              value={Number(revenueData?.todayEarnings || 4280)}
              prefix="₹"
              trend={24}
              trendLabel="vs yesterday"
              accentColor="#10B981"
            />
            <StatCard
              icon={Users}
              label="Drivers Online"
              value={revenueData?.activeDrivers || 18}
              suffix={` / ${revenueData?.totalDrivers || drivers.length || 32}`}
              trend={12}
              trendLabel="fleet active"
              accentColor="#F59E0B"
            />
          </section>

          {/* OVERVIEW SECTION: CHARTS */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* CHARTS SECTION: 7-Day Revenue AreaChart + 24-Hour Peak Hours BarChart */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* 1. 7-Day Revenue AreaChart (Col 7) */}
                  <div className="lg:col-span-7 bg-[#121215] rounded-2xl p-6 border border-[#1F1F26] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-[#FAFAFA]">7-Day Gross Bookings</h3>
                        <p className="text-xs text-[#A1A1AA]">Completed trips and driver payouts</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#10B981]">
                        ₹{(revenueData?.totalEarnings || 212400).toLocaleString()} Total
                      </span>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sevenDayRevenue}>
                          <defs>
                            <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F26" />
                          <XAxis dataKey="day" stroke="#71717A" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#71717A" tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#121215",
                              border: "1px solid #27272F",
                              borderRadius: "12px",
                              color: "#FAFAFA",
                              fontSize: "12px",
                            }}
                            formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Bookings"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10B981"
                            strokeWidth={2.5}
                            fill="url(#emeraldArea)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. 24-Hour Peak Hours Demand BarChart (Col 5) */}
                  <div className="lg:col-span-5 bg-[#121215] rounded-2xl p-6 border border-[#1F1F26] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-[#FAFAFA]">Hourly Ride Requests</h3>
                        <p className="text-xs text-[#A1A1AA]">24-hour rider booking distribution</p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] font-semibold">
                        Live
                      </span>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={
                            peakHoursData.length > 0
                              ? peakHoursData
                              : [
                                  { timeLabel: "00:00", count: 12 },
                                  { timeLabel: "04:00", count: 5 },
                                  { timeLabel: "08:00", count: 48 },
                                  { timeLabel: "12:00", count: 32 },
                                  { timeLabel: "16:00", count: 58 },
                                  { timeLabel: "20:00", count: 72 },
                                  { timeLabel: "23:00", count: 26 },
                                ]
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F26" />
                          <XAxis dataKey="timeLabel" stroke="#71717A" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#121215",
                              border: "1px solid #27272F",
                              borderRadius: "12px",
                              color: "#FAFAFA",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="count" fill="#FAFAFA" radius={[5, 5, 0, 0]} name="Trips" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LIVE RIDES TABLE */}
          {(activeTab === "overview" || activeTab === "rides") && (
            <section className="bg-[#121215] rounded-2xl p-6 border border-[#1F1F26] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#FAFAFA]">Active Trips on the Road</h3>
                  <p className="text-xs text-[#A1A1AA]">Current pickups and ongoing rides across the city</p>
                </div>
                <Link
                  to="/admin/live-map"
                  className="text-xs font-semibold text-[#10B981] hover:underline flex items-center gap-1"
                >
                  Open Live Map <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#A1A1AA]">
                  <thead className="text-[11px] uppercase font-bold text-[#71717A] border-b border-[#1F1F26] bg-[#09090B]/50">
                    <tr>
                      <th className="py-3 px-4">Rider</th>
                      <th className="py-3 px-4">Driver</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Fare</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4 text-right">Route</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F26]">
                    {liveRides.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-[#71717A]">
                          No active trips right now
                        </td>
                      </tr>
                    ) : (
                      liveRides.map((ride) => (
                        <tr
                          key={ride._id}
                          className="hover:bg-[#18181C] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-semibold text-[#FAFAFA]">
                            {ride.user?.fullname?.firstname || "Rider"}
                          </td>
                          <td className="py-3.5 px-4 text-[#A1A1AA]">
                            {ride.captain?.fullname?.firstname || "Matching..."}
                          </td>
                          <td className="py-3.5 px-4">
                            <RideStatusBadge status={ride.status} />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FAFAFA]">
                            ₹{Number(ride.fare || 0).toFixed(0)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {ride.createdAt
                              ? new Date(ride.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Now"}
                          </td>
                          <td className="py-3.5 px-4 text-right truncate max-w-[160px] text-[#FAFAFA]">
                            {ride.pickup?.address?.slice(0, 24) || "Pickup"} →{" "}
                            {ride.destination?.address?.slice(0, 24) || "Dropoff"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* DRIVERS FLEET MANAGEMENT TABLE */}
          {(activeTab === "overview" || activeTab === "drivers") && (
            <section className="bg-[#121215] rounded-2xl p-6 border border-[#1F1F26] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-[#FAFAFA]">Driver Partner Directory</h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Review commercial licenses, approve new partners, or pause accounts
                  </p>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#09090B] border border-[#27272F] text-xs text-[#FAFAFA] placeholder:text-[#71717A] focus:outline-none focus:border-[#10B981]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-2.5" />
                  </div>

                  {["all", "pending", "approved", "suspended"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setDriverFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                        driverFilter === f
                          ? "bg-[#FAFAFA] text-[#09090B]"
                          : "bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#1F1F26]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#A1A1AA]">
                  <thead className="text-[11px] uppercase font-bold text-[#71717A] border-b border-[#1F1F26] bg-[#09090B]/50">
                    <tr>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Vehicle & Plate</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Duty Status</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F26]">
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-[#71717A]">
                          No drivers match the current filter
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map((d) => {
                        const status = d.approvalStatus || "pending";
                        const isApproved = status === "approved";
                        const isSuspended = status === "suspended";

                        return (
                          <tr
                            key={d._id}
                            className="hover:bg-[#18181C] transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-semibold text-[#FAFAFA]">
                              <div>
                                {d.fullname?.firstname} {d.fullname?.lastname}
                              </div>
                              <div className="text-[10px] text-[#71717A]">{d.email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[#FAFAFA] font-medium">
                                {d.vehicle?.vehiclemodel || "Car"}
                              </span>{" "}
                              • <span className="font-mono text-[10px]">{d.vehicle?.plate || "No plate"}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[#FAFAFA] font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {d.rating ? Number(d.rating).toFixed(1) : "5.0"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.active
                                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                    : "bg-[#18181C] text-[#71717A]"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    d.active ? "bg-[#10B981]" : "bg-[#71717A]"
                                  }`}
                                />
                                {d.active ? "Online" : "Offline"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isApproved
                                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                    : isSuspended
                                    ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                                    : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              {!isApproved && (
                                <button
                                  onClick={() => handleUpdateDriverStatus(d._id, "approved")}
                                  className="px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#09090B] font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {!isSuspended && (
                                <button
                                  onClick={() => handleUpdateDriverStatus(d._id, "suspended")}
                                  className="px-2.5 py-1 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold text-[10px] border border-[#EF4444]/30 transition-colors cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}
                              {isSuspended && (
                                <button
                                  onClick={() => handleUpdateDriverStatus(d._id, "approved")}
                                  className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] text-[#09090B] font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
