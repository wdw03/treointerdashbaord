import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Eye,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';

const RETURN_STAGES = [
  'All',
  'Return Requested',
  'Approved',
  'Pickup Pending',
  'Returned',
  'Refund Pending',
  'Refunded',
  'Rejected'
];

export const Returns = () => {
  const { returns, updateReturnStatus, showToast } = useAdmin();

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (activeTab !== 'All' && r.status !== activeTab) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [returns, activeTab, searchTerm]);

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Returns & Refund Claims</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review customer replacement and refund requests with reverse courier tracking.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs no-scrollbar shrink-0">
        {RETURN_STAGES.map((tab) => {
          const count = tab === 'All' ? returns.length : returns.filter(r => r.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }
              `}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH STRIP */}
      <div className="admin-card p-3.5 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Claim ID, Order, Customer, Reason..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* RETURNS TABLE */}
      <div className="admin-card overflow-hidden w-full max-w-full min-w-0 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[300px] max-h-[60vh] lg:max-h-none w-full max-w-full min-w-0 touch-pan-x overscroll-contain relative border-b border-slate-800/60">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-[#0F172A] text-slate-300">
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Claim ID</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Order ID</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Customer</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Product & Reason</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm">Refund Amount</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Reverse Courier</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Status</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((r) => (
                <tr key={r.id} className="table-tr">
                  <td className="table-td font-mono font-bold text-indigo-400 text-xs">
                    {r.id}
                  </td>
                  <td className="table-td font-mono text-slate-200 text-xs">
                    {r.orderId}
                  </td>
                  <td className="table-td">
                    <p className="font-semibold text-slate-100 text-xs">{r.customer}</p>
                    <p className="text-[10px] text-slate-500">{r.email}</p>
                  </td>
                  <td className="table-td max-w-xs">
                    <p className="font-semibold text-slate-200 text-xs truncate">{r.productName}</p>
                    <p className="text-[11px] text-amber-400/90 font-medium">Reason: {r.reason}</p>
                  </td>
                  <td className="table-td text-right font-black text-sm text-slate-100">
                    ₹{r.amount}
                  </td>
                  <td className="table-td">
                    <p className="text-xs text-slate-300 font-medium">{r.pickupCourier}</p>
                    <p className="text-[10px] text-indigo-400 font-mono">{r.trackingNumber}</p>
                  </td>
                  <td className="table-td">
                    <span className={`
                      badge
                      ${r.status === 'Refunded' ? 'badge-emerald' : ''}
                      ${r.status === 'Return Requested' ? 'badge-amber' : ''}
                      ${r.status === 'Approved' ? 'badge-indigo' : ''}
                      ${r.status === 'Pickup Scheduled' ? 'badge-indigo' : ''}
                      ${r.status === 'Rejected' ? 'badge-rose' : ''}
                      ${r.status === 'In Transit' ? 'badge-indigo' : ''}
                    `}>
                      {r.status}
                    </span>
                  </td>
                  <td className="table-td text-right">
                    <button
                      onClick={() => setSelectedReturn(r)}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3.5 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center shrink-0 bg-slate-900/90">
          <span>Showing {filteredReturns.length} of {returns.length} return claims</span>
          <span className="text-[11px] text-slate-500">Automated reverse pickup courier dispatch</span>
        </div>
      </div>

      {/* RETURN DETAIL & TIMELINE MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Return Claim: {selectedReturn.id}</h3>
                <p className="text-xs text-slate-400">Linked to Order {selectedReturn.orderId}</p>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Claim details */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <p className="text-slate-400">Customer: <strong className="text-slate-200">{selectedReturn.customer}</strong></p>
              <p className="text-slate-400">Item: <strong className="text-slate-200">{selectedReturn.productName}</strong></p>
              <p className="text-slate-400">Claimed Reason: <strong className="text-amber-400">{selectedReturn.reason}</strong></p>
              <p className="text-slate-300 italic pt-1">"{selectedReturn.reasonDetails}"</p>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Return & Reverse Pickup Timeline</h4>
              <div className="space-y-3 text-xs">
                {selectedReturn.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${step.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 flex justify-between">
                      <span className={`font-semibold ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>{step.step}</span>
                      <span className="text-[11px] text-slate-500">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions for Admin */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Refund Amount: ₹{selectedReturn.amount}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateReturnStatus(selectedReturn.id, 'Approved');
                    setSelectedReturn(null);
                  }}
                  className="btn-secondary py-1 px-3 text-xs"
                >
                  Approve Return
                </button>
                <button
                  onClick={() => {
                    updateReturnStatus(selectedReturn.id, 'Refunded');
                    setSelectedReturn(null);
                  }}
                  className="btn-primary py-1 px-3 text-xs"
                >
                  Process ₹{selectedReturn.amount} Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
