import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { ToastContainer } from '../ui/ToastContainer.jsx';
import { PrintModal } from '../ui/PrintModal.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';

export const Layout = () => {
  const { sidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main
          className={`
            flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300
            ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Interactive Modals & Toasts */}
      <ToastContainer />
      <PrintModal />
    </div>
  );
};
