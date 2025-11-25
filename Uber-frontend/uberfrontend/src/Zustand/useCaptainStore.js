import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

export const useCaptainStore = create((set,get) => ({
  captain: null,
  active: false,
  isAuthenticated: !!localStorage.getItem('captaintoken'),
  token: localStorage.getItem('captaintoken') || null,
  availableRides: [],
  currentRide: null,
  rideHistory: [],
  isLoading: false,
  error: null,
    setAuthenticated: (value) => set({ isAuthenticated: value }),

    fetchCaptainProfile: async () => {
    const token = get().token || localStorage.getItem('captaintoken');
    console.log('🔍 Fetching captain profile - Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found, logging out');
      set({ isAuthenticated: false, captain: null, active: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('📡 Making profile request to:', `${API_BASE}/captains/profile`);
      const response = await axios.get(`${API_BASE}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Profile response:', response.data);
      set({
        captain: response.data.captain,
        active: response.data.captain.active || false,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Profile fetch error:', error.response?.data || error.message);
      get().logout();
      set({
        error: error.response?.data?.message || 'Failed to fetch captain profile',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch captain's current active ride (accepted or in_progress)
  fetchCurrentRide: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = get().token || localStorage.getItem('captaintoken');
      const response = await axios.get(`${API_BASE}/rides/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ currentRide: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      // If 404 no active ride, clear without treating as an error
      const status = error?.response?.status;
      if (status === 404) {
        set({ currentRide: null, isLoading: false });
        return null;
      }
      set({
        error: error.response?.data?.message || 'Failed to fetch current ride',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch captain's completed ride history
  fetchRideHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = get().token || localStorage.getItem('captaintoken');
      const response = await axios.get(`${API_BASE}/rides/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ rideHistory: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ride history',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_BASE}/captains/login`, {
        email,
        password
      });
      
      const { token, captain } = response.data;
      
      localStorage.setItem('captaintoken', token);
      
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

    
 toggleActive: async () => {
 const currentActiveState = get().active;
const newActiveState = !currentActiveState;
const token = get().token || localStorage.getItem('captaintoken');

console.log('🔄 Toggle active - Current state:', currentActiveState, 'New state:', newActiveState);
console.log('🎫 Token exists:', !!token);
console.log('🎫 Token preview:', token ? token.substring(0, 20) + '...' : 'null');

    set({ isLoading: true, error: null });

    if (!token) {
      set({
        error: 'No authentication token found',
        isLoading: false,
      });
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE}/captains/status`,
        { active: newActiveState },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Toggle response:', response.data);
      
      set({
        active: response.data.captain.active,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Toggle error:', error.response?.data || error.message);
      set({
        error: error.response?.data?.message || 'Failed to update status',
        isLoading: false,
      });
      throw error;
    }
  },

logout: () =>{
localStorage.removeItem ('captaintoken');
set({
  captain:null,
  isAuthenticated: false,
  token: null
})
},
    fetchAvailableRides: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('captaintoken');
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
  
  acceptRide: async (rideId) => { 
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('captaintoken');
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