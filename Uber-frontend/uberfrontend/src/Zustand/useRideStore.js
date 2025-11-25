// useRideStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useRideStore = create((set, get) => ({
  currentRide: null,
    rideOtp: localStorage.getItem('rideOtp') || null,

  token: localStorage.getItem('captaintoken') || null,
  rideHistory: [],
  isLoading: false,
  error: null,
  // Dashboard metrics for user
  stats: {
    totalRides: 0,
    totalSpent: 0,
    activeRide: null,
  },
  bookRide: async (rideData) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/rides/book`, rideData, {
        headers: { Authorization: `Bearer ${token}` },
      });
     const otpValue = response.data.otp || null;
     if (otpValue) {
       localStorage.setItem('rideOtp', otpValue);
     }
     set({
        currentRide: response.data.data,
        rideOtp: otpValue,
        rideStatus: 'searching',
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to book ride',
        isLoading: false,
      });
      throw error;
    }
  },

  calculatetheprice: async (pickup, destination) => {
    try {
      const res = await axios.post(`${API_BASE}/api/fare/calculate`, {
        pickup,
        destination,
      });
      return res.data; // expected { fare: number } or { estimatedFare: number }
    } catch (error) {
      console.error("Error in calculating fare:", error);
      set({
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  fetchCurrentRide: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/user-current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ride = response.data.data;
      set({
        currentRide: ride || null,
        rideStatus: ride?.status || 'idle',
        isLoading: false,
      });
      return ride;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch current ride',
        isLoading: false,
      });
    }
  },

  fetchRideHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/user-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ rideHistory: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ride history',
        isLoading: false,
      });
    }
  },

  cancelRideUser: async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      set({ isLoading: true, error: null });
      await axios.post(
        `${API_BASE}/rides/${rideId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('rideOtp');
      set({ currentRide: null, rideStatus: "idle", isLoading: false, rideOtp: null });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message,
      });
    }
  },

  updateRideStatus: (newStatus) => set({ rideStatus: newStatus }),

  clearCurrentRide: () => set({ currentRide: null, rideStatus: 'idle' }),

  clearError: () => set({ error: null }),

  // Captain functions
StartRide: async (rideId, otp) => {
  set({ isLoading: true, error: null });
  try {
    const token = localStorage.getItem('captaintoken');
    const response = await axios.post(
      `${API_BASE}/rides/${rideId}/start`,
      { otp },   // ✅ SEND OTP HERE
      { headers: { Authorization: `Bearer ${token}` } }
    );

    set({ isLoading: false });
    return response.data;
  } catch (error) {
    set({
      isLoading: false,
      error: error.response?.data?.message || 'Failed to start ride',
    });
    throw error;
  }
},

  finishRide: async (rideId) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('captaintoken');
      const response = await axios.post(
        `${API_BASE}/rides/${rideId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ currentRide: 'completed', rideStatus: 'idle', isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.response?.data?.message || 'Failed to finish ride',
      });
      throw error;
    }
  },

  finishRideuser: async (rideId, otp) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const finalOtp = otp || get().rideOtp || undefined;
      const response = await axios.post(
        `${API_BASE}/rides/${rideId}/completeuser`,
        finalOtp ? { otp: finalOtp } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('rideOtp');
      set({ currentRide: null, rideStatus: 'completed', isLoading: false, rideOtp: null });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to finish ride',
      });
      throw error;
    }
  },

  fetchusermetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        stats: response.data.data,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching stats",
      });
      throw error;
    }
  },
      
  

  cancelRidecaptain: async (rideId) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('captaintoken');
      const response = await axios.post(
        `${API_BASE}/rides/${rideId}/captain-cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ currentRide: null, rideStatus: 'idle', isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to cancel ride',
      });
      throw error;
    }
  },
}));
