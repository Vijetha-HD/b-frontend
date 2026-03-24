import React, { useEffect, useState } from 'react';
import { Activity, Truck, Wrench, AlertTriangle, Package, Users, DollarSign, ShoppingBag } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { getDashboardStats, getWarrantyExpiryStats } from '../api/services/dashboard.service';

const Dashboard = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        counts: {},
        today: {},
        activityLog: []
    });
    const [warrantyData, setWarrantyData] = useState([]);
    const [warrantyPage, setWarrantyPage] = useState(1);
    const [totalWarrantyCount, setTotalWarrantyCount] = useState(0);
    const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
    const WARRANTY_LIMIT = 5;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const dashboardRes = await getDashboardStats();
                if (dashboardRes.success) {
                    setStats(dashboardRes.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchWarranty = async () => {
            try {
                const warrantyRes = await getWarrantyExpiryStats(30, warrantyPage, WARRANTY_LIMIT);
                if (warrantyRes.success) {
                    setWarrantyData(warrantyRes.data);
                    setTotalWarrantyCount(warrantyRes.count || 0);
                }
            } catch (error) {
                console.error("Failed to load warranty stats");
            }
        };
        fetchWarranty();
    }, [warrantyPage]);

    const statCards = [
        { label: "Today's Revenue", value: `₹${stats.today?.sales?.toLocaleString() || 0}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", onClick: () => setActiveTab('analytics') },
        { label: "Today's Orders", value: stats.today?.orders || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", onClick: () => setActiveTab('orders') },
        { label: "Total Products", value: stats.counts?.totalProducts || 0, icon: Package, color: "text-orange-600", bg: "bg-orange-50", onClick: () => setActiveTab('inventory') },
        { label: "Total Users", value: stats.counts?.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50", onClick: () => setActiveTab('customers') }
    ];

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

            {/* Action Required Banner */}
            {(stats.counts?.pendingOrders > 0 || stats.counts?.lowStock > 0) && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-red-800">
                        <AlertTriangle size={20} />
                        <span className="font-bold">Action Required:</span>
                        <div className="flex space-x-4 text-sm">
                            {stats.counts?.pendingOrders > 0 && <span>{stats.counts.pendingOrders} Orders Pending Shipment</span>}
                            {/* {stats.counts?.lowStock > 0 && <span>{stats.counts.lowStock} Products Low on Stock</span>} */}
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-50 border border-red-100 transition">
                        Manage Now
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Operations Log */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                        <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center">
                            <Activity size={20} className="mr-2 text-blue-600" /> Recent Operations Logs
                        </h3>
                        <div className="space-y-4">
                            {stats.activityLog && stats.activityLog.length > 0 ? (
                                stats.activityLog.map((log, i) => (
                                    <div key={i} className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-all">
                                        <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                        <p className="text-sm font-bold text-slate-700 flex-1">{log.msg}</p>
                                        <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </div>

                    {/* Warranty Watchlist Widget Summary Card */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">Warranty Watchlist</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {totalWarrantyCount} {totalWarrantyCount === 1 ? 'product' : 'products'} expiring in next 30 days
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsWarrantyModalOpen(true)}
                            className="px-6 py-3 bg-orange-50 text-orange-700 font-bold rounded-xl hover:bg-orange-100 transition border border-orange-100 flex items-center"
                        >
                            View Details
                        </button>
                    </div>
                </div>

                {/* Quick Navigation Card */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 h-fit">
                    <h3 className="font-black text-slate-800 text-lg mb-6">Quick Navigation</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveTab('orders')} className="p-6 bg-orange-50/50 rounded-3xl border-2 border-orange-100 hover:border-orange-500 transition-all flex flex-col items-center">
                            <Truck className="text-orange-600 mb-2" size={24} />
                            <span className="text-[10px] font-black uppercase text-orange-900">Shipments</span>
                        </button>
                        <button onClick={() => setActiveTab('refurb')} className="p-6 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 hover:border-indigo-500 transition-all flex flex-col items-center">
                            <Wrench className="text-indigo-600 mb-2" size={24} />
                            <span className="text-[10px] font-black uppercase text-indigo-900">Workforce</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Warranty Modal */}
            {isWarrantyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertTriangle size={24} className="mr-3 text-orange-600" />
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Warranty Expiry Watchlist</h2>
                                    <p className="text-sm text-slate-500 font-medium">Expiring in next 30 days</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsWarrantyModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-sm text-left text-slate-600 table-fixed">
                                <thead className="text-xs text-slate-400 uppercase font-bold border-b border-orange-200 bg-white">
                                    <tr>
                                        <th className="pb-3 pl-2 w-[20%] whitespace-nowrap">Customer</th>
                                        <th className="pb-3 w-[45%] whitespace-nowrap">Product</th>
                                        <th className="pb-3 text-center w-[15%] whitespace-nowrap">Expiry Date</th>
                                        <th className="pb-3 pr-2 text-right w-[20%] whitespace-nowrap">Days Left</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warrantyData.length > 0 ? (
                                        warrantyData.map((item, i) => (
                                            <tr key={i} className="border-b border-orange-100 last:border-0 hover:bg-orange-50 transition-colors group">
                                                <td className="py-3 pl-2 font-medium text-slate-800 align-top">
                                                    <div className="flex flex-col truncate pr-2">
                                                        <span className="truncate" title={item.customerName}>{item.customerName}</span>
                                                        <span className="text-[10px] text-slate-400 font-normal truncate" title={item.customerEmail}>{item.customerEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 align-top">
                                                    <div className="font-medium text-slate-700 w-full truncate" title={item.productName}>
                                                        {item.productName}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center whitespace-nowrap align-top">
                                                    <span className="bg-orange-100 text-orange-700 py-1 px-2 rounded-full text-xs font-bold">
                                                        {new Date(item.expiryDate).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-2 text-right align-top">
                                                    <span className={`font-bold ${item.daysRemaining < 7 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                                                        {item.daysRemaining} days
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-slate-400 italic">
                                                No warranties expiring in the selected period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-400 font-medium">
                                    Showing {warrantyData.length > 0 ? ((warrantyPage - 1) * WARRANTY_LIMIT) + 1 : 0}-
                                    {Math.min(warrantyPage * WARRANTY_LIMIT, totalWarrantyCount)} of {totalWarrantyCount}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setWarrantyPage(p => Math.max(1, p - 1))}
                                        disabled={warrantyPage === 1}
                                        className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setWarrantyPage(p => p + 1)}
                                        disabled={warrantyData.length < WARRANTY_LIMIT || (warrantyPage * WARRANTY_LIMIT >= totalWarrantyCount)}
                                        className="px-3 py-1 text-xs font-bold rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
