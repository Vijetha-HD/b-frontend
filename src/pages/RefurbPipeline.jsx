import React, { useState, useEffect } from 'react';
import { User, ChevronRight } from 'lucide-react';
import { STAGES } from '../data/constants';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RefurbPipeline = ({ refurbPipeline, updateRefurbStage }) => {
    const [refurbRequests, setRefurbRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRefurbRequests();
    }, []);

    const fetchRefurbRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/laptops/refurbishment/requests?status=IN_REFURB`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                // Map refurbishment requests to pipeline format
                const mappedRequests = (response.data.data.requests || []).map((req, index) => ({
                    id: req._id,
                    item: req.productId?.name || 'Unknown Product',
                    stage: 'Received', // Start at first stage
                    tech: 'TBD',
                    request: req // Keep original request data
                }));
                setRefurbRequests(mappedRequests);
            }
        } catch (error) {
            console.error('Error fetching refurbishment requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStage = async (requestId, currentStage) => {
        const currentIndex = STAGES.indexOf(currentStage);
        if (currentIndex < STAGES.length - 1) {
            const newStage = STAGES[currentIndex + 1];
            // Update local state
            setRefurbRequests(prev => prev.map(item =>
                item.id === requestId ? { ...item, stage: newStage } : item
            ));

            // If it's the last stage, mark as ready for return dispatch
            if (newStage === 'Certified') {
                try {
                    const token = localStorage.getItem('token');
                    // The status will be updated when admin dispatches back to customer
                    // For now, just update the local state
                } catch (error) {
                    console.error('Error updating stage:', error);
                }
            }
        }
    };

    // Combine mock data with real requests for now
    const allItems = [...refurbPipeline, ...refurbRequests];

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 animate-in fade-in">
                <p className="text-slate-400">Loading refurbishment pipeline...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in slide-in-from-left-4">
            {STAGES.map(stage => (
                <div key={stage} className="bg-slate-100/50 p-4 rounded-3xl border border-slate-200/50 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest">{stage}</h4>
                        <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200">
                            {allItems.filter(i => i.stage === stage).length}
                        </span>
                    </div>
                    <div className="space-y-4">
                        {allItems.filter(i => i.stage === stage).map(unit => (
                            <div key={unit.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative cursor-move">
                                <p className="text-[10px] font-bold text-blue-600 mb-1">{unit.id?.slice(-6) || unit.id}</p>
                                <h5 className="font-bold text-slate-800 leading-tight line-clamp-2">{unit.item}</h5>
                                {unit.request && (
                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{unit.request.issueText}</p>
                                )}
                                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                                    <div className="flex items-center text-xs text-slate-400 font-medium">
                                        <User size={12} className="mr-1" /> {unit.tech}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (unit.request) {
                                                handleUpdateStage(unit.id, unit.stage);
                                            } else {
                                                updateRefurbStage(unit.id);
                                            }
                                        }}
                                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg group-hover:bg-blue-50 transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RefurbPipeline;
