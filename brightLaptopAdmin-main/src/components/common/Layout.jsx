import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({
    children,
    isSidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    handleLogout,
    searchTerm,
    setSearchTerm,
    authUser,
    setSelectedWarehouse
}) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
                setSearchTerm={setSearchTerm}
                setSelectedWarehouse={setSelectedWarehouse}
            />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar
                    activeTab={activeTab}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    authUser={authUser}
                />
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
