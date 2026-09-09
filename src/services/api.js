// Centralized API Client for Trio Ecart Admin Dashboard
// Direct live production backend fallback for Vercel deployments
const LIVE_BACKEND_URL = 'https://treobackend.vercel.app';
const TRIOTECH_FALLBACK = 'https://trieotech.vercel.app/api';
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
};