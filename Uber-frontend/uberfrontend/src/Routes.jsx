import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CaptainProtectedRoute from "./components/CaptainProtectedRoute";

// Route-level lazy loading for optimal chunk splitting and fast initial paint
const LaunchPage = lazy(() => import("./components/Launchpage"));
const Auth = lazy(() => import("./components/Auth"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Captaindashboard = lazy(() => import("./components/Captaindashboard"));
const AllRides = lazy(() => import("./components/AllRides"));
const OrderConfirmation = lazy(() => import("./components/OrderConfirmation"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminLiveMap = lazy(() => import("./admin/AdminLiveMap"));

const RouteLoader = () => (
  <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col items-center justify-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#06B6D4] p-[1.5px] animate-pulse">
      <div className="w-full h-full rounded-[10px] bg-[#09090B] flex items-center justify-center font-black text-sm text-[#FAFAFA]">
        N
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
      <span>Loading Nexus...</span>
    </div>
  </div>
);

const AllRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
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
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center text-xl font-bold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AllRoutes;
