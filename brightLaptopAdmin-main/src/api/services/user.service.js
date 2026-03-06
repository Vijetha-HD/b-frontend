/**
 * User API Service
 * Handles user-related API calls (Customers, Addresses)
 */

import axiosInstance from '../axios.config.js';
import API_CONFIG from '../../config/api.config.js';

/**
 * Get all customers (B2B & B2C)
 * @returns {Promise} Response with list of customers
 */
export const getCustomers = async (params = {}) => {
    try {
        const response = await axiosInstance.get(
            API_CONFIG.ENDPOINTS.USER.CUSTOMERS,
            { params }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch customers',
            details: error.response?.data,
        };
    }
};

/**
 * Get user addresses
 * @returns {Promise} Response with list of addresses
 */
export const getAddresses = async () => {
    try {
        const response = await axiosInstance.get(
            API_CONFIG.ENDPOINTS.USER.ADDRESSES
        );
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch addresses',
            details: error.response?.data
        };
    }
};

/**
 * Add new address
 * @param {Object} addressData 
 * @returns {Promise} Response
 */
export const addAddress = async (addressData) => {
    try {
        const response = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.USER.ADDRESSES,
            addressData
        );
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to add address',
            details: error.response?.data
        };
    }
};

/**
 * Remove address
 * @param {string} addressId 
 * @returns {Promise} Response
 */
export const removeAddress = async (addressId) => {
    try {
        const response = await axiosInstance.delete(
            API_CONFIG.ENDPOINTS.USER.ADDRESS_BY_ID(addressId)
        );
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to remove address',
            details: error.response?.data
        };
    }
};
