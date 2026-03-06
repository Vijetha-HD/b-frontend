/**
 * Product API Service
 * Handles all product-related API calls
 */

import axiosInstance from "../axios.config.js";
import API_CONFIG from "../../config/api.config.js";

/**
 * Create a new product
 * @param {Object} productData - Product data object
 * @returns {Promise} Response with created product
 */
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
      productData,
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to create product",
      details: error.response?.data,
    };
  }
};

/**
 * Get all products
 * @param {Object} params - Query parameters (sellerId, isActive, category, etc.)
 * @returns {Promise} Response with products data
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL,
      { params },
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products",
      details: error.response?.data,
    };
  }
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Response with product data
 */
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_ID(id),
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product",
      details: error.response?.data,
    };
  }
};

/**
 * Update product
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} Response with updated product
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id),
      productData,
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update product",
      details: error.response?.data,
    };
  }
};

/**
 * Delete product (soft delete)
 * @param {string} id - Product ID
 * @returns {Promise} Response with deletion status
 */
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id),
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product",
      details: error.response?.data,
    };
  }
};

/**
 * Get product categories list
 * @returns {Promise} Response with categories array
 */
export const getProductCategories = async () => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES,
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch categories",
      details: error.response?.data,
    };
  }
};

/**
 * Get brands list
 * @returns {Promise} Response with brands data
 */
export const getBrands = async () => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BRANDS,
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch brands",
      details: error.response?.data,
    };
  }
};

/**
 * Search products
 * @param {Object} params - Search parameters (q, limit, etc.)
 * @returns {Promise} Response with search results
 */
export const searchProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH,
      { params },
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to search products",
      details: error.response?.data,
    };
  }
};

/**
 * Bulk create products from parsed CSV/Excel data
 * @param {Array} products - Array of product objects parsed from CSV/Excel
 * @returns {Promise} Response with created count and failed rows
 */
export const bulkCreateProducts = async (products) => {
  try {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.PRODUCTS.BULK_CREATE,
      { products },
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || error.message || "Bulk upload failed",
      details: error.response?.data,
    };
  }
};
