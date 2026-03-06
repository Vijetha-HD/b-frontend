import React from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';

const Navbar = ({ activeTab, isSidebarOpen, setSidebarOpen, searchTerm, setSearchTerm, authUser }) => {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center space-x-4">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                    <ChevronRight className={`${isSidebarOpen ? 'rotate-180' : ''} transition-transform`} />
                </button>
                <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight">{activeTab}</h2>
            </div>
            <div className="flex items-center space-x-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder={`Search in ${activeTab}...`}
                        className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-3 border-l pl-6 border-slate-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-800 leading-tight">{authUser?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{authUser?.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">AD</div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
