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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 min-w-0 w-full max-w-full flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main
          className={`
            flex-1 min-w-0 w-full max-w-full p-3 sm:p-6 md:p-8 transition-all duration-300 overflow-x-hidden
            ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">
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
