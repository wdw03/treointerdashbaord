import React, { useState } from 'react';
import {
  FileText,
  User,
  Image as ImageIcon,
  Tag,
  Search,
  Save,
  X,
  Sparkles,
  Globe,
  Clock
} from 'lucide-react';

const SUGGESTED_BLOG_IMAGES = [
  { label: 'Peacock Zardosi', url: '/products/peacock-real-feathers-pair-1.jpg' },
  { label: 'Hammered Copper', url: '/products/hammered-copper-bottle-1.jpg' },
  { label: 'Pooja Thali & Diya', url: '/products/pooja-thali-brass-diya-1.jpg' },
  { label: 'Lotus Kamal Aasan', url: '/products/lotus-kamal-aasan-1.jpg' },
  { label: 'Pure Cotton Gamcha', url: '/products/pure-cotton-gamcha-red-1.jpg' },
  { label: 'Shreenathji Devotion', url: '/products/shreenathji-statement-patch-1.jpg' }
];

export const BlogEditorModal = ({
  blog,
  isOpen,
  onSave,
  onClose
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'author_media' | 'tags' | 'seo'
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    category: blog?.category || 'Artisan Heritage',
    readTime: blog?.readTime || '5 min read',
    date: blog?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: blog?.author || 'Trio Ecart Editorial',
    authorRole: blog?.authorRole || 'Heritage Crafts Curator',
    authorImage: blog?.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    image: blog?.image || '/products/peacock-real-feathers-pair-1.jpg',
    tags: blog?.tags || ['Handmade', 'Indian Craft', 'Heritage'],
    status: blog?.status || 'Published',
    seoTitle: blog?.seoTitle || blog?.title || '',
    seoDescription: blog?.seoDescription || blog?.excerpt || ''
  });

  const handleTitleChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug ? prev.slug : autoSlug,
      seoTitle: prev.seoTitle ? prev.seoTitle : val
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Blog Title is required!');
      return;
    }
    onSave({
      ...(blog || {}),
      ...formData,
      slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      seoTitle: formData.seoTitle.trim() || formData.title,
      seoDescription: formData.seoDescription.trim() || formData.excerpt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="font-bold text-white text-base">
              {blog ? `Edit Article: ${blog.title.substring(0, 36)}...` : 'Write New Craft Journal Article'}
            </h3>
            <p className="text-xs text-slate-400">Manage article body, imagery, author bio and SEO search rankings</p>
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
              <Save className="w-3.5 h-3.5" /> Save Article
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'content', label: '1. Story & Content', icon: FileText },
            { id: 'author_media', label: '2. Author & Cover Media', icon: User },
            { id: 'tags', label: '3. Category & Tags', icon: Tag },
            { id: 'seo', label: '4. SEO & Google Snippet', icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors
                  ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
                `}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: STORY & CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Article Headline / Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. The Sacred Art of Zardosi: From Mughal Ateliers to Modern Bridal Couture"
                  className="admin-input w-full text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="sacred-art-of-zardosi"
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-select w-full text-xs"
                  >
                    <option value="Artisan Heritage">Artisan Heritage</option>
                    <option value="Wellness & Tradition">Wellness &amp; Tradition</option>
                    <option value="Devotion & Rituals">Devotion &amp; Rituals</option>
                    <option value="Bridal Fashion Guides">Bridal Fashion Guides</option>
                    <option value="DIY Craft Tutorials">DIY Craft Tutorials</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Publishing Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="admin-select w-full text-xs font-bold"
                  >
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Excerpt / Hook Summary</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short introductory summary shown on the blog list cards..."
                  className="admin-input w-full text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Article Body Content (HTML / Rich Format)</label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h2>Section Heading</h2><p>Article narrative...</p>"
                  className="admin-input w-full text-xs font-mono leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Supports standard HTML tags like &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;li&gt;.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHOR & MEDIA */}
          {activeTab === 'author_media' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Full Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Meera Sen"
                    className="admin-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Title / Role</label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    placeholder="e.g. Heritage Textile Curator"
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Avatar URL</label>
                  <input
                    type="text"
                    value={formData.authorImage}
                    onChange={(e) => setFormData({ ...formData, authorImage: e.target.value })}
                    className="admin-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Estimated Reading Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="admin-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Featured Cover Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/products/peacock-real-feathers-pair-1.jpg"
                  className="admin-input w-full text-xs font-mono"
                  required
                />

                {/* Suggested Cover Photos */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                    Pick from Authentic Craft Images:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_BLOG_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: img.url })}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${formData.image === img.url ? 'bg-indigo-600 text-white border-indigo-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Preview */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">{formData.category}</span>
                  <h5 className="font-bold text-white text-xs truncate max-w-sm">{formData.title || 'Article Title'}</h5>
                  <p className="text-[11px] text-slate-400">By {formData.author} • {formData.readTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TAGS & TAXONOMY */}
          {activeTab === 'tags' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Add Article Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Type tag (e.g. Zari, Bridal, Mandir Decor) and press Enter..."
                    className="admin-input flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-secondary py-1.5 px-4 text-xs font-bold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  Assigned Tags ({formData.tags.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-indigo-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & SEARCH SNIPPET */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Google Meta Title (Max 60 chars)</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Primary search engine title..."
                  className="admin-input w-full text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formData.seoTitle.length} / 60 characters</span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Google Meta Description (Max 160 chars)</label>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Search snippet summary..."
                  className="admin-input w-full text-xs leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formData.seoDescription.length} / 160 characters</span>
              </div>

              {/* Live Google Search Card Preview */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Live Google Search Result Preview:
                </span>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>https://trioecart.com &gt; blog &gt; {formData.slug || 'article'}</span>
                </div>
                <h4 className="text-sm font-semibold text-indigo-400 hover:underline cursor-pointer">
                  {formData.seoTitle || 'Article Title Preview | Trio Ecart'}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {formData.seoDescription || 'Article meta description preview will appear here in Google search rankings.'}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
