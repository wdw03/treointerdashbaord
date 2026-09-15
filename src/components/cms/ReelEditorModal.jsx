import React, { useState, useRef, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { adminApi } from '../../services/api.js';
import {
  Film,
  Upload,
  Video,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  MessageCircle,
  Music2,
  User,
  AtSign,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export const ReelEditorModal = ({
  reel,
  isOpen,
  onSave,
  onClose,
  showToast
}) => {
  if (!isOpen) return null;

  const { products } = useAdmin();

  // Local state for editor
  const [formData, setFormData] = useState({
    id: reel?.id || null,
    influencer_name: reel?.influencer_name || reel?.name || 'Trio Influencer',
    influencer_username: reel?.influencer_username || reel?.handle || '@trioenterprises',
    influencer_avatar: reel?.influencer_avatar || reel?.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    video_url: reel?.video_url || reel?.video || '',
    thumbnail_url: reel?.thumbnail_url || reel?.img || '',
    caption: reel?.caption || '',
    song_title: reel?.song_title || reel?.song || 'Original Audio · Trio Trends',
    views_count: reel?.views_count || reel?.views || '150K',
    likes_count: reel?.likes_count || reel?.likes || '18.5K',
    comments_count: reel?.comments_count || reel?.comments || '320',
    product_id: reel?.product_id || reel?.productId || '',
    product_name: reel?.product_name || reel?.product || '',
    product_slug: reel?.product_slug || reel?.slug || '',
    product_price: reel?.product_price !== undefined ? reel.product_price : (reel?.rawPrice || ''),
    product_old_price: reel?.product_old_price !== undefined ? reel.product_old_price : (reel?.rawOldPrice || ''),
    product_image: reel?.product_image || '',
    product_discount: reel?.product_discount || reel?.discount || '',
    display_order: reel?.display_order !== undefined ? reel.display_order : 0,
    is_active: reel?.is_active !== undefined ? Boolean(reel.is_active) : true,
  });

  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // File input refs
  const videoInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Filtered available products from store
  const availableProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    if (!productSearch.trim()) return products.slice(0, 15);
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    ).slice(0, 20);
  }, [products, productSearch]);

  // Handle Video file upload directly to Supabase Storage
  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 50MB)
    if (file.size > 52428800) {
      if (showToast) showToast('Video file size exceeds 50MB limit. Please compress your video.', 'error');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(15);
    try {
      setUploadProgress(45);
      const res = await adminApi.uploadReelVideo(file);
      setUploadProgress(90);

      if (res && res.url) {
        setFormData((prev) => ({
          ...prev,
          video_url: res.url,
          thumbnail_url: prev.thumbnail_url || prev.influencer_avatar
        }));
        setUploadProgress(100);
        if (showToast) showToast('Reel video uploaded to Supabase CDN successfully!', 'success');
      } else {
        throw new Error(res?.error || 'No URL returned from server');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      if (showToast) showToast(`Failed to upload video: ${err.message}`, 'error');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Handle Influencer Avatar upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await adminApi.uploadImage(file);
      if (res && res.url) {
        setFormData((prev) => ({
          ...prev,
          influencer_avatar: res.url
        }));
        if (showToast) showToast('Influencer avatar uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      if (showToast) showToast(`Failed to upload avatar: ${err.message}`, 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Select an existing product from the store
  const handleSelectProduct = (prod) => {
    const price = Number(prod.price) || 0;
    const oldPrice = Number(prod.original_price || prod.compare_price || (price * 1.5)) || 0;
    const discount = oldPrice > price
      ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`
      : '';
    const img = Array.isArray(prod.images) ? (prod.images[0] || '') : (prod.image || '');

    setFormData((prev) => ({
      ...prev,
      product_id: String(prod.id),
      product_name: prod.name,
      product_slug: prod.slug,
      product_price: price,
      product_old_price: oldPrice,
      product_image: img,
      product_discount: discount
    }));
    setProductDropdownOpen(false);
    setProductSearch('');
    if (showToast) showToast(`Linked product: "${prod.name.slice(0, 30)}..."`, 'info');
  };

  // Remove linked product
  const handleClearProduct = () => {
    setFormData((prev) => ({
      ...prev,
      product_id: '',
      product_name: '',
      product_slug: '',
      product_price: '',
      product_old_price: '',
      product_image: '',
      product_discount: ''
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.video_url.trim()) {
      if (showToast) showToast('Please upload a video file or enter a video URL!', 'error');
      return;
    }

    if (!formData.influencer_name.trim()) {
      if (showToast) showToast('Influencer name is required!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        display_order: Number(formData.display_order) || 0,
        product_price: Number(formData.product_price) || 0,
        product_old_price: Number(formData.product_old_price) || 0,
      });
      onClose();
    } catch (err) {
      console.error('Error saving reel:', err);
      if (showToast) showToast(`Error saving reel: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ee2a7b] to-[#d4af37] flex items-center justify-center text-white shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {formData.id ? 'Edit Instagram Reel' : 'Upload New Reel Video'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Supabase CDN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct Supabase video upload with influencer profile & linked add-to-cart product
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Video Player & Direct Upload (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#ee2a7b]" />
                  Reel Video (9:16 Vertical) *
                </label>
                {formData.video_url && (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              {/* Video Player Preview / Upload Dropzone */}
              <div className="relative aspect-[9/16] w-full max-w-[260px] mx-auto rounded-2xl bg-black border-2 border-dashed border-slate-700 hover:border-[#ee2a7b]/60 transition-all overflow-hidden flex flex-col items-center justify-center group shadow-xl">
                {formData.video_url ? (
                  <div className="relative w-full h-full bg-black">
                    <video
                      key={formData.video_url}
                      src={formData.video_url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                      poster={formData.thumbnail_url || formData.influencer_avatar}
                    />
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-[#ee2a7b] text-white text-xs backdrop-blur-md border border-white/20 transition-all shadow-md"
                        title="Replace Video"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="p-6 text-center cursor-pointer flex flex-col items-center justify-center h-full w-full"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ee2a7b]/20 to-[#d4af37]/20 border border-[#ee2a7b]/30 flex items-center justify-center text-[#ee2a7b] mb-3 group-hover:scale-110 transition-transform">
                      {uploadingVideo ? (
                        <Loader2 className="w-7 h-7 animate-spin text-[#ee2a7b]" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white mb-1">
                      {uploadingVideo ? 'Uploading to Supabase...' : 'Click to Upload Video'}
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-[170px]">
                      MP4, WebM or QuickTime vertical reels (Max 50MB)
                    </span>
                    {uploadingVideo && (
                      <div className="w-full mt-3 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#ee2a7b] to-[#d4af37] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hidden file input for video */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {/* Action buttons for video */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ee2a7b]/20 to-[#d4af37]/20 hover:from-[#ee2a7b]/30 hover:to-[#d4af37]/30 border border-[#ee2a7b]/40 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#ee2a7b]" />
                      <span>Uploading to Supabase Storage CDN...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#ee2a7b]" />
                      <span>{formData.video_url ? 'Replace Video File' : 'Upload Video File to Supabase'}</span>
                    </>
                  )}
                </button>

                {/* External Video URL input */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Or direct Video URL (Supabase CDN / MP4)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://...supabase.co/storage/v1/object/public/reels/video.mp4"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
              </div>

              {/* Status & Display Order */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Reel Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      formData.is_active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {formData.is_active ? '● Live on Store' : '○ Inactive / Draft'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-400">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="admin-input w-20 text-xs font-mono text-center"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Influencer Details, Metrics, and Linked Product (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* SECTION 1: Influencer Info */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Influencer Profile</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Influencer Full Name *</label>
                    <input
                      type="text"
                      value={formData.influencer_name}
                      onChange={(e) => setFormData({ ...formData, influencer_name: e.target.value })}
                      placeholder="e.g. Abida Fatima"
                      className="admin-input w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Username / Handle *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-xs">@</span>
                      <input
                        type="text"
                        value={formData.influencer_username.replace(/^@/, '')}
                        onChange={(e) => setFormData({ ...formData, influencer_username: '@' + e.target.value.replace(/^@/, '') })}
                        placeholder="abida.fatima_"
                        className="admin-input w-full text-xs pl-7"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Picture / Avatar */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Influencer Profile Photo (Avatar)</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                      {formData.influencer_avatar ? (
                        <img
                          src={formData.influencer_avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={formData.influencer_avatar}
                        onChange={(e) => setFormData({ ...formData, influencer_avatar: e.target.value })}
                        placeholder="Avatar image URL"
                        className="admin-input flex-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0"
                      >
                        {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* SECTION 2: Caption & Social Metrics */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Heart className="w-4 h-4 text-[#ee2a7b]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reel Content & Social Stats</h3>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Caption / Description</label>
                  <textarea
                    rows={2}
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="e.g. Added these handcrafted pearl zardosi patches to my festive lehenga border ✨"
                    className="admin-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <Music2 className="w-3 h-3 text-[#ee2a7b]" />
                    Background Music / Audio Title
                  </label>
                  <input
                    type="text"
                    value={formData.song_title}
                    onChange={(e) => setFormData({ ...formData, song_title: e.target.value })}
                    placeholder="e.g. Kesariya · Slowed & Reverb"
                    className="admin-input w-full text-xs"
                  />
                </div>

                {/* Social Counters (Directly Editable) */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-400" />
                      Views Count
                    </label>
                    <input
                      type="text"
                      value={formData.views_count}
                      onChange={(e) => setFormData({ ...formData, views_count: e.target.value })}
                      placeholder="e.g. 412K"
                      className="admin-input w-full text-xs font-mono font-bold text-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#ee2a7b]" />
                      Likes Count
                    </label>
                    <input
                      type="text"
                      value={formData.likes_count}
                      onChange={(e) => setFormData({ ...formData, likes_count: e.target.value })}
                      placeholder="e.g. 24.3K"
                      className="admin-input w-full text-xs font-mono font-bold text-[#ee2a7b]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                      Comments
                    </label>
                    <input
                      type="text"
                      value={formData.comments_count}
                      onChange={(e) => setFormData({ ...formData, comments_count: e.target.value })}
                      placeholder="e.g. 1,204"
                      className="admin-input w-full text-xs font-mono font-bold text-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Tagged Store Product (Add to Cart Integration) */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Tagged Product (Add to Cart Trigger)
                    </h3>
                  </div>
                  {formData.product_id && (
                    <button
                      type="button"
                      onClick={handleClearProduct}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Tag
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  Select an existing store product. When customers click <b>"Add to Cart"</b> on this reel, this exact product will be added to their cart.
                </p>

                {/* Product Search & Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductDropdownOpen(true);
                      }}
                      onFocus={() => setProductDropdownOpen(true)}
                      placeholder="Search store products by name, id or slug to link..."
                      className="admin-input w-full text-xs pl-8 pr-8"
                    />
                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => setProductSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  {productDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-1">
                      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-slate-400 border-b border-slate-800">
                        <span>Select a product to link:</span>
                        <button
                          type="button"
                          onClick={() => setProductDropdownOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          Close
                        </button>
                      </div>
                      {availableProducts.length > 0 ? (
                        availableProducts.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <img
                              src={Array.isArray(prod.images) ? prod.images[0] : (prod.image || '/placeholder.png')}
                              alt={prod.name}
                              className="w-9 h-9 rounded-md object-cover bg-slate-950 shrink-0 border border-slate-700"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate">{prod.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="text-amber-400 font-bold">₹{prod.price}</span>
                                {prod.original_price && (
                                  <span className="line-through text-slate-500">₹{prod.original_price}</span>
                                )}
                                <span>ID: {prod.id}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          No matching products found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Product Card Preview */}
                {formData.product_id ? (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={formData.product_image || '/placeholder.png'}
                        alt={formData.product_name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          Linked Product
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {formData.product_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          <span className="text-amber-400 font-bold">₹{formData.product_price}</span>
                          {formData.product_old_price > 0 && (
                            <span className="line-through text-slate-500 text-[10px]">₹{formData.product_old_price}</span>
                          )}
                          {formData.product_discount && (
                            <span className="text-emerald-400 text-[10px] font-bold">{formData.product_discount}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Cart Ready
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                    No product linked yet. Search and choose an authentic store product above.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingVideo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ee2a7b] to-[#d4af37] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Reel...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{formData.id ? 'Update Reel' : 'Publish Reel to Store'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
