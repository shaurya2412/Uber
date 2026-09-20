import React from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Captaindashboard from "./components/Captaindashboard";
import LaunchPage from "./components/Launchpage";
import ProtectedRoute from "./components/ProtectedRoute";
import CaptainProtectedRoute from "./components/CaptainProtectedRoute";
import AllRides from "./components/AllRides";
import OrderConfirmation from "./components/OrderConfirmation";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLiveMap from "./admin/AdminLiveMap";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LaunchPage />} />
      <Route path="/login" element={<Auth initialMode="signin" initialRole="user" />} />
      <Route path="/Welcome" element={<Auth initialMode="signup" initialRole="user" />} />
      <Route path="/captainlogin" element={<Auth initialMode="signin" initialRole="captain" />} />
      <Route path="/captainRegister" element={<Auth initialMode="signup" initialRole="captain" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rides"
        element={
          <ProtectedRoute>
            <AllRides />
          </ProtectedRoute>
        }
      />
      <Route
        path="/capdashboard"
        element={
          <CaptainProtectedRoute>
            <Captaindashboard />
          </CaptainProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/live-map" element={<AdminLiveMap />} />
      <Route path="*" element={<div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] flex items-center justify-center text-xl font-bold">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AllRoutes;
