/**
 * Complaint API Service
 * Handles complaint-related API calls
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Get complaints
 * @param {Object} params - Query params (userId, status, orderId)
 * @returns {Promise} Response with list of complaints
 */
export const getComplaints = async (params = {}) => {
    try {
        const response = await axiosInstance.get(
            API_CONFIG.ENDPOINTS.COMPLAINTS.GET_ALL,
            { params }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch complaints',
            details: error.response?.data,
        };
    }
};

/**
 * Update complaint status
 * @param {string} id 
 * @param {Object} data - { status, adminNotes, priority }
 * @returns {Promise} Response
 */
export const updateComplaintStatus = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            API_CONFIG.ENDPOINTS.COMPLAINTS.UPDATE_STATUS(id),
            data
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to update complaint',
            details: error.response?.data,
        };
    }
};
