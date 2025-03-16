// src/lib/axios.js
import axios from 'axios';

// Create axios instance with default configs
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 30 seconds
});

// Request interceptor - useful for adding auth tokens or modifying requests
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add logic here to add auth tokens from localStorage or cookies
    // Example: if (localStorage.getItem('token')) {
    //   config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - useful for handling common response patterns
axiosInstance.interceptors.response.use(
  (response) => {
    // You can transform response data here if needed
    return response;
  },
  (error) => {
    // Handle common errors here (e.g., 401 unauthorized, 403 forbidden)
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      console.log('Unauthorized - redirecting to login');
      // Example: window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;