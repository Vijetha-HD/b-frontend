/**
 * Upload API Service
 * Handles file uploads (images) to Cloudinary
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Upload multiple images
 * @param {FileList|File[]} files - Array of image files
 * @returns {Promise} Response with uploaded image URLs
 */
export const uploadImages = async (files) => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Convert FileList to Array if needed
    const filesArray = Array.from(files);
    
    // Append each file to FormData
    filesArray.forEach((file) => {
      formData.append('images', file);
    });
    
    // Make request - don't set Content-Type header, let axios/browser handle it
    // This ensures proper boundary is set for multipart/form-data
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.UPLOAD.IMAGES,
      formData
    );
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to upload images',
      details: error.response?.data,
    };
  }
};

/**
 * Upload single image
 * @param {File} file - Image file
 * @returns {Promise} Response with uploaded image URL
 */
export const uploadSingleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Make request - don't set Content-Type header, let axios/browser handle it
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.UPLOAD.SINGLE_IMAGE,
      formData
    );
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to upload image',
      details: error.response?.data,
    };
  }
};

