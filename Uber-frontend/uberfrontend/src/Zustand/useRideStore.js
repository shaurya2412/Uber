// useRideStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useRideStore = create((set) => ({
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
      const response = await axios.post(`${API_BASE}/rides/book`, rideData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        currentRide: response.data.data,
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
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_BASE}/api/fare/calculate`, {
        pickup,
        destination,
      });
      set({ isLoading: false });
      return res.data; // expected { fare: number } or { estimatedFare: number }
    } catch (error) {
      console.error("Error in calculating fare:", error);
      set({
        isLoading: false,
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
      set({ currentRide: null, rideStatus: "idle", isLoading: false });
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
}));
