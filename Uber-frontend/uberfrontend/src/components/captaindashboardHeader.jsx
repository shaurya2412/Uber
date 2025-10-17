import React, { useState, useRef, useEffect } from "react";
import { FaCar } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { BsWallet2 } from "react-icons/bs";
import { MdHistory } from "react-icons/md";

import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserStore";

const CapDashboardHeader = () => {
  const { currentRide } = useRideStore();
  const {logout, isAuthenticated,fetchProfile } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <header className="w-full flex justify-between items-center px-8 py-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-8">
             <h1 className="font-semibold text-gray-600">Captain Dashboard</h1>
             <div className="flex items-center space-x-3">
               <div>
                 <button
                   onClick={() => {
                     useCaptainStore.getState().logout();
                     window.location.href = "/captainlogin";
                   }}
                 >
                   Logout
                 </button>
               </div>
     
               <span className="text-sm text-gray-600">Status:</span>
     
               <button
                 onClick={async () => {
                   if (isToggling) return;
                   console.log("Toggle clicked, current active state:", active);
                   setIsToggling(true);
                   try {
                     const result = await toggleActive();
                     console.log("Toggle result:", result);
                   } catch (error) {
                     console.error("Error toggling status:", error);
                     alert(
                       "Failed to update status: " +
                         (error.response?.data?.message || error.message)
                     );
                   } finally {
                     setIsToggling(false);
                   }
                 }}
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
                 className={`flex items-center font-medium ${
                   active ? "text-green-600" : "text-red-600"        
                 }`}
               >
                 ● {active ? "Online" : "Offline"}
               </span>
               <div className="text-blue-600 shadow-2xl"> {captain?.fullname.firstname} {captain?.fullname.lastname}</div>
               <img
                 src="https://i.pravatar.cc/40"
                 alt="Captain"
                 className="w-10 h-10 rounded-full border border-gray-300"
               />
             </div>
           </div>
    </header>
  );
};

export default CapDashboardHeader;
