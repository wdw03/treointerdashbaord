import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { ReturnsTableSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
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
  X,
  Camera,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  FileText
} from 'lucide-react';

const RETURN_STAGES = [
  'All',
  'Return Requested',
  'Approved',
  'Pickup Scheduled',
  'Returned',
  'Refund Pending',
  'Refunded',
  'Rejected'
];

export const Returns = () => {
  const { returns, updateReturnStatus, refreshReturns, showToast } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Rejection modal
  const [rejectModal, setRejectModal] = useState({ open: false, claim: null });
  const [rejectReason, setRejectReason] = useState('');

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (activeTab !== 'All') {
        const tabLower = activeTab.toLowerCase();
        const statusLower = (r.status || '').toLowerCase();
        if (tabLower === 'return requested' && !statusLower.includes('requested') && !statusLower.includes('pending')) return false;
        if (tabLower === 'approved' && !statusLower.includes('approved')) return false;
        if (tabLower === 'rejected' && !statusLower.includes('rejected')) return false;
        if (tabLower === 'refunded' && !statusLower.includes('refunded')) return false;
        if (tabLower === 'pickup scheduled' && !statusLower.includes('pickup')) return false;
        if (tabLower === 'returned' && statusLower !== 'returned') return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.id?.toLowerCase().includes(q) ||
          r.orderId?.toLowerCase().includes(q) ||
          r.customer?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.productName?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [returns, activeTab, searchTerm]);

  const handleApprove = async (claim) => {
    setIsProcessing(true);
    try {
      await updateReturnStatus(claim.id, 'approve', {
        adminNotes: 'Return claim verified & approved by admin. Reverse pickup authorized.',
      });
      setSelectedReturn(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (claim) => {
    setRejectModal({ open: true, claim });
    setRejectReason('Defect not visible or does not meet replacement criteria.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.claim) return;
    setIsProcessing(true);
    try {
      await updateReturnStatus(rejectModal.claim.id, 'reject', {
        adminNotes: rejectReason || 'Claim rejected upon admin review.',
      });
      setRejectModal({ open: false, claim: null });
      setSelectedReturn(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async (claim) => {
    if (!window.confirm(`Are you sure you want to issue a refund of ₹${claim.amount} for Order ${claim.orderId}?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await updateReturnStatus(claim.id, 'refund', {
        refundAmount: claim.amount,
        adminNotes: 'Refund successfully initiated by admin.',
      });
      setSelectedReturn(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Returns &amp; Refund Claims</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect customer damage photos, verify claims, and authorize doorstep reverse pickup or refunds.
          </p>
        </div>
        <button
          onClick={async () => {
            if (refreshReturns) {
              showToast('Syncing return claims...');
              await refreshReturns();
            }
          }}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-sync Claims
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-slate-800 text-xs no-scrollbar shrink-0">
        {RETURN_STAGES.map((tab) => {
          const count = tab === 'All'
            ? returns.length
            : returns.filter((r) => {
                const s = (r.status || '').toLowerCase();
                const t = tab.toLowerCase();
                if (t === 'return requested') return s.includes('requested') || s.includes('pending');
                return s.includes(t);
              }).length;

          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }
              `}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {isPageLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500/50 animate-pulse inline-block" />
                ) : (
                  count
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH STRIP */}
      <div className="admin-card p-3 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Claim ID, Order, Customer, Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-9 text-xs w-full py-1.5"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Showing <strong className="text-white">{filteredReturns.length}</strong> of {returns.length} claims
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-card overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-[#0F172A] text-slate-300 text-xs">
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Claim / Ticket ID</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Order ID</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Customer</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Product &amp; Reason</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Proof Photos</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm py-2.5 px-3">Refund Amount</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm py-2.5 px-3">Status</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isPageLoading ? (
                <ReturnsTableSkeleton rows={7} />
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">
                    No return claims match your current filters.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="table-tr hover:bg-slate-800/40">
                    <td className="table-td font-mono font-bold text-indigo-400 py-2.5 px-3">
                      {r.ticketId || r.id}
                    </td>
                    <td className="table-td font-mono text-slate-200 py-2.5 px-3">
                      {r.orderId}
                    </td>
                    <td className="table-td py-2.5 px-3">
                      <p className="font-semibold text-slate-100">{r.customer}</p>
                      <p className="text-[10px] text-slate-400">{r.phone || r.email}</p>
                    </td>
                    <td className="table-td max-w-xs py-2.5 px-3">
                      <p className="font-semibold text-slate-200 truncate">{r.productName}</p>
                      <p className="text-[11px] text-amber-400 font-medium truncate">Reason: {r.reason}</p>
                    </td>
                    <td className="table-td py-2.5 px-3">
                      {r.images && r.images.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {r.images.slice(0, 3).map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Proof thumb"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxPhoto(imgUrl);
                              }}
                              className="w-7 h-7 rounded-lg object-cover border border-indigo-500/40 cursor-zoom-in hover:scale-110 transition-transform"
                              title="Click to zoom"
                            />
                          ))}
                          <span className="text-[10px] font-bold text-indigo-400 ml-1">
                            {r.images.length} photo{r.images.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No photos</span>
                      )}
                    </td>
                    <td className="table-td text-right font-black text-sm text-slate-100 py-2.5 px-3">
                      ₹{r.amount}
                    </td>
                    <td className="table-td py-2.5 px-3">
                      <span className={`
                        badge
                        ${r.status === 'Refunded' ? 'badge-emerald' : ''}
                        ${r.status === 'Return Requested' ? 'badge-amber' : ''}
                        ${r.status === 'Approved' ? 'badge-indigo' : ''}
                        ${r.status === 'Pickup Scheduled' ? 'badge-cyan' : ''}
                        ${r.status === 'Rejected' ? 'badge-rose' : ''}
                        ${r.status === 'Returned' ? 'badge-purple' : ''}
                      `}>
                        {r.status}
                      </span>
                    </td>
                    <td className="table-td text-right py-2.5 px-3">
                      <button
                        onClick={() => setSelectedReturn(r)}
                        className="btn-secondary py-1 px-2.5 text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center shrink-0 bg-slate-900/90">
          <span>Showing {filteredReturns.length} of {returns.length} return claims</span>
          <span className="text-[11px] text-slate-500">Live Photo Verification &amp; Reverse Logistics</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RETURN DETAIL & PHOTO INSPECTION MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl p-5 sm:p-6 space-y-4 animate-scaleIn my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded">
                    {selectedReturn.ticketId || selectedReturn.id}
                  </span>
                  <span className={`badge ${
                    selectedReturn.status === 'Approved' ? 'badge-indigo' :
                    selectedReturn.status === 'Refunded' ? 'badge-emerald' :
                    selectedReturn.status === 'Rejected' ? 'badge-rose' : 'badge-amber'
                  }`}>
                    {selectedReturn.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-1">
                  Return Claim for Order {selectedReturn.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Customer: <strong className="text-slate-200">{selectedReturn.customer}</strong></span>
                <span className="text-slate-400">Phone: <strong className="text-slate-200">{selectedReturn.phone || 'N/A'}</strong></span>
              </div>
              <p className="text-slate-400">Items: <strong className="text-slate-200">{selectedReturn.productName}</strong></p>
              <p className="text-slate-400">Claimed Reason: <strong className="text-amber-400">{selectedReturn.reason}</strong></p>
              <p className="text-slate-300 italic pt-1 border-t border-slate-800/80 mt-1.5">
                "{selectedReturn.reasonDetails}"
              </p>
              {selectedReturn.adminNotes && (
                <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-indigo-300 mt-1">
                  <strong>Admin Remarks:</strong> {selectedReturn.adminNotes}
                </div>
              )}
            </div>

            {/* 📸 CUSTOMER UPLOADED PROOF PHOTOS GALLERY */}
            {selectedReturn.images && selectedReturn.images.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    Customer Proof Photos ({selectedReturn.images.length} / 3)
                  </h4>
                  <span className="text-[10px] text-indigo-400">Click photo to zoom</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedReturn.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxPhoto(imgUrl)}
                      className="aspect-square rounded-xl overflow-hidden border border-indigo-900/60 relative cursor-pointer group bg-slate-950 hover:border-indigo-500 transition-all shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt={`Damage proof ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-5 h-5 text-indigo-300" />
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-bold bg-black/80 text-white rounded">
                        Photo {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                No proof photos uploaded for this claim.
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Return &amp; Reverse Logistics Timeline
              </h4>
              <div className="space-y-2">
                {(selectedReturn.timeline || []).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      step.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 flex justify-between">
                      <span className={`${step.done ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                        {step.step}
                      </span>
                      <span className="text-[10px] text-slate-500">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Action Bar */}
            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-400">
                Refund Due: ₹{selectedReturn.amount}
              </span>

              <div className="flex items-center gap-2">
                {/* Reject Button */}
                {selectedReturn.status !== 'Rejected' && selectedReturn.status !== 'Refunded' && (
                  <button
                    onClick={() => handleOpenReject(selectedReturn)}
                    disabled={isProcessing}
                    className="btn-secondary py-1.5 px-3 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  >
                    Reject Claim
                  </button>
                )}

                {/* Approve Button */}
                {selectedReturn.status !== 'Approved' && selectedReturn.status !== 'Refunded' && (
                  <button
                    onClick={() => handleApprove(selectedReturn)}
                    disabled={isProcessing}
                    className="btn-secondary py-1.5 px-3 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                  >
                    Approve Return
                  </button>
                )}

                {/* Process Refund Button */}
                {selectedReturn.status !== 'Refunded' && (
                  <button
                    onClick={() => handleProcessRefund(selectedReturn)}
                    disabled={isProcessing}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Process ₹{selectedReturn.amount} Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FULL PHOTO LIGHTBOX MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl">
            <img
              src={lightboxPhoto}
              alt="Enlarged proof"
              className="max-w-full max-h-[88vh] object-contain rounded-2xl border border-indigo-500/30 shadow-2xl"
            />
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* REJECT MODAL WITH ADMIN REMARKS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-white text-sm">Reject Return Claim</h3>
              <button
                onClick={() => setRejectModal({ open: false, claim: null })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please enter the reason for rejection. This will be shown to the customer on their order portal:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Damage not visible in uploaded photos, product used/washed, or policy expired..."
              className="admin-input text-xs w-full p-2.5"
            />

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setRejectModal({ open: false, claim: null })}
                disabled={isProcessing}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isProcessing}
                className="btn-primary py-1.5 px-3 text-xs bg-rose-600 hover:bg-rose-700 border-rose-600"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
