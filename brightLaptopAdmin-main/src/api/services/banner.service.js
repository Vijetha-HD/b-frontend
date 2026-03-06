/**
 * Banner API Service (Admin)
 * Handles banner CRUD operations via the backend API.
 */

import axiosInstance from "../axios.config.js";
import API_CONFIG from "../../config/api.config.js";

/**
 * Fetch all active banners
 */
export const getBanners = async () => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.BANNERS.GET_ALL,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch banners",
    };
  }
};

/**
 * Add a new banner
 * @param {{ imageUrl: string, publicId: string }} data
 */
export const addBanner = async (data) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.BANNERS.ADD,
      data,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to add banner",
    };
  }
};

/**
 * Delete a banner by ID
 * @param {string} id
 */
export const deleteBanner = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.BANNERS.DELETE(id),
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete banner",
    };
  }
};

/**
 * Replace a banner's image
 * @param {string} id
 * @param {{ imageUrl: string, publicId: string }} data
 */
export const replaceBanner = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.BANNERS.REPLACE(id),
      data,
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to replace banner",
    };
  }
};

/**
 * Reorder banners
 * @param {{ id: string, order: number }[]} banners
 */
export const reorderBanners = async (banners) => {
  try {
    const response = await axiosInstance.patch(
      API_CONFIG.ENDPOINTS.BANNERS.REORDER,
      { banners },
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to reorder banners",
    };
  }
};
