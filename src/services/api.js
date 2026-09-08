// Centralized API Client for Trio Ecart Admin Dashboard
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
  : '/api';

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
};
