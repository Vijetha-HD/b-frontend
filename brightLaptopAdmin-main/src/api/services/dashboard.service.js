import axiosInstance from '../axios.config';

export const getDashboardStats = async () => {
    try {
        const response = await axiosInstance.get('/laptops/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export const getAnalyticsSummary = async () => {
    try {
        const response = await axiosInstance.get('/laptops/dashboard/analytics/summary');
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        throw error;
    }
};

export const getWarrantyExpiryStats = async (days = 30, page = 1, limit = 5) => {
    try {
        const response = await axiosInstance.get(`/laptops/dashboard/analytics/warranty-expiry?days=${days}&page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching warranty expiry stats:', error);
        throw error;
    }
};
