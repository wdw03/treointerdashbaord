import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { ProductImage } from '../components/ui/ProductImage.jsx';
import {
  Truck,
  Package,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

const SHIPPING_TABS = [
  'All',
  'Ready to Ship',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Failed Delivery',
  'RTO'
];

export const Shipping = () => {
  const { orders, setPrintDocument, updateOrderStatus, showToast } = useAdmin();

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('All');
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [timelineOrder, setTimelineOrder] = useState(null);

  // Map orders into shipment cards
  const shipments = useMemo(() => {
    return orders.map((o) => {
      // Determine shipping stage
      let shippingStage = 'Ready to Ship';
      if (o.status === 'Confirmed' || o.status === 'Processing') shippingStage = 'Ready to Ship';
      else if (o.status === 'Packed') shippingStage = 'Packed';
      else if (o.status === 'Shipped') shippingStage = 'Shipped';
      else if (o.status === 'Out for Delivery') shippingStage = 'Out for Delivery';
      else if (o.status === 'Delivered') shippingStage = 'Delivered';
      else if (o.status === 'Cancelled') shippingStage = 'Failed Delivery';
      else if (o.status === 'Returned' || o.status === 'Return Requested') shippingStage = 'RTO';

      return {
        ...o,
        shippingStage,
        shippingCost: o.shippingCharge || 49,
        attempts: o.status === 'Out for Delivery' ? 1 : (o.status === 'Delivered' ? 1 : 0),
        weight: '350g',
      };
    });
  }, [orders]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (activeTab !== 'All' && s.shippingStage !== activeTab) return false;
      if (selectedCourier !== 'All' && s.shippingPartner !== selectedCourier) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          s.id.toLowerCase().includes(q) ||
          s.customer.name.toLowerCase().includes(q) ||
          s.trackingNumber?.toLowerCase().includes(q) ||
          s.customer.address.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shipments, activeTab, selectedCourier, searchTerm]);

  const handleBulkPrintLabels = () => {
    const list = shipments.filter((s) => selectedShipments.includes(s.id));
    if (list.length === 0) return;
    setPrintDocument({ type: 'shipping_label', data: list });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedShipments(filteredShipments.map((s) => s.id));
    } else {
      setSelectedShipments([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedShipments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Shipping & Delivery Logistics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch, courier AWB tracking, delivery attempt logs and shipping label printing.
          </p>
        </div>

        {selectedShipments.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/70 border border-indigo-500/40 px-3.5 py-1.5 rounded-xl text-xs text-slate-200 animate-fadeIn">
            <span className="font-bold text-indigo-400">{selectedShipments.length} selected</span>
            <button onClick={handleBulkPrintLabels} className="btn-primary py-1 px-3 text-xs">
              <Printer className="w-3.5 h-3.5" /> Bulk Print Shipping Labels
            </button>
          </div>
        )}
      </div>

      {/* COURIER PARTNER HEALTH CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="admin-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">BlueDart Express</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xl font-black text-white mt-2">6 Shipments</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Avg Delivery: 2.1 Days</p>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Delhivery Surface</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xl font-black text-white mt-2">4 Shipments</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Avg Delivery: 3.4 Days</p>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Xpressbees</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xl font-black text-white mt-2">2 Shipments</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Avg Delivery: 2.8 Days</p>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">DTDC Standard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xl font-black text-white mt-2">1 Shipment</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Avg Delivery: 3.0 Days</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs no-scrollbar">
        {SHIPPING_TABS.map((tab) => {
          const count = tab === 'All'
            ? shipments.length
            : shipments.filter((s) => s.shippingStage === tab).length;

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

      {/* CONTROLS */}
      <div className="admin-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AWB, Customer, Destination City..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="admin-select py-1.5 text-xs"
          >
            <option value="All">All Logistics Partners</option>
            <option value="BlueDart">BlueDart</option>
            <option value="Delhivery">Delhivery</option>
            <option value="Xpressbees">Xpressbees</option>
            <option value="DTDC">DTDC</option>
          </select>
        </div>
      </div>

      {/* SHIPMENTS TABLE */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-th w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredShipments.length > 0 && selectedShipments.length === filteredShipments.length}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="table-th">AWB Tracking #</th>
                <th className="table-th">Order Ref</th>
                <th className="table-th">Destination City</th>
                <th className="table-th">Partner</th>
                <th className="table-th">Est Delivery</th>
                <th className="table-th text-center">Attempts</th>
                <th className="table-th">Shipping Stage</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((s) => {
                const isSelected = selectedShipments.includes(s.id);
                return (
                  <tr key={s.id} className={`table-tr ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                    <td className="table-td text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(s.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="table-td font-mono font-bold text-indigo-400">
                      {s.trackingNumber}
                    </td>
                    <td className="table-td">
                      <span className="font-semibold text-slate-200 block">{s.id}</span>
                      <span className="text-[11px] text-slate-400">{s.customer.name}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.customer.address.city}, {s.customer.address.state}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{s.customer.address.pincode}</span>
                    </td>
                    <td className="table-td">
                      <span className="font-medium text-xs text-slate-200">{s.shippingPartner}</span>
                      <span className="text-[10px] text-slate-500 block">Air Express</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{s.estimatedDelivery}</span>
                      </div>
                    </td>
                    <td className="table-td text-center font-bold text-slate-300">
                      {s.attempts} / 3
                    </td>
                    <td className="table-td">
                      <span className={`
                        badge
                        ${s.shippingStage === 'Ready to Ship' ? 'badge-amber' : ''}
                        ${s.shippingStage === 'Packed' ? 'badge-cyan' : ''}
                        ${s.shippingStage === 'Shipped' ? 'badge-purple' : ''}
                        ${s.shippingStage === 'Out for Delivery' ? 'badge-indigo' : ''}
                        ${s.shippingStage === 'Delivered' ? 'badge-emerald' : ''}
                        ${s.shippingStage === 'Failed Delivery' ? 'badge-rose' : ''}
                        ${s.shippingStage === 'RTO' ? 'badge-slate' : ''}
                      `}>
                        {s.shippingStage}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintDocument({ type: 'shipping_label', data: s })}
                          className="btn-secondary py-1 px-2.5 text-xs"
                          title="Print Shipping Label"
                        >
                          <Printer className="w-3.5 h-3.5" /> Label
                        </button>
                        <button
                          onClick={() => setTimelineOrder(s)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Tracking Timeline"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRACKING TIMELINE MODAL */}
      {timelineOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Shipment Tracking</h3>
                <p className="text-xs text-indigo-400 font-mono">{timelineOrder.trackingNumber} ({timelineOrder.shippingPartner})</p>
              </div>
              <button onClick={() => setTimelineOrder(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">✓</div>
                <div>
                  <p className="font-semibold text-slate-100">Package Picked Up by {timelineOrder.shippingPartner}</p>
                  <p className="text-[11px] text-slate-500">Surat Mother Hub, Gujarat • Sep 02, 04:30 PM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">✓</div>
                <div>
                  <p className="font-semibold text-slate-100">In Transit - Airport Air Hub</p>
                  <p className="text-[11px] text-slate-500">Ahmedabad Terminal • Sep 02, 11:45 PM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0">●</div>
                <div>
                  <p className="font-semibold text-slate-100">Arrived at Destination Facility</p>
                  <p className="text-[11px] text-indigo-400 font-medium">{timelineOrder.customer.address.city} Sorting Center • Sep 03, 08:15 AM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold shrink-0">○</div>
                <div>
                  <p className="font-semibold text-slate-400">Out for Delivery</p>
                  <p className="text-[11px] text-slate-500">Expected by courier agent today</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Recipient: {timelineOrder.customer.name}</span>
              <button
                onClick={() => {
                  setPrintDocument({ type: 'shipping_label', data: timelineOrder });
                  setTimelineOrder(null);
                }}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
