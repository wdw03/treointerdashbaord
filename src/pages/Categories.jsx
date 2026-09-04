import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { CategoriesGridSkeleton } from '../components/ui/Skeleton.jsx';
import { ProductImage } from '../components/ui/ProductImage.jsx';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  ChevronRight,
  Save,
  X
} from 'lucide-react';

export const Categories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, showToast } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [editingCategory, setEditingCategory] = useState(null);
  const [subcatInput, setSubcatInput] = useState('');

  // Calculate actual product count per category dynamically from catalog
  const categoriesWithCounts = categories.map((c) => {
    const count = products.filter((p) => p.category?.toLowerCase() === c.name.toLowerCase()).length;
    return {
      ...c,
      actualCount: count || c.productCount || 0
    };
  });

  const handleOpenNewCategory = () => {
    setEditingCategory({
      name: '',
      slug: '',
      image: '/products/pearl-zardosi-patch-1.jpg',
      banner: '/products/red-rose-1.jpg',
      description: '',
      subcategories: []
    });
    setSubcatInput('');
  };

  const handleAddSubcat = () => {
    if (!subcatInput.trim()) return;
    const slug = subcatInput.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setEditingCategory({
      ...editingCategory,
      subcategories: [...(editingCategory.subcategories || []), { name: subcatInput.trim(), slug }]
    });
    setSubcatInput('');
  };

  const handleRemoveSubcat = (slug) => {
    setEditingCategory({
      ...editingCategory,
      subcategories: (editingCategory.subcategories || []).filter((s) => s.slug !== slug)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (editingCategory.id) {
      updateCategory(editingCategory.id, editingCategory);
    } else {
      addCategory(editingCategory);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Categories & Collections</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize catalog taxonomies, subcategories and storefront navigation.
          </p>
        </div>

        <button onClick={handleOpenNewCategory} className="btn-primary py-2 px-4 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* CATEGORIES GRID */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isPageLoading ? (
          <CategoriesGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-2">
            {categoriesWithCounts.map((cat) => (
              <div key={cat.id} className="admin-card p-5 flex flex-col justify-between group admin-card-hover">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={cat.image}
                        category={cat.name}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <h3 className="font-bold text-slate-100 text-base leading-tight">{cat.name}</h3>
                        <span className="text-[11px] text-indigo-400 font-mono">/{cat.slug}</span>
                      </div>
                    </div>

                    <span className="badge-indigo font-bold text-xs px-2.5 py-0.5 rounded-full">
                      {cat.actualCount} Products
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {cat.description || 'Collection of genuine handmade craft & fashion decor items.'}
                  </p>

                  {/* Subcategories Tags */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Subcategories ({cat.subcategories?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories?.map((sub) => (
                        <span
                          key={sub.slug}
                          className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-lg"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active on Storefront
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCategory({ ...cat })}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete category "${cat.name}"?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT / CREATE CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingCategory.id ? `Edit: ${editingCategory.name}` : 'Create Category'}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Category Title *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Traditional Torans & Hangings"
                  className="admin-input w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Short description for collection banner..."
                  className="admin-input w-full text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcatInput}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    placeholder="Subcategory name (e.g. Velvet Door Torans)..."
                    className="admin-input flex-1 text-xs"
                  />
                  <button type="button" onClick={handleAddSubcat} className="btn-secondary py-1.5 px-3 text-xs">
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {editingCategory.subcategories?.map((s) => (
                    <span
                      key={s.slug}
                      className="bg-slate-800 text-slate-200 px-2 py-1 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcat(s.slug)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary py-1.5 px-3 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4 text-xs font-bold">
                  <Save className="w-3.5 h-3.5" /> Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
