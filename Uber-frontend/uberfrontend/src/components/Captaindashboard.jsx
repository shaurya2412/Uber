import React, { use, useState } from "react";
import {
  Phone,
  MessageSquare,
  X,
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Star,
  User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCaptainStore } from "../Zustand/useCaptainStore";

const weeklyEarnings = [
  { day: "Mon", earnings: 120 },
  { day: "Tue", earnings: 95 },
  { day: "Wed", earnings: 140 },
  { day: "Thu", earnings: 110 },
  { day: "Fri", earnings: 156 },
  { day: "Sat", earnings: 180 },
  { day: "Sun", earnings: 85 },
];

const recentTrips = [
  { name: "Mike Chen", time: "2:30 PM", id: "R123455", fare: 18.25, rating: 5 },
  { name: "Emma Davis", time: "1:45 PM", id: "R123454", fare: 32.1, rating: 4 },
  { name: "John Smith", time: "12:20 PM", id: "R123453", fare: 15.8, rating: 5 },
];

// Card wrapper
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
    {children}
  </div>
);

const CaptainDashboard = () => {
  const {token, active} = useCaptainStore;

  const [isactive, setIsActive] = useState();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-sm font-semibold text-gray-900">Captain Dashboard</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Status:</span>

          <button
            onClick={() => setIsActive(!isactive)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
              isactive ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isactive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          {/* Status Text */}
          <span
            className={`flex items-center font-medium ${
              isactive ? "text-green-600" : "text-red-600"
            }`}
          >
            ● {isactive ? "Online" : "Offline"}
          </span>
          <img
            src="https://i.pravatar.cc/40"
            alt="Captain"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left side */}
        <div className="col-span-8 space-y-6">
          {/* Current Ride */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Current Ride</h2>
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                In Progress
              </span>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://i.pravatar.cc/100?img=5"
                alt="Passenger"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-gray-800 font-medium">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">Ride ID: R123456</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <p className="text-sm text-gray-700">123 Main St, Downtown</p>
              </div>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-700">456 Oak Ave, Uptown</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span className="flex items-center space-x-1">
                <Navigation className="w-4 h-4" /> <p>8.2 km</p>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" /> <p>15 min</p>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" /> <p>$24.5</p>
              </span>
            </div>
            <div className="flex space-x-3">
              <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Recent Trips */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Trips</h2>
            <div className="space-y-4">
              {recentTrips.map((trip, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{trip.name}</p>
                      <p className="text-sm text-gray-500">
                        {trip.time} • {trip.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 font-medium">${trip.fare}</p>
                    <p className="text-sm text-green-600 flex items-center justify-end">
                      <Star className="w-4 h-4 mr-1" /> {trip.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right side */}
        <div className="col-span-4 space-y-6">
          {/* Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">$156.75</p>
                <p className="text-sm text-gray-500">Earnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-sm text-gray-500">Trips</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">6.5h</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">4.9</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </Card>

          {/* Weekly Earnings */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Earnings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyEarnings}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Go to Popular Area
              </button>
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Break Time
              </button>
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                View Analytics
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
