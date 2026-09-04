import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { usePageLoading } from '../../hooks/usePageLoading.js';
import { BlogTableSkeleton, Skeleton } from '../../components/ui/Skeleton.jsx';
import { BlogEditorModal } from '../../components/cms/BlogEditorModal.jsx';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal.jsx';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Tag,
  Globe,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const BlogManagementCms = () => {
  const {
    cmsBlogs,
    saveBlog,
    deleteBlog,
    toggleBlogPublish,
    showToast
  } = useAdmin();
  const isPageLoading = usePageLoading(450);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Published' | 'Draft'

  const [editingBlog, setEditingBlog] = useState(null);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return cmsBlogs.filter((b) => {
      if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && b.status !== selectedStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = b.title.toLowerCase().includes(q);
        const matchesAuthor = b.author?.toLowerCase().includes(q);
        const matchesTags = b.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesTags) return false;
      }
      return true;
    });
  }, [cmsBlogs, selectedCategory, selectedStatus, searchTerm]);

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 flex flex-col lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Artisan Blog &amp; Journal CMS</h1>
            {isPageLoading ? (
              <Skeleton className="w-24 h-5 rounded-full" />
            ) : (
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {cmsBlogs.length} Stories Available
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish educational guides on Zari embroidery, Ayurvedic copper wellness, and sacred pooja rituals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBlog(null);
            setEditorModalOpen(true);
          }}
          className="btn-primary py-2 px-4 text-xs font-bold shrink-0"
        >
          <Plus className="w-4 h-4" /> Write New Craft Article
        </button>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="admin-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search article headline, author, tag..."
            className="admin-input pl-9 py-1.5 text-xs w-full"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-select py-1.5 text-xs"
          >
            <option value="All">All Categories</option>
            <option value="Artisan Heritage">Artisan Heritage</option>
            <option value="Wellness & Tradition">Wellness &amp; Tradition</option>
            <option value="Devotion & Rituals">Devotion &amp; Rituals</option>
            <option value="Bridal Fashion Guides">Bridal Fashion Guides</option>
            <option value="DIY Craft Tutorials">DIY Craft Tutorials</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="admin-select py-1.5 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published (Live)</option>
            <option value="Draft">Draft (Hidden)</option>
          </select>
        </div>
      </div>

      {/* BLOG ARTICLES TABLE */}
      <div className="admin-card overflow-hidden w-full max-w-full min-w-0 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[300px] max-h-[60vh] lg:max-h-none w-full max-w-full min-w-0 touch-pan-x overscroll-contain relative border-b border-slate-800/60">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 shadow-md">
              <tr className="bg-[#0F172A] text-slate-300">
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] w-20 border-b border-slate-800 shadow-sm">Cover</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Article Title &amp; Slug</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Category</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Author</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Published Date</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] border-b border-slate-800 shadow-sm">Tags</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-center border-b border-slate-800 shadow-sm">Status</th>
                <th className="table-th sticky top-0 z-20 bg-[#0F172A] text-right border-b border-slate-800 shadow-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPageLoading ? (
                <BlogTableSkeleton rows={6} />
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">
                    No blog articles match your current search criteria.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="table-tr">
                    {/* Cover Thumbnail */}
                    <td className="table-td">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="table-td max-w-sm">
                      <h4 className="font-bold text-white text-xs leading-snug truncate">{blog.title}</h4>
                      <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">/blog/{blog.slug}</span>
                    </td>

                    {/* Category */}
                    <td className="table-td">
                      <span className="badge-indigo text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        {blog.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <img src={blog.authorImage} alt={blog.author} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                        <div>
                          <p className="text-xs font-semibold text-slate-200 truncate">{blog.author}</p>
                          <p className="text-[10px] text-slate-500 truncate">{blog.authorRole}</p>
                        </div>
                      </div>
                    </td>

                    {/* Published Date & Read Time */}
                    <td className="table-td text-xs text-slate-300">
                      <div>{blog.date}</div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {blog.readTime}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {blog.tags?.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-medium border border-slate-700">
                            #{t}
                          </span>
                        ))}
                        {blog.tags?.length > 2 && (
                          <span className="text-[9px] text-slate-500 font-bold">+{blog.tags.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill Toggle */}
                    <td className="table-td text-center">
                      <button
                        type="button"
                        onClick={() => toggleBlogPublish(blog.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${blog.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                        title="Click to toggle live status"
                      >
                        {blog.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlog(blog);
                            setEditorModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setBlogToDelete(blog)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Article"
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

        <div className="p-3.5 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center shrink-0 bg-slate-900/90">
          {isPageLoading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <span>Showing {filteredBlogs.length} of {cmsBlogs.length} articles</span>
          )}
          <span className="text-[11px] text-slate-500">Includes Google Search SEO Metadata</span>
        </div>
      </div>

      {/* MODALS */}
      {editorModalOpen && (
        <BlogEditorModal
          blog={editingBlog}
          isOpen={editorModalOpen}
          onSave={saveBlog}
          onClose={() => setEditorModalOpen(false)}
        />
      )}

      {blogToDelete && (
        <DeleteConfirmModal
          isOpen={!!blogToDelete}
          title="Delete Blog Article"
          itemName={blogToDelete.title}
          message="Are you sure you want to delete this article? This will remove it from the storefront journal."
          onConfirm={() => deleteBlog(blogToDelete.id)}
          onClose={() => setBlogToDelete(null)}
        />
      )}
    </div>
  );
};
