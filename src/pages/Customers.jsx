import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import {
  Users,
  Search,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Tag,
  Star,
  X
} from 'lucide-react';

export const Customers = () => {
  const { customers, orders } = useAdmin();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'VIP' | 'New'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); // profile drawer/modal

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (activeTab === 'VIP' && !c.tags.includes('VIP') && !c.tags.includes('High Value')) return false;
      if (activeTab === 'New' && c.totalOrders > 3) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [customers, activeTab, searchTerm]);

  // Find order history for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((o) => o.customer.email === selectedCustomer.email || o.customer.name === selectedCustomer.name);
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Customers & Artisans Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Profiles, boutique designer orders, lifetime customer spend and shipping addresses.
          </p>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="admin-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['All', 'VIP', 'New'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-1.5 rounded-xl font-medium transition-colors
                ${activeTab === tab ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'}
              `}
            >
              {tab === 'VIP' ? 'VIP Artisans' : (tab === 'New' ? 'New Customers' : 'All Customers')} ({
                tab === 'All' ? customers.length : (tab === 'VIP' ? customers.filter(c => c.tags.includes('VIP') || c.tags.includes('High Value')).length : customers.filter(c => c.totalOrders <= 3).length)
              })
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer name, city, email..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-th">Customer Name</th>
                <th className="table-th">Contact Info</th>
                <th className="table-th">Location</th>
                <th className="table-th text-center">Total Orders</th>
                <th className="table-th text-right">Lifetime Spend</th>
                <th className="table-th">Customer Tags</th>
                <th className="table-th">Joined Date</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="table-tr">
                  {/* Customer Avatar & Name */}
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
                        {c.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 text-xs">{c.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="table-td">
                    <p className="text-xs text-slate-300 font-medium">{c.phone}</p>
                    <p className="text-[11px] text-slate-500">{c.email}</p>
                  </td>

                  {/* Location */}
                  <td className="table-td">
                    <span className="text-xs text-slate-200">{c.city}</span>
                    <span className="text-[10px] text-slate-500 block">{c.state}</span>
                  </td>

                  {/* Total Orders */}
                  <td className="table-td text-center font-bold text-slate-200 text-xs">
                    {c.totalOrders} Orders
                  </td>

                  {/* Total Spent */}
                  <td className="table-td text-right font-black text-sm text-emerald-400">
                    ₹{c.totalSpent.toLocaleString()}
                  </td>

                  {/* Tags */}
                  <td className="table-td">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="table-td text-xs text-slate-400 font-mono">
                    {c.joinedDate}
                  </td>

                  {/* Actions */}
                  <td className="table-td text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-lg">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.city}, {selectedCustomer.state} • Member since {selectedCustomer.joinedDate}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Lifetime Spend</span>
                <span className="text-base font-bold text-emerald-400">₹{selectedCustomer.totalSpent.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Completed Orders</span>
                <span className="text-base font-bold text-indigo-400">{selectedCustomer.totalOrders} Orders</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Average Order Value</span>
                <span className="text-base font-bold text-white">₹{Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders)}</span>
              </div>
            </div>

            {/* Address & Notes */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Saved Addresses</p>
                {selectedCustomer.addresses?.map((a, i) => (
                  <p key={i} className="text-slate-200">
                    <strong className="text-indigo-400">[{a.type}]</strong> {a.text}
                  </p>
                ))}
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-indigo-300">
                  <strong className="text-indigo-400 block mb-0.5">Admin Profile Notes:</strong>
                  {selectedCustomer.notes}
                </div>
              )}
            </div>

            {/* Recent Orders placed by this customer */}
            <div>
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">Order History ({customerOrders.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerOrders.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-3">No orders recorded yet.</p>
                ) : (
                  customerOrders.map((ord) => (
                    <div key={ord.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-indigo-400">{ord.id}</span>
                        <span className="text-slate-400 ml-2">{ord.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200">₹{ord.items.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
                        <span className="badge-indigo text-[10px]">{ord.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
