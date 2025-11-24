import React, { useState, useRef, useEffect } from "react";
import { FaCar } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { BsWallet2 } from "react-icons/bs";
import { MdHistory } from "react-icons/md";

import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserStore";

// ✅ Solana wallet imports
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const UserDashboardHeader = () => {
  const { currentRide } = useRideStore();
  const { logout, isAuthenticated, fetchProfile } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Solana wallet hook
  const { publicKey } = useWallet();

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Shorten wallet address for display
  const shortenAddress = (address) =>
    address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  return (
    <header className="w-full flex justify-between items-center px-8 py-3 bg-white shadow-sm">
      {/* Left Section: Logo + Navigation */}
      <div className="flex items-center space-x-12">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaCar size={18} />
          </div>
          <span className="text-sm text-black font-semibold">RideGo</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6 text-gray-600 font-medium">
          <span className="text-black cursor-pointer">Dashboard</span>
          <span className="cursor-pointer hover:text-black">My Rides</span>
          <span className="cursor-pointer bg-gray-100 px-3 py-1 rounded-md text-black">
            Wallet
          </span>
        </nav>
      </div>

      {/* Right Section: Wallet + Notifications + Profile */}
      <div className="flex items-center space-x-6 relative">
        {/* ✅ Solana Wallet Connect Button */}
        <div className="flex items-center gap-2">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium" />
          {publicKey && (
            <span className="text-xs text-gray-600 font-medium">
              {shortenAddress(publicKey.toBase58())}
            </span>
          )}
        </div>

        {/* Notification Icon */}
        <div className="relative">
          <IoNotificationsOutline
            size={22}
            color="black"
            className="cursor-pointer"
          />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5">
            2
          </span>
        </div>

        {/* Profile + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <CgProfile size={20} color="black" />
            </div>
            <span className="text-gray-800 font-medium">
              {currentRide?.user?.fullname?.firstname || "User"}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden transition-all duration-150 ease-out">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <CgProfile size={16} /> Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <MdHistory size={16} /> My Rides
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <BsWallet2 size={16} /> Wallet
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
              >
                <CiLogout size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserDashboardHeader;
