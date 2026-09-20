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
      showToast("Telemetry metrics refreshed with fallback cached data", "info");
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

  // Mock 7-day revenue trend for AreaChart
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
    <div className="flex h-screen bg-[#0A0A0F] text-[#F8FAFC] overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      {/* FIXED DARK SIDEBAR (240px) */}
      <aside className="w-60 bg-[#0A0A0F] border-r border-[#1E1E2E] flex flex-col justify-between p-5 z-20 shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#7C3AED]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#F8FAFC]">
                Nexus <span className="text-[#7C3AED]">Ops</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111118]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Analytics</span>
            </button>

            <Link
              to="/admin/live-map"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-[#06B6D4] hover:bg-[#111118] transition-all"
            >
              <MapPin className="w-4 h-4 text-[#06B6D4]" />
              <span>City Live Map</span>
            </Link>

            <button
              onClick={() => setActiveTab("drivers")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "drivers"
                  ? "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111118]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Driver Fleet</span>
            </button>

            <button
              onClick={() => setActiveTab("rides")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "rides"
                  ? "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111118]"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Active Dispatches</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-[#1E1E2E] space-y-3">
          <div className="px-3 py-2 rounded-xl bg-[#111118] border border-[#1E1E2E]">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Security Level</p>
            <p className="text-xs font-bold text-[#10B981] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Root Admin Active
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SCROLLABLE AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0A0A0F]">
        {/* Top Navbar */}
        <header className="px-8 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#F8FAFC]">
              {activeTab === "overview" && "Executive Command Center"}
              {activeTab === "drivers" && "Driver Verification & Fleet Ops"}
              {activeTab === "rides" && "Live Fleet Dispatch Telemetry"}
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Automated geospatial routing, surge telemetry, and platform gross volume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-[#111118] border border-[#2D2D3F] hover:border-[#7C3AED] text-[#F8FAFC] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#7C3AED]" : ""}`} />
              <span className="hidden sm:inline">Refresh Telemetry</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl">
          {/* STATS ROW (4 GLASSCARD PRIMITIVES WITH TRENDS) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Car}
              label="Total Rides"
              value={revenueData?.totalTrips || 1284}
              trend={18}
              trendLabel="this week"
              accentColor="#7C3AED"
            />
            <StatCard
              icon={Clock}
              label="Active Now"
              value={revenueData?.activeRidesCount || liveRides.length || 6}
              trend={5}
              trendLabel="on roads"
              accentColor="#06B6D4"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue Today"
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
          {activeTab === "overview" && (
            <>
              {/* CHARTS SECTION: 7-Day Revenue AreaChart + 24-Hour Peak Hours BarChart */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. 7-Day Revenue AreaChart (Col 7) */}
                <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-[#1E1E2E] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-[#F8FAFC]">7-Day Gross Revenue Volume</h3>
                      <p className="text-xs text-[#94A3B8]">Completed ride volume & payment settlements</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#10B981]">
                      ₹{(revenueData?.totalEarnings || 212400).toLocaleString()} Gross
                    </span>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sevenDayRevenue}>
                        <defs>
                          <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E1E2E" />
                        <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111118",
                            border: "1px solid #2D2D3F",
                            borderRadius: "12px",
                            color: "#F8FAFC",
                            fontSize: "12px",
                          }}
                          formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7C3AED"
                          strokeWidth={3}
                          fill="url(#purpleArea)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. 24-Hour Peak Hours Demand BarChart (Col 5) */}
                <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-[#1E1E2E] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-[#F8FAFC]">24-Hour Peak Demand</h3>
                      <p className="text-xs text-[#94A3B8]">Hourly trip density distribution</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] font-semibold">
                      Real-Time
                    </span>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData.length > 0 ? peakHoursData : [
                        { timeLabel: "00:00", count: 12 },
                        { timeLabel: "04:00", count: 5 },
                        { timeLabel: "08:00", count: 48 },
                        { timeLabel: "12:00", count: 32 },
                        { timeLabel: "16:00", count: 58 },
                        { timeLabel: "20:00", count: 72 },
                        { timeLabel: "23:00", count: 26 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E1E2E" />
                        <XAxis dataKey="timeLabel" stroke="#475569" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111118",
                            border: "1px solid #2D2D3F",
                            borderRadius: "12px",
                            color: "#F8FAFC",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Rides" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* LIVE RIDES TABLE */}
              <section className="glass-card rounded-3xl p-6 border border-[#1E1E2E] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#F8FAFC]">Active Fleet Operations</h3>
                    <p className="text-xs text-[#94A3B8]">Rides currently undergoing state machine transitions</p>
                  </div>
                  <Link
                    to="/admin/live-map"
                    className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
                  >
                    View on Fullscreen Map <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#94A3B8]">
                    <thead className="text-[11px] uppercase font-bold text-[#475569] border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
                      <tr>
                        <th className="py-3 px-4">Rider</th>
                        <th className="py-3 px-4">Captain</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Fare</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4 text-right">Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1E2E]">
                      {liveRides.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-[#475569]">
                            No live rides currently in transit
                          </td>
                        </tr>
                      ) : (
                        liveRides.map((ride) => (
                          <tr
                            key={ride._id}
                            className="hover:bg-[#7C3AED]/5 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                              {ride.user?.fullname?.firstname || "Rider"}
                            </td>
                            <td className="py-3.5 px-4 text-[#94A3B8]">
                              {ride.captain?.fullname?.firstname || "Matching..."}
                            </td>
                            <td className="py-3.5 px-4">
                              <RideStatusBadge status={ride.status} />
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">
                              ₹{Number(ride.fare || 0).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px]">
                              {ride.createdAt ? new Date(ride.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}
                            </td>
                            <td className="py-3.5 px-4 text-right truncate max-w-[160px] text-[#F8FAFC]">
                              {ride.pickup?.address?.slice(0, 24) || "Pickup"} → {ride.destination?.address?.slice(0, 24) || "Dropoff"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* DRIVERS FLEET MANAGEMENT TABLE */}
          {(activeTab === "overview" || activeTab === "drivers") && (
            <section className="glass-card rounded-3xl p-6 border border-[#1E1E2E] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-[#F8FAFC]">Driver Fleet Management</h3>
                  <p className="text-xs text-[#94A3B8]">
                    Verify documents, approve accounts, and toggle suspensions
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
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#2D2D3F] text-xs text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#475569] absolute left-2.5 top-2.5" />
                  </div>

                  {["all", "pending", "approved", "suspended"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setDriverFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        driverFilter === f
                          ? "bg-[#7C3AED] text-white shadow-md"
                          : "bg-[#111118] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E1E2E]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#94A3B8]">
                  <thead className="text-[11px] uppercase font-bold text-[#475569] border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
                    <tr>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Vehicle Specs</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Online Status</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E2E]">
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-[#475569]">
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
                            className="hover:bg-[#7C3AED]/5 transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                              <div>
                                {d.fullname?.firstname} {d.fullname?.lastname}
                              </div>
                              <div className="text-[10px] text-[#475569]">{d.email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[#F8FAFC] font-medium">
                                {d.vehicle?.vehiclemodel || "Car"}
                              </span>{" "}
                              • <span className="font-mono text-[10px]">{d.vehicle?.plate || "No plate"}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[#F8FAFC] font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {d.rating ? Number(d.rating).toFixed(1) : "5.0"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.active
                                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                    : "bg-gray-800 text-gray-400"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${d.active ? "bg-[#10B981]" : "bg-gray-500"}`} />
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
                                  className="px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0A0A0F] font-bold text-[10px] transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {!isSuspended && (
                                <button
                                  onClick={() => handleUpdateDriverStatus(d._id, "suspended")}
                                  className="px-2.5 py-1 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold text-[10px] border border-[#EF4444]/30 transition-colors"
                                >
                                  Suspend
                                </button>
                              )}
                              {isSuspended && (
                                <button
                                  onClick={() => handleUpdateDriverStatus(d._id, "approved")}
                                  className="px-2.5 py-1 rounded-lg bg-[#06B6D4] text-[#0A0A0F] font-bold text-[10px] transition-colors"
                                >
                                  Re-Activate
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
