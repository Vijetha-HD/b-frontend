import { Mail, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../utils/excelExport';
import React, { useState, useEffect } from 'react';

const Customers = ({ filteredCustomers, onView, currentPage, totalPages, onPageChange, filters, setFilters }) => {
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
    const handleExport = (type) => {
        const data = filteredCustomers.map(c => ({
            'Customer Name': c.name,
            'Email Address': c.email,
            'Type': c.type,
            'Total Spent': c.totalSpent,
            'Status': c.status
        }));

        if (type === 'excel') {
            exportToExcel(data, 'customers_report');
        } else {
            exportToCSV(data, 'customers_report');
        }
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Customer Intelligence CRM</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <Download size={14} /> Excel
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <Download size={14} /> CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-100">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Customer Type</label>
                    <select
                        value={localFilters?.role || ''}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Types</option>
                        <option value="B2C_BUYER">B2C Customers</option>
                        <option value="B2B_BUYER">B2B Clients</option>
                    </select>
                </div>
                {/* <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Verification Status</label>
                    <select
                        value={localFilters?.isVerified || ''}
                        onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div> */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Joined After</label>
                    <input
                        type="date"
                        value={localFilters?.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                    />
                </div>
                {/* <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Joined Before</label>
                    <input
                        type="date"
                        value={localFilters?.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                    />
                </div> */}
                <div className="flex items-end">
                    <button
                        onClick={() => setFilters({ role: '', isVerified: '', startDate: '', endDate: '' })}
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
                            <th className="px-8 py-5">Profile</th>
                            <th className="px-8 py-5 text-center">Type</th>
                            <th className="px-8 py-5 text-center">LTV</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-slate-50/50">
                                <td className="px-8 py-5 flex items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md ${customer.type === 'B2B' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-black text-slate-800">{customer.name}</p>
                                        <p className="text-xs text-slate-400 font-bold">{customer.email}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${customer.type === 'B2B' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                                        {customer.type}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center font-black text-slate-800 text-base">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button onClick={() => onView(customer)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl"><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))}
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
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
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
    );
};

export default Customers;
