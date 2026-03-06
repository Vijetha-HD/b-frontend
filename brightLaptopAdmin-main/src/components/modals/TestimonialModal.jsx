import React from 'react';
import { X } from 'lucide-react';

const TestimonialModal = ({ isOpen, setTestimonialModalOpen, handleAddTestimonial, newTestimonial, setNewTestimonial, inventory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-bottom-8">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-800">Record Testimonial</h3>
                    <button onClick={() => setTestimonialModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleAddTestimonial} className="p-10 space-y-6">
                    <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Customer Name" value={newTestimonial.customer} onChange={(e) => setNewTestimonial({ ...newTestimonial, customer: e.target.value })} />
                    <div className="grid grid-cols-2 gap-6">
                        <select required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={newTestimonial.laptopId} onChange={(e) => setNewTestimonial({ ...newTestimonial, laptopId: e.target.value })}>
                            <option value="">Select Laptop...</option>
                            {inventory.map(item => <option key={item.id} value={item.id}>{item.brand} {item.model}</option>)}
                        </select>
                        <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-yellow-600" value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                        </select>
                    </div>
                    <textarea required rows="4" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-medium text-slate-700" placeholder="Review comment..." value={newTestimonial.comment} onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}></textarea>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all">Publish Feedback</button>
                </form>
            </div>
        </div>
    );
};

export default TestimonialModal;
