import React from "react";
import { FaCar } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";

import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserStore";

const UserDashboardHeader = () => {
   const {
    rideHistory,
    fetchRideHistory,
    currentRide,
    isLoading,
    error,
  } = useRideStore();

  const {logout,token} = useUserStore();
  console.log(currentRide);
  return (
    <header className="w-full flex justify-between items-center px-8 py-3 bg-white shadow-sm">
      {/* Left Section: Logo + Navigation */}
      <div className="flex items-center space-x-12">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-black text-white p-2 rounded-lg">
            <FaCar size={18} />
          </div>
          <span className=" text-sm text-black font-semibold">RideGo</span>
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

      {/* Right Section: Notifications + Profile */}
      <div className="flex items-center space-x-6">
        {/* Notification Icon */}
        <div className="relative ">
          <IoNotificationsOutline size={22} color="black" className="cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5">
            2
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <CgProfile size={20} color="black"/>
          </div>
          <span className="text-gray-800 font-medium">{currentRide?.captain?.fullname.firstname}</span>
        </div>
        <div>
          <button onClick={logout} className="text-white bg-white font-medium"><CiLogout/></button>
        </div>
      </div>
    </header>
  );
};

export default UserDashboardHeader;
