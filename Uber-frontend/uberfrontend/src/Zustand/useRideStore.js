// stores/useRideStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useRideStore = create((set,) => ({
  rideStatus: 'idle', 
    currentRide: null,
    rideHistory: [],
    isLoading: false,
  error: null,

  bookRide: async (rideData) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/rides/book`, rideData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        currentRide: response.data.data,
        rideStatus: 'searching',
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to book ride',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch Current Active Ride
  fetchCurrentRide: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/user-current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ride = response.data.data;
      if (ride) {
        set({ 
          currentRide: ride,
          rideStatus: ride.status,
          isLoading: false 
        });
      } else {
        set({ 
          currentRide: null,
          rideStatus: 'idle',
          isLoading: false 
        });
      }
      
      return ride;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch current ride',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch Ride History
  fetchRideHistory: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/user-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        rideHistory: response.data.data,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch ride history',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update Ride Status
  updateRideStatus: (newStatus) => {
    set({ rideStatus: newStatus });
  },
  
  // Clear Current Ride (after completion)
  clearCurrentRide: () => {
    set({ 
      currentRide: null,
      rideStatus: 'idle' 
    });
  },
  
  // Clear Error
  clearError: () => {
    set({ error: null });
  }
}));