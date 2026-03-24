import { useState, useCallback } from 'react';
import { getComplaints, updateComplaintStatus } from '../api/services/complaint.service';
import { toast } from '../components/common/SimpleToast';

/**
 * Custom hook to manage complaints
 */
export const useComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch complaints
     * @param {Object} filters - Optional filters
     */
    const fetchComplaints = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getComplaints(filters);
            if (result.success) {
                setComplaints(result.data.data.complaints);
            } else {
                setError(result.error);
                toast.error(result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            toast.error('Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update complaint
     */
    const updateStatus = async (id, data) => {
        const result = await updateComplaintStatus(id, data);
        if (result.success) {
            toast.success('Complaint updated');
            // Optimistic update
            setComplaints(prev => prev.map(c =>
                c._id === id ? { ...c, ...result.data.data.complaint } : c
            ));
            return true;
        } else {
            toast.error(result.error);
            return false;
        }
    };

    return {
        complaints,
        loading,
        error,
        fetchComplaints,
        updateStatus
    };
};
