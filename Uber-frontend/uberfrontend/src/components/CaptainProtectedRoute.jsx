import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCaptainStore } from "../Zustand/useCaptainStore";
import axios from "axios";

const CaptainProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout, } = useCaptainStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("captaintoken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/captains/profile", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.data) throw new Error("Invalid profile response");

        console.log("Captain profile verified ✅:", res.data);

        // Store the captain profile and mark as authenticated
        useCaptainStore.setState({ captain: res.data, isAuthenticated: true });
      } catch (error) {
        console.error("Captain token validation failed ❌:", error);
        logout();
        localStorage.removeItem("captaintoken");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying captain authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect if loading is finished AND not authenticated
if (!loading && !isAuthenticated) {
  return <Navigate to="/captainlogin" replace />;
}
  return children;
};

export default CaptainProtectedRoute;
