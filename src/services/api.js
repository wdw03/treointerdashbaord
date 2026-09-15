import { supabase } from './supabase.js';
// Centralized API Client for Trio Ecart Admin Dashboard
// Direct live production backend fallback for Vercel deployments
const LIVE_BACKEND_URL = 'https://trioenterprises.in';
const BACKEND_FALLBACK = 'https://treobackend.vercel.app';
const TRIOTECH_FALLBACK = 'https://trioenterprises.in/api';
const RAW_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '')
  ? import.meta.env.VITE_API_URL 
  : LIVE_BACKEND_URL;

const API_BASE = `${RAW_URL.replace(/\/+$/, '')}/api`;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If body is FormData, don't set Content-Type header (browser sets boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMsg = errJson.error;
      } catch {
        // use default
      }
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    // Fallback to trieotech.vercel.app if primary backend fails
    try {
      const fallbackUrl = `${TRIOTECH_FALLBACK}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const fbRes = await fetch(fallbackUrl, { ...options, headers });
      if (fbRes.ok) return await fbRes.json();
    } catch (_) {}
    throw err;
  }
}

export const adminApi = {
  // Statistics
  getStats: async () => {
    return request('/admin/stats');
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/products${query ? `?${query}` : ''}`);
  },

  createProduct: async (productData) => {
    return request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id, productData) => {
    return request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id) => {
    return request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  getOrder: async (orderId) => {
    return request(`/admin/orders/${orderId}`);
  },

  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },

  updateOrderStatus: async (orderId, status, details = {}) => {
    return request(`/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...details }),
    });
  },

  // Categories
  getCategories: async () => {
    return request('/admin/categories');
  },

  createCategory: async (categoryData) => {
    return request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, categoryData) => {
    return request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id) => {
    return request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Customers
  getCustomers: async () => {
    return request('/admin/customers');
  },

  // Instagram Reels CMS Management (Dual Supabase Direct + Backend API Fallback)
  getReels: async (params = {}) => {
    try {
      let q = supabase
        .from('reels')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (params.status === 'active') q = q.eq('is_active', true);
      else if (params.status === 'inactive') q = q.eq('is_active', false);

      if (params.search) {
        q = q.or(`influencer_name.ilike.%${params.search}%,influencer_username.ilike.%${params.search}%,caption.ilike.%${params.search}%,product_name.ilike.%${params.search}%`);
      }

      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase direct getReels fallback:', e.message);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/admin/reels${query ? `?${query}` : ''}`);
  },

  createReel: async (reelData) => {
    try {
      const { data, error } = await supabase.from('reels').insert([reelData]).select().single();
      if (!error && data) return { success: true, reel: data };
    } catch (e) {
      console.warn('Supabase direct createReel fallback:', e.message);
    }
    return request('/admin/reels', {
      method: 'POST',
      body: JSON.stringify(reelData),
    });
  },

  updateReel: async (id, reelData) => {
    try {
      const { data, error } = await supabase
        .from('reels')
        .update({ ...reelData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return { success: true, reel: data };
    } catch (e) {
      console.warn('Supabase direct updateReel fallback:', e.message);
    }
    return request(`/admin/reels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reelData),
    });
  },

  deleteReel: async (id) => {
    try {
      const { error } = await supabase.from('reels').delete().eq('id', id);
      if (!error) return { success: true, message: 'Deleted' };
    } catch (e) {
      console.warn('Supabase direct deleteReel fallback:', e.message);
    }
    return request(`/admin/reels/${id}`, {
      method: 'DELETE',
    });
  },

  uploadReelVideo: async (file) => {
    try {
      const timestamp = Date.now();
      const cleanName = (file.name || 'video.mp4')
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const fileName = `${timestamp}-${cleanName}`;
      const { data, error } = await supabase.storage
        .from('reels')
        .upload(fileName, file, {
          contentType: file.type || 'video/mp4',
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('reels').getPublicUrl(fileName);
        return { success: true, url: publicUrl, fileName };
      }
    } catch (e) {
      console.warn('Supabase direct upload fallback:', e.message);
    }
    const formData = new FormData();
    formData.append('file', file);
    return request('/admin/reels/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Blogs CMS
  getBlogs: async () => {
    return request('/blogs');
  },

  createBlog: async (blogData) => {
    return request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  updateBlog: async (slug, blogData) => {
    return request(`/blogs/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  deleteBlog: async (slug) => {
    return request(`/blogs/${slug}`, {
      method: 'DELETE',
    });
  },

  // File Upload to Supabase Storage CDN
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },

  uploadBlogImage: async (file, alt = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    return request('/admin/upload/blog', {
      method: 'POST',
      body: formData,
    });
  },

  // FAQ Management
  getFaqs: async (params = {}) => {
    const qs = params && params.all ? '?all=true' : '';
    return request('/faqs' + qs);
  },

  createFaq: async (faqData) => {
    return request('/faqs', {
      method: 'POST',
      body: JSON.stringify(faqData),
    });
  },

  updateFaq: async (id, faqData) => {
    return request('/faqs', {
      method: 'PUT',
      body: JSON.stringify({ id, ...faqData }),
    });
  },

  deleteFaq: async (id) => {
    return request('/faqs?id=' + id, {
      method: 'DELETE',
    });
  },

  // COD Serviceable Pincodes Management
  getCodPincodes: async () => {
    return request('/admin/cod-pincodes');
  },

  addCodPincodes: async (data) => {
    return request('/admin/cod-pincodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteCodPincode: async (pincode) => {
    return request(`/admin/cod-pincodes?pincode=${encodeURIComponent(pincode)}`, {
      method: 'DELETE',
    });
  },

  toggleGlobalCod: async (enabled) => {
    return request('/admin/cod-pincodes', {
      method: 'PATCH',
      body: JSON.stringify({ cod_enabled_globally: enabled }),
    });
  },

  // Coupons Management
  getCoupons: async () => {
    return request('/admin/coupons');
  },

  createCoupon: async (couponData) => {
    return request('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  deleteCoupon: async (id) => {
    return request('/admin/coupons/' + id, {
      method: 'DELETE',
    });
  },

  toggleCouponStatus: async (id) => {
    return request('/admin/coupons/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ toggleStatus: true }),
    });
  },

  // Customer Contact Inquiries
  getContactMessages: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('/admin/contact' + (query ? '?' + query : ''));
  },

  updateContactMessage: async (id, data) => {
    return request('/admin/contact/' + id, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteContactMessage: async (id) => {
    return request('/admin/contact/' + id, {
      method: 'DELETE',
    });
  },

  // Shiprocket Shipment Actions
  createShipment: async (orderId) => {
    return request('/admin/shipments/create', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  assignAWB: async (orderId, courierId) => {
    return request('/admin/shipments/awb', {
      method: 'POST',
      body: JSON.stringify({ orderId, courierId }),
    });
  },

  getShiprocketLabel: async (params, directShipmentId) => {
    let payload = {};
    if (typeof params === 'string') {
      payload = { orderId: params, shipmentId: directShipmentId };
    } else if (Array.isArray(params)) {
      payload = { orderIds: params };
    } else if (typeof params === 'object' && params !== null) {
      payload = params;
    }
    return request('/admin/shipments/label', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  cancelShipment: async (orderId, reason = 'Cancelled by store administrator') => {
    return request('/admin/shipments/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    });
  },

  requestPickup: async (orderId) => {
    return request('/admin/shipments/pickup', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  // Return & Refund Claims
  getReturns: async () => {
    return request('/admin/returns');
  },

  updateReturnStatus: async (id, action, details = {}) => {
    return request(`/admin/returns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, ...details }),
    });
  },
};
