/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} Response with user data and token
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Login failed',
      details: error.response?.data,
    };
  }
};

/**
 * Admin Login
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN,
      credentials
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Admin login failed',
      details: error.response?.data,
    };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Response with user data and token
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Registration failed',
      details: error.response?.data,
    };
  }
};

/**
 * Get current user profile
 * @returns {Promise} Response with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch user profile',
      details: error.response?.data,
    };
  }
};

/**
 * Logout user (client-side only - clears token)
 * Note: Backend doesn't have a logout endpoint since JWT is stateless
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};







