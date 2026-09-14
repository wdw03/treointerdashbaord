import React, { useState, useRef, useCallback } from 'react';
import { adminApi } from '../../services/api.js';
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
  Clock,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Upload,
  Trash2,
  AlertCircle,
  ImagePlus,
  Type,
  Eye
} from 'lucide-react';

const SUGGESTED_BLOG_IMAGES = [
  { label: 'Peacock Zardosi', url: '/products/peacock-real-feathers-pair-1.jpg' },
  { label: 'Hammered Copper', url: '/products/hammered-copper-bottle-1.jpg' },
  { label: 'Pooja Thali & Diya', url: '/products/pooja-thali-brass-diya-1.jpg' },
  { label: 'Lotus Kamal Aasan', url: '/products/lotus-kamal-aasan-1.jpg' },
  { label: 'Pure Cotton Gamcha', url: '/products/pure-cotton-gamcha-red-1.jpg' },
  { label: 'Shreenathji Devotion', url: '/products/shreenathji-statement-patch-1.jpg' }
];

const CATEGORY_OPTIONS = [
  'Artisan Heritage',
  'Wellness & Tradition',
  'Devotion & Rituals',
  'Bridal Fashion Guides',
  'DIY Craft Tutorials',
  'Festive Decor',
  'Indian Textiles',
  'Copper Wellness',
  'Gift Guides'
];

export const BlogEditorModal = ({
  blog,
  isOpen,
  onSave,
  onClose
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('content');
  const [tagInput, setTagInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const contentRef = useRef(null);
  const coverFileRef = useRef(null);
  const inlineFileRef = useRef(null);

  const [formData, setFormData] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    category: blog?.category || 'Artisan Heritage',
    readTime: blog?.readTime || blog?.read_time || '5 min read',
    date: blog?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: blog?.author || 'Trio Enterprises Editorial',
    authorRole: blog?.authorRole || blog?.author_role || 'Heritage Crafts Curator',
    authorImage: blog?.authorImage || blog?.author_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    image: blog?.image || '/products/peacock-real-feathers-pair-1.jpg',
    imageAlt: blog?.imageAlt || blog?.image_alt || '',
    tags: blog?.tags || ['Handmade', 'Indian Craft', 'Heritage'],
    status: blog?.status || 'Published',
    seoTitle: blog?.seoTitle || blog?.seo_title || blog?.title || '',
    seoDescription: blog?.seoDescription || blog?.seo_description || blog?.excerpt || ''
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

  // =================== IMAGE UPLOAD ===================
  const handleCoverUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.uploadBlogImage(file, formData.imageAlt || formData.title);
      if (result?.url) {
        setFormData(prev => ({ ...prev, image: result.url }));
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      alert('Failed to upload cover image: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [formData.imageAlt, formData.title]);

  const handleCoverDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    if (coverFileRef.current) {
      coverFileRef.current.files = dt.files;
      coverFileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  const handleInlineImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const alt = prompt('Enter alt text for this image (important for SEO):') || 'Blog image';
      const result = await adminApi.uploadBlogImage(file, alt);
      if (result?.url) {
        const imgTag = `\n<figure>\n  <img src="${result.url}" alt="${alt}" style="max-width:100%;border-radius:12px;" />\n  <figcaption>${alt}</figcaption>\n</figure>\n`;
        insertAtCursor(imgTag);
      }
    } catch (err) {
      console.error('Inline image upload error:', err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingInline(false);
      if (inlineFileRef.current) inlineFileRef.current.value = '';
    }
  }, []);

  // =================== FORMATTING TOOLBAR ===================
  const insertAtCursor = (text) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: prev.content + text }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    const newContent = before + text + after;
    setFormData(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const wrapSelection = (openTag, closeTag) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.content.substring(start, end);
    const wrapped = openTag + (selected || 'text here') + closeTag;
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: before + wrapped + after }));
    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + wrapped.length);
      } else {
        textarea.setSelectionRange(start + openTag.length, start + openTag.length + 9);
      }
    }, 10);
  };

  const insertHeading = (level) => {
    const tag = level === 2 ? 'h2' : 'h3';
    wrapSelection(`<${tag}>`, `</${tag}>`);
  };

  const insertLink = () => {
    const url = prompt('Enter the URL (e.g. https://trioenterprises.in/blog/...):');
    if (!url) return;
    const textarea = contentRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;
    const selectedText = formData.content.substring(start, end) || 'Link Text';
    const linkTag = `<a href="${url}" target="_blank" rel="noopener">${selectedText}</a>`;
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: before + linkTag + after }));
  };

  const insertBacklink = () => {
    const slug = prompt('Enter blog slug for internal backlink (e.g. sacred-art-of-zardosi):');
    if (!slug) return;
    const textarea = contentRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;
    const selectedText = formData.content.substring(start, end) || 'Read More';
    const linkTag = `<a href="/blog/${slug}">${selectedText}</a>`;
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: before + linkTag + after }));
  };

  const formatActions = [
    { icon: Bold, label: 'Bold', action: () => wrapSelection('<strong>', '</strong>') },
    { icon: Italic, label: 'Italic', action: () => wrapSelection('<em>', '</em>') },
    { icon: Heading2, label: 'H2', action: () => insertHeading(2) },
    { icon: Heading3, label: 'H3', action: () => insertHeading(3) },
    { icon: Quote, label: 'Blockquote', action: () => wrapSelection('<blockquote>', '</blockquote>') },
    { icon: List, label: 'UL List', action: () => insertAtCursor('\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n') },
    { icon: ListOrdered, label: 'OL List', action: () => insertAtCursor('\n<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n</ol>\n') },
    { icon: LinkIcon, label: 'External Link', action: insertLink },
    { icon: FileText, label: 'Internal Backlink', action: insertBacklink },
    { icon: ImagePlus, label: 'Insert Image', action: () => inlineFileRef.current?.click() },
  ];

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
      seoDescription: formData.seoDescription.trim() || formData.excerpt,
      imageAlt: formData.imageAlt || formData.title,
      image_alt: formData.imageAlt || formData.title
    });
    onClose();
  };

  const seoTitleLen = formData.seoTitle.length;
  const seoDescLen = formData.seoDescription.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {blog ? `Edit: ${blog.title?.substring(0, 40)}...` : 'Write New Craft Journal Article'}
            </h3>
            <p className="text-xs text-slate-400">Manage article body, imagery, author bio, backlinks and SEO search rankings</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
            <button type="button" onClick={handleSubmit} className="btn-primary py-1.5 px-4 text-xs font-bold">
              <Save className="w-3.5 h-3.5" /> {blog ? 'Update Article' : 'Publish Article'}
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
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: STORY & CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Article Headline / Title *</label>
                <input type="text" value={formData.title} onChange={handleTitleChange} placeholder="e.g. The Sacred Art of Zardosi: From Mughal Ateliers to Modern Bridal Couture" className="admin-input w-full text-xs font-semibold" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">URL Slug</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="sacred-art-of-zardosi" className="admin-input w-full text-xs font-mono" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={CATEGORY_OPTIONS.includes(formData.category) ? formData.category : '__custom__'}
                    onChange={(e) => { if (e.target.value !== '__custom__') setFormData({ ...formData, category: e.target.value }); else setCustomCategory(formData.category); }}
                    className="admin-select w-full text-xs"
                  >
                    {CATEGORY_OPTIONS.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    {!CATEGORY_OPTIONS.includes(formData.category) && (<option value="__custom__">{formData.category} (Custom)</option>)}
                    <option value="__custom__">+ Custom Category...</option>
                  </select>
                  {(!CATEGORY_OPTIONS.includes(formData.category) || customCategory) && (
                    <input type="text" value={CATEGORY_OPTIONS.includes(formData.category) ? customCategory : formData.category} onChange={(e) => { setCustomCategory(e.target.value); setFormData({ ...formData, category: e.target.value }); }} placeholder="Enter custom category name" className="admin-input w-full text-xs mt-1.5" />
                  )}
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Publishing Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="admin-select w-full text-xs font-bold">
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Excerpt / Hook Summary</label>
                <textarea rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Short introductory summary shown on the blog list cards..." className="admin-input w-full text-xs leading-relaxed" />
              </div>

              {/* WordPress-like Formatting Toolbar */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Article Body Content (HTML / Rich Format)</label>
                <div className="flex items-center gap-0.5 flex-wrap bg-slate-950 border border-slate-800 rounded-t-xl px-2 py-1.5">
                  {formatActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <button key={idx} type="button" onClick={action.action} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title={action.label}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                  <div className="w-px h-5 bg-slate-700 mx-1" />
                  <button type="button" onClick={() => setPreviewMode(!previewMode)} className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${previewMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title="Preview HTML">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  {uploadingInline && (<span className="text-[10px] text-indigo-400 ml-2 animate-pulse">Uploading image...</span>)}
                </div>

                <input ref={inlineFileRef} type="file" accept="image/*" onChange={handleInlineImageUpload} className="hidden" />

                {previewMode ? (
                  <div className="bg-slate-950 border border-t-0 border-slate-800 rounded-b-xl p-4 min-h-[200px] prose prose-invert prose-sm max-w-none text-xs" dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-slate-500">No content to preview yet...</p>' }} />
                ) : (
                  <textarea ref={contentRef} rows={10} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="<h2>Section Heading</h2><p>Article narrative...</p>" className="admin-input w-full text-xs font-mono leading-relaxed border-t-0 rounded-t-none" />
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">Supports &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, &lt;img&gt;, &lt;figure&gt;</span>
                  <span className="text-[10px] text-slate-500">{formData.content.length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHOR & MEDIA */}
          {activeTab === 'author_media' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Full Name</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="e.g. Meera Sen" className="admin-input w-full text-xs" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Title / Role</label>
                  <input type="text" value={formData.authorRole} onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })} placeholder="e.g. Heritage Textile Curator" className="admin-input w-full text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Avatar URL</label>
                  <input type="text" value={formData.authorImage} onChange={(e) => setFormData({ ...formData, authorImage: e.target.value })} className="admin-input w-full text-xs font-mono" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Estimated Reading Time</label>
                  <input type="text" value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: e.target.value })} placeholder="e.g. 6 min read" className="admin-input w-full text-xs" />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5"><ImageIcon className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />Featured Cover Image *</label>
                <div onDrop={handleCoverDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={() => !uploading && coverFileRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${uploading ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50'}`}>
                  <input ref={coverFileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-indigo-400">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Uploading to CDN...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400 font-semibold">Click or drag & drop cover image</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG, WebP supported • Max 5MB</p>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="Or paste image URL: /products/peacock-real-feathers-pair-1.jpg" className="admin-input w-full text-xs font-mono" />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Image Alt Text (SEO) *</label>
                  <input type="text" value={formData.imageAlt} onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })} placeholder="Describe the image for screen readers & Google (e.g. Handcrafted Zardosi peacock patch on velvet)" className="admin-input w-full text-xs" />
                  {!formData.imageAlt && (<span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> Alt text is important for SEO & accessibility</span>)}
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Quick Pick from Craft Library:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_BLOG_IMAGES.map((img, i) => (
                      <button key={i} type="button" onClick={() => setFormData({ ...formData, image: img.url })} className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${formData.image === img.url ? 'bg-indigo-600 text-white border-indigo-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}>{img.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Preview */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <img src={formData.image} alt={formData.imageAlt || 'Cover Preview'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">{formData.category}</span>
                  <h5 className="font-bold text-white text-xs truncate max-w-sm">{formData.title || 'Article Title'}</h5>
                  <p className="text-[11px] text-slate-400">By {formData.author} • {formData.readTime}</p>
                  {formData.imageAlt && (<p className="text-[10px] text-emerald-400/60 mt-0.5 truncate">Alt: {formData.imageAlt}</p>)}
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
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Type tag (e.g. Zari, Bridal, Mandir Decor) and press Enter..." className="admin-input flex-1 text-xs" />
                  <button type="button" onClick={handleAddTag} className="btn-secondary py-1.5 px-4 text-xs font-bold">Add Tag</button>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Assigned Tags ({formData.tags.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-indigo-400 hover:text-rose-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Popular Tag Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Zardosi', 'Embroidery', 'Indian Craft', 'Bridal Fashion', 'Handmade', 'Copper', 'Ayurveda', 'Pooja', 'Diwali', 'Navratri', 'Wedding', 'DIY', 'Heritage', 'Karigar', 'Festive', 'Vedic'].map(tag => (
                    <button key={tag} type="button" onClick={() => { if (!formData.tags.includes(tag)) setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] })); }} disabled={formData.tags.includes(tag)} className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${formData.tags.includes(tag) ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:border-indigo-500 cursor-pointer'}`}>+ {tag}</button>
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
                <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} placeholder="Primary search engine title..." className="admin-input w-full text-xs" maxLength={70} />
                <span className={`text-[10px] mt-0.5 block ${seoTitleLen > 60 ? 'text-rose-400 font-bold' : seoTitleLen > 50 ? 'text-amber-400' : 'text-slate-500'}`}>{seoTitleLen} / 60 characters {seoTitleLen > 60 ? '⚠ Too long!' : seoTitleLen >= 30 ? '✓ Good' : ''}</span>
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Google Meta Description (Max 160 chars)</label>
                <textarea rows={2} value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} placeholder="Search snippet summary..." className="admin-input w-full text-xs leading-relaxed" maxLength={200} />
                <span className={`text-[10px] mt-0.5 block ${seoDescLen > 160 ? 'text-rose-400 font-bold' : seoDescLen > 140 ? 'text-amber-400' : 'text-slate-500'}`}>{seoDescLen} / 160 characters {seoDescLen > 160 ? '⚠ Too long!' : seoDescLen >= 80 ? '✓ Good' : ''}</span>
              </div>

              {/* Live Google Search Card Preview */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">✨ Live Google Search Result Preview:</span>
                <div className="text-[12px] text-green-700 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>https://trioenterprises.in › blog › {formData.slug || 'article'}</span>
                </div>
                <h4 className="text-lg font-medium text-blue-700 hover:underline cursor-pointer leading-snug">{formData.seoTitle || formData.title || 'Article Title Preview | Trio Enterprises'}</h4>
                <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">{formData.seoDescription || formData.excerpt || 'Article meta description preview will appear here in Google search rankings.'}</p>
              </div>

              {/* SEO Checklist */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">SEO Checklist:</span>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { label: 'Title length 30-60 chars', ok: seoTitleLen >= 30 && seoTitleLen <= 60 },
                    { label: 'Description length 80-160 chars', ok: seoDescLen >= 80 && seoDescLen <= 160 },
                    { label: 'Cover image alt text set', ok: !!formData.imageAlt },
                    { label: 'URL slug is clean & readable', ok: formData.slug && formData.slug.length > 3 },
                    { label: 'Excerpt/hook is provided', ok: formData.excerpt?.length > 20 },
                    { label: 'At least 3 tags assigned', ok: formData.tags?.length >= 3 },
                  ].map((item, idx) => (
                    <li key={idx} className={`flex items-center gap-2 ${item.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${item.ok ? 'bg-emerald-500/20 border-emerald-500/40' : 'border-slate-700'}`}>{item.ok ? '✓' : '○'}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
