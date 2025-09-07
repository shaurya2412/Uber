// stores/useUserStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useUserStore = create((set) => ({
  // ===== STATE =====
  
  // User Data
  user: null,
  
  // Authentication
  isAuthenticated: false,
  token: null,
  
  // UI State
  isLoading: false,
  error: null,
  
  // ===== ACTIONS =====
  
  // Login User
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_BASE}/users/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      set({ 
        user, 
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


  
  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null,
      token: null,
      isAuthenticated: false 
    });
  },

fetchProfile: async () => {
  set({ isLoading: true, error: null });
  
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    set({ 
      user: response.data,
      isAuthenticated: true,   // 👈 FIX: mark authenticated
      token,                   // 👈 optional: keep token in store
      isLoading: false 
    });
    
    return response.data;
  } catch (error) {
    set({ 
      error: error.response?.data?.message || 'Failed to fetch profile',
      isAuthenticated: false,  // 👈 explicitly reset auth on error
      token: null,
      user: null,
      isLoading: false 
    });
    throw error;
  }
}

}));