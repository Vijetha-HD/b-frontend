/**
 * Warehouse API Service
 * Handles warehouse-related API calls
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Get all warehouses
 * @returns {Promise} Response with list of warehouses
 */
export const getWarehouses = async (params = {}) => {
    try {
        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.WAREHOUSES.GET_ALL, { params });
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch warehouses',
            details: error.response?.data,
        };
    }
};

/**
 * Create a new warehouse
 * @param {Object} warehouseData 
 * @returns {Promise} Response
 */
export const createWarehouse = async (warehouseData) => {
    try {
        const response = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.WAREHOUSES.CREATE,
            warehouseData
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to create warehouse',
            details: error.response?.data,
        };
    }
};
