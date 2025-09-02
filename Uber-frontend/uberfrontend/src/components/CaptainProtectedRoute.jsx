import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useCaptainStore } from '../Zustand/useCaptainStore';

const CaptainProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout } = useCaptainStore();

  useEffect(() => {
    // Check if captain is authenticated on component mount
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && !isAuthenticated) {
        try {
          // Try to validate token by making a request to captain profile
          // You might want to add a fetchCaptainProfile method to the store
          const response = await fetch('http://localhost:5000/captains/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Token validation failed');
          }
        } catch (error) {
          // If token is invalid, logout and clear storage
          console.error('Captain token validation failed:', error);
          logout();
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, logout]);

  // If no token in localStorage, redirect to captain login
  if (!localStorage.getItem('token')) {
    return <Navigate to="/captainlogin" replace />;
  }

  // If not authenticated (even with token), show loading or redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying captain authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected component
  return children;
};

export default CaptainProtectedRoute;
