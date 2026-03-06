import React from 'react';
import { X } from 'lucide-react';

const WarehouseModal = ({ isOpen, setWHModalOpen, handleAddWarehouse, newWarehouse, setNewWarehouse }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden scale-in animate-in slide-in-from-bottom-8">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-800 leading-none">Expand Logistics</h3>
                    <button onClick={() => setWHModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <form onSubmit={handleAddWarehouse} className="p-10 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Warehouse Name" value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} />
                    </div>
                    <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Full Address" value={newWarehouse.address} onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="City / Location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} />
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Manager Name (Optional)" value={newWarehouse.manager} onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })} />
                    </div>
                    <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" placeholder="Contact Number" value={newWarehouse.contact} onChange={(e) => setNewWarehouse({ ...newWarehouse, contact: e.target.value })} />
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-black transition-all">Confirm Global Expansion</button>
                </form>
            </div>
        </div>
    );
};

export default WarehouseModal;
