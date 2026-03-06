/**
 * Specification API Service
 * Handles fetching dynamic specification options (RAM, Storage, etc.)
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Fetch all specification options
 * @returns {Promise} Response with spec options
 */
export const fetchSpecifications = async () => {
    try {
        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.SPECIFICATIONS.GET_ALL);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to fetch specifications',
        };
    }
};
