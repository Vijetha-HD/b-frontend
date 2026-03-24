import React, { useState } from 'react';
import { X, Package, Ruler, Weight, Truck, IndianRupee, Clock } from 'lucide-react';
import { createShipment, calculateRates } from '../../api/services/shipping.service';

const ShipModal = ({ isOpen, setShipModalOpen, order, onSuccess }) => {
    const [dimensions, setDimensions] = useState({
        length: '10', // Default somewhat realistic values
        breadth: '10',
        height: '10',
        weight: '0.5'
    });
    const [loading, setLoading] = useState(false);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rates, setRates] = useState(null); // Stores fetched rates
    const [selectedCourier, setSelectedCourier] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setDimensions({ ...dimensions, [e.target.name]: e.target.value });
        // Reset selections if dimensions change
        if (rates) {
            setRates(null);
            setSelectedCourier(null);
        }
    };

    const handleCheckRates = async (e) => {
        e.preventDefault();
        setRatesLoading(true);
        setError(null);
        setRates(null);

        const result = await calculateRates({
            orderId: order._id,
            ...dimensions
        });

        setRatesLoading(false);

        if (result.success) {
            // Shiprocket returns `data.data.available_courier_companies`
            // Check formatted response structure
            const courierList = result.data?.data?.available_courier_companies || result.data?.available_courier_companies || [];
            if (courierList.length === 0) {
                setError('No courier partners available for this route.');
            } else {
                setRates(courierList);
            }
        } else {
            setError(result.error);
        }
    };

    const handleDispatch = async () => {
        if (!selectedCourier) return;

        setLoading(true);
        setError(null);

        const result = await createShipment({
            orderId: order._id,
            ...dimensions,
            courierId: selectedCourier.courier_company_id, // Pass selected courier ID
            courierName: selectedCourier.courier_name // Helpful for logging
        });

        setLoading(false);

        if (result.success) {
            if (result.warning) {
                alert(`Shipment Created, but AWB Generation Failed:\n${result.warning}\n\nPlease check your Shiprocket account (e.g., KYC status).`);
            } else {
                alert(`Shipment Created via ${selectedCourier.courier_name}!\nAWB Generated and Tracking updated on Dashboard.`);
            }
            setShipModalOpen(false);
            if (onSuccess) onSuccess(result);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/50 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Shiprocket Dispatch</h3>
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mt-1">Order #{order?._id?.slice(-6)}</p>
                    </div>
                    <button onClick={() => setShipModalOpen(false)} className="p-2 hover:bg-white rounded-2xl text-slate-400 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Dimensions Form */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Package Details</label>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="relative group">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Length</span>
                                <input
                                    type="number" name="length" placeholder="0" required
                                    value={dimensions.length} onChange={handleChange}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center text-sm"
                                />
                            </div>
                            <div className="relative group">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Breadth</span>
                                <input
                                    type="number" name="breadth" placeholder="0" required
                                    value={dimensions.breadth} onChange={handleChange}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center text-sm"
                                />
                            </div>
                            <div className="relative group">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Height</span>
                                <input
                                    type="number" name="height" placeholder="0" required
                                    value={dimensions.height} onChange={handleChange}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center text-sm"
                                />
                            </div>
                            <div className="relative group">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400">Weight (Kg)</span>
                                <input
                                    type="number" step="0.01" name="weight" placeholder="0" required
                                    value={dimensions.weight} onChange={handleChange}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCheckRates}
                            disabled={ratesLoading}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                        >
                            {ratesLoading ? 'Calculating Rates...' : 'Check / Refresh Rates'}
                        </button>
                    </div>

                    {/* Rates List */}
                    {rates && (
                        <div className="space-y-4 animate-in fade-in">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Available Couriers ({rates.length})</label>
                            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {rates.map((courier) => (
                                    <div
                                        key={courier.courier_company_id}
                                        onClick={() => setSelectedCourier(courier)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center group
                                            ${selectedCourier?.courier_company_id === courier.courier_company_id
                                                ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                                                : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl ${selectedCourier?.courier_company_id === courier.courier_company_id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500'} transition-colors`}>
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{courier.courier_name}</h4>
                                                <p className="text-[10px] text-slate-500 font-medium flex items-center mt-1">
                                                    <Clock size={10} className="mr-1" /> ETD: {courier.etd}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-800 text-lg flex items-center justify-end">
                                                <IndianRupee size={14} strokeWidth={3} /> {courier.rate}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating: {courier.rating}/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handleDispatch}
                        disabled={loading || !selectedCourier}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                    >
                        {loading ? <span>Processsing...</span> : <><Package size={18} /> <span>Dispatch with {selectedCourier ? selectedCourier.courier_name : '...'}</span></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipModal;
