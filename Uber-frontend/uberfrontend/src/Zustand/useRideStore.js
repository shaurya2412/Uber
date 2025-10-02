import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useRideStore = create((set,) => ({
  rideStatus: 'idle', 
    currentRide: null,
      token: localStorage.getItem('captaintoken') || null,

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
  

 cancelRidecaptain: async (rideId) => {
    const token = localStorage.getItem("captaintoken"); // or captaintoken if for captain
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const res = await axios.post(
        `${API_BASE}/rides/${rideId}/captain-cancel`,
        {}, // empty body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update state
      set({
        currentRide: null, // ride is no longer active
        rideStatus: "idle",
        isLoading: false,
      });

      return res.data; // could contain success message or cancelled ride details
    } catch (error) {
      console.error("❌ Failed to cancel ride:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message,
      });
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
  
  clearCurrentRide: () => {
    set({ 
      currentRide: null,
      rideStatus: 'idle' 
    });
  },
    clearError: () => {
    set({ error: null });
  }
}));