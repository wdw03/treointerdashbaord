import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
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
  X
} from 'lucide-react';

export const StaticPagesCms = () => {
  const { cmsPages, updatePage, showToast } = useAdmin();

  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'contact' | 'faqs'

  // Local state initialized from context
  const [aboutData, setAboutData] = useState(cmsPages.about || {});
  const [contactData, setContactData] = useState(cmsPages.contact || {});
  const [faqs, setFaqs] = useState(cmsPages.faqs || []);

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showAddFaq, setShowAddFaq] = useState(false);

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
    showToast('FAQ question deleted', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Static &amp; Policy Pages CMS</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize content for About Us, Contact &amp; Warehouse details, and Customer FAQ accordions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${activeTab === 'about' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Info className="w-4 h-4" /> About Us Story
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Phone className="w-4 h-4" /> Contact &amp; Warehouse
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${activeTab === 'faqs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <HelpCircle className="w-4 h-4" /> FAQ Accordions ({faqs.length})
        </button>
      </div>

      {/* TAB 1: ABOUT US */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="admin-card p-6 space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">About Us Brand Story &amp; Mission</h3>
            <button type="submit" className="btn-primary py-1.5 px-3.5 text-xs font-bold">
              <Save className="w-3.5 h-3.5" /> Save About Page
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Headline</label>
            <input
              type="text"
              value={aboutData.headline || ''}
              onChange={(e) => setAboutData({ ...aboutData, headline: e.target.value })}
              className="admin-input w-full text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Brand Origin Story</label>
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

      {/* TAB 2: CONTACT & WAREHOUSE */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="admin-card p-6 space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Customer Support &amp; Warehouse Location</h3>
            <button type="submit" className="btn-primary py-1.5 px-3.5 text-xs font-bold">
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
                className="admin-input w-full text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={contactData.supportPhone || ''}
                onChange={(e) => setContactData({ ...contactData, supportPhone: e.target.value })}
                className="admin-input w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Registered Warehouse Address</label>
            <input
              type="text"
              value={contactData.warehouseAddress || ''}
              onChange={(e) => setContactData({ ...contactData, warehouseAddress: e.target.value })}
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
                className="admin-input w-full text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Response Guarantee Notice</label>
              <input
                type="text"
                value={contactData.faqNotice || ''}
                onChange={(e) => setContactData({ ...contactData, faqNotice: e.target.value })}
                className="admin-input w-full text-xs"
              />
            </div>
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
            {faqs.map((faq, index) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
