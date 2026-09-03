import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  X,
  Save,
  Tag,
  CheckCircle2,
  Eye
} from 'lucide-react';

const SUGGESTED_IMAGES = [
  { label: 'Shreenathji Mukharvind', url: '/products/shreenathji-statement-patch-1.jpg' },
  { label: 'Peacock Real Feathers', url: '/products/peacock-real-feathers-pair-1.jpg' },
  { label: 'Hammered Copper Bottle', url: '/products/hammered-copper-bottle-1.jpg' },
  { label: 'Brass Diya Pooja Thali', url: '/products/pooja-thali-brass-diya-1.jpg' },
  { label: 'Lotus Kamal Aasan', url: '/products/lotus-kamal-aasan-1.jpg' },
  { label: 'Pearl Zardosi Patches', url: '/products/pearl-zardosi-patch-1.jpg' }
];

export const SlideEditorModal = ({
  slide,
  isOpen,
  onSave,
  onClose
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('desktop'); // 'desktop' | 'mobile' | 'imagery'
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    ctaText: slide?.ctaText || 'Explore Collection',
    desktopCtaText: slide?.desktopCtaText || 'Explore Collection',
    ctaLink: slide?.ctaLink || '/shop',
    secondaryCtaText: slide?.secondaryCtaText || 'Learn More',
    secondaryCtaLink: slide?.secondaryCtaLink || '/blog',
    mobileTitle: slide?.mobileTitle || '',
    mobileSubtitle: slide?.mobileSubtitle || '',
    mobileCtaText: slide?.mobileCtaText || 'Shop Now',
    mobileImage: slide?.mobileImage || slide?.image || '/products/shreenathji-statement-patch-1.jpg',
    image: slide?.image || '/products/shreenathji-statement-patch-1.jpg',
    secondaryImage: slide?.secondaryImage || '/products/peacock-real-feathers-pair-1.jpg',
    badge: slide?.badge || 'Festive & Wedding Special',
    tag: slide?.tag || 'Authentic Craft',
    isActive: slide?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Slide title is required!');
      return;
    }
    onSave({
      ...(slide || {}),
      ...formData,
      mobileTitle: formData.mobileTitle.trim() || formData.title,
      mobileSubtitle: formData.mobileSubtitle.trim() || formData.subtitle,
      mobileImage: formData.mobileImage.trim() || formData.image
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="font-bold text-white text-base">
              {slide ? `Edit Slide: ${slide.title.substring(0, 32)}...` : 'Add New Hero Banner Slide'}
            </h3>
            <p className="text-xs text-slate-400">Configure separate desktop and mobile responsive layouts</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary py-1.5 px-4 text-xs font-bold"
            >
              <Save className="w-3.5 h-3.5" /> Save Slide
            </button>
          </div>
        </div>

        {/* Device Switcher Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`
              px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
              ${activeTab === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
            `}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop Version
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`
              px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
              ${activeTab === 'mobile' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
            `}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile Version
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('imagery')}
            className={`
              px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
              ${activeTab === 'imagery' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
            `}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Images &amp; Badges
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: DESKTOP CONTENT */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Desktop Main Headline *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Handcrafted Zardosi & Sacred Deity Patches"
                  className="admin-input w-full text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Desktop Subtitle / Story Description</label>
                <textarea
                  rows={3}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Detailed artisanal craft story shown on desktop screens..."
                  className="admin-input w-full text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Primary CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.desktopCtaText}
                    onChange={(e) => setFormData({ ...formData, desktopCtaText: e.target.value })}
                    placeholder="e.g. Explore Embroidery Patches"
                    className="admin-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Primary CTA Button Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g. /category/patches"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Secondary Button Text (Desktop Only)</label>
                  <input
                    type="text"
                    value={formData.secondaryCtaText}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                    placeholder="e.g. View Best Sellers"
                    className="admin-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Secondary Button Link</label>
                  <input
                    type="text"
                    value={formData.secondaryCtaLink}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                    placeholder="e.g. /shop"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE OPTIMIZED CONTENT */}
          {activeTab === 'mobile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                💡 <strong>Mobile Optimization:</strong> Keep headlines short and punchy to prevent the text from pushing the CTA button below the phone's first fold.
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Concise Headline</label>
                <input
                  type="text"
                  value={formData.mobileTitle}
                  onChange={(e) => setFormData({ ...formData, mobileTitle: e.target.value })}
                  placeholder="e.g. Handcrafted Zardosi & Deity Patches"
                  className="admin-input w-full text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Defaults to Desktop Headline if left empty.</span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Short Description</label>
                <textarea
                  rows={2}
                  value={formData.mobileSubtitle}
                  onChange={(e) => setFormData({ ...formData, mobileSubtitle: e.target.value })}
                  placeholder="Shorter 1-sentence description for phone screens..."
                  className="admin-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Mobile Button Label</label>
                  <input
                    type="text"
                    value={formData.mobileCtaText}
                    onChange={(e) => setFormData({ ...formData, mobileCtaText: e.target.value })}
                    placeholder="e.g. Explore Patches"
                    className="admin-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Mobile Optimized Image URL</label>
                  <input
                    type="text"
                    value={formData.mobileImage}
                    onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                    placeholder="/products/shreenathji-statement-patch-1.jpg"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGERY & BADGES */}
          {activeTab === 'imagery' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Desktop Primary Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/products/shreenathji-statement-patch-1.jpg"
                  className="admin-input w-full text-xs font-mono"
                  required
                />

                {/* Quick Suggestion Chips from Authentic Photos */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                    Quick Pick from Catalog Photos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_IMAGES.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: item.url })}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${formData.image === item.url ? 'bg-indigo-600 text-white border-indigo-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Secondary Corner Image (Desktop Visual Card)</label>
                  <input
                    type="text"
                    value={formData.secondaryImage}
                    onChange={(e) => setFormData({ ...formData, secondaryImage: e.target.value })}
                    placeholder="/products/peacock-real-feathers-pair-1.jpg"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Top Pill Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Festive & Wedding 2026"
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Corner Ribbon Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Authentic Imperial Zari"
                    className="admin-input w-full text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                    />
                    <span className="font-semibold text-emerald-400 text-xs">Slide is Live on Website</span>
                  </label>
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">{formData.badge}</span>
                  <h5 className="font-bold text-white text-xs truncate">{formData.title || 'Slide Title'}</h5>
                  <p className="text-[11px] text-slate-400 truncate">{formData.subtitle || 'Slide description preview'}</p>
                  <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">{formData.ctaLink}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
