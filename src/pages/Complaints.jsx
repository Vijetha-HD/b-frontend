import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Filter, Search, User, Package, ShoppingCart, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../api/axios.config.js';
import API_CONFIG from '../config/api.config.js';

// Helper function to format Cloudinary video URL for audio playback
const formatAudioUrl = (url) => {
    if (!url) return url;
    // If it's a Cloudinary URL and doesn't have format parameter, add it
    if (url.includes('cloudinary.com') && url.includes('/video/')) {
        // Ensure the URL has proper format for audio playback
        if (!url.includes('/f_')) {
            // Add format parameter if not present
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}f_webm`;
        }
    }
    return url;
};

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchComplaints();
    }, [statusFilter, categoryFilter, currentPage]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.COMPLAINTS.GET_ALL, {
                params: {
                    status: statusFilter,
                    category: categoryFilter,
                    page: currentPage,
                    limit: itemsPerPage
                }
            });
            if (response.data.success) {
                setComplaints(response.data.data.complaints || []);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.pages);
                }
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            const response = await axiosInstance.put(
                API_CONFIG.ENDPOINTS.COMPLAINTS.UPDATE_STATUS(complaintId),
                { status: newStatus }
            );
            if (response.data.success) {
                fetchComplaints();
                setSelectedComplaint(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN':
                return <AlertCircle size={16} className="text-orange-500" />;
            case 'IN_PROGRESS':
                return <Clock size={16} className="text-blue-500" />;
            case 'RESOLVED':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'CLOSED':
                return <XCircle size={16} className="text-gray-500" />;
            default:
                return <AlertCircle size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN':
                return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'IN_PROGRESS':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'RESOLVED':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'CLOSED':
                return 'bg-gray-50 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        // Status and Category are now server-side filtered
        // Search is client-side on current page
        const matchesSearch = searchTerm === '' ||
            complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 animate-in fade-in">
                <p className="text-slate-400">Loading complaints...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Complaints Management</h3>
                    <div className="text-sm text-slate-400">
                        Total: <span className="font-black text-slate-800">{filteredComplaints.length}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Laptop Issue">Laptop Issue</option>
                        <option value="Software Issue">Software Issue</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Payment / Order Issue">Payment / Order Issue</option>
                        <option value="Return / Refund / Replacement">Return / Refund / Replacement</option>
                        <option value="Warranty / Service Issue">Warranty / Service Issue</option>
                        <option value="Other Issue">Other Issue</option>
                    </select>
                </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Complaint</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                        No complaints found
                                    </td>
                                </tr>
                            ) : (
                                filteredComplaints.map(complaint => (
                                    <tr key={complaint._id} className="hover:bg-slate-50/50">
                                        <td className="px-8 py-5">
                                            <div className="flex items-start gap-2">
                                                {complaint.voiceMessage && (
                                                    <Volume2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    {complaint.description ? (
                                                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-md">
                                                            {complaint.description}
                                                        </p>
                                                    ) : (
                                                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-md italic">
                                                            Voice message only
                                                        </p>
                                                    )}
                                                    {complaint.voiceMessage && (
                                                        <p className="text-xs text-blue-600 mt-1 flex items-center">
                                                            <Volume2 size={10} className="mr-1" />
                                                            Voice message attached
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {complaint.orderId && (
                                                <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                    <ShoppingCart size={12} className="mr-1" />
                                                    Order: {complaint.orderId._id?.slice(-6).toUpperCase()}
                                                </p>
                                            )}
                                            {complaint.productId && (
                                                <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                    <Package size={12} className="mr-1" />
                                                    {complaint.productId.name}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {complaint.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {complaint.userId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {complaint.userId?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                                {complaint.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                                                {getStatusIcon(complaint.status)}
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600">
                                            {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedComplaint(complaint)}
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

            {/* Complaint Detail Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800">Complaint Details</h3>
                                <button
                                    onClick={() => setSelectedComplaint(null)}
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
                                    <p className="font-semibold text-slate-800">{selectedComplaint.userId?.name || 'N/A'}</p>
                                    <p className="text-sm text-slate-600 mt-1">{selectedComplaint.userId?.email || 'N/A'}</p>
                                    {selectedComplaint.userId?.phone && (
                                        <p className="text-sm text-slate-600">{selectedComplaint.userId.phone}</p>
                                    )}
                                    {selectedComplaint.userId?.companyName && (
                                        <p className="text-sm text-slate-600">Company: {selectedComplaint.userId.companyName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order/Product Info */}
                            {(selectedComplaint.orderId || selectedComplaint.productId) && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Order & Product</h4>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                        {/* {selectedComplaint.orderId && (
                                            <div>
                                                <p className="text-xs text-slate-400">Order ID</p>
                                                <p className="font-semibold text-slate-800">{selectedComplaint.orderId._id}</p>
                                                <p className="text-sm text-slate-600">Amount: ₹{selectedComplaint.orderId.totalAmount?.toLocaleString()}</p>
                                            </div>
                                        )} */}
                                        {selectedComplaint.productId && (
                                            <div>
                                                <p className="text-xs text-slate-400">Product</p>
                                                <p className="font-semibold text-slate-800">{selectedComplaint.productId.name}</p>
                                                {selectedComplaint.productId.brand && (
                                                    <p className="text-sm text-slate-600">Brand: {selectedComplaint.productId.brand}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Complaint Details */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Complaint Information</h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400">Category</p>
                                        <p className="font-semibold text-slate-800">{selectedComplaint.category}</p>
                                    </div>
                                    {selectedComplaint.description && (
                                        <div>
                                            <p className="text-xs text-slate-400">Description</p>
                                            <p className="text-slate-800 whitespace-pre-wrap">{selectedComplaint.description}</p>
                                        </div>
                                    )}
                                    {selectedComplaint.voiceMessage && (
                                        <div>
                                            <p className="text-xs text-slate-400 mb-2 flex items-center">
                                                <Volume2 size={12} className="mr-1" />
                                                Voice Message
                                            </p>
                                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                {/* Use video element for Cloudinary audio files (stored as video resource) */}
                                                <video
                                                    controls
                                                    className="w-full"
                                                    preload="metadata"
                                                    crossOrigin="anonymous"
                                                    style={{ maxHeight: '60px' }}
                                                    onError={(e) => {
                                                        console.error('Video playback error:', e);
                                                        // Fallback: try with audio element
                                                        const audioUrl = formatAudioUrl(selectedComplaint.voiceMessage);
                                                        const audio = document.createElement('audio');
                                                        audio.src = audioUrl;
                                                        audio.controls = true;
                                                        audio.className = 'w-full';
                                                        e.target.parentElement.appendChild(audio);
                                                        e.target.style.display = 'none';
                                                    }}
                                                >
                                                    <source src={formatAudioUrl(selectedComplaint.voiceMessage)} type="video/webm" />
                                                    <source src={selectedComplaint.voiceMessage} type="video/webm" />
                                                    <source src={selectedComplaint.voiceMessage} type="audio/webm" />
                                                    Your browser does not support the audio element.
                                                </video>
                                                <div className="flex items-center justify-between mt-2">
                                                    <a
                                                        href={selectedComplaint.voiceMessage}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                                    >
                                                        <Volume2 size={12} />
                                                        Download audio file
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            const audioUrl = formatAudioUrl(selectedComplaint.voiceMessage);
                                                            const audio = new Audio(audioUrl);
                                                            audio.play().catch(err => {
                                                                console.error('Error playing audio:', err);
                                                                // Try with original URL
                                                                const audio2 = new Audio(selectedComplaint.voiceMessage);
                                                                audio2.play().catch(err2 => {
                                                                    console.error('Error playing audio with original URL:', err2);
                                                                    alert('Unable to play audio. Please try downloading the file.');
                                                                });
                                                            });
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                                    >
                                                        <Volume2 size={12} />
                                                        Play in new player
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!selectedComplaint.description && !selectedComplaint.voiceMessage && (
                                        <div>
                                            <p className="text-slate-500 italic text-sm">No description or voice message provided</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-400">Status</p>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                                            {getStatusIcon(selectedComplaint.status)}
                                            {selectedComplaint.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Created At</p>
                                        <p className="text-slate-800">
                                            {new Date(selectedComplaint.createdAt).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Update Status</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedComplaint._id, status)}
                                            disabled={selectedComplaint.status === status}
                                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedComplaint.status === status
                                                ? 'bg-blue-500 text-white cursor-not-allowed'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;
