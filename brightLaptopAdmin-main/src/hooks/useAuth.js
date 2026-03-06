/**
 * Custom Hook for Authentication Operations
 * Provides easy-to-use functions for authentication
 */

import { useState, useCallback } from 'react';
import { login, adminLogin,register, getCurrentUser, logout as authLogout } from '../api/services/auth.service.js';

/**
 * Custom hook for authentication operations
 * @returns {Object} Auth operations and loading/error states
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Login user
   */
 const handleLogin = useCallback(async (email, password) => {
  setLoading(true);
  setError(null);

  try {
    // 🔥 Use ADMIN LOGIN instead of normal login
    const result = await adminLogin({ email, password });

    if (!result.success) {
      setError(result.error);
      return { success: false, error: result.error };
    }

    // const { token, user } = result.data.data;
const { accessToken, refreshToken, admin } = result.data.data;

localStorage.setItem('token', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(admin));
return { success: true, data: { token: accessToken, user: admin } };


    // 🔥 Store as ADMIN TOKEN (important)
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));

    return { success: true, data: { token, user } };
  } catch (err) {
    const errorMessage = err.message || 'Admin login failed';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
}, []);


  /**
   * Register new user
   */
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await register(userData);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      // Store token and user data
      const { token, user } = result.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, data: { token, user } };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current user profile
   */
  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCurrentUser();
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const handleLogout = useCallback(() => {
    authLogout();
    return { success: true };
  }, []);

  return {
    handleLogin,
    handleRegister,
    fetchCurrentUser,
    handleLogout,
    loading,
    error,
  };
};







