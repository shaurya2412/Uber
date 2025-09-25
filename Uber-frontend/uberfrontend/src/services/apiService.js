import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Create axios instances for different user types
const userApi = axios.create({
  baseURL: API_BASE,
});

const captainApi = axios.create({
  baseURL: API_BASE,
});

// Request interceptors to add auth tokens
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

captainApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('captaintoken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // User APIs
  user: {
    login: async (email, password) => {
      const response = await userApi.post('/users/login', { email, password });
      return response.data;
    },

    register: async (userData) => {
      const response = await userApi.post('/users/register', userData);
      return response.data;
    },

    getProfile: async () => {
      const response = await userApi.get('/users/profile');
      return response.data;
    }
  },

  // Captain APIs
  captain: {
    login: async (email, password) => {
      const response = await captainApi.post('/captains/login', { email, password });
      return response.data;
    },

    register: async (captainData) => {
      const response = await captainApi.post('/captains/register', captainData);
      return response.data;
    },

    getProfile: async () => {
      const response = await captainApi.get('/captains/profile');
      return response.data;
    },

    updateStatus: async (active) => {
      const response = await captainApi.put('/captains/status', { active });
      return response.data;
    }
  },

  // Ride APIs
  ride: {
    // User ride operations
    bookRide: async (rideData) => {
      const response = await userApi.post('/rides/book', rideData);
      return response.data;
    },

    getUserCurrentRide: async () => {
      const response = await userApi.get('/rides/user-current');
      return response.data;
    },

    getUserRideHistory: async () => {
      const response = await userApi.get('/rides/user-history');
      return response.data;
    },

    cancelRide: async (rideId) => {
      const response = await userApi.post(`/rides/${rideId}/cancel`);
      return response.data;
    },

    // Captain ride operations
    getAvailableRides: async () => {
      const response = await captainApi.get('/rides/available');
      return response.data;
    },

    acceptRide: async (rideId) => {
      const response = await captainApi.post(`/rides/${rideId}/accept`);
      return response.data;
    },

    startRide: async (rideId) => {
      const response = await captainApi.post(`/rides/${rideId}/start`);
      return response.data;
    },

    completeRide: async (rideId) => {
      const response = await captainApi.post(`/rides/${rideId}/complete`);
      return response.data;
    },

    getCurrentRide: async () => {
      const response = await captainApi.get('/rides/current');
      return response.data;
    },

    getRideHistory: async () => {
      const response = await captainApi.get('/rides/history');
      return response.data;
    },

    updateLocation: async (rideId, lat, lng) => {
      const response = await captainApi.put(`/rides/${rideId}/location`, { lat, lng });
      return response.data;
    }
  },

  // Fare calculation API
  fare: {
    calculate: async (pickup, destination) => {
      const response = await axios.post(`${API_BASE}/calculate/calculate`, {
        pickup,
        destination
      });
      return response.data;
    }
  },

  // Google OAuth API
  auth: {
    googleLogin: async (token) => {
      const response = await axios.post(`${API_BASE}/auth/google`, { token });
      return response.data;
    }
  }
};

export default apiService;
