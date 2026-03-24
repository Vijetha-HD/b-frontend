/**
 * Shipping API Service
 * Handles Shiprocket related operations
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Create a shipment for an order
 * @param {Object} shipmentData - { orderId, length, breadth, height, weight }
 * @returns {Promise} Response
 */
export const createShipment = async (shipmentData) => {
    try {
        const response = await axiosInstance.post(
            '/laptops/shipping/create-shipment',
            shipmentData
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to create shipment',
            details: error.response?.data,
        };
    }
};

/**
 * Calculate shipping rates
 * @param {Object} data - { orderId, weight, length, breadth, height }
 */
export const calculateRates = async (data) => {
    try {
        const response = await axiosInstance.post(
            '/laptops/shipping/calculate-rates',
            data
        );
        return {
            success: true,
            data: response.data.data, // Accessing data.data because backend sends { success: true, data: { ... } }
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch rates',
        };
    }
};
