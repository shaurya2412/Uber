import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../Zustand/useUserstore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, fetchProfile, logout } = useUserStore();

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && !isAuthenticated) {
        try {
          // Try to fetch user profile to validate token
          await fetchProfile();
        } catch (error) {
          // If token is invalid, logout and clear storage
          console.error('Token validation failed:', error);
          logout();
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, fetchProfile, logout]);

  // If no token in localStorage, redirect to login
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  // If not authenticated (even with token), show loading or redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
