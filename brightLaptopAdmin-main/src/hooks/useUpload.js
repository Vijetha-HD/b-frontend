/**
 * Custom Hook for File Upload Operations
 * Provides easy-to-use functions for image uploads
 */

import { useState, useCallback } from 'react';
import { uploadImages, uploadSingleImage } from '../api/services/upload.service.js';

/**
 * Custom hook for file upload operations
 * @returns {Object} Upload operations and loading/error states
 */
export const useUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Upload multiple images
   */
  const uploadMultiple = useCallback(async (files) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const result = await uploadImages(files);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      setProgress(100);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload images';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload single image
   */
  const uploadSingle = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const result = await uploadSingleImage(file);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      setProgress(100);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadMultiple,
    uploadSingle,
    loading,
    error,
    progress,
  };
};







