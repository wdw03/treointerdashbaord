import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Sparkles,
  Warehouse,
  Tags,
  Users,
  CreditCard,
  RotateCcw,
  TicketPercent,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sliders,
  BookOpen,
  FileText
} from 'lucide-react';

export const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed, stats, mobileMenuOpen, setMobileMenuOpen, cmsHeroSlides, cmsBlogs } = useAdmin();

  const commerceNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      name: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
      badge: stats.statusCounts.new > 0 ? stats.statusCounts.new : null,
      badgeColor: 'bg-indigo-500 text-white'
    },
    {
      name: 'Shipping',
      path: '/shipping',
      icon: Truck,
      badge: (stats.statusCounts.processing + stats.statusCounts.packed) > 0 ? (stats.statusCounts.processing + stats.statusCounts.packed) : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    {
      name: 'Products',
      path: '/products',
      icon: Sparkles,
      badge: stats.totalProducts,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Warehouse,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
    },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    {
      name: 'Returns & Refunds',
      path: '/returns',
      icon: RotateCcw,
      badge: stats.statusCounts.returnRequested > 0 ? stats.statusCounts.returnRequested : null,
      badgeColor: 'bg-purple-500 text-white'
    },
    { name: 'Coupons', path: '/coupons', icon: TicketPercent },
  ];

  const cmsNav = [
    {
      name: 'Home & Banners CMS',
      path: '/cms/home',
      icon: Sliders,
      badge: `${cmsHeroSlides?.length || 3} Slides`,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold'
    },
    {
      name: 'Blog & Journal CMS',
      path: '/cms/blogs',
      icon: BookOpen,
      badge: `${cmsBlogs?.length || 3} Posts`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
    },
    {
      name: 'Static Pages & FAQ',
      path: '/cms/pages',
      icon: FileText
    }
  ];

  const systemNav = [
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavGroup = (items, label) => (
    <div className="space-y-1 mb-4">
      {!sidebarCollapsed && label && (
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3.5 block mb-1.5 animate-fadeIn">
          {label}
        </span>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `
              group flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative
              ${isActive
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold shadow-inner border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-xs animate-fadeIn">{item.name}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className={`text-[10px] px-2 py-0.2 rounded-full shrink-0 font-medium ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 flex flex-col
          bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/80
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Authentic Logo Emblem from triotech */}
            <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-amber-500/50 via-rose-700/40 to-amber-500/50 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden border border-amber-500/40">
                <img
                  src="/logo.png"
                  alt="Trio Enterprises"
                  className="w-full h-full object-contain p-0.5 transform hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="flex flex-col truncate animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white">
                    TRIO <span className="text-amber-400 font-bold">ENTERPRISES</span>
                  </span>
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-black uppercase">
                    CMS
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  Ethnic Craft Guild
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (Grouped) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {renderNavGroup(commerceNav, 'Store Operations')}
          {renderNavGroup(cmsNav, 'Storefront CMS')}
          {renderNavGroup(systemNav, 'System')}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          {!sidebarCollapsed ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200">Catalog &amp; CMS Live</p>
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> 164 Photos Synced
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="164 Photos & CMS Synced">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
