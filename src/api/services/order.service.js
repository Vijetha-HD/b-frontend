/**
 * Order API Service
 * Handles order-related API calls
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Get all orders
 * @param {Object} params - Query params (status, orderType)
 * @returns {Promise} Response with list of orders
 */
export const getOrders = async (params = {}) => {
    try {
        const response = await axiosInstance.get(
            API_CONFIG.ENDPOINTS.ORDERS.GET_ALL,
            { params }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch orders',
            details: error.response?.data,
        };
    }
};

/**
 * Update order status
 * @param {string} orderId 
 * @param {string} status 
 * @returns {Promise} Response
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axiosInstance.put(
            API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
            { status }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to update order status',
            details: error.response?.data,
        };
    }
};

/**
 * Get invoice data
 * @param {string} orderId
 * @returns {Promise} Response with invoice data
 */
export const getInvoice = async (orderId) => {
    try {
        const response = await axiosInstance.get(
            API_CONFIG.ENDPOINTS.ORDERS.INVOICE(orderId)
        );
        return {
            success: true,
            data: response.data?.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch invoice',
            details: error.response?.data,
        };
    }
};
