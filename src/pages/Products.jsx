import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { ProductImage } from '../components/ui/ProductImage.jsx';
import { ProductGalleryPreview } from '../components/ui/ProductGalleryPreview.jsx';
import { ImageLightbox } from '../components/ui/ImageLightbox.jsx';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { ProductsTableSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Tag,
  Layers,
  ArrowUpDown,
  X,
  Save,
  Image as ImageIcon,
  Camera,
  ZoomIn,
  Star
} from 'lucide-react';

const FILTER_BADGES = [
  'All',
  'Best Seller',
  'Festival Special',
  'Wedding Special',
  'Trending',
  'Handmade',
  'Sale',
  'In Stock',
  'Out of Stock'
];

export const Products = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    showToast
  } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [activeBadgeFilter, setActiveBadgeFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // modal state for Add/Edit
  const [activeEditorTab, setActiveEditorTab] = useState('basic'); // 'basic'|'media'|'pricing'|'variants'|'details'|'flags'
  const [newImageUrl, setNewImageUrl] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      // Badge/Flag Filter
      if (activeBadgeFilter === 'Best Seller' && !p.isBestSeller && p.badge !== 'Best Seller') return false;
      if (activeBadgeFilter === 'Festival Special' && !p.isFestivalSpecial && p.badge !== 'Festival Special') return false;
      if (activeBadgeFilter === 'Wedding Special' && !p.isWeddingSpecial && p.badge !== 'Wedding Special') return false;
      if (activeBadgeFilter === 'Trending' && !p.isTrending && p.badge !== 'Trending') return false;
      if (activeBadgeFilter === 'Handmade' && !p.isHandmade && p.badge !== 'Handmade') return false;
      if (activeBadgeFilter === 'Sale' && p.badge !== 'Sale') return false;
      if (activeBadgeFilter === 'In Stock' && !p.inStock) return false;
      if (activeBadgeFilter === 'Out of Stock' && p.inStock) return false;

      // Search (Name, Category, Subcategory, Material, Color)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesSubcat = p.subcategory?.toLowerCase().includes(q);
        const matchesMaterial = p.material?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesSubcat && !matchesMaterial) return false;
      }

      return true;
    });
  }, [products, activeBadgeFilter, selectedCategory, searchTerm]);

  // Open editor for brand new product
  const handleOpenNewProduct = () => {
    setEditingProduct({
      name: '',
      slug: '',
      category: 'Patches',
      subcategory: 'Lotus Flower Patches',
      brand: 'Trio Ecart',
      price: 299,
      originalPrice: 699,
      discount: 57,
      material: 'Fabric, Zari, Glass Beads',
      color: 'Gold and Pink',
      occasion: 'Sarees, Lehengas, Dupattas & Festive DIY',
      packageQuantity: 'Set of 2 Pieces',
      countryOfOrigin: 'India',
      badge: 'New',
      shortDescription: '',
      fullDescription: '',
      description: '',
      stock: 50,
      inStock: true,
      isNew: true,
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      isWeddingSpecial: true,
      isFestivalSpecial: false,
      isHandmade: true,
      images: ['/products/pearl-zardosi-patch-1.jpg'],
      colors: [{ name: 'Default Multi', hex: '#D4AF37', price: 299, originalPrice: 699, image: '/products/pearl-zardosi-patch-1.jpg' }],
      sizes: ['Standard Pack'],
      features: ['Handcrafted with traditional zari work', 'Easy sew-on application', 'Lustrous festive finish'],
      specifications: { 'Brand': 'Trio Ecart', 'Origin': 'India', 'Care': 'Dry Clean / Spot Clean' }
    });
    setActiveEditorTab('basic');
  };

  // Save product from editor
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) {
      showToast('Product name is required!', 'error');
      return;
    }

    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct(editingProduct);
    }
    setEditingProduct(null);
  };

  // Set primary photo in editor
  const handleSetPrimaryImage = (index) => {
    if (!editingProduct.images || index === 0) return;
    const reordered = [...editingProduct.images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    setEditingProduct({ ...editingProduct, images: reordered });
    showToast('Primary cover image updated');
  };

  // Remove photo from editor
  const handleRemoveImage = (index) => {
    if (editingProduct.images.length <= 1) {
      showToast('Product must have at least 1 image', 'error');
      return;
    }
    const filtered = editingProduct.images.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, images: filtered });
  };

  // Add new image URL in editor
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setEditingProduct({
      ...editingProduct,
      images: [...(editingProduct.images || []), newImageUrl.trim()]
    });
    setNewImageUrl('');
    showToast('Photo added to product gallery');
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Product Catalog & Gallery</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {products.length} Products • 164 Authentic High-Res Photos Loaded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse genuine Trio Ecart photos: multi-angle views, color variants, zoom inspection & catalog fields.
          </p>
        </div>

        <button onClick={handleOpenNewProduct} className="btn-primary py-2 px-4 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" /> Add New Craft Product
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs no-scrollbar shrink-0">
        {FILTER_BADGES.map((tab) => {
          const isActive = activeBadgeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveBadgeFilter(tab)}
              className={`
                px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-150
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="admin-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product name, material, color..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-select py-1.5 text-xs"
          >
            <option value="All">All Categories (9)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE WITH INTEGRATED MULTI-IMAGE PREVIEW */}
      <div className="admin-card overflow-hidden w-full max-w-full min-w-0 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[320px] max-h-[62vh] lg:max-h-none w-full max-w-full min-w-0 touch-pan-x overscroll-contain relative border-b border-slate-800/60">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-[#0F172A] text-slate-300">
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] w-44 border-b border-slate-800 shadow-sm">Product Photos & Angles</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Product Name & Category</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Material & Occasion</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm">Price</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-center border-b border-slate-800 shadow-sm">Stock</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Badge / Flags</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-center border-b border-slate-800 shadow-sm">Status</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPageLoading ? (
                <ProductsTableSkeleton rows={7} />
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                return (
                  <tr key={p.id} className="table-tr">
                    {/* Interactive Photo Gallery Strip */}
                    <td className="table-td">
                      <ProductGalleryPreview product={p} compact={true} />
                    </td>

                    {/* Name, Slug, Category */}
                    <td className="table-td max-w-xs">
                      <p className="font-bold text-slate-100 text-xs truncate leading-snug">{p.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="text-indigo-400 font-semibold">{p.category}</span>
                        <span>•</span>
                        <span className="truncate">{p.subcategory || 'Craft Decor'}</span>
                      </div>
                    </td>

                    {/* Material & Occasion */}
                    <td className="table-td max-w-[200px]">
                      <p className="text-xs text-slate-300 truncate">{p.material || 'Handcrafted Fabric & Zari'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{p.occasion || 'Festival, Wedding & Craft'}</p>
                    </td>

                    {/* Price & Discount */}
                    <td className="table-td text-right">
                      <span className="text-sm font-black text-white block">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-slate-500 line-through">₹{p.originalPrice}</span>
                      )}
                      {p.discount && (
                        <span className="text-[10px] text-emerald-400 block font-bold">{p.discount}% OFF</span>
                      )}
                    </td>

                    {/* Stock Units */}
                    <td className="table-td text-center">
                      <span className={`font-bold text-xs ${p.stock && p.stock <= 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {p.stock || 45} units
                      </span>
                    </td>

                    {/* Badge & Special Flags */}
                    <td className="table-td">
                      <div className="flex flex-wrap items-center gap-1">
                        {p.badge && (
                          <span className={`
                            badge text-[10px]
                            ${p.badge === 'Best Seller' ? 'badge-amber font-bold' : ''}
                            ${p.badge === 'Festival Special' ? 'badge-indigo font-bold' : ''}
                            ${p.badge === 'Trending' ? 'badge-purple font-bold' : ''}
                            ${p.badge === 'Handmade' ? 'badge-emerald font-bold' : ''}
                            ${p.badge === 'Sale' ? 'badge-rose font-bold' : ''}
                            ${p.badge === 'New' ? 'badge-cyan font-bold' : ''}
                          `}>
                            {p.badge}
                          </span>
                        )}
                        {p.isWeddingSpecial && (
                          <span className="badge-purple text-[9px] px-1.5 py-0.2">Wedding</span>
                        )}
                        {p.isHandmade && (
                          <span className="badge-emerald text-[9px] px-1.5 py-0.2">Handmade</span>
                        )}
                      </div>
                    </td>

                    {/* Publish Status toggle */}
                    <td className="table-td text-center">
                      <button
                        onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${p.inStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                      >
                        {p.inStock ? 'Live' : 'Draft'}
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...p });
                            setActiveEditorTab('basic');
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center shrink-0 bg-slate-900/90">
          <span>{isPageLoading ? <Skeleton className="h-3.5 w-36 inline-block align-middle" /> : `Showing ${filteredProducts.length} of ${products.length} products`}</span>
          <span className="text-[11px] text-slate-500">All 164 Product Photos Loaded Locally</span>
        </div>
      </div>

      {/* COMPREHENSIVE PRODUCT EDITOR MODAL WITH INTERACTIVE MEDIA GALLERY */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div>
                <h3 className="font-bold text-lg text-white">
                  {editingProduct.id ? `Edit: ${editingProduct.name.substring(0, 38)}...` : 'Add New Craft Product'}
                </h3>
                <p className="text-xs text-slate-400">Preserves full schema & metadata from Trio Ecart products.js</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setEditingProduct(null)} className="btn-secondary py-1.5 px-3 text-xs">
                  Cancel
                </button>
                <button onClick={handleSaveProduct} className="btn-primary py-1.5 px-4 text-xs font-bold">
                  <Save className="w-3.5 h-3.5" /> Save Product
                </button>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-2 px-6 py-2 bg-slate-950/40 border-b border-slate-800 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: '1. Basic Info' },
                { id: 'media', label: `2. Photos & Gallery (${editingProduct.images?.length || 0})` },
                { id: 'pricing', label: '3. Pricing & Stock' },
                { id: 'variants', label: '4. Colors & Sizes' },
                { id: 'details', label: '5. Description & Specs' },
                { id: 'flags', label: '6. Badges & Special Flags' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveEditorTab(t.id)}
                  className={`
                    px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors
                    ${activeEditorTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Forms */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* TAB 1: BASIC INFO */}
              {activeEditorTab === 'basic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Product Title / Name *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="e.g. Pearl zardosi Moti Beaded Round Applique Patches, Set of 20"
                      className="admin-input w-full text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Category *</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="admin-select w-full text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={editingProduct.subcategory || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        placeholder="e.g. Lotus Flower Patches"
                        className="admin-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Brand</label>
                      <input
                        type="text"
                        value={editingProduct.brand || 'Trio Ecart'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="admin-input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Material Composition</label>
                      <input
                        type="text"
                        value={editingProduct.material || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                        placeholder="e.g. Fabric, Faux Pearl Beads, Metallic Gold Thread, Zari"
                        className="admin-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Recommended Occasion</label>
                      <input
                        type="text"
                        value={editingProduct.occasion || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}
                        placeholder="e.g. Sarees, Lehengas, Dupattas, Bags & DIY Crafts"
                        className="admin-input w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE MEDIA GALLERY */}
              {activeEditorTab === 'media' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">Product High-Resolution Photo Gallery</h4>
                      <p className="text-[11px] text-slate-400">
                        First image is used as the primary catalog cover thumbnail. Click "Make Cover" to reorder.
                      </p>
                    </div>
                  </div>

                  {/* Visual Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {editingProduct.images?.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`
                          relative group rounded-2xl overflow-hidden border-2 bg-slate-950 p-2 flex flex-col items-center justify-between shadow-lg transition-all
                          ${idx === 0 ? 'border-indigo-500 shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}
                        `}
                      >
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow z-10">
                            Cover Image
                          </span>
                        )}

                        {/* Image Preview */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-900 flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="w-full flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400 truncate max-w-[90px] font-mono text-[9px]">
                            {imgUrl.replace('/products/', '')}
                          </span>
                          <div className="flex items-center gap-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-indigo-400 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-indigo-600/30"
                                title="Set as Main Cover"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-rose-400 hover:text-white p-1 rounded hover:bg-rose-500/20"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Input */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <label className="font-semibold text-slate-300 block text-xs">Add Another Photo URL / Path:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="e.g. /products/new-angle.jpg"
                        className="admin-input flex-1 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="btn-secondary py-1.5 px-4 text-xs font-bold shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & STOCK */}
              {activeEditorTab === 'pricing' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="admin-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Original MRP (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                        className="admin-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Discount %</label>
                      <input
                        type="number"
                        value={editingProduct.discount || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, discount: Number(e.target.value) })}
                        className="admin-input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Stock Quantity (Units)</label>
                      <input
                        type="number"
                        value={editingProduct.stock || 50}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="admin-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Package Quantity String</label>
                      <input
                        type="text"
                        value={editingProduct.packageQuantity || 'Set of 2 Pieces'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, packageQuantity: e.target.value })}
                        placeholder="e.g. 20 Patches (₹9.95 / count)"
                        className="admin-input w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VARIANTS (COLORS & SIZES) */}
              {activeEditorTab === 'variants' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-slate-200">Color Variants Configuration</h4>
                  <div className="space-y-3">
                    {editingProduct.colors?.map((c, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Color Name</label>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => {
                              const newColors = [...editingProduct.colors];
                              newColors[i].name = e.target.value;
                              setEditingProduct({ ...editingProduct, colors: newColors });
                            }}
                            className="admin-input w-full text-xs py-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Hex Code</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={c.hex || '#D4AF37'}
                              onChange={(e) => {
                                const newColors = [...editingProduct.colors];
                                newColors[i].hex = e.target.value;
                                setEditingProduct({ ...editingProduct, colors: newColors });
                              }}
                              className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={c.hex || '#D4AF37'}
                              onChange={(e) => {
                                const newColors = [...editingProduct.colors];
                                newColors[i].hex = e.target.value;
                                setEditingProduct({ ...editingProduct, colors: newColors });
                              }}
                              className="admin-input w-full text-xs font-mono py-1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Variant Price (₹)</label>
                          <input
                            type="number"
                            value={c.price || editingProduct.price}
                            onChange={(e) => {
                              const newColors = [...editingProduct.colors];
                              newColors[i].price = Number(e.target.value);
                              setEditingProduct({ ...editingProduct, colors: newColors });
                            }}
                            className="admin-input w-full text-xs py-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Variant Photo URL</label>
                          <input
                            type="text"
                            value={c.image || ''}
                            onChange={(e) => {
                              const newColors = [...editingProduct.colors];
                              newColors[i].image = e.target.value;
                              setEditingProduct({ ...editingProduct, colors: newColors });
                            }}
                            placeholder="/products/color.jpg"
                            className="admin-input w-full text-xs font-mono py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="font-semibold text-slate-300 block mb-1">Available Sizes (Comma separated)</label>
                    <input
                      type="text"
                      value={editingProduct.sizes?.join(', ') || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder="e.g. Set of 20 (Medium), Set of 40 (Medium)"
                      className="admin-input w-full text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: DESCRIPTIONS & SPECS */}
              {activeEditorTab === 'details' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={editingProduct.shortDescription || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                      className="admin-input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Full Authentic Description</label>
                    <textarea
                      rows={4}
                      value={editingProduct.fullDescription || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                      className="admin-input w-full text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: BADGES & SPECIAL FLAGS */}
              {activeEditorTab === 'flags' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Catalog Badge</label>
                    <select
                      value={editingProduct.badge || 'New'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      className="admin-select w-full text-xs"
                    >
                      <option value="Best Seller">Best Seller</option>
                      <option value="Festival Special">Festival Special</option>
                      <option value="Trending">Trending</option>
                      <option value="Handmade">Handmade</option>
                      <option value="Sale">Sale</option>
                      <option value="New">New</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isHandmade ?? true}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isHandmade: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Handmade</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isWeddingSpecial ?? false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isWeddingSpecial: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Wedding Special</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFestivalSpecial ?? false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFestivalSpecial: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Festival Special</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isBestSeller ?? false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isTrending ?? false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isTrending: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Trending</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFeatured ?? false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-200">Featured</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock ?? true}
                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 w-4 h-4"
                      />
                      <span className="font-semibold text-emerald-400">Published / Active</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
