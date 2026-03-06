/**
 * Brand API Service
 * Handles all brand-related API calls
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Fetch all brands
 * @returns {Promise} Response with brands list
 */
export const fetchBrands = async () => {
    try {
        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BRANDS.GET_ALL);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to fetch brands',
        };
    }
};

/**
 * Create new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise} Response with created brand
 */
export const createBrand = async (brandData) => {
    try {
        const response = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.BRANDS.CREATE,
            brandData
        );
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to create brand',
        };
    }
};
