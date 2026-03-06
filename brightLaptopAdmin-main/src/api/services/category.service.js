/**
 * Category API Service
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Fetch all categories
 * @returns {Promise} Response
 */
export const fetchCategories = async () => {
    try {
        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL);
        // Backend returns: { success: true, count: N, data: { categories: [...] } }
        return {
            success: true,
            data: response.data?.data?.categories || [],
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch categories',
        };
    }
};

/**
 * Get category by name/slug
 * @param {string} name
 */
export const fetchCategoryByName = async (name) => {
    try {
        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.CATEGORIES.GET_BY_NAME(name));
        return {
            success: true,
            data: response.data?.data || response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch category',
        };
    }
}

/**
 * Create a new category
 * @param {Object} categoryData
 * @returns {Promise} Response
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, categoryData);
        return {
            success: true,
            data: response.data?.data?.category || response.data?.data || null,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to create category',
        };
    }
};
