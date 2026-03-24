/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: "/laptops/auth/login",
      REGISTER: "/laptops/auth/register",
      ADMIN_LOGIN: "/laptops/auth/admin/login",
      LOGOUT: "/laptops/auth/logout",
      REFRESH: "/laptops/auth/refresh",
      PROFILE: "/laptops/auth/profile",
    },

    // User Management
    USER: {
      CUSTOMERS: "/laptops/user/customers",
      ADDRESSES: "/laptops/user/addresses",
      ADDRESS_BY_ID: (id) => `/laptops/user/addresses/${id}`,
    },

    // Products
    PRODUCTS: {
      BASE: "/laptops/products",
      CREATE: "/laptops/products",
      BULK_CREATE: "/laptops/products/bulk",
      GET_ALL: "/laptops/products",
      GET_BY_ID: (id) => `/laptops/products/${id}`,
      UPDATE: (id) => `/laptops/products/${id}`,
      DELETE: (id) => `/laptops/products/${id}`,
      CATEGORIES: "/laptops/products/categories/list",
      BRANDS: "/laptops/products/brands",
      SEARCH: "/laptops/products/search",
    },

    // Brands
    BRANDS: {
      BASE: "/laptops/brands",
      CREATE: "/laptops/brands",
      GET_ALL: "/laptops/brands",
    },

    // Specifications
    SPECIFICATIONS: {
      GET_ALL: "/laptops/specifications",
    },

    // Upload
    UPLOAD: {
      IMAGES: "/laptops/upload/images",
      SINGLE_IMAGE: "/laptops/upload/image",
    },

    // Orders
    ORDERS: {
      BASE: "/laptops/orders",
      CREATE: "/laptops/orders",
      GET_ALL: "/laptops/orders",
      GET_BY_ID: (id) => `/laptops/orders/${id}`,
      UPDATE: (id) => `/laptops/orders/${id}`,
      UPDATE_STATUS: (id) => `/laptops/orders/${id}/status`,
      INVOICE: (id) => `/laptops/orders/${id}/invoice`,
    },

    // Support / Complaints
    COMPLAINTS: {
      BASE: "/laptops/support/complaints",
      CREATE: "/laptops/support/complaints",
      GET_ALL: "/laptops/support/complaints",
      GET_BY_ID: (id) => `/laptops/support/complaints/${id}`,
      UPDATE_STATUS: (id) => `/laptops/support/complaints/${id}/status`,
    },

    // Warehouse
    WAREHOUSES: {
      BASE: "/laptops/warehouses",
      CREATE: "/laptops/warehouses",
      GET_ALL: "/laptops/warehouses",
    },

    // Categories
    CATEGORIES: {
      BASE: "/laptops/categories",
      CREATE: "/laptops/categories",
      GET_ALL: "/laptops/categories",
      GET_BY_NAME: (name) => `/laptops/categories/${encodeURIComponent(name)}`,
    },

    // Banners
    BANNERS: {
      BASE: "/laptops/banners",
      GET_ALL: "/laptops/banners",
      ADD: "/laptops/banners",
      DELETE: (id) => `/laptops/banners/${id}`,
      REPLACE: (id) => `/laptops/banners/${id}`,
      REORDER: "/laptops/banners/reorder",
    },
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
};

export default API_CONFIG;
