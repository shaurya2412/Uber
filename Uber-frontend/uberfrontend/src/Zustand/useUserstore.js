// stores/useUserStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useUserStore = create((set) => ({
  
  user: null,
  isAuthenticated: false,
  token: null,  
  isLoading: false,
  error: null,
    
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_BASE}/users/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
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
      isAuthenticated: true,  
      token,                   
      isLoading: false 
    });
    
    return response.data;
  } catch (error) {
    set({ 
      error: error.response?.data?.message || 'Failed to fetch profile',
      isAuthenticated: false,  
      token: null,
      user: null,
      isLoading: false 
    });
    throw error;
  }
}

}));