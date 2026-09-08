import {
  initialHeroSlides,
  initialHomeSections,
  initialCmsBlogs,
  initialCmsPages
} from '../data/initialCmsData.js';
import { adminApi } from './api.js';

const STORAGE_KEYS = {
  HERO_SLIDES: 'trio_cms_hero_slides_v1',
  HOME_SECTIONS: 'trio_cms_home_sections_v1',
  BLOGS: 'trio_cms_blogs_v1',
  PAGES: 'trio_cms_pages_v1'
};

// Helper to read from localStorage with fallback
const getStorageData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

// Helper to write to localStorage
const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export const cmsService = {
  // ═══════════════════════════════════════════════════════════════
  // HERO SLIDES CRUD
  // ═══════════════════════════════════════════════════════════════
  getHeroSlides: async () => {
    return getStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
  },

  saveHeroSlide: async (slideData) => {
    const slides = getStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
    let updated;

    if (slideData.id) {
      updated = slides.map((s) => (s.id === slideData.id ? { ...s, ...slideData } : s));
    } else {
      const newSlide = {
        ...slideData,
        id: `SLIDE-${Date.now()}`,
        order: slides.length + 1,
        isActive: slideData.isActive ?? true
      };
      updated = [...slides, newSlide];
    }

    setStorageData(STORAGE_KEYS.HERO_SLIDES, updated);
    return updated;
  },

  deleteHeroSlide: async (id) => {
    const slides = getStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
    const updated = slides.filter((s) => s.id !== id);
    setStorageData(STORAGE_KEYS.HERO_SLIDES, updated);
    return updated;
  },

  toggleHeroSlideStatus: async (id) => {
    const slides = getStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
    const updated = slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setStorageData(STORAGE_KEYS.HERO_SLIDES, updated);
    return updated;
  },

  reorderHeroSlides: async (reorderedIds) => {
    const slides = getStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
    const updated = reorderedIds.map((id, index) => {
      const found = slides.find((s) => s.id === id);
      return { ...found, order: index + 1 };
    });
    setStorageData(STORAGE_KEYS.HERO_SLIDES, updated);
    return updated;
  },

  // ═══════════════════════════════════════════════════════════════
  // HOME SECTIONS CONFIG
  // ═══════════════════════════════════════════════════════════════
  getHomeSections: async () => {
    return getStorageData(STORAGE_KEYS.HOME_SECTIONS, initialHomeSections);
  },

  updateHomeSection: async (sectionKey, newSectionData) => {
    const sections = getStorageData(STORAGE_KEYS.HOME_SECTIONS, initialHomeSections);
    const updated = {
      ...sections,
      [sectionKey]: { ...sections[sectionKey], ...newSectionData }
    };
    setStorageData(STORAGE_KEYS.HOME_SECTIONS, updated);
    return updated;
  },

  toggleSectionVisibility: async (sectionKey) => {
    const sections = getStorageData(STORAGE_KEYS.HOME_SECTIONS, initialHomeSections);
    const isCurrentlyEnabled = sections[sectionKey]?.isEnabled ?? true;
    const updated = {
      ...sections,
      [sectionKey]: { ...sections[sectionKey], isEnabled: !isCurrentlyEnabled }
    };
    setStorageData(STORAGE_KEYS.HOME_SECTIONS, updated);
    return updated;
  },

  // ═══════════════════════════════════════════════════════════════
  // BLOG ARTICLES CRUD (Synced with Live API & blogs.json)
  // ═══════════════════════════════════════════════════════════════
  getBlogs: async () => {
    try {
      const res = await adminApi.getBlogs();
      if (res && res.blogs && res.blogs.length) {
        setStorageData(STORAGE_KEYS.BLOGS, res.blogs);
        return res.blogs;
      }
    } catch (err) {
      console.warn('API getBlogs fallback to local storage:', err.message);
    }
    return getStorageData(STORAGE_KEYS.BLOGS, initialCmsBlogs);
  },

  saveBlog: async (blogData) => {
    const slug = blogData.slug?.trim() || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let apiBlog = null;

    try {
      if (blogData.id && !String(blogData.id).startsWith('BLOG-')) {
        const res = await adminApi.updateBlog(slug, { ...blogData, slug });
        apiBlog = res.blog;
      } else {
        const res = await adminApi.createBlog({ ...blogData, slug });
        apiBlog = res.blog;
      }
    } catch (err) {
      console.warn('Live API saveBlog failed, falling back to local storage:', err.message);
    }

    const blogs = getStorageData(STORAGE_KEYS.BLOGS, initialCmsBlogs);
    let updated;
    if (blogData.id) {
      updated = blogs.map((b) => (b.id === blogData.id || b.slug === slug ? { ...b, ...blogData, slug, ...(apiBlog || {}) } : b));
    } else {
      const newBlog = apiBlog || {
        ...blogData,
        id: `BLOG-${Date.now()}`,
        slug,
        date: blogData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: blogData.status || 'Published'
      };
      updated = [newBlog, ...blogs];
    }

    setStorageData(STORAGE_KEYS.BLOGS, updated);
    return updated;
  },

  deleteBlog: async (idOrSlug) => {
    try {
      await adminApi.deleteBlog(idOrSlug);
    } catch (err) {
      console.warn('Live API deleteBlog failed:', err.message);
    }

    const blogs = getStorageData(STORAGE_KEYS.BLOGS, initialCmsBlogs);
    const updated = blogs.filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
    setStorageData(STORAGE_KEYS.BLOGS, updated);
    return updated;
  },

  toggleBlogPublish: async (idOrSlug) => {
    const blogs = getStorageData(STORAGE_KEYS.BLOGS, initialCmsBlogs);
    const target = blogs.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
    const newStatus = target?.status === 'Published' ? 'Draft' : 'Published';

    if (target?.slug) {
      try {
        await adminApi.updateBlog(target.slug, { status: newStatus });
      } catch (err) {
        console.warn('Live API toggleBlogPublish failed:', err.message);
      }
    }

    const updated = blogs.map((b) => {
      if (b.id === idOrSlug || b.slug === idOrSlug) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    setStorageData(STORAGE_KEYS.BLOGS, updated);
    return updated;
  },

  // ═══════════════════════════════════════════════════════════════
  // STATIC PAGES CRUD
  // ═══════════════════════════════════════════════════════════════
  getPages: async () => {
    return getStorageData(STORAGE_KEYS.PAGES, initialCmsPages);
  },

  updatePage: async (pageKey, pageData) => {
    const pages = getStorageData(STORAGE_KEYS.PAGES, initialCmsPages);
    const updated = {
      ...pages,
      [pageKey]: { ...pages[pageKey], ...pageData }
    };
    setStorageData(STORAGE_KEYS.PAGES, updated);
    return updated;
  },

  // ═══════════════════════════════════════════════════════════════
  // BACKUP & RESET
  // ═══════════════════════════════════════════════════════════════
  resetToDefaults: () => {
    setStorageData(STORAGE_KEYS.HERO_SLIDES, initialHeroSlides);
    setStorageData(STORAGE_KEYS.HOME_SECTIONS, initialHomeSections);
    setStorageData(STORAGE_KEYS.BLOGS, initialCmsBlogs);
    setStorageData(STORAGE_KEYS.PAGES, initialCmsPages);
    return {
      heroSlides: initialHeroSlides,
      homeSections: initialHomeSections,
      blogs: initialCmsBlogs,
      pages: initialCmsPages
    };
  }
};
