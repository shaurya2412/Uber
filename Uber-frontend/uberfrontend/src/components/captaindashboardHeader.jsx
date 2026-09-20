import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Bell, User, LogOut, History, Shield, Power } from "lucide-react";
import { useCaptainStore } from "../Zustand/useCaptainStore";

const CaptainDashboardHeader = () => {
  const navigate = useNavigate();
  const { captain, active, toggleActive, logout } = useCaptainStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleActive = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await toggleActive();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/captainlogin");
  };

  const fullName = captain?.fullname;
  const displayName = fullName
    ? `${fullName.firstname || ""} ${fullName.lastname || ""}`.trim() || "Driver"
    : "Driver";

  return (
    <header className="w-full bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-[#1E1E2E] px-6 lg:px-10 py-3.5 z-30 sticky top-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#7C3AED] group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#F8FAFC]">
                Nexus <span className="text-[#06B6D4]">Driver</span>
              </span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111118] border border-[#1E1E2E] text-[11px] text-[#94A3B8]">
            <span
              className={`w-2 h-2 rounded-full ${
                active ? "bg-[#10B981] animate-ping" : "bg-gray-500"
              }`}
            />
            {active ? "Telemetry Active" : "GPS Standby"}
          </span>
        </div>

        {/* Right Section: Toggle + Profile */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#111118] border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all cursor-pointer"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] p-0.5 flex items-center justify-center text-[#0A0A0F] font-bold text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC] hidden sm:inline-block">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111118] border border-[#2D2D3F] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] z-50 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1E1E2E]">
                  <p className="text-xs font-bold text-[#F8FAFC] truncate">{displayName}</p>
                  <p className="text-[10px] text-[#94A3B8] truncate">{captain?.email || "driver@nexus.app"}</p>
                </div>

                <button
                  onClick={() => {
                    navigate("/admin");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#1A1A24] flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Admin Operations</span>
                </button>

                <div className="my-1 border-t border-[#1E1E2E]" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-500/10 flex items-center gap-2.5 text-xs text-[#EF4444] font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CaptainDashboardHeader;
