import React, { useEffect, useRef, useState } from "react";
import { FaCar } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { MdHistory } from "react-icons/md";

import { useCaptainStore } from "../Zustand/useCaptainStore";

const CaptainDashboardHeader = () => {
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
      alert(
        "Failed to update status: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    window.location.href = "/captainlogin";
  };

  const fullName = captain?.fullname;
  const displayName = fullName
    ? `${fullName.firstname || ""} ${fullName.lastname || ""}`.trim() ||
      "Captain"
    : "Captain";
  const initials =
    displayName && displayName !== "Captain"
      ? displayName
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "CP";

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between px-8 py-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaCar size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Captain Control Center
            </p>
            <p className="text-lg font-semibold text-gray-900">{displayName}</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-600 font-medium">
          <span className="text-black cursor-default">Dashboard</span>
          <span className="cursor-pointer hover:text-black">My Rides</span>
          <span className="cursor-pointer hover:text-black">Earnings</span>
        </nav>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status</span>
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                active ? "bg-green-500" : "bg-gray-400"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                active ? "text-green-600" : "text-red-600"
              }`}
            >
              ● {active ? "Online" : "Offline"}
            </span>
          </div>

          <IoNotificationsOutline
            size={22}
            className="text-gray-800 cursor-pointer"
          />

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                {initials}
              </div>
              <span className="text-sm text-gray-800 hidden sm:inline-block">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                  <CgProfile size={18} /> Profile
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                  <MdHistory size={18} /> Ride history
                </button>
                <hr className="border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                >
                  <CiLogout size={18} /> Logout
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
