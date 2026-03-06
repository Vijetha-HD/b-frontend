import React, { useEffect, useState } from 'react';
import { PieChart as PieIcon, ArrowUpRight, ShieldCheck, ShoppingCart, Briefcase, User, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { getAnalyticsSummary } from '../api/services/dashboard.service';

const BarChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.sales));
    return (
        <div className="flex items-end justify-between h-48 w-full gap-2 mt-6">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center items-end h-32 rounded-t-lg bg-blue-50 group-hover:bg-blue-100 transition-all overflow-hidden">
                        <div
                            style={{ height: `${(d.sales / maxVal) * 100}%` }}
                            className="w-4 bg-blue-500 rounded-t-md transition-all duration-700 ease-out group-hover:w-5 group-hover:bg-blue-600 relative"
                        >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md transition-all whitespace-nowrap z-10">
                                ₹{d.sales.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{d.date}</span>
                </div>
            ))}
        </div>
    );
};

const TopProductItem = ({ product, rank }) => (
    <div className="flex items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mr-4 ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
            #{rank}
        </div>
        <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 line-clamp-1">{product.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{product.sales} sold</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-black text-slate-800">₹{product.revenue?.toLocaleString()}</p>
        </div>
    </div>
);

const Analytics = ({ reportTimeframe, setReportTimeframe, filteredOrdersByTime }) => {
    const [analyticsData, setAnalyticsData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        growth: "0%",
        b2b: { percentage: 0 },
        b2c: { percentage: 0 },
        salesTrend: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // In a real app, pass reportTimeframe to the API
                const response = await getAnalyticsSummary();
                if (response.success) {
                    setAnalyticsData(response.data);
                }
            } catch (error) {
                console.error("Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [reportTimeframe]); // Refresh when timeframe changes

    if (loading) return <div className="p-8">Loading Analytics...</div>;

    const avgOrderValue = analyticsData.totalOrders > 0
        ? Math.round(analyticsData.totalRevenue / analyticsData.totalOrders)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Factor</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{analyticsData.growth}</h3>
                    <div className="mt-4 flex items-center text-green-600 text-xs font-black uppercase">
                        <ArrowUpRight size={16} className="mr-1" /> VS LAST {reportTimeframe}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Order Value</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">
                        ₹{avgOrderValue.toLocaleString()}
                    </h3>
                    <div className="mt-4 flex items-center text-indigo-600 text-xs font-black uppercase">
                        <ShieldCheck size={16} className="mr-1" /> OPTIMIZED MARGINS
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Sold</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{analyticsData.totalOrders}</h3>
                    <div className="mt-4 flex items-center text-pink-500 text-xs font-black uppercase">
                        <ShoppingCart size={16} className="mr-1" /> {reportTimeframe} FLOW
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sales Trend Chart (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center">
                                <TrendingUp className="mr-3 text-blue-500" size={28} /> Sales Trends
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">Revenue Performance</p>
                        </div>
                        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${reportTimeframe === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`} onClick={() => setReportTimeframe('weekly')}>Week</button>
                            <button className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${reportTimeframe === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`} onClick={() => setReportTimeframe('monthly')}>Month</button>
                        </div>
                    </div>
                    <BarChart data={analyticsData.salesTrend} />
                </div>

                {/* Top Products (Takes 1 column) */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-fit">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                        <Award className="mr-2 text-yellow-500" size={20} /> Top Sellers
                    </h3>
                    <div className="space-y-2">
                        {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
                            analyticsData.topProducts.map((product, i) => (
                                <TopProductItem key={i} product={product} rank={i + 1} />
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic">No sales data yet.</p>
                        )}
                    </div>
                </div>

                {/* Market Distribution (Takes Full Width or Bottom Slot) */}
                <div className="lg:col-span-3 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center">
                                <PieIcon className="mr-3 text-indigo-500" size={28} /> Market Distribution
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">Segmentation Analysis (B2B vs B2C)</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-around gap-12">
                        <div className="relative w-64 h-64">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ec4899" strokeWidth="4.5" strokeDasharray={`${analyticsData.b2c.percentage || 0} ${100 - (analyticsData.b2c.percentage || 0)}`} className="transition-all duration-700 ease-in-out" />
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="4.5" strokeDasharray={`${analyticsData.b2b.percentage || 0} ${100 - (analyticsData.b2b.percentage || 0)}`} strokeDashoffset={`-${analyticsData.b2c.percentage || 0}`} className="transition-all duration-700 ease-in-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Net Val</span>
                                <span className="text-2xl font-black text-slate-800 leading-tight">₹{analyticsData.totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex-1 max-w-md space-y-6">
                            <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-3xl border border-indigo-50/50">
                                <div className="flex items-center space-x-4">
                                    <Briefcase className="text-indigo-600" size={24} />
                                    <div>
                                        <p className="font-black text-slate-800">Enterprise B2B</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulk Corporate Logistics</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-indigo-600">{analyticsData.b2b.percentage}%</p>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-pink-50/30 rounded-3xl border border-pink-50/50">
                                <div className="flex items-center space-x-4">
                                    <User className="text-pink-600" size={24} />
                                    <div>
                                        <p className="font-black text-slate-800">Retail B2C</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Consumer Delivery</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-pink-600">{analyticsData.b2c.percentage}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
