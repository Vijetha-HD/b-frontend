import { useState, useCallback } from 'react';
import { getCustomers } from '../api/services/user.service.js';

export const useCustomers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCustomers(params);
            if (result.success) {
                // Ensure we return an array
                const data = result.data.data || result.data || [];
                // Check if nested 'data' property exists (common in axios response wrapper)
                if (data.data && Array.isArray(data.data)) {
                    return { success: true, data: data.data };
                }

                return {
                    success: true,
                    data: Array.isArray(data) ? data : [],
                    pagination: result.data.pagination
                };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchCustomers,
        loading,
        error
    };
};
