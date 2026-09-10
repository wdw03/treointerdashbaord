import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { usePageLoading } from '../../hooks/usePageLoading.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { adminApi } from '../../services/api.js';
import {
  FileText,
  HelpCircle,
  Phone,
  Info,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  X,
  Mail,
  MessageSquare,
  Clock,
  Search,
  Eye,
  RefreshCw,
  Check,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const StaticPagesCms = () => {
  const { cmsPages, updatePage, showToast } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [activeTab, setActiveTab] = useState('contact'); // default to contact to see inquiries

  // Local state initialized from context
  const [aboutData, setAboutData] = useState(cmsPages.about || {});
  const [contactData, setContactData] = useState(cmsPages.contact || {});
  const [faqs, setFaqs] = useState(cmsPages.faqs || []);

  // Customer Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | unread | read | replied
  const [viewingMessage, setViewingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showAddFaq, setShowAddFaq] = useState(false);

  // Fetch inquiries
  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await adminApi.getContactMessages();
      if (res && Array.isArray(res.messages)) {
        setInquiries(res.messages);
      }
    } catch (err) {
      console.warn('Failed to load contact messages:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Save About Us
  const handleSaveAbout = (e) => {
    e.preventDefault();
    updatePage('about', aboutData);
  };

  // Save Contact Details
  const handleSaveContact = (e) => {
    e.preventDefault();
    updatePage('contact', contactData);
  };

  // Add FAQ
  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const updated = [
      ...faqs,
      {
        id: `FAQ-${Date.now()}`,
        question: newQuestion.trim(),
        answer: newAnswer.trim()
      }
    ];
    setFaqs(updated);
    updatePage('faqs', updated);
    setNewQuestion('');
    setNewAnswer('');
    setShowAddFaq(false);
  };

  // Delete FAQ
  const handleDeleteFaq = (id) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    updatePage('faqs', updated);
  };

  // Update Inquiry Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateContactMessage(id, { status: newStatus });
      setInquiries((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Inquiry marked as ${newStatus}!`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      await adminApi.deleteContactMessage(id);
      setInquiries((prev) => prev.filter((m) => m.id !== id));
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage(null);
      }
      showToast('Inquiry deleted');
    } catch (err) {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  // Save Admin Reply
  const handleSaveReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await adminApi.updateContactMessage(id, { admin_reply: replyText.trim(), status: 'replied' });
      setInquiries((prev) =>
        prev.map((m) => (m.id === id ? { ...m, admin_reply: replyText.trim(), status: 'replied' } : m))
      );
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage((prev) => ({ ...prev, admin_reply: replyText.trim(), status: 'replied' }));
      }
      setReplyText('');
      showToast('Reply logged and inquiry marked as Replied!');
    } catch (err) {
      showToast('Failed to save reply', 'error');
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const unreadCount = inquiries.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Static Pages &amp; Contact Inquiries
          </h1>
          <p className="text-xs text-slate-400">
            Manage contact information, customer inquiries inbox, About Us story, and FAQs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'contact'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact Info &amp; Inquiries</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {unreadCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'about'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About Us Page</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs Manager ({faqs.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTACT INFO & CUSTOMER INQUIRIES */}
      {activeTab === 'contact' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. CUSTOMER INQUIRIES INBOX */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    Customer Inquiries Inbox
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {inquiries.length} Total
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live messages submitted by customers via the storefront Contact Us form
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchInquiries}
                  disabled={inquiriesLoading}
                  className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1.5"
                  title="Refresh Inquiries"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${inquiriesLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Inquiries' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'read', label: 'Reviewed' },
                  { id: 'replied', label: 'Replied' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      statusFilter === st.id
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-input pl-8 pr-3 py-1.5 w-full text-xs"
                />
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Subject / Topic</th>
                    <th className="p-3">Message Preview</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        {inquiriesLoading
                          ? 'Loading customer inquiries...'
                          : 'No inquiries found matching your filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => (
                      <tr
                        key={inq.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          inq.status === 'unread' ? 'bg-indigo-500/5 font-semibold text-white' : ''
                        }`}
                      >
                        <td className="p-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {new Date(inq.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-slate-100">{inq.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <a href={`mailto:${inq.email}`} className="hover:underline text-indigo-400">
                              {inq.email}
                            </a>
                          </div>
                          {inq.phone && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <a
                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-emerald-400"
                              >
                                {inq.phone}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="p-3 max-w-[160px] truncate text-slate-200">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] border border-slate-700">
                            {inq.subject || 'General'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[240px] truncate text-slate-400">
                          {inq.message}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inq.status === 'unread'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : inq.status === 'replied'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingMessage(inq);
                                if (inq.status === 'unread') {
                                  handleUpdateStatus(inq.id, 'read');
                                }
                              }}
                              className="p-1.5 text-indigo-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Full Message"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {inq.status === 'unread' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(inq.id, 'read')}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Mark as Read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(inq.id, 'unread')}
                                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Mark as Unread"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CONTACT DETAILS & WAREHOUSE CONFIGURATION */}
          <form onSubmit={handleSaveContact} className="admin-card p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">Customer Support &amp; Warehouse Settings</h3>
                <p className="text-[11px] text-slate-400">
                  Contact numbers, official email, and warehouse address shown on the storefront Contact Us page
                </p>
              </div>
              <button type="submit" className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Contact Details
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={contactData.supportEmail || ''}
                  onChange={(e) => setContactData({ ...contactData, supportEmail: e.target.value })}
                  placeholder="care@trioenterprises.com"
                  className="admin-input w-full text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Support Phone / WhatsApp</label>
                <input
                  type="text"
                  value={contactData.supportPhone || ''}
                  onChange={(e) => setContactData({ ...contactData, supportPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="admin-input w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Registered Warehouse &amp; Workshop Address</label>
              <input
                type="text"
                value={contactData.warehouseAddress || ''}
                onChange={(e) => setContactData({ ...contactData, warehouseAddress: e.target.value })}
                placeholder="Johari Bazaar Craft Quarter, Jaipur 302003, Rajasthan"
                className="admin-input w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Business Hours</label>
                <input
                  type="text"
                  value={contactData.businessHours || ''}
                  onChange={(e) => setContactData({ ...contactData, businessHours: e.target.value })}
                  placeholder="Mon - Sat: 10:00 AM - 7:00 PM IST"
                  className="admin-input w-full text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Response Guarantee Notice</label>
                <input
                  type="text"
                  value={contactData.faqNotice || ''}
                  onChange={(e) => setContactData({ ...contactData, faqNotice: e.target.value })}
                  placeholder="Replies guaranteed within 2 to 4 hours"
                  className="admin-input w-full text-xs"
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* VIEW INQUIRY MODAL */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Customer Inquiry Details</h3>
                  <p className="text-[11px] text-slate-400">
                    Received on {new Date(viewingMessage.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Customer Name</span>
                  <span className="font-bold text-white">{viewingMessage.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Email Address</span>
                  <a
                    href={`mailto:${viewingMessage.email}?subject=Reply: ${encodeURIComponent(viewingMessage.subject || 'Inquiry')}`}
                    className="text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {viewingMessage.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Phone / WhatsApp</span>
                  {viewingMessage.phone ? (
                    <a
                      href={`https://wa.me/${viewingMessage.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      {viewingMessage.phone}
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </div>
              </div>

              {/* Inquiry Topic */}
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Inquiry Topic</span>
                <div className="px-3 py-2 rounded-lg bg-slate-800 text-white font-bold inline-block">
                  {viewingMessage.subject || 'General Inquiry'}
                </div>
              </div>

              {/* Full Message */}
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Customer Message</span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {viewingMessage.message}
                </div>
              </div>

              {/* Existing Reply */}
              {viewingMessage.admin_reply && (
                <div>
                  <span className="text-emerald-400 block text-[10px] uppercase font-mono mb-1">Logged Admin Reply</span>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs leading-relaxed">
                    {viewingMessage.admin_reply}
                  </div>
                </div>
              )}

              {/* Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-bold text-slate-300 block">Log Internal Reply or Notes:</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply note or response sent to customer..."
                  className="admin-input w-full text-xs"
                />
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(viewingMessage.id, 'unread')}
                      className="btn-secondary py-1 px-2.5 text-xs text-amber-400"
                    >
                      Mark Unread
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(viewingMessage.id, 'read')}
                      className="btn-secondary py-1 px-2.5 text-xs text-sky-400"
                    >
                      Mark Reviewed
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveReply(viewingMessage.id)}
                    className="btn-primary py-1.5 px-4 text-xs font-bold"
                  >
                    Save Reply Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT US */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="admin-card p-6 space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">About Us Brand Story</h3>
            <button type="submit" className="btn-primary py-1.5 px-3.5 text-xs font-bold">
              <Save className="w-3.5 h-3.5" /> Save About Us
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Story Heading</label>
            <input
              type="text"
              value={aboutData.heading || ''}
              onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
              className="admin-input w-full text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Our Heritage &amp; Artisanal Story</label>
            <textarea
              rows={4}
              value={aboutData.story || ''}
              onChange={(e) => setAboutData({ ...aboutData, story: e.target.value })}
              className="admin-input w-full text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Mission Statement</label>
            <textarea
              rows={3}
              value={aboutData.mission || ''}
              onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
              className="admin-input w-full text-xs leading-relaxed"
            />
          </div>
        </form>
      )}

      {/* TAB 3: FAQS ACCORDION MANAGER */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Frequently Asked Questions ({faqs.length})</h3>
            <button
              type="button"
              onClick={() => setShowAddFaq(!showAddFaq)}
              className="btn-primary py-1.5 px-3 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add New FAQ
            </button>
          </div>

          {/* Add FAQ Box */}
          {showAddFaq && (
            <form onSubmit={handleAddFaq} className="admin-card p-5 space-y-3 text-xs border-indigo-500/40">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-indigo-400">Add Question &amp; Answer</span>
                <button type="button" onClick={() => setShowAddFaq(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Question *</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How do I wash velvet pooja aasans?"
                  className="admin-input w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Answer *</label>
                <textarea
                  rows={3}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Detailed informative response for customers..."
                  className="admin-input w-full text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddFaq(false)} className="btn-secondary py-1 px-3 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1 px-3.5 text-xs font-bold">
                  Save FAQ
                </button>
              </div>
            </form>
          )}

          {/* FAQ List */}
          <div className="space-y-3">
            {isPageLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1">
                      <Skeleton className="h-3.5 w-6 rounded" />
                      <Skeleton className="h-3.5 w-64" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-5/6 opacity-70 ml-8" />
                  <Skeleton className="h-3 w-2/3 opacity-50 ml-8" />
                </div>
              ))
            ) : (
              faqs.map((faq, index) => (
                <div key={faq.id} className="admin-card p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-indigo-400 font-bold shrink-0">Q{index + 1}.</span>
                      <h4 className="font-bold text-slate-100 text-xs">{faq.question}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-slate-400 pl-6 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
