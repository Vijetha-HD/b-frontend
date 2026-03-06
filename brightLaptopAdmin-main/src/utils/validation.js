/**
 * Validation Utilities
 * Helper functions for form validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and missingFields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '' || 
           (Array.isArray(value) && value.length === 0);
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is within range
 */
export const validateNumberRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate product data before submission
 * @param {Object} productData - Product data to validate
 * @returns {Object} Validation result
 */
export const validateProductData = (productData) => {
  const errors = [];

  // Required fields
  if (!productData.name || productData.name.trim().length < 2) {
    errors.push('Product name is required and must be at least 2 characters');
  }

  if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
    errors.push('At least one product image is required');
  }

  if (!productData.basePrice || productData.basePrice <= 0) {
    errors.push('Base price is required and must be greater than 0');
  }

  if (!productData.stock || productData.stock < 0) {
    errors.push('Stock quantity is required and must be 0 or greater');
  }

  if (!productData.category || productData.category.trim().length < 2) {
    errors.push('Category is required and must be at least 2 characters');
  }

  // Optional field validations
  if (productData.discountPercentage !== undefined) {
    if (productData.discountPercentage < 0 || productData.discountPercentage > 100) {
      errors.push('Discount percentage must be between 0 and 100');
    }
  }

  if (productData.gstPercentage !== undefined) {
    if (productData.gstPercentage < 0 || productData.gstPercentage > 100) {
      errors.push('GST percentage must be between 0 and 100');
    }
  }

  if (productData.rating !== undefined) {
    if (productData.rating < 0 || productData.rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};







