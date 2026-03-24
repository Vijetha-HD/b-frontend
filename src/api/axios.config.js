/**
 * Axios Configuration
 * Centralized axios instance with interceptors for authentication and error handling
 */

import axios from 'axios';
import API_CONFIG from '../config/api.config.js';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous logout redirects
let isRedirecting = false;

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('BrightLaptopAdmin API Request Interceptor - URL:', config.url);
    console.log('BrightLaptopAdmin API Request Interceptor - Token found in localStorage:', !!token);

    // Add token to Authorization header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('BrightLaptopAdmin API Request Interceptor - NO TOKEN FOUND in localStorage');
    }

    // Don't override Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error responses and authentication failures
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Prevent multiple simultaneous redirects
      if (!isRedirecting) {
        isRedirecting = true;

        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        } else {
          // Reset flag after delay if already on login page
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

