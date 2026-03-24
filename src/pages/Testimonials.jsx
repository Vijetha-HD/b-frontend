import React from 'react';
import { Plus, Star, Quote, Laptop } from 'lucide-react';

const Testimonials = ({ testimonials, setTestimonialModalOpen }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">Laptop Review Engine</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Public Feedback Management</p>
                </div>
                <button
                    onClick={() => setTestimonialModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all flex items-center"
                >
                    <Plus size={20} className="mr-2" /> Record Testimonial
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-blue-50 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <Quote size={120} />
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < t.rating ? "fill-current" : "text-slate-200"} />
                            ))}
                        </div>
                        <p className="text-slate-700 font-medium italic leading-relaxed relative z-10">"{t.comment}"</p>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 border border-white">
                                    {t.customer.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-black text-slate-800">{t.customer}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.date}</p>
                                </div>
                            </div>
                            <Laptop size={18} className="text-blue-200 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
