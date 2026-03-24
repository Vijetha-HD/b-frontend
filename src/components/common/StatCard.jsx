import React from 'react';

const StatCard = ({ label, value, icon: Icon, color, bg, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h3 className="text-2xl font-black mt-1 text-slate-800">{value}</h3>
        </div>
        <div className={`${bg} ${color} p-4 rounded-2xl shadow-inner`}>
            <Icon size={24} />
        </div>
    </div>
);

export default StatCard;
