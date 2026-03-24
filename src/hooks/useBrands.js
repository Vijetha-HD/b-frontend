import { useState, useEffect, useCallback } from 'react';
import { fetchBrands, createBrand } from '../api/services/brand.service.js';

export const useBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadBrands = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchBrands();
            if (result.success) {
                setBrands(result.data);
            } else {
                setError(result.error);
                console.error('Failed to load brands:', result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            console.error('Error in useBrands:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createNewBrand = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await createBrand(data);
            if (result.success) {
                // Refresh list to include new brand
                await loadBrands();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const msg = err.message || 'Failed to create brand';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        loadBrands();
    }, [loadBrands]);

    return {
        brands,
        loading,
        error,
        refreshBrands: loadBrands,
        createNewBrand,
    };
};
