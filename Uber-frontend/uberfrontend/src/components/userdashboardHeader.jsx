import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, History, Shield, ChevronDown } from "lucide-react";
import { useRideStore } from "../Zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserstore";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const UserDashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRide } = useRideStore();
  const { user, logout, isAuthenticated, fetchProfile } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile?.();
    }
  }, [isAuthenticated, user, fetchProfile]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shortenAddress = (address) =>
    address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  const riderName =
    user?.fullname?.firstname ||
    user?.name ||
    currentRide?.user?.fullname?.firstname ||
    "Rider";

  return (
    <header className="w-full flex justify-between items-center px-5 lg:px-8 h-16 bg-[#09090B]/95 backdrop-blur-xl border-b border-white/[0.08] z-30 sticky top-0">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-black text-sm group-hover:bg-[#10B981] transition-colors">
            N
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#FAFAFA]">
            Nexus
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <Link
            to="/dashboard"
            className={`transition-colors ${
              location.pathname === "/dashboard"
                ? "text-[#FAFAFA]"
                : "text-[#A1A1AA] hover:text-[#FAFAFA]"
            }`}
          >
            Book a Ride
          </Link>
          <Link
            to="/rides"
            className={`transition-colors ${
              location.pathname === "/rides"
                ? "text-[#FAFAFA]"
                : "text-[#A1A1AA] hover:text-[#FAFAFA]"
            }`}
          >
            Past Trips & Receipts
          </Link>
          <Link
            to="/admin"
            className="text-[#A1A1AA] hover:text-[#10B981] transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Fleet Operations</span>
          </Link>
        </nav>
      </div>

      {/* Right: Wallet & Account Menu */}
      <div className="flex items-center gap-3.5">
        <div className="hidden sm:flex items-center gap-2">
          <WalletMultiButton className="!bg-[#121215] hover:!bg-[#18181C] !border !border-white/[0.1] !text-[#FAFAFA] !px-3.5 !py-1.5 !rounded-lg !text-xs !font-semibold !h-9 transition-colors" />
          {publicKey && (
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-1 rounded-md">
              {shortenAddress(publicKey.toBase58())}
            </span>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121215] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-bold text-xs">
              {riderName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#FAFAFA]">{riderName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121215] border border-white/[0.12] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 py-1.5 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-white/[0.07]">
                <p className="text-xs font-bold text-[#FAFAFA] truncate">{riderName}</p>
                <p className="text-[10px] font-mono text-[#A1A1AA] truncate">
                  {user?.email || "Signed in"}
                </p>
              </div>

              <button
                onClick={() => {
                  navigate("/rides");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#18181C] flex items-center gap-2.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Past Trips</span>
              </button>

              <button
                onClick={() => {
                  navigate("/admin");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#18181C] flex items-center gap-2.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#FAFAFA]" />
                <span>Fleet Ops</span>
              </button>

              <div className="my-1 border-t border-white/[0.07]" />

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
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

export default UserDashboardHeader;
