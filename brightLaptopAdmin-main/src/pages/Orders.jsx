import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { COURIER_PARTNERS } from '../data/constants';

import { getInvoice } from '../api/services/order.service.js';
import { generateInvoicePDF } from '../utils/invoicePDF.js';
import { toast } from '../components/common/SimpleToast.jsx';


const Orders = ({ orders, setShippingTargetOrder, setShipModalOpen, activeTab, setActiveTab, currentPage, totalPages, onPageChange, filters, setFilters }) => {
    // const [activeTab, setActiveTab] = useState('B2C'); // Lifted to App.jsx
    const [downloadingId, setDownloadingId] = useState(null);
    const [localFilters, setLocalFilters] = useState(filters || {});

    // Sync local state with props when props change (e.g. on reset)
    useEffect(() => {
        setLocalFilters(filters || {});
    }, [filters]);

    // Debounce update to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(localFilters);
        }, 500);
        return () => clearTimeout(timer);
    }, [localFilters, setFilters]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDownloadInvoice = async (order) => {
        try {
            setDownloadingId(order._id);
            const response = await getInvoice(order._id);

            if (response.success && response.data?.invoice) {
                generateInvoicePDF(response.data);
                toast.success('Invoice downloaded successfully'); // Replace with toast if available
            } else {
                toast.error('Failed to generate invoice: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Error downloading invoice');
        } finally {
            setDownloadingId(null);
        }
    };

    // Filter orders based on active tab -- MOVED TO BACKEND
    // Orders prop now contains only the relevant orders for the active tab
    const filteredOrders = orders;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Dispatch Ledger</h3>
                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">Shiprocket Partner Integration Active</p>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-slate-50 p-1.5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('B2C')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'B2C' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            B2C Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('B2B')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'B2B' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            B2B Orders
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-100">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</label>
                        <select
                            value={localFilters?.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={localFilters?.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={localFilters?.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
                            className="w-full py-2 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors text-sm"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5 text-center">Value</th>
                                <th className="px-8 py-5 text-center">Courier Partner</th>
                                <th className="px-8 py-5 text-right">Control</th>
                                <th className="px-8 py-5 text-center">Invoice</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-slate-50/50">
                                        <td className="px-8 py-5 font-black text-blue-600 text-xs uppercase tracking-tighter">#{order._id.slice(-6)}</td>
                                        <td className="px-8 py-5">
                                            <p className="font-black text-slate-800">{order.userId?.name || 'Unknown User'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                {order.products?.length} Items • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-slate-800 text-base">₹{order.totalAmount?.toLocaleString()}</td>
                                        {/* <td className="px-8 py-5 text-center">
                                            {order.paymentStatus === 'PAID' ? (
                                                <button
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    disabled={downloadingId === order._id}
                                                    title="Download Invoice"
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    {downloadingId === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Package size={16} />
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-300">-</span>
                                            )}
                                        </td> */}
                                        <td className="px-8 py-5 text-center">
                                            {order.status === 'SHIPPED' ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center space-x-1.5 text-blue-600 mb-1">
                                                        <Truck size={14} />
                                                        <span className="text-xs font-black uppercase tracking-widest">Shipped</span>
                                                    </div>
                                                    {order.trackingData ? (
                                                        <div className="text-[10px] text-slate-500 text-center">
                                                            <p className="font-bold">{order.trackingData.courierName || 'Courier Assigned'}</p>
                                                            <p className="font-mono text-slate-400">AWB: {order.trackingData.trackingId || 'N/A'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Tracking Pending</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] font-black uppercase italic ${order.status === 'CANCELLED' ? 'text-red-400' : 'text-slate-300'}`}>
                                                    {order.status === 'PENDING' ? 'Pending Assignment' : order.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right flex items-center justify-end space-x-2">
                                            {order.status === 'PENDING' || order.status === 'APPROVED' ? (
                                                <button
                                                    onClick={() => { setShippingTargetOrder(order); setShipModalOpen(true); }}
                                                    className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all"
                                                >
                                                    Dispatch Shiprocket
                                                </button>
                                            ) : (
                                                <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center justify-center w-fit">
                                                    <CheckCircle size={12} className="mr-1.5" /> {order.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {/* Invoice Download Button */}
                                            {order.paymentStatus === 'PAID' || order.orderType === 'B2B' ? (
                                                <button
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    disabled={downloadingId === order._id}
                                                    title="Download Invoice"
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    {downloadingId === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Package size={16} />
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <Package size={48} className="mb-4 opacity-50" />
                                            <p className="font-bold text-sm">No {activeTab} Orders Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
