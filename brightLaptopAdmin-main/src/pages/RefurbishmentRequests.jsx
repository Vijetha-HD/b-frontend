import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Search, Package, ShoppingCart, User, Wrench, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ShipModal from '../components/modals/ShipModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RefurbishmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showShipModal, setShowShipModal] = useState(false);
    const [shipmentType, setShipmentType] = useState(null); // 'warehouse' or 'customer'

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, currentPage]); // Re-fetch when status or page changes

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/laptops/refurbishment/requests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    status: statusFilter,
                    page: currentPage,
                    limit: itemsPerPage
                }
            });
            if (response.data.success) {
                setRequests(response.data.data.requests || []);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.pages);
                }
            }
        } catch (error) {
            console.error('Error fetching refurbishment requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/laptops/refurbishment/requests/${requestId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data.success) {
                fetchRequests();
                setSelectedRequest(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleApprove = async (requestId) => {
        await handleStatusUpdate(requestId, 'APPROVED');
    };

    const handleMoveToRefurb = async (requestId) => {
        await handleStatusUpdate(requestId, 'IN_REFURB');
    };

    const handleComplete = async (requestId) => {
        await handleStatusUpdate(requestId, 'COMPLETED');
    };

    const handleShipmentSuccess = async (result) => {
        if (!selectedRequest || !shipmentType) return;

        try {
            const token = localStorage.getItem('token');
            const endpoint = shipmentType === 'warehouse'
                ? `${API_BASE_URL}/laptops/refurbishment/requests/${selectedRequest._id}/warehouse-shipment`
                : `${API_BASE_URL}/laptops/refurbishment/requests/${selectedRequest._id}/return-shipment`;

            // Extract shipment details from the Shiprocket response
            // Structure: result = { success: true, data: { success: true, data: shiprocketResponse } }
            const shiprocketResponse = result?.data?.data || result?.data || result;

            // Shiprocket typically returns: order_id, shipment_id, status, etc.
            const awbNumber = shiprocketResponse.shipment_id || shiprocketResponse.order_id || shiprocketResponse.id;
            const courierName = shiprocketResponse.courier_name || selectedRequest.orderId?.courier || 'Unknown';
            const trackingNumber = shiprocketResponse.tracking_number || shiprocketResponse.awb || shiprocketResponse.shipment_id || awbNumber;

            await axios.put(
                endpoint,
                {
                    awbNumber: awbNumber?.toString(),
                    courierName,
                    trackingNumber: trackingNumber?.toString(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchRequests();
            setShowShipModal(false);
            setSelectedRequest(null);
            setShipmentType(null);
        } catch (error) {
            console.error('Error updating shipment:', error);
            alert('Failed to update shipment details: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <AlertCircle size={16} className="text-orange-500" />;
            case 'APPROVED':
                return <CheckCircle size={16} className="text-blue-500" />;
            case 'IN_TRANSIT_TO_WAREHOUSE':
                return <Truck size={16} className="text-purple-500" />;
            case 'IN_REFURB':
                return <Wrench size={16} className="text-indigo-500" />;
            case 'IN_TRANSIT_TO_CUSTOMER':
                return <Truck size={16} className="text-green-500" />;
            case 'COMPLETED':
                return <CheckCircle size={16} className="text-green-500" />;
            default:
                return <AlertCircle size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'APPROVED':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'IN_TRANSIT_TO_WAREHOUSE':
                return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'IN_REFURB':
                return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'IN_TRANSIT_TO_CUSTOMER':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'COMPLETED':
                return 'bg-gray-50 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const filteredRequests = requests.filter(request => {
        // Status filtering is now server-side.
        // Client-side search (on current page only):
        const matchesSearch = searchTerm === '' ||
            request.issueText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 animate-in fade-in">
                <p className="text-slate-400">Loading refurbishment requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Refurbishment Requests</h3>
                    <div className="text-sm text-slate-400">
                        Total: <span className="font-black text-slate-800">{filteredRequests.length}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on filter change
                        }}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IN_TRANSIT_TO_WAREHOUSE">In Transit to Warehouse</option>
                        <option value="IN_REFURB">In Refurbishment</option>
                        <option value="IN_TRANSIT_TO_CUSTOMER">In Transit to Customer</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Request</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Product</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                        No refurbishment requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map(request => (
                                    <tr key={request._id} className="hover:bg-slate-50/50">
                                        <td className="px-8 py-5">
                                            <p className="font-semibold text-slate-800 line-clamp-1 max-w-md">
                                                {request.issueText}
                                            </p>
                                            {request.orderId && (
                                                <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                    <ShoppingCart size={12} className="mr-1" />
                                                    Order: {request.orderId._id?.slice(-6).toUpperCase()}
                                                </p>
                                            )}
                                            {request.accessories && request.accessories.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Accessories: {request.accessories.join(', ')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {request.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {request.userId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {request.userId?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                {request.productId?.images?.[0] && (
                                                    <img
                                                        src={request.productId.images[0]}
                                                        alt={request.productId.name}
                                                        className="w-10 h-10 rounded-lg object-cover mr-2"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {request.productId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {request.productId?.brand || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600">
                                            {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800">Refurbishment Request Details</h3>
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setShowShipModal(false);
                                        setShipmentType(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center">
                                    <User size={14} className="mr-2" />
                                    User Information
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="font-semibold text-slate-800">{selectedRequest.userId?.name || 'N/A'}</p>
                                    <p className="text-sm text-slate-600 mt-1">{selectedRequest.userId?.email || 'N/A'}</p>
                                    {selectedRequest.userId?.phone && (
                                        <p className="text-sm text-slate-600">{selectedRequest.userId.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Product & Order Info */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Product & Order</h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                    {selectedRequest.productId && (
                                        <div>
                                            <p className="text-xs text-slate-400">Product</p>
                                            <p className="font-semibold text-slate-800">{selectedRequest.productId.name}</p>
                                            {selectedRequest.productId.brand && (
                                                <p className="text-sm text-slate-600">Brand: {selectedRequest.productId.brand}</p>
                                            )}
                                        </div>
                                    )}
                                    {/* {selectedRequest.orderId && (
                                        <div>
                                            <p className="text-xs text-slate-400">Order ID</p>
                                            <p className="font-semibold text-slate-800">{selectedRequest.orderId._id}</p>
                                        </div>
                                    )} */}
                                </div>
                            </div>

                            {/* Issue Images */}
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Issue Images</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedRequest.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Issue ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Issue Description */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Issue Description</h4>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-800 whitespace-pre-wrap">{selectedRequest.issueText}</p>
                                </div>
                            </div>

                            {/* Accessories */}
                            {selectedRequest.accessories && selectedRequest.accessories.length > 0 && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Accessories</h4>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-slate-800">{selectedRequest.accessories.join(', ')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status & Actions */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Status & Actions</h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400">Current Status</p>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border mt-2 ${getStatusColor(selectedRequest.status)}`}>
                                            {getStatusIcon(selectedRequest.status)}
                                            {selectedRequest.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedRequest.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleApprove(selectedRequest._id)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                                            >
                                                Approve Request
                                            </button>
                                        )}
                                        {selectedRequest.status === 'APPROVED' && (
                                            <button
                                                onClick={() => {
                                                    setShipmentType('warehouse');
                                                    setShowShipModal(true);
                                                }}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors"
                                            >
                                                Dispatch to Warehouse
                                            </button>
                                        )}
                                        {selectedRequest.status === 'IN_TRANSIT_TO_WAREHOUSE' && (
                                            <button
                                                onClick={() => handleMoveToRefurb(selectedRequest._id)}
                                                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
                                            >
                                                Mark as Received (Move to Refurb)
                                            </button>
                                        )}
                                        {selectedRequest.status === 'IN_REFURB' && (
                                            <button
                                                onClick={() => {
                                                    setShipmentType('customer');
                                                    setShowShipModal(true);
                                                }}
                                                className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                                            >
                                                Dispatch to Customer
                                            </button>
                                        )}
                                        {selectedRequest.status === 'IN_TRANSIT_TO_CUSTOMER' && (
                                            <button
                                                onClick={() => handleComplete(selectedRequest._id)}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-xl text-sm font-bold hover:bg-gray-600 transition-colors"
                                            >
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>

                                    {/* Tracking Info */}
                                    {selectedRequest.warehouseShipment?.trackingNumber && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-slate-400">Warehouse Shipment</p>
                                            <p className="text-sm text-slate-800">Tracking: {selectedRequest.warehouseShipment.trackingNumber}</p>
                                            <p className="text-xs text-slate-600">Courier: {selectedRequest.warehouseShipment.courierName}</p>
                                        </div>
                                    )}
                                    {selectedRequest.returnShipment?.trackingNumber && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-slate-400">Return Shipment</p>
                                            <p className="text-sm text-slate-800">Tracking: {selectedRequest.returnShipment.trackingNumber}</p>
                                            <p className="text-xs text-slate-600">Courier: {selectedRequest.returnShipment.courierName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ship Modal */}
            {selectedRequest && showShipModal && (
                <ShipModal
                    isOpen={showShipModal}
                    setShipModalOpen={setShowShipModal}
                    order={selectedRequest.orderId}
                    onSuccess={(result) => handleShipmentSuccess(result)}
                />
            )}
        </div>
    );
};

export default RefurbishmentRequests;
