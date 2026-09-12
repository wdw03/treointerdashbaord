import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';
import { adminApi } from '../services/api.js';
import { ProductImage } from '../components/ui/ProductImage.jsx';
import { calculateOrderTotal, ORDER_STATUSES } from '../data/orders.js';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { OrdersTableSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import {
  Search,
  Filter,
  Printer,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Package,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  MessageSquare,
  XCircle,
  Eye,
  Download,
  ChevronDown,
  ArrowUpDown,
  MoreVertical,
  X,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const cleanPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export const Orders = () => {
  const { orders, updateOrderStatus, bulkUpdateOrderStatus, setPrintDocument, showToast, refreshOrders } = useAdmin();
  const isPageLoading = usePageLoading(450);

  // Active Tab Filter (All or specific status)
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // for modal view
  const [sortBy, setSortBy] = useState('date_desc');
  const [shipmentActionLoading, setShipmentActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: '' });
  const [orderAuditHistory, setOrderAuditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch status history audit log when order modal opens
  useEffect(() => {
    if (!selectedOrderDetails) {
      setOrderAuditHistory([]);
      return;
    }
    let active = true;
    setLoadingHistory(true);
    const fetchAudit = async () => {
      try {
        const orderId = selectedOrderDetails.db_id || selectedOrderDetails.id;
        const res = await adminApi.getOrder(orderId);
        if (active && Array.isArray(res?.statusHistory)) {
          setOrderAuditHistory(res.statusHistory);
        }
      } catch (err) {
        console.warn('Failed to load status history:', err);
      } finally {
        if (active) setLoadingHistory(false);
      }
    };
    fetchAudit();
    return () => { active = false; };
  }, [selectedOrderDetails?.id, selectedOrderDetails?.status]);

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelModal({ open: true, orderId, reason: 'Order cancelled by store administrator' });
      return;
    }
    updateOrderStatus(orderId, newStatus);
  };

  // Keep selectedOrderDetails in sync when orders update
  useEffect(() => {
    if (selectedOrderDetails) {
      const updated = orders.find((o) => o.id === selectedOrderDetails.id);
      if (updated) {
        setSelectedOrderDetails(updated);
      }
    }
  }, [orders]);

  const handleCreateShipment = async (orderId) => {
    setShipmentActionLoading(true);
    setActionMessage('Creating Shiprocket shipment...');
    try {
      const res = await adminApi.createShipment(orderId);
      if (res && res.success) {
        showToast(res.alreadyExists ? 'Shipment already exists' : 'Shiprocket shipment created successfully!');
        if (refreshOrders) await refreshOrders();
      } else {
        showToast(res?.error || 'Failed to create shipment');
      }
    } catch (err) {
      showToast(err.message || 'Shipment creation failed');
    } finally {
      setShipmentActionLoading(false);
      setActionMessage('');
    }
  };

  const handleAssignAWB = async (orderId) => {
    setShipmentActionLoading(true);
    setActionMessage('Assigning AWB from Shiprocket...');
    try {
      const res = await adminApi.assignAWB(orderId);
      if (res && res.success) {
        showToast(`AWB ${res.awbNumber || ''} assigned successfully!`);
        if (refreshOrders) await refreshOrders();
      } else {
        showToast(res?.error || 'Failed to assign AWB');
      }
    } catch (err) {
      showToast(err.message || 'AWB assignment failed');
    } finally {
      setShipmentActionLoading(false);
      setActionMessage('');
    }
  };

  const handleRequestPickup = async (orderId) => {
    setShipmentActionLoading(true);
    setActionMessage('Scheduling courier pickup...');
    try {
      const res = await adminApi.requestPickup(orderId);
      if (res && res.success) {
        showToast(res.alreadyScheduled ? 'Pickup already scheduled' : 'Courier pickup scheduled successfully!');
        if (refreshOrders) await refreshOrders();
      } else {
        showToast(res?.error || 'Failed to schedule pickup');
      }
    } catch (err) {
      showToast(err.message || 'Pickup request failed');
    } finally {
      setShipmentActionLoading(false);
      setActionMessage('');
    }
  };

  const handlePrintShiprocketLabel = async (order) => {
    setShipmentActionLoading(true);
    setActionMessage('Generating official Shiprocket shipping label with AWB...');
    try {
      const res = await adminApi.getShiprocketLabel(order.id);
      if (res && res.labelUrl) {
        window.open(res.labelUrl, '_blank', 'noopener,noreferrer');
        showToast(`Official Shiprocket shipping label opened! (AWB: ${res.awbNumbers?.[0] || res.awb || order.trackingNumber || ''})`);
      } else {
        showToast(res?.error || 'Could not generate official label from Shiprocket.');
      }
    } catch (err) {
      showToast(`Shiprocket label error: ${err.message}`);
    } finally {
      setShipmentActionLoading(false);
      setActionMessage('');
    }
  };

  // Scroll controls for horizontal status tabs
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const hasScrollLeft = el.scrollLeft > 6;
    const hasScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 12;
    setCanScrollLeft(hasScrollLeft);
    setCanScrollRight(hasScrollRight);
  };

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    checkScrollButtons();

    el.addEventListener('scroll', checkScrollButtons, { passive: true });
    window.addEventListener('resize', checkScrollButtons);

    const timer1 = setTimeout(checkScrollButtons, 50);
    const timer2 = setTimeout(checkScrollButtons, 200);

    return () => {
      el.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [orders]);

  const handleScroll = (direction) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollAmount = 280;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleTabClick = (tab, e) => {
    setActiveTab(tab);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Strictly exclude unpaid checkout attempts / failed payments
        const s = (order.raw_status || order.status || '').toLowerCase();
        if (['pending_payment', 'pending payment', 'payment_failed', 'payment failed', 'draft'].includes(s)) {
          return false;
        }

        // Tab filter
        if (activeTab !== 'All' && order.status !== activeTab) return false;

        // Courier filter
        if (selectedCourier !== 'All' && order.shippingPartner !== selectedCourier) return false;

        // Payment filter
        if (selectedPayment !== 'All' && order.paymentMethod !== selectedPayment) return false;

        // Search filter (ID, Customer name, phone, email, product)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesId = order.id.toLowerCase().includes(q);
          const matchesCustomer = order.customer.name.toLowerCase().includes(q) || order.customer.phone.includes(q) || order.customer.email.toLowerCase().includes(q);
          const matchesProduct = order.items.some((i) => i.name.toLowerCase().includes(q));
          const matchesTracking = order.trackingNumber?.toLowerCase().includes(q);
          if (!matchesId && !matchesCustomer && !matchesProduct && !matchesTracking) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount_desc') return calculateOrderTotal(b).total - calculateOrderTotal(a).total;
        if (sortBy === 'amount_asc') return calculateOrderTotal(a).total - calculateOrderTotal(b).total;
        return 0;
      });
  }, [orders, activeTab, selectedCourier, selectedPayment, searchTerm, sortBy]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkPrintInvoices = () => {
    const list = orders.filter((o) => selectedOrders.includes(o.id));
    if (list.length === 0) return;
    setPrintDocument({ type: 'invoice', data: list });
  };

  const handleBulkPrintPackingSlips = () => {
    const list = orders.filter((o) => selectedOrders.includes(o.id));
    if (list.length === 0) return;
    setPrintDocument({ type: 'packing_slip', data: list });
  };

  const handleBulkPrintShippingLabels = async () => {
    if (selectedOrders.length === 0) {
      showToast('Please select at least one order to print labels');
      return;
    }
    setShipmentActionLoading(true);
    setActionMessage(`Generating official Shiprocket shipping labels for ${selectedOrders.length} orders...`);
    try {
      const res = await adminApi.getShiprocketLabel({ orderIds: selectedOrders });
      if (res && res.labelUrl) {
        window.open(res.labelUrl, '_blank', 'noopener,noreferrer');
        showToast(`Official Shiprocket shipping labels for ${selectedOrders.length} orders opened!`);
      } else {
        showToast(res?.error || 'Failed to generate bulk official Shiprocket labels');
      }
    } catch (err) {
      showToast(`Bulk label error: ${err.message}`);
    } finally {
      setShipmentActionLoading(false);
      setActionMessage('');
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedOrders.length === 0) return;
    bulkUpdateOrderStatus(selectedOrders, newStatus);
    setSelectedOrders([]);
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">Orders Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
            Track, filter, update and bulk-dispatch orders across blue-chip couriers.
          </p>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-indigo-950/80 border border-indigo-500/40 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs text-slate-200 animate-fadeIn w-full sm:w-auto">
            <span className="font-bold text-indigo-400 text-xs shrink-0">{selectedOrders.length} selected</span>
            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5 flex-wrap flex-1 sm:flex-initial">
              <button onClick={handleBulkPrintInvoices} className="btn-secondary py-1 px-2 text-[11px] sm:text-xs">
                <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Invoices
              </button>
              <button onClick={handleBulkPrintPackingSlips} className="btn-secondary py-1 px-2 text-[11px] sm:text-xs">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Slips
              </button>
              <button onClick={handleBulkPrintShippingLabels} className="btn-secondary py-1 px-2 text-[11px] sm:text-xs">
                <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Labels
              </button>

              {/* Quick Bulk Status Picker */}
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStatusChange(e.target.value);
                }}
                defaultValue=""
                className="admin-select py-1 px-2 text-[11px] sm:text-xs flex-1 sm:flex-initial"
              >
                <option value="" disabled>Status...</option>
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* HORIZONTAL STATUS TABS (Single row with smooth scroll & left/right buttons) */}
      <div className="relative w-full max-w-full min-w-0 border-b border-slate-800/80 pb-2 group shrink-0">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 z-10 flex items-center pr-6 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900/95 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg shadow-black/60 flex items-center justify-center transition-all duration-150 active:scale-90"
              title="Scroll Left"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Tabs Container */}
        <div
          ref={tabsContainerRef}
          onScroll={checkScrollButtons}
          className="w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth touch-pan-x min-w-0 py-0.5"
        >
          <div className="flex items-center gap-1.5 w-max pl-1 pr-14">
            {['All', ...ORDER_STATUSES].map((tab) => {
              const count = tab === 'All'
                ? orders.length
                : orders.filter((o) => o.status === tab).length;

              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={(e) => handleTabClick(tab, e)}
                  className={`
                    px-3 py-1.5 sm:py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 text-xs shrink-0 select-none
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                    }
                  `}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold flex items-center justify-center min-w-[1.25rem] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPageLoading ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500/50 animate-pulse" />
                    ) : (
                      count
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 z-10 flex items-center pl-6 bg-gradient-to-l from-[#0B0F19] via-[#0B0F19]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900/95 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg shadow-black/60 flex items-center justify-center transition-all duration-150 active:scale-90"
              title="Scroll Right"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH CONTROL STRIP */}
      <div className="admin-card p-3 sm:p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 text-xs w-full max-w-full min-w-0 shrink-0">
        {/* Search */}
        <div className="relative w-full md:w-80 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer, Phone..."
            className="admin-input pl-9 pr-8 py-1.5 text-xs w-full min-w-0"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto min-w-0">
          {/* Courier Filter */}
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="admin-select py-1.5 px-2.5 text-xs w-full sm:w-auto min-w-0"
          >
            <option value="All">All Couriers</option>
            <option value="BlueDart">BlueDart</option>
            <option value="Delhivery">Delhivery</option>
            <option value="Xpressbees">Xpressbees</option>
            <option value="DTDC">DTDC</option>
          </select>

          {/* Payment Method */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="admin-select py-1.5 px-2.5 text-xs w-full sm:w-auto min-w-0"
          >
            <option value="All">All Payments</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-select py-1.5 px-2.5 text-xs w-full sm:w-auto min-w-0"
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE CARD */}
      <div className="admin-card overflow-hidden w-full max-w-full min-w-0 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col flex-1 min-h-0">
        {/* Mobile Swipe Hint banner (only visible on mobile screens) */}
        <div className="lg:hidden flex items-center justify-between px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80 text-[11px] text-slate-400 select-none shrink-0">
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <ArrowRightLeft className="w-3 h-3" /> Scroll table horizontally for all columns
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {filteredOrders.length} orders
          </span>
        </div>

        {/* Scrollable Container (Only table items scroll, headers & navbar stay fixed) */}
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[320px] max-h-[62vh] lg:max-h-none w-full max-w-full min-w-0 touch-pan-x overscroll-contain relative border-b border-slate-800/60">
          <table className="w-full text-left min-w-[940px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-[#0F172A] text-slate-300">
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] w-10 text-center px-3 py-3 border-b border-slate-800 shadow-sm">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[130px] border-b border-slate-800 shadow-sm">Order ID</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[160px] border-b border-slate-800 shadow-sm">Customer</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[200px] border-b border-slate-800 shadow-sm">Items &amp; Variants</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-center px-2 py-3 w-14 border-b border-slate-800 shadow-sm">Qty</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right px-3.5 py-3 min-w-[95px] border-b border-slate-800 shadow-sm">Amount</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[105px] border-b border-slate-800 shadow-sm">Payment</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[130px] border-b border-slate-800 shadow-sm">Status</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] px-3.5 py-3 min-w-[135px] border-b border-slate-800 shadow-sm">Courier / Tracking</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right px-3.5 py-3 min-w-[90px] border-b border-slate-800 shadow-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {isPageLoading ? (
                <OrdersTableSkeleton rows={7} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-500 text-sm">
                    No orders match your current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { subtotal, tax, shipping, discount, total } = calculateOrderTotal(order);
                  const isSelected = selectedOrders.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`table-tr ${isSelected ? 'bg-indigo-950/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="table-td text-center px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(order.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Order ID & Date */}
                      <td className="table-td px-3.5 py-3 cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="font-mono font-bold text-indigo-400 hover:underline text-xs">{order.id}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="table-td px-3.5 py-3 cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="font-semibold text-slate-200 text-xs">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{order.customer.phone}</span>
                          {order.customer.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone(order.customer.phone)}?text=${encodeURIComponent(
                                `Hello ${order.customer.name}, this is Trio Enterprises support regarding Order #${order.id}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 rounded transition-colors"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>WA</span>
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{order.customer.address.city}, {order.customer.address.state}</div>
                      </td>

                      {/* Products Stack with images */}
                      <td className="table-td px-3.5 py-3 cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="flex items-center gap-2">
                          <ProductImage
                            src={order.items[0]?.image}
                            category={order.items[0]?.category}
                            alt={order.items[0]?.name}
                            className="w-9 h-9 rounded-lg shrink-0"
                          />
                          <div className="truncate max-w-[140px] sm:max-w-[160px]">
                            <p className="text-xs font-medium text-slate-200 truncate">{order.items[0]?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {order.items[0]?.selectedColor} • {order.items[0]?.selectedSize}
                            </p>
                          </div>
                          {order.items.length > 1 && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded shrink-0">
                              +{order.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="table-td px-2 py-3 text-center font-bold text-slate-300 text-xs">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </td>

                      {/* Final Amount */}
                      <td className="table-td px-3.5 py-3 text-right">
                        <div className="font-bold text-slate-100 text-xs">₹{total}</div>
                        {discount > 0 && <span className="text-[10px] text-emerald-400 block font-medium">-₹{discount} OFF</span>}
                      </td>

                      {/* Payment Status */}
                      <td className="table-td px-3.5 py-3">
                        <span className="font-medium text-xs block text-slate-200">{order.paymentMethod}</span>
                        <span className={`text-[10px] font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-400' : order.paymentStatus === 'Refunded' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Order Status Badge with quick dropdown */}
                      <td className="table-td px-3.5 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="admin-select text-xs py-1 px-2 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {(() => {
                          let claim = null;
                          if (order.notes) {
                            try {
                              const p = JSON.parse(order.notes);
                              claim = p.returnClaim;
                            } catch (_) {}
                          }
                          if (!claim) return null;
                          return (
                            <div className="mt-1 flex flex-col gap-0.5">
                              <Link
                                to="/returns"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md transition-colors"
                                title={`Return ticket ${claim.ticketId} active. Click to inspect.`}
                              >
                                <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                                <span>Return: {claim.status?.replace(/_/g, ' ') || 'Requested'}</span>
                              </Link>
                              {claim.reverseAwb && (
                                <span className="text-[9px] font-mono text-indigo-300 truncate max-w-[130px]">
                                  AWB: {claim.reverseAwb}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Courier & Tracking */}
                      <td className="table-td px-3.5 py-3">
                        <div className="text-xs font-medium text-slate-300">{order.shippingPartner}</div>
                        <div className="font-mono text-[10px] text-indigo-400">{order.trackingNumber}</div>
                        <div className="text-[10px] text-slate-500">Est: {order.estimatedDelivery}</div>
                      </td>

                      {/* Row Actions */}
                      <td className="table-td px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPrintDocument({ type: 'invoice', data: order })}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintShiprocketLabel(order)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print Official Shiprocket Shipping Label"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400 shrink-0 bg-slate-900/90">
          <span>{isPageLoading ? <Skeleton className="h-3.5 w-36 inline-block align-middle" /> : `Showing ${filteredOrders.length} of ${orders.length} total orders`}</span>
          <span className="text-slate-500 text-[10px] sm:text-[11px]">Click any order row to view visual timeline and complete details</span>
        </div>
      </div>

      {/* VISUAL ORDER DETAILS MODAL WITH TIMELINE */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-white font-mono">{selectedOrderDetails.id}</h3>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                      {selectedOrderDetails.status}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Placed on {new Date(selectedOrderDetails.date).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="sm:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPrintDocument({ type: 'invoice', data: selectedOrderDetails })}
                  className="btn-secondary py-1 px-2.5 text-xs flex-1 sm:flex-initial"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => handlePrintShiprocketLabel(selectedOrderDetails)}
                  className="btn-secondary py-1 px-2.5 text-xs flex-1 sm:flex-initial"
                  title="Print Official Shiprocket Shipping Label"
                >
                  <Truck className="w-3.5 h-3.5" /> Shiprocket Label
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
              {/* Return Support Ticket Alert Banner */}
              {(() => {
                let claim = null;
                if (selectedOrderDetails.notes) {
                  try {
                    const p = JSON.parse(selectedOrderDetails.notes);
                    claim = p.returnClaim;
                  } catch (_) {}
                }
                if (!claim) return null;
                return (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-amber-300 text-sm">
                              Support Ticket Active: {claim.ticketId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 capitalize">
                              {claim.status?.replace(/_/g, ' ') || 'Pending Review'}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-200/90 mt-1">
                            <strong>Reason:</strong> {claim.reason}
                          </p>
                          {claim.description && (
                            <p className="text-[11px] text-slate-300 italic mt-0.5">
                              "{claim.description}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                        {/* WhatsApp Customer Button */}
                        {selectedOrderDetails.customer?.phone && (
                          <a
                            href={`https://wa.me/${cleanPhone(selectedOrderDetails.customer.phone)}?text=${encodeURIComponent(
                              `Hello ${selectedOrderDetails.customer.name}, this is Trio Enterprises support regarding your Return Ticket ${claim.ticketId} for Order #${selectedOrderDetails.id}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500 flex items-center gap-1.5"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        )}

                        <Link
                          to="/returns"
                          className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Claim &amp; Photos</span>
                        </Link>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Reverse Pickup AWB</span>
                        <span className="font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 inline-block mt-0.5">
                          {claim.reverseAwb || (['approved', 'pickup_scheduled', 'returned', 'refunded'].includes(claim.status) ? `RET-AWB-${selectedOrderDetails.id}` : 'Pending AWB Generation')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Return Courier Partner</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block">
                          {claim.pickupCourier || 'Delhivery Surface / BlueDart Reverse'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Resolution Requested</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">
                          {claim.resolution === 'replacement' ? 'Free Handcrafted Replacement' : `100% Full Refund (₹${selectedOrderDetails.totalAmount || selectedOrderDetails.total || 0})`}
                        </span>
                      </div>

                      {claim.refundReason && (
                        <div className="sm:col-span-2 md:col-span-3 pt-1 text-[11px] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <strong className="text-amber-300">Reason for Refund / Acceptance:</strong>{' '}
                          <span className="text-slate-200">{claim.refundReason}</span>
                          {claim.adminNotes && (
                            <span className="text-slate-400 block mt-0.5">Admin Note: {claim.adminNotes}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              {/* Visual Order Timeline */}
              <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Order &amp; Logistics Lifecycle</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedOrderDetails.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    Status: {selectedOrderDetails.status}
                  </span>
                </div>
                {selectedOrderDetails.status === 'Cancelled' ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center">
                    <p className="text-xs text-rose-300 font-bold flex items-center justify-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" /> Order Cancelled
                    </p>
                    <p className="text-[11px] text-rose-200/80 mt-1">
                      {selectedOrderDetails.financials?.paymentStatus === 'refunded' ? 'Payment refunded & inventory restored.' : 'Order closed & inventory restored.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-xs min-w-[280px]">
                    {['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                      const isPassed =
                        (step === 'Placed') ||
                        (step === 'Processing' && ['Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                        (step === 'Packed' && ['Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                        (step === 'Shipped' && ['Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                        (step === 'Delivered' && selectedOrderDetails.status === 'Delivered');

                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                            {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                          </div>
                          <span className={`font-semibold text-[9px] sm:text-[11px] truncate w-full ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status & Lifecycle Audit Trail */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Lifecycle Audit Trail &amp; History ({orderAuditHistory.length})
                  </h4>
                  {loadingHistory && <span className="text-[10px] text-slate-500 animate-pulse">Refreshing audit...</span>}
                </div>

                {orderAuditHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-1">Initial order placement recorded. No subsequent transitions yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {orderAuditHistory.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-200 capitalize">
                              {item.from_status || 'Initial'} &rarr; <strong className="text-indigo-300">{item.to_status}</strong>
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              item.source === 'customer' ? 'bg-rose-500/20 text-rose-300' :
                              item.source === 'shiprocket_webhook' ? 'bg-cyan-500/20 text-cyan-300' :
                              item.source === 'admin' ? 'bg-indigo-500/20 text-indigo-300' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {item.source}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{item.reason || 'Status transition logged'}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ordered Items ({selectedOrderDetails.items.length})</h4>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[420px]">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedOrderDetails.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <ProductImage src={item.image} category={item.category} alt={item.name} className="w-8 h-8 rounded-lg shrink-0" />
                              <span className="font-semibold text-slate-200 text-xs truncate max-w-[140px]">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-xs">
                            {item.selectedColor} • {item.selectedSize}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">₹{item.price}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-200">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-300">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer & Shipping Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Customer Details</p>
                  <p className="font-bold text-slate-100 text-sm">{selectedOrderDetails.customer.name}</p>
                  <p className="text-slate-300">Phone: {selectedOrderDetails.customer.phone}</p>
                  <p className="text-slate-300 truncate">Email: {selectedOrderDetails.customer.email}</p>
                  <p className="text-slate-400 pt-1 text-[11px] leading-relaxed">
                    {selectedOrderDetails.customer.address.street}, {selectedOrderDetails.customer.address.city}, {selectedOrderDetails.customer.address.state} - {selectedOrderDetails.customer.address.pincode}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Shipping &amp; Payment</p>
                  <p className="text-slate-300">Courier: <strong className="text-slate-100">{selectedOrderDetails.shippingPartner}</strong></p>
                  <p className="text-slate-300">AWB: <strong className="font-mono text-indigo-400">{selectedOrderDetails.trackingNumber}</strong></p>
                  <p className="text-slate-300">Payment: <span className="text-emerald-400 font-semibold">{selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})</span></p>
                  <p className="text-slate-400 pt-1 text-[11px]">Est: {selectedOrderDetails.estimatedDelivery}</p>
                </div>
              </div>

              {/* Shiprocket Logistics & Controls Card */}
              <div className="bg-slate-950 p-3.5 sm:p-5 rounded-xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/20 to-slate-950 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shiprocket Logistics &amp; Shipping Controls</h4>
                      <p className="text-[10px] text-slate-400">Live carrier assignment, AWB generation, and pickup dispatch</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOrderDetails.trackingNumber && !selectedOrderDetails.trackingNumber.startsWith('SR-') ? (
                      <a
                        href={`https://shiprocket.co/tracking/${selectedOrderDetails.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded transition-colors"
                      >
                        Track Shipment <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Courier</span>
                    <span className="text-slate-200 font-semibold truncate block mt-0.5">
                      {selectedOrderDetails.shippingPartner || 'Pending Assignment'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">AWB Code</span>
                    <span className="font-mono text-indigo-400 font-semibold truncate block mt-0.5">
                      {selectedOrderDetails.trackingNumber || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Shipment Status</span>
                    <span className="text-slate-200 font-semibold truncate block mt-0.5 capitalize">
                      {selectedOrderDetails.shipmentStatus || selectedOrderDetails.status || 'Pending'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Pickup Status</span>
                    <span className="text-emerald-400 font-semibold truncate block mt-0.5 capitalize">
                      {selectedOrderDetails.pickupStatus || 'Not Requested'}
                    </span>
                  </div>
                </div>

                {/* Logistics Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  {/* Create Shipment button if no shipment or tracking */}
                  {(!selectedOrderDetails.trackingNumber || selectedOrderDetails.shippingPartner === 'Awaiting Shipment') && (
                    <button
                      onClick={() => handleCreateShipment(selectedOrderDetails.db_id || selectedOrderDetails.id)}
                      disabled={shipmentActionLoading}
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      {shipmentActionLoading ? 'Creating...' : 'Create Shipment'}
                    </button>
                  )}

                  {/* Assign AWB if shipment exists but no real AWB */}
                  {(!selectedOrderDetails.trackingNumber || selectedOrderDetails.trackingNumber.startsWith('SR-')) && (
                    <button
                      onClick={() => handleAssignAWB(selectedOrderDetails.db_id || selectedOrderDetails.id)}
                      disabled={shipmentActionLoading}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {shipmentActionLoading ? 'Assigning...' : 'Assign AWB'}
                    </button>
                  )}

                  {/* Admin Cancel Order button */}
                  {!['Cancelled', 'Delivered', 'Returned', 'Refunded'].includes(selectedOrderDetails.status) && (
                    <button
                      onClick={() => setCancelModal({ open: true, orderId: selectedOrderDetails.id, reason: '' })}
                      disabled={shipmentActionLoading}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                      title="Cancel order, refund online payment & restore stock"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Cancel Order
                    </button>
                  )}

                  {/* Mark as Packed button */}
                  {['Confirmed', 'Processing', 'New'].includes(selectedOrderDetails.status) && (
                    <button
                      onClick={async () => {
                        await updateOrderStatus(selectedOrderDetails.id, 'Packed');
                      }}
                      disabled={shipmentActionLoading}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      Mark as Packed
                    </button>
                  )}

                  {/* Schedule Pickup button */}
                  {selectedOrderDetails.status === 'Packed' && (
                    <button
                      onClick={() => handleRequestPickup(selectedOrderDetails.db_id || selectedOrderDetails.id)}
                      disabled={shipmentActionLoading}
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {shipmentActionLoading ? 'Scheduling...' : 'Schedule Pickup'}
                    </button>
                  )}

                  {/* Print Official Shiprocket Label (PDF) */}
                  <button
                    onClick={() => handlePrintShiprocketLabel(selectedOrderDetails)}
                    disabled={shipmentActionLoading}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                    title="Fetch and print official Shiprocket carrier barcode label PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Shiprocket Label (PDF)
                  </button>

                  {/* Re-sync with backend */}
                  <button
                    onClick={async () => {
                      if (refreshOrders) {
                        showToast('Syncing orders & shipments...');
                        await refreshOrders();
                      }
                    }}
                    disabled={shipmentActionLoading}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-auto"
                    title="Re-sync shipment data"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {actionMessage && (
                  <p className="text-[11px] text-indigo-300 animate-pulse flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {actionMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
