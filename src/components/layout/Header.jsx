import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';
import {
  Search,
  Bell,
  Menu,
  Plus,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  User,
  ChevronDown,
  ExternalLink,
  Package,
  X
} from 'lucide-react';

export const Header = () => {
  const {
    sidebarCollapsed,
    setMobileMenuOpen,
    globalSearch,
    setGlobalSearch,
    products,
    orders,
    customers,
    stats,
    showToast
  } = useAdmin();

  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on global search
  const searchResults = React.useMemo(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) return null;
    const q = globalSearch.toLowerCase().trim();

    const matchedOrders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    ).slice(0, 3);

    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      orders: matchedOrders,
      products: matchedProducts,
      customers: matchedCustomers,
      total: matchedOrders.length + matchedProducts.length + matchedCustomers.length
    };
  }, [globalSearch, orders, products, customers]);

  return (
    <header
      className={`
        sticky top-0 z-30 h-16 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80
        flex items-center justify-between px-4 sm:px-6 transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}
    >
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar Container */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search by Order ID, Product, Customer, SKU..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Instant Dropdown Search Results */}
          {searchFocused && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 max-h-96 overflow-y-auto z-50 animate-scaleIn">
              {searchResults.total === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching orders, products, or customers found.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Matching Products */}
                  {searchResults.products.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1">Products ({searchResults.products.length})</p>
                      {searchResults.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            navigate('/products');
                            setSearchFocused(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.category} • ₹{p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Orders */}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1">Orders ({searchResults.orders.length})</p>
                      {searchResults.orders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            navigate('/orders');
                            setSearchFocused(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-mono text-xs font-bold text-indigo-400">{o.id}</span>
                            <p className="text-[11px] text-slate-300">{o.customer.name}</p>
                          </div>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-medium">
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Customers */}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1">Customers ({searchResults.customers.length})</p>
                      {searchResults.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            navigate('/customers');
                            setSearchFocused(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.city} • {c.phone}</p>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium">₹{c.totalSpent}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Actions, Notifications, User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Product Button */}
        <button
          onClick={() => navigate('/products/new')}
          className="btn-primary py-1.5 px-3 text-xs hidden sm:inline-flex"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0B0F19]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-scaleIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 px-1">
                <span className="font-semibold text-xs text-white">Notifications</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {stats.statusCounts.new + stats.lowStockCount} New
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => { navigate('/orders'); setShowNotifications(false); }}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer flex gap-2.5 items-start"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">New Orders Placed</p>
                    <p className="text-[11px] text-slate-400">{stats.statusCounts.new} customer orders awaiting confirmation.</p>
                  </div>
                </div>

                {stats.lowStockCount > 0 && (
                  <div
                    onClick={() => { navigate('/inventory'); setShowNotifications(false); }}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer flex gap-2.5 items-start"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">Low Stock Alert</p>
                      <p className="text-[11px] text-slate-400">{stats.lowStockCount} craft products running below 15 units.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              TE
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-semibold text-slate-200 block leading-tight">Trio Ecart Admin</span>
              <span className="text-[10px] text-slate-500 block leading-tight">Head Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-scaleIn">
              <div className="p-2 border-b border-slate-800 mb-1">
                <p className="font-semibold text-slate-100">Trio Ecart Store</p>
                <p className="text-[11px] text-slate-500">admin@trioecart.com</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Store Settings
              </button>
              <button
                onClick={() => {
                  showToast('Storefront preview opened in new window');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
              >
                View Live Store <ExternalLink className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
