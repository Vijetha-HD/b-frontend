import React, { useState, useEffect } from 'react'; // Added useEffect
import { ArrowLeft, User, MessageSquare, Phone, MapPin, Calendar, Mail, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints'; // Import hook

const CustomerDetails = ({ customer, onBack }) => {
    console.log("customer", customer);

    const [activeTab, setActiveTab] = useState('info');
    const { complaints, fetchComplaints, loading: loadingComplaints } = useComplaints();

    useEffect(() => {
        if (customer && customer.id) {
            // Fetch complaints for this specific user
            fetchComplaints({ userId: customer.id });
        }
    }, [customer, fetchComplaints]);

    if (!customer) return null;

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in h-full flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors group">
                        <ArrowLeft size={24} className="text-slate-400 group-hover:text-slate-600" />
                    </button>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${customer.type === 'B2B' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                        {customer.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{customer.name}</h2>
                        {/* <p className="text-slate-400 font-bold text-sm">Customer ID: {customer.id}</p> */}
                    </div>
                </div>
                <div className="flex gap-3">
                    {/* <button className="px-6 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                        Edit Profile
                    </button> */}
                    {/* <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        Contact User
                    </button> */}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-50 px-8">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 px-6 font-bold text-sm transition-all border-b-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    User Info
                </button>
                <button
                    onClick={() => setActiveTab('complaints')}
                    className={`py-4 px-6 font-bold text-sm transition-all border-b-2 ${activeTab === 'complaints' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    User Complaints
                </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
                {activeTab === 'info' ? (
                    <div className="max-w-4xl space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                    <Shield size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Role</span>
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-black uppercase ${customer.type === 'B2B' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
                                    {customer.type}
                                </span>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-2 text-slate-400">
                                    <Calendar size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Joined</span>
                                </div>
                                <span className="text-base font-bold text-slate-700">{new Date(customer.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6">Contact & Business Information</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-medium">
                                        <Mail size={18} className="text-slate-400" />
                                        {customer.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-medium">
                                        <Phone size={18} className="text-slate-400" />
                                        {customer.phone || 'N/A'}
                                    </div>
                                </div>

                                {customer.type === 'B2B' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Company Name</label>
                                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                                <Shield size={18} className="text-slate-400" />
                                                {customer.companyName || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">GST Number</label>
                                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                                <Shield size={18} className="text-slate-400" />
                                                {customer.gstNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                                        {customer.type === 'B2B' ? 'Business Address' : 'Primary Address'}
                                    </label>
                                    <div className="flex items-start gap-3 text-slate-700 font-medium">
                                        <MapPin size={18} className="text-slate-400 mt-1" />
                                        <p>
                                            {customer.type === 'B2B'
                                                ? (customer.businessAddress || 'No business address provided')
                                                : (customer.addresses && customer.addresses.length > 0
                                                    ? `${customer.addresses[0].addressLine1}, ${customer.addresses[0].city}, ${customer.addresses[0].state} - ${customer.addresses[0].pincode}`
                                                    : 'No address provided')
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl space-y-4">
                        {activeTab === 'complaints' && (
                            <div className="space-y-4">
                                {loadingComplaints ? (
                                    <div className="text-center py-10 text-slate-400">Loading complaints...</div>
                                ) : complaints.length > 0 ? (
                                    complaints.map((complaint) => (
                                        <div key={complaint._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{complaint.subject}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{complaint.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-600' :
                                                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle size={12} /> {complaint.priority} Priority
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(complaint.createdAt).toLocaleDateString()}
                                                </span>
                                                {complaint.orderId && (
                                                    <span className="flex items-center gap-1 text-blue-500">
                                                        <Shield size={12} /> Order #{complaint.orderId._id ? complaint.orderId._id.slice(-6) : '...'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3 opacity-50" />
                                        <h3 className="text-sm font-bold text-slate-900">No Complaints History</h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">This customer hasn't reported any issues with their orders yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default CustomerDetails;
