/**
 * useBulkUpload Hook
 * Wraps the bulkCreateProducts API call with loading/error state
 */
import { useState } from "react";
import { bulkCreateProducts } from "../api/services/product.service.js";

export const useBulkUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadBulk = async (products) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bulkCreateProducts(products);
      return result;
    } catch (err) {
      setError(err.message || "Bulk upload failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { uploadBulk, loading, error };
};
