import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

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
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, captain: null, active: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_BASE}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({
        captain: response.data.captain,
        active: response.data.captain.active,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      get().logout();
      set({
        error: error.response?.data?.message || 'Failed to fetch captain profile',
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
const token = get().token;

    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`${API_BASE}/captains/status`,
        { active: newActiveState },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      set({
        active: response.data.captain.active,
        isLoading: false,
        error: null,
      });
    } catch (error) {
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