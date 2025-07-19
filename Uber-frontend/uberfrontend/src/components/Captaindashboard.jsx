import React, { useState } from 'react';

const Captaindashboard = () => {
  // State for the driver status toggle (Online/Offline)
  const [isOnline, setIsOnline] = useState(false);

  // Reusable ProgressBar component for performance metrics
  const ProgressBar = ({ label, value, icon }) => {
    const percentage = parseInt(value, 10);
    const barColor = percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center text-gray-300">
            {icon && <span className="mr-2 text-base">{icon}</span>}
            <span className="text-sm">{label}</span>
          </div>
          <span className="text-sm font-medium">{value}</span>
        </div>
        {/* Progress bar visual */}
        <div className="w-full bg-black-700 rounded-full h-2.5">
          <div
            className={`${barColor} h-2.5 rounded-full`}
            style={{ width: `${percentage}%` }} // Dynamically set width based on value
          ></div>
        </div>
      </div>
    );
  };

  // DriverStatusToggle component
  const DriverStatusToggle = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Driver Status</h2>
        <p className="text-gray-400 text-sm mb-4">Toggle your availability to receive trip requests</p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg">Go online to start receiving trips</span>
          {/* Toggle switch UI */}
          <div
            className={`relative inline-flex flex-shrink-0 h-6 w-12 border-2 ${
              isOnline ? 'border-green-500 bg-green-500' : 'border-black-600 bg-black-700'
            } rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500`}
            role="switch"
            aria-checked={isOnline}
            onClick={() => setIsOnline(!isOnline)} // Toggles the online status
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                isOnline ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></span>
          </div>
        </div>
        {/* Display current status (Online/Offline) */}
        <div className="text-right mt-2">
           <span className={`text-sm font-medium ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
             {isOnline ? 'Online' : 'Offline'}
           </span>
        </div>
      </div>
    );
  };

  // StatCard component for displaying key metrics
  const StatCard = ({ title, value, change, changeColor, symbol, icon }) => {
    return (
      // Added border border-gray-700
      <div className="bg-black rounded-lg p-6 shadow-md flex flex-col justify-between border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-300">{title}</h3>
          {/* Optional icon for the stat card */}
          {icon && <span className="text-xl">{icon}</span>}
        </div>
        <p className="text-4xl font-bold mb-1">
          {/* Optional symbol (e.g., dollar sign, arrow) */}
          {symbol && <span className="text-2xl mr-1">{symbol}</span>}
          {value}
        </p>
        <p className={`text-sm ${changeColor || 'text-gray-400'}`}>{change}</p>
      </div>
    );
  };

  // CurrentTripCard component to display ongoing trip details
  const CurrentTripCard = () => {
    return (
      // Added border border-gray-700
      <div className="bg-black rounded-lg p-6 shadow-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Trip</h2>
          <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">Active Trip</span>
        </div>
        <p className="text-gray-400 text-sm mb-4">Trip in progress</p>

        {/* Passenger Info */}
        <div className="flex items-center mb-4">
          <img
            src="https://placehold.co/40x40/333333/FFFFFF?text=SM" // Placeholder image for avatar
            alt="Sarah Miller"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-lg font-medium">Sarah Miller</p>
            <p className="text-gray-400 text-sm">4.9 ⭐ · UberX</p>
          </div>
        </div>

        {/* Pickup & Destination details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1 mr-3"></span>
            <div>
              <p className="text-gray-400 text-sm">Pickup</p>
              <p className="font-medium">123 Main Street, Downtown</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1 mr-3"></span>
            <div>
              <p className="text-gray-400 text-sm">Destination</p>
              <p className="font-medium">456 Oak Avenue, Uptown</p>
            </div> {/* Removed the stray backslash here */}
          </div>
        </div>

        {/* Trip remaining time and estimated fare */}
        <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-700 pt-4 mt-4">
          <p className="text-gray-400">12 min remaining</p>
          <p>$18.50 estimated</p>
        </div>
      </div>
    );
  };

  // PerformanceMetricsCard component
  const PerformanceMetricsCard = () => {
    return (
      // Added border border-gray-700
      <div className="bg-black rounded-lg p-6 shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <p className="text-gray-400 text-sm mb-6">Your driving performance this week</p>

        {/* Using the reusable ProgressBar component */}
        <ProgressBar label="Acceptance Rate" value="94%" icon="📊" />
        <ProgressBar label="Completion Rate" value="98%" icon="✅" />
        <ProgressBar label="On-Time Pickup" value="89%" icon="⏰" />
      </div>
    );
  };

  // RecentTripItem component for individual trip entries in the history
  const RecentTripItem = ({ type, rating, pickup, destination, timeAgo, earnings }) => {
    return (
      // Added border border-gray-700
      <div className="bg-black rounded-lg p-6 shadow-md mb-4 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <p className="font-semibold text-lg mr-2">{type}</p>
            {/* Star rating display */}
            <span className="text-yellow-400">
              {'⭐'.repeat(rating)} {/* Repeat star emoji based on rating */}
            </span>
          </div>
          <p className="text-green-400 font-semibold text-lg">${earnings}</p>
        </div>
        {/* Pickup and Destination details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <p className="text-gray-300">{pickup}</p>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            <p className="text-gray-300">{destination}</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm">{timeAgo}</p>
      </div>
    );
  };

  return (
    // Main container for the entire dashboard
    // Added border border-gray-700 to the container for a full-page border effect
    <div className="min-h-screen bg-black text-white p-6 font-sans border border-gray-700">
      <div className="container mx-auto p-4 md:p-8">
        {/* Dashboard Header */}
        <h1 className="text-3xl font-bold mb-8">Captain Dashboard</h1>

        {/* Top Section: Driver Status & Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Driver Status Toggle Card - Added border border-gray-700 */}
          <div className="bg-black rounded-lg p-6 shadow-md md:col-span-2 lg:col-span-1 flex flex-col justify-between border border-gray-700">
            <DriverStatusToggle />
          </div>

          {/* Individual Stat Cards - these now use the StatCard component which has a border */}
          <StatCard
            title="Today's Earnings"
            value="$127.50"
            change="+12% from yesterday"
            changeColor="text-green-400"
            symbol="$"
          />
          <StatCard
            title="This Week"
            value="$892.30"
            change="+8% from last week"
            changeColor="text-green-400"
            symbol="↗"
          />
          <StatCard
            title="Hours Online"
            value="6.5h"
            change="Today's active time"
            icon="⏰"
          />
          <StatCard
            title="Rating"
            value="4.89"
            change="Based on 1,247 trips"
            icon="⭐"
          />
        </div>

        {/* Middle Section: Current Trip & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Trip Card - this now uses the CurrentTripCard component which has a border */}
          <div className="lg:col-span-2">
            <CurrentTripCard />
          </div>

          {/* Performance Metrics Card - this now uses the PerformanceMetricsCard component which has a border */}
          <div className="lg:col-span-1">
            <PerformanceMetricsCard />
          </div>
        </div>

        {/* New Section: Recent Trips - Added border border-gray-700 */}
        <div className="bg-black rounded-lg p-6 shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Recent Trips</h2>
          <p className="text-gray-400 text-sm mb-4">Your latest completed rides</p>

          {/* Example Recent Trip Items - these now use the RecentTripItem component which has a border */}
          <RecentTripItem
            type="UberX"
            rating={4}
            pickup="Downtown Mall"
            destination="Airport Terminal 2"
            timeAgo="2 hours ago"
            earnings="24.50"
          />
          <RecentTripItem
            type="UberX"
            rating={4}
            pickup="Central Station"
            destination="Business District"
            timeAgo="4 hours ago"
            earnings="16.75"
          />
          <RecentTripItem
            type="UberPool"
            rating={3}
            pickup="University Campus"
            destination="Shopping Center"
            timeAgo="6 hours ago"
            earnings="12.25"
          />
          {/* Add more RecentTripItem components as needed */}
        </div>
      </div>
    </div>
  );
}

export default Captaindashboard;