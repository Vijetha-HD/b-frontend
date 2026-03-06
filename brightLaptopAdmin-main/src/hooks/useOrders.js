import { useState, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../api/services/order.service';
import { toast } from '../components/common/SimpleToast';

/**
 * Custom hook to manage orders
 */
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all orders
     * @param {Object} filters - Optional filters (status, orderType)
     */
    const fetchOrders = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getOrders(filters);
            if (result.success) {
                setOrders(result.data.data.orders);
                // Return pagination info along with success
                return { success: true, pagination: result.data.pagination };
            } else {
                setError(result.error);
                toast.error(result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            toast.error('Failed to fetch orders');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an order's status
     */
    const updateStatus = async (orderId, status) => {
        const result = await updateOrderStatus(orderId, status);
        if (result.success) {
            toast.success('Order status updated');
            // Optimistic update or refetch
            setOrders(prev => prev.map(order =>
                order._id === orderId ? { ...order, status: status } : order
            ));
            return true;
        } else {
            toast.error(result.error);
            return false;
        }
    };

    return {
        orders,
        loading,
        error,
        fetchOrders,
        updateStatus
    };
};


