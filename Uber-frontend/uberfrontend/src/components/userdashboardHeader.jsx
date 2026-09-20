import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Bell, User, LogOut, History, Wallet, Shield } from "lucide-react";
import { useRideStore } from "../Zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserstore";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const UserDashboardHeader = () => {
  const navigate = useNavigate();
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
    "Passenger";

  return (
    <header className="w-full flex justify-between items-center px-6 lg:px-10 py-3.5 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-[#1E1E2E] z-30 sticky top-0">
      {/* Left: Logo & Nav */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 text-[#7C3AED] group-hover:rotate-45 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-[#F8FAFC]">
            Nexus<span className="text-[#06B6D4]">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#94A3B8]">
          <Link to="/dashboard" className="text-[#F8FAFC] hover:text-[#7C3AED] transition-colors">
            Ride Booking
          </Link>
          <Link to="/rides" className="hover:text-[#F8FAFC] transition-colors">
            Trip History
          </Link>
          <Link to="/admin" className="hover:text-[#06B6D4] transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Fleet Admin
          </Link>
        </nav>
      </div>

      {/* Right Section: Solana Wallet + Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Solana Wallet Button */}
        <div className="hidden sm:flex items-center gap-2">
          <WalletMultiButton className="!bg-[#1A1A24] hover:!bg-[#2D2D3F] !border !border-[#2D2D3F] !text-[#F8FAFC] !px-3.5 !py-1.5 !rounded-xl !text-xs !font-bold !h-9 transition-colors" />
          {publicKey && (
            <span className="text-[11px] font-mono text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-1 rounded-lg">
              {shortenAddress(publicKey.toBase58())}
            </span>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#111118] border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-0.5 flex items-center justify-center text-white">
              <User className="w-4 h-4 text-[#F8FAFC]" />
            </div>
            <span className="text-xs font-semibold text-[#F8FAFC]">{riderName}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111118] border border-[#2D2D3F] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] z-50 py-2 overflow-hidden">
              <div className="px-4 py-2 border-b border-[#1E1E2E]">
                <p className="text-xs font-bold text-[#F8FAFC] truncate">{riderName}</p>
                <p className="text-[10px] text-[#94A3B8] truncate">{user?.email || "rider@nexus.app"}</p>
              </div>

              <button
                onClick={() => {
                  navigate("/rides");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#1A1A24] flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <History className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>My Rides</span>
              </button>

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
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-500/10 flex items-center gap-2.5 text-xs text-[#EF4444] font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserDashboardHeader;
