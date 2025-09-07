import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../Zustand/useUserstore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated,  fetchProfile, logout } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && !isAuthenticated) {
        try {
          await fetchProfile();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, fetchProfile, logout]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

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

  return children;
};

export default ProtectedRoute;
