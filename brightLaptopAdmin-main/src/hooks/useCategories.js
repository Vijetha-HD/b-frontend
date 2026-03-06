import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, createCategory } from '../api/services/category.service.js';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchCategories();
            if (result.success) {
                setCategories(result.data);
            } else {
                setError(result.error);
                console.error('Failed to load categories:', result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            console.error('Error in useCategories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createNewCategory = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await createCategory(data);
            if (result.success) {
                // Refresh list to include new category
                await loadCategories();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const msg = err.message || 'Failed to create category';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    return {
        categories,
        loading,
        error,
        refreshCategories: loadCategories,
        createNewCategory,
    };
};
