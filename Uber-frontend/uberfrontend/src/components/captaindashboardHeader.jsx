import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Shield, ChevronDown } from "lucide-react";
import { useCaptainStore } from "../Zustand/useCaptainStore";

const CaptainDashboardHeader = () => {
  const navigate = useNavigate();
  const { captain, active, logout } = useCaptainStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/captainlogin");
  };

  const fullName = captain?.fullname;
  const displayName = fullName
    ? `${fullName.firstname || ""} ${fullName.lastname || ""}`.trim() || "Partner"
    : "Partner";

  return (
    <header className="w-full bg-[#09090B]/95 backdrop-blur-xl border-b border-white/[0.08] px-5 lg:px-8 h-16 z-30 sticky top-0 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-black text-sm group-hover:bg-[#10B981] transition-colors">
            N
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#FAFAFA]">
            Nexus <span className="text-[#10B981] font-mono text-xs uppercase ml-1">Driver</span>
          </span>
        </Link>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121215] border border-white/[0.08] text-[11px] font-mono text-[#A1A1AA]">
          <span
            className={`w-2 h-2 rounded-full ${
              active ? "bg-[#10B981] animate-ping" : "bg-[#52525B]"
            }`}
          />
          {active ? "ONLINE • RECEIVING TRIPS" : "OFFLINE"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121215] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="w-6 h-6 rounded-md bg-[#10B981] text-[#09090B] flex items-center justify-center font-bold text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#FAFAFA] hidden sm:inline-block">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121215] border border-white/[0.12] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 py-1.5 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-white/[0.07]">
                <p className="text-xs font-bold text-[#FAFAFA] truncate">{displayName}</p>
                <p className="text-[10px] font-mono text-[#A1A1AA] truncate">
                  {captain?.email || "Driver Partner"}
                </p>
              </div>

              <button
                onClick={() => {
                  navigate("/admin");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#18181C] flex items-center gap-2.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Fleet Operations</span>
              </button>

              <div className="my-1 border-t border-white/[0.07]" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 hover:bg-red-500/10 flex items-center gap-2.5 text-xs text-[#EF4444] font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CaptainDashboardHeader;
