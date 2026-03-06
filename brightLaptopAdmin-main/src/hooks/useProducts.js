/**
 * Custom Hook for Product Operations
 * Provides easy-to-use functions for product CRUD operations
 */

import { useState, useCallback } from 'react';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../api/services/product.service.js';

/**
 * Custom hook for product operations
 * @returns {Object} Product operations and loading/error states
 */
export const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new product
   */
  const create = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createProduct(productData);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all products
   */
  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getProducts(params);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch products';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch product by ID
   */
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getProductById(id);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update product
   */
  const update = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProduct(id, productData);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete product
   */
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteProduct(id);
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error, details: result.details };
      }
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    create,
    fetchAll,
    fetchById,
    update,
    remove,
    loading,
    error,
  };
};







