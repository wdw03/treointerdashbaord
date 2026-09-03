import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { ProductImage } from '../components/ui/ProductImage.jsx';
import { calculateOrderTotal, ORDER_STATUSES } from '../data/orders.js';
import {
  Search,
  Filter,
  Printer,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Eye,
  Download,
  ChevronDown,
  ArrowUpDown,
  MoreVertical,
  X
} from 'lucide-react';

export const Orders = () => {
  const { orders, updateOrderStatus, bulkUpdateOrderStatus, setPrintDocument, showToast } = useAdmin();

  // Active Tab Filter (All or specific status)
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // for modal view
  const [sortBy, setSortBy] = useState('date_desc');

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
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

  const handleBulkPrintShippingLabels = () => {
    const list = orders.filter((o) => selectedOrders.includes(o.id));
    if (list.length === 0) return;
    setPrintDocument({ type: 'shipping_label', data: list });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedOrders.length === 0) return;
    bulkUpdateOrderStatus(selectedOrders, newStatus);
    setSelectedOrders([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Orders Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, filter, update and bulk-dispatch orders across blue-chip couriers.
          </p>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/70 border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs text-slate-200 animate-fadeIn">
            <span className="font-bold text-indigo-400">{selectedOrders.length} selected</span>
            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button onClick={handleBulkPrintInvoices} className="btn-secondary py-1 px-2.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Invoices
            </button>
            <button onClick={handleBulkPrintPackingSlips} className="btn-secondary py-1 px-2.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Slips
            </button>
            <button onClick={handleBulkPrintShippingLabels} className="btn-secondary py-1 px-2.5 text-xs">
              <Truck className="w-3.5 h-3.5" /> Labels
            </button>

            {/* Quick Bulk Status Picker */}
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value);
              }}
              defaultValue=""
              className="admin-select py-1 px-2 text-xs"
            >
              <option value="" disabled>Update Status...</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* HORIZONTAL STATUS TABS (All 12 status options + counts) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs no-scrollbar">
        {['All', ...ORDER_STATUSES].map((tab) => {
          const count = tab === 'All'
            ? orders.length
            : orders.filter((o) => o.status === tab).length;

          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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

      {/* FILTER & SEARCH CONTROL STRIP */}
      <div className="admin-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer, Phone, Tracking..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Courier Filter */}
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="admin-select py-1.5 text-xs"
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
            className="admin-select py-1.5 text-xs"
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
            className="admin-select py-1.5 text-xs"
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-th w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="table-th">Order ID</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Items & Variants</th>
                <th className="table-th text-center">Qty</th>
                <th className="table-th text-right">Amount</th>
                <th className="table-th">Payment</th>
                <th className="table-th">Status</th>
                <th className="table-th">Courier / Tracking</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
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
                      <td className="table-td text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(order.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Order ID & Date */}
                      <td className="table-td cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="font-mono font-bold text-indigo-400 hover:underline">{order.id}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="table-td cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="font-semibold text-slate-200">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{order.customer.phone}</div>
                        <div className="text-[10px] text-slate-500">{order.customer.address.city}, {order.customer.address.state}</div>
                      </td>

                      {/* Products Stack with images */}
                      <td className="table-td cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                        <div className="flex items-center gap-2">
                          <ProductImage
                            src={order.items[0]?.image}
                            category={order.items[0]?.category}
                            alt={order.items[0]?.name}
                            className="w-9 h-9 rounded-lg"
                          />
                          <div className="truncate max-w-[160px]">
                            <p className="text-xs font-medium text-slate-200 truncate">{order.items[0]?.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {order.items[0]?.selectedColor} • {order.items[0]?.selectedSize}
                            </p>
                          </div>
                          {order.items.length > 1 && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                              +{order.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="table-td text-center font-bold text-slate-300">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </td>

                      {/* Final Amount */}
                      <td className="table-td text-right">
                        <div className="font-bold text-slate-100">₹{total}</div>
                        {discount > 0 && <span className="text-[10px] text-emerald-400 block font-medium">-₹{discount} OFF</span>}
                      </td>

                      {/* Payment Status */}
                      <td className="table-td">
                        <span className="font-medium text-xs block text-slate-200">{order.paymentMethod}</span>
                        <span className={`text-[10px] font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-400' : order.paymentStatus === 'Refunded' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Order Status Badge with quick dropdown */}
                      <td className="table-td">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="admin-select text-xs py-1 px-2 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Courier & Tracking */}
                      <td className="table-td">
                        <div className="text-xs font-medium text-slate-300">{order.shippingPartner}</div>
                        <div className="font-mono text-[10px] text-indigo-400">{order.trackingNumber}</div>
                        <div className="text-[10px] text-slate-500">Est: {order.estimatedDelivery}</div>
                      </td>

                      {/* Row Actions */}
                      <td className="table-td text-right">
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
                            onClick={() => setPrintDocument({ type: 'shipping_label', data: order })}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print Shipping Label"
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
        <div className="p-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredOrders.length} of {orders.length} total orders</span>
          <span>Click any order row to view visual timeline and complete details</span>
        </div>
      </div>

      {/* VISUAL ORDER DETAILS MODAL WITH TIMELINE */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white font-mono">{selectedOrderDetails.id}</h3>
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrderDetails.date).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintDocument({ type: 'invoice', data: selectedOrderDetails })}
                  className="btn-secondary py-1 px-2.5 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setPrintDocument({ type: 'shipping_label', data: selectedOrderDetails })}
                  className="btn-secondary py-1 px-2.5 text-xs"
                >
                  <Truck className="w-3.5 h-3.5" /> Label
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Visual Order Timeline */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Shipment & Delivery Timeline</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const isPassed =
                      (step === 'Placed') ||
                      (step === 'Processing' && ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                      (step === 'Packed' && ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                      (step === 'Shipped' && ['Shipped', 'Out for Delivery', 'Delivered'].includes(selectedOrderDetails.status)) ||
                      (step === 'Delivered' && selectedOrderDetails.status === 'Delivered');

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`font-semibold text-[11px] ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Ordered Items ({selectedOrderDetails.items.length})</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
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
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <ProductImage src={item.image} category={item.category} alt={item.name} className="w-8 h-8 rounded-lg" />
                              <span className="font-semibold text-slate-200">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {item.selectedColor} • {item.selectedSize}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">₹{item.price}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-200">{item.quantity}</td>
                          <td className="py-3 px-3 text-right font-bold text-indigo-300">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer & Shipping Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Customer Details</p>
                  <p className="font-bold text-slate-100 text-sm">{selectedOrderDetails.customer.name}</p>
                  <p className="text-slate-300">Phone: {selectedOrderDetails.customer.phone}</p>
                  <p className="text-slate-300">Email: {selectedOrderDetails.customer.email}</p>
                  <p className="text-slate-400 pt-1">
                    {selectedOrderDetails.customer.address.street}, {selectedOrderDetails.customer.address.city}, {selectedOrderDetails.customer.address.state} - {selectedOrderDetails.customer.address.pincode}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Shipping & Payment</p>
                  <p className="text-slate-300">Courier: <strong className="text-slate-100">{selectedOrderDetails.shippingPartner}</strong></p>
                  <p className="text-slate-300">AWB Number: <strong className="font-mono text-indigo-400">{selectedOrderDetails.trackingNumber}</strong></p>
                  <p className="text-slate-300">Payment: <span className="text-emerald-400 font-semibold">{selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})</span></p>
                  <p className="text-slate-400 pt-1">Estimated Delivery: {selectedOrderDetails.estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
