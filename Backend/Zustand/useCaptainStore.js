// stores/useCaptainStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useCaptainStore = create((set, get) => ({
  // ===== STATE =====
  
  // Captain Data
  captain: null,
  
  // Authentication
  isAuthenticated: false,
  token: null,
  
  // Ride Management
  availableRides: [],
  currentRide: null,
  rideHistory: [],
  
  // UI State
  isLoading: false,
  error: null,
  
  // ===== ACTIONS =====
  
  // Login Captain
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_BASE}/captains/login`, {
        email,
        password
      });
      
      const { token, captain } = response.data;
      
      localStorage.setItem('token', token);
      
      set({ 
        captain,
        token,
        isAuthenticated: true,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch Available Rides
  fetchAvailableRides: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/rides/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        availableRides: response.data.data,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch rides',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Accept a Ride
  acceptRide: async (rideId) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/rides/${rideId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        currentRide: response.data.data,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to accept ride',
        isLoading: false 
      });
      throw error;
    }
  }
}));