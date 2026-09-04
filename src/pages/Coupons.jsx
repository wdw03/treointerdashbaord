import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { CouponsGridSkeleton, ChartCardSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  Save,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Coupons = () => {
  const { coupons, addCoupon, toggleCouponStatus, deleteCoupon, categories, showToast } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const handleOpenNewCoupon = () => {
    setEditingCoupon({
      code: 'FESTIVE' + Math.floor(10 + Math.random() * 90),
      type: 'Percentage',
      value: 20,
      minOrderValue: 799,
      maxDiscount: 400,
      applicableCategory: 'Patches',
      description: 'Festival offer on handmade craft collection',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-11-30',
      maxUses: 500
    });
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!editingCoupon.code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }
    addCoupon(editingCoupon);
    setEditingCoupon(null);
  };

  // Usage analytics chart data
  const couponChartData = coupons.map((c) => ({
    name: c.code,
    uses: c.usedCount,
    category: c.applicableCategory
  }));

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Coupons & Festival Discounts</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create promotional discount codes, free shipping rules and category campaigns.
          </p>
        </div>

        <button onClick={handleOpenNewCoupon} className="btn-primary py-2 px-4 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" /> Create Discount Coupon
        </button>
      </div>

      {/* USAGE ANALYTICS CHART */}
      {isPageLoading ? (
        <div className="admin-card p-4 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="h-44 w-full bg-slate-900/60 rounded-xl border border-slate-800/60 p-4 flex items-end justify-between gap-3">
            {[45, 60, 35, 80, 65, 90, 50, 75].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-lg opacity-60" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-card p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Coupon Redemption Analytics</h3>
              <p className="text-xs text-slate-400">Total times each festival offer or code was redeemed by customers</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <BarChart2 className="w-4 h-4" /> Real-time tracking
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={couponChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(v) => [`${v} redemptions`, 'Usage']}
                />
                <Bar dataKey="uses" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* COUPONS CARDS GRID */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isPageLoading ? (
          <CouponsGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
          {coupons.map((c) => (
          <div key={c.id} className="admin-card p-5 flex flex-col justify-between group admin-card-hover">
            <div>
              {/* Header with Code */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <TicketPercent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black font-mono text-base text-white tracking-wider block">{c.code}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">{c.applicableCategory} Category</span>
                  </div>
                </div>

                <span className={`badge ${c.status === 'Active' ? 'badge-emerald' : 'badge-slate'}`}>
                  {c.status}
                </span>
              </div>

              {/* Discount Value */}
              <div className="my-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Benefit</span>
                  <span className="text-lg font-black text-white">
                    {c.type === 'Percentage' ? `${c.value}% OFF` : (c.type === 'Flat' ? `₹${c.value} FLAT` : 'FREE SHIPPING')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Min Order</span>
                  <span className="text-xs font-bold text-slate-300">₹{c.minOrderValue}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {c.description}
              </p>
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Redeemed: <strong className="text-slate-200">{c.usedCount}</strong> / {c.maxUses}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCouponStatus(c.id)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create Promotional Coupon</h3>
              <button onClick={() => setEditingCoupon(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={editingCoupon.code}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI25"
                    className="admin-input w-full text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.type}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, type: e.target.value })}
                    className="admin-select w-full text-xs"
                  >
                    <option value="Percentage">Percentage Discount (%)</option>
                    <option value="Flat">Flat Cash Off (₹)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={editingCoupon.value}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, value: Number(e.target.value) })}
                    className="admin-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrderValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderValue: Number(e.target.value) })}
                    className="admin-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })}
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Applicable Category</label>
                <select
                  value={editingCoupon.applicableCategory}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, applicableCategory: e.target.value })}
                  className="admin-select w-full text-xs"
                >
                  <option value="All">All Store Products</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Customer Offer Description</label>
                <textarea
                  rows={2}
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="admin-input w-full text-xs"
                />
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCoupon(null)} className="btn-secondary py-1.5 px-3 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4 text-xs font-bold">
                  <Save className="w-3.5 h-3.5" /> Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
