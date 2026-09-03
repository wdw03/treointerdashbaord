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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans w-full max-w-full">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Column - Uses responsive padding-left for sidebar offset to prevent any right-side clipping */}
      <div
        className={`
          flex-1 min-w-0 w-full max-w-full flex flex-col min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-6 lg:px-8 lg:py-6">
          <div className="w-full min-w-0">
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
