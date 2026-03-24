import { useState, useEffect, useCallback } from 'react';
import { fetchSpecifications } from '../api/services/specification.service.js';

export const useSpecifications = () => {
    const [specifications, setSpecifications] = useState({
        ram: [],
        storage: [],
        screenSize: [],
        processor: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSpecifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchSpecifications();
            if (result.success) {
                setSpecifications(result.data);
            } else {
                setError(result.error);
                console.error('Failed to load specifications:', result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            console.error('Error in useSpecifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadSpecifications();
    }, [loadSpecifications]);

    return {
        specifications,
        loading,
        error,
        refreshSpecifications: loadSpecifications,
    };
};
