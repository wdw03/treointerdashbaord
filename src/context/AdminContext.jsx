import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialProductsList from '../data/products.js';
import initialCategoriesList from '../data/categories.js';
import { initialOrders, calculateOrderTotal } from '../data/orders.js';
import { initialCustomers } from '../data/customers.js';
import { initialCoupons } from '../data/coupons.js';
import { initialPayments } from '../data/payments.js';
import { initialReturns } from '../data/returns.js';
import { initialInventory, initialStockLogs } from '../data/inventory.js';
import { cmsService } from '../services/cmsService.js';
import {
  initialHeroSlides,
  initialHomeSections,
  initialCmsBlogs,
  initialCmsPages
} from '../data/initialCmsData.js';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Core Entities State
  const [products, setProducts] = useState(initialProductsList);
  const [categories, setCategories] = useState(initialCategoriesList);
  const [orders, setOrders] = useState(initialOrders);
  const [customers, setCustomers] = useState(initialCustomers);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [payments, setPayments] = useState(initialPayments);
  const [returns, setReturns] = useState(initialReturns);
  const [inventory, setInventory] = useState(initialInventory);
  const [stockLogs, setStockLogs] = useState(initialStockLogs);

  // ─── SUPER ADMIN AUTHENTICATION STATE ───
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const session = localStorage.getItem('trio_superadmin_session');
      return session ? JSON.parse(session)?.active === true : false;
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const session = localStorage.getItem('trio_superadmin_session');
      return session ? JSON.parse(session)?.user : {
        name: 'Trio Super Admin',
        email: 'admin@trioenterprises.com',
        role: 'Super Admin',
        avatar: 'SA',
        lastLogin: new Date().toISOString()
      };
    } catch {
      return {
        name: 'Trio Super Admin',
        email: 'admin@trioenterprises.com',
        role: 'Super Admin',
        avatar: 'SA',
        lastLogin: new Date().toISOString()
      };
    }
  });

  // ─── CMS STATES (HERO SLIDES, HOME SECTIONS, BLOGS, PAGES) ───
  const [cmsHeroSlides, setCmsHeroSlides] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_cms_hero_slides_v1');
      return saved ? JSON.parse(saved) : initialHeroSlides;
    } catch {
      return initialHeroSlides;
    }
  });

  const [cmsHomeSections, setCmsHomeSections] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_cms_home_sections_v1');
      return saved ? JSON.parse(saved) : initialHomeSections;
    } catch {
      return initialHomeSections;
    }
  });

  const [cmsBlogs, setCmsBlogs] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_cms_blogs_v1');
      return saved ? JSON.parse(saved) : initialCmsBlogs;
    } catch {
      return initialCmsBlogs;
    }
  });

  const [cmsPages, setCmsPages] = useState(() => {
    try {
      const saved = localStorage.getItem('trio_cms_pages_v1');
      return saved ? JSON.parse(saved) : initialCmsPages;
    } catch {
      return initialCmsPages;
    }
  });

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [printDocument, setPrintDocument] = useState(null);

  // Initial simulated fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Manual trigger to simulate real-time API refetch & show skeleton loading
  const refreshData = (customDuration = 600) => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
      showToast('Live dashboard data synchronized!', 'info');
    }, customDuration);
  };

  // Toast Notification Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Product Operations
  const addProduct = (newProduct) => {
    const id = Date.now();
    const slug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = {
      ...newProduct,
      id,
      slug,
      inStock: newProduct.inStock ?? true,
      badge: newProduct.badge || 'New',
      images: newProduct.images?.length ? newProduct.images : ['/products/pearl-zardosi-patch-1.jpg'],
      colors: newProduct.colors || [],
      sizes: newProduct.sizes || [],
      features: newProduct.features || [],
      specifications: newProduct.specifications || {},
    };
    setProducts((prev) => [created, ...prev]);

    // Also add to inventory
    const catPrefix = created.category ? created.category.substring(0, 3).toUpperCase() : 'PRD';
    const newInv = {
      productId: id,
      name: created.name,
      sku: `TE-${catPrefix}-${id}`,
      category: created.category,
      subcategory: created.subcategory,
      price: created.price,
      image: created.images[0],
      totalStock: 50,
      availableStock: 50,
      reservedStock: 0,
      lowStockThreshold: 15,
      status: 'In Stock',
      lastRestocked: new Date().toISOString().split('T')[0],
      variants: []
    };
    setInventory((prev) => [newInv, ...prev]);
    showToast(`Product "${created.name.substring(0, 30)}..." added successfully!`);
    return created;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === Number(id) ? { ...p, ...updatedFields } : p))
    );
    setInventory((prev) =>
      prev.map((inv) => (inv.productId === Number(id) ? { ...inv, name: updatedFields.name || inv.name, price: updatedFields.price || inv.price } : inv))
    );
    showToast('Product updated successfully!');
  };

  const deleteProduct = (id) => {
    const p = products.find((x) => x.id === Number(id));
    setProducts((prev) => prev.filter((x) => x.id !== Number(id)));
    setInventory((prev) => prev.filter((x) => x.productId !== Number(id)));
    showToast(`Deleted "${p?.name?.substring(0, 25) || 'product'}"`, 'info');
  };

  const duplicateProduct = (id) => {
    const existing = products.find((x) => x.id === Number(id));
    if (!existing) return;
    const duplicated = {
      ...existing,
      id: Date.now(),
      name: `${existing.name} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      badge: 'New',
    };
    setProducts((prev) => [duplicated, ...prev]);
    showToast(`Duplicated product created: ${duplicated.name.substring(0, 30)}...`);
  };

  // Order Operations
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order ${orderId} status changed to ${newStatus}`);
  };

  const bulkUpdateOrderStatus = (orderIds, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (orderIds.includes(ord.id) ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Updated ${orderIds.length} orders to "${newStatus}"`);
  };

  // Inventory Operations
  const adjustStock = (productId, adjustmentQty, reason) => {
    const changeNum = Number(adjustmentQty);
    setInventory((prev) =>
      prev.map((item) => {
        if (item.productId === Number(productId)) {
          const newAvail = Math.max(0, item.availableStock + changeNum);
          const newTotal = newAvail + item.reservedStock;
          const status = newAvail === 0 ? 'Out of Stock' : (newAvail <= item.lowStockThreshold ? 'Low Stock' : 'In Stock');

          const newLog = {
            id: `LOG-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            sku: item.sku,
            productName: item.name,
            change: changeNum > 0 ? `+${changeNum}` : `${changeNum}`,
            newStock: newAvail,
            reason: reason || 'Manual Stock Adjustment',
            admin: 'Store Admin'
          };
          setStockLogs((l) => [newLog, ...l]);

          return {
            ...item,
            availableStock: newAvail,
            totalStock: newTotal,
            status,
            lastRestocked: changeNum > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked
          };
        }
        return item;
      })
    );
    showToast(`Stock updated (${changeNum > 0 ? '+' : ''}${changeNum} units)`);
  };

  // Category Operations
  const addCategory = (catData) => {
    const newCat = {
      ...catData,
      id: Date.now(),
      slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: 0,
      subcategories: catData.subcategories || []
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" added`);
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === Number(id) ? { ...c, ...updatedFields } : c))
    );
    showToast('Category updated');
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== Number(id)));
    showToast('Category deleted', 'info');
  };

  // Coupon Operations
  const addCoupon = (couponData) => {
    const newCoupon = {
      ...couponData,
      id: `CPN-${Date.now()}`,
      usedCount: 0,
      status: 'Active'
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created`);
  };

  const toggleCouponStatus = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
    showToast('Coupon status updated');
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted', 'info');
  };

  // Return Operations
  const updateReturnStatus = (returnId, newStatus) => {
    setReturns((prev) =>
      prev.map((r) => {
        if (r.id === returnId) {
          const updatedTimeline = r.timeline.map((step) => {
            if (step.step.toLowerCase().includes(newStatus.toLowerCase())) {
              return { ...step, done: true, date: new Date().toLocaleString() };
            }
            return step;
          });
          return { ...r, status: newStatus, timeline: updatedTimeline };
        }
        return r;
      })
    );
    showToast(`Return ${returnId} updated to ${newStatus}`);
  };

  // ══════════════════════════════════════════════════════════════════════
  // CMS ACTIONS (HERO SLIDES, HOME SECTIONS, BLOGS, PAGES)
  // ══════════════════════════════════════════════════════════════════════

  // 1. Hero Slides
  const saveHeroSlide = async (slideData) => {
    const updated = await cmsService.saveHeroSlide(slideData);
    setCmsHeroSlides(updated);
    showToast(slideData.id ? 'Hero Slide updated successfully' : 'New Hero Slide created');
    return updated;
  };

  const deleteHeroSlide = async (id) => {
    const updated = await cmsService.deleteHeroSlide(id);
    setCmsHeroSlides(updated);
    showToast('Hero Slide deleted', 'info');
    return updated;
  };

  const toggleHeroSlideStatus = async (id) => {
    const updated = await cmsService.toggleHeroSlideStatus(id);
    setCmsHeroSlides(updated);
    showToast('Slide visibility updated');
    return updated;
  };

  const reorderHeroSlides = async (reorderedIds) => {
    const updated = await cmsService.reorderHeroSlides(reorderedIds);
    setCmsHeroSlides(updated);
    showToast('Hero slides reordered');
    return updated;
  };

  // 2. Home Sections
  const updateHomeSection = async (sectionKey, newSectionData) => {
    const updated = await cmsService.updateHomeSection(sectionKey, newSectionData);
    setCmsHomeSections(updated);
    showToast(`Section "${sectionKey}" updated successfully`);
    return updated;
  };

  const toggleSectionVisibility = async (sectionKey) => {
    const updated = await cmsService.toggleSectionVisibility(sectionKey);
    setCmsHomeSections(updated);
    showToast(`Section "${sectionKey}" visibility toggled`);
    return updated;
  };

  // 3. Blog Articles
  const saveBlog = async (blogData) => {
    const updated = await cmsService.saveBlog(blogData);
    setCmsBlogs(updated);
    showToast(blogData.id ? 'Blog article updated' : 'New blog article published');
    return updated;
  };

  const deleteBlog = async (id) => {
    const updated = await cmsService.deleteBlog(id);
    setCmsBlogs(updated);
    showToast('Blog article deleted', 'info');
    return updated;
  };

  const toggleBlogPublish = async (id) => {
    const updated = await cmsService.toggleBlogPublish(id);
    setCmsBlogs(updated);
    showToast('Blog publish status toggled');
    return updated;
  };

  // 4. Static Pages
  const updatePage = async (pageKey, pageData) => {
    const updated = await cmsService.updatePage(pageKey, pageData);
    setCmsPages(updated);
    showToast(`Page "${pageKey}" saved`);
    return updated;
  };

  // 5. Reset All CMS Data
  const resetCmsToDefaults = () => {
    const defaults = cmsService.resetToDefaults();
    setCmsHeroSlides(defaults.heroSlides);
    setCmsHomeSections(defaults.homeSections);
    setCmsBlogs(defaults.blogs);
    setCmsPages(defaults.pages);
    showToast('All CMS content reset to default authentic catalog settings', 'info');
  };

  // Dashboard Aggregates & KPIs
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let todayRevenue = 0;
    const todayStr = '2026-09-03';

    const statusCounts = {
      total: orders.length,
      new: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
      returnRequested: 0,
      returned: 0,
      refunded: 0,
    };

    orders.forEach((ord) => {
      const { total } = calculateOrderTotal(ord);
      if (ord.status !== 'Cancelled' && ord.status !== 'Refunded') {
        totalRevenue += total;
        if (ord.date.startsWith(todayStr)) {
          todayRevenue += total;
        }
      }

      switch (ord.status) {
        case 'New': statusCounts.new++; break;
        case 'Confirmed': statusCounts.confirmed++; break;
        case 'Processing': statusCounts.processing++; break;
        case 'Packed': statusCounts.packed++; break;
        case 'Shipped': statusCounts.shipped++; break;
        case 'Out for Delivery': statusCounts.outForDelivery++; break;
        case 'Delivered': statusCounts.delivered++; break;
        case 'Cancelled': statusCounts.cancelled++; break;
        case 'Return Requested': statusCounts.returnRequested++; break;
        case 'Returned': statusCounts.returned++; break;
        case 'Refunded': statusCounts.refunded++; break;
        default: break;
      }
    });

    const lowStockCount = inventory.filter((i) => i.availableStock > 0 && i.availableStock <= i.lowStockThreshold).length;
    const outOfStockCount = inventory.filter((i) => i.availableStock === 0).length;

    return {
      totalRevenue,
      todayRevenue: todayRevenue || 931,
      statusCounts,
      totalCustomers: customers.length,
      lowStockCount,
      outOfStockCount,
      totalProducts: products.length
    };
  }, [orders, inventory, customers, products]);

  // Super Admin Login Handler
  const login = async (email, password, remember = true) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Authorized Super Admin Logins
    const validEmails = [
      'admin@trioenterprises.com',
      'superadmin@trioenterprises.com',
      'admin@trio.com',
      'admin'
    ];
    const validPasswords = [
      'admin@trio2026',
      'admin123',
      'Admin@123',
      'admin',
      'superadmin'
    ];

    const isEmailValid = validEmails.includes(cleanEmail);
    const isPasswordValid = validPasswords.includes(cleanPass);

    if (isEmailValid && isPasswordValid) {
      const userData = {
        name: 'Trio Super Admin',
        email: cleanEmail.includes('@') ? cleanEmail : 'admin@trioenterprises.com',
        role: 'Super Admin',
        avatar: 'SA',
        lastLogin: new Date().toISOString()
      };

      const sessionData = {
        active: true,
        user: userData,
        token: `trio_sa_${Date.now()}`
      };

      if (remember) {
        localStorage.setItem('trio_superadmin_session', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('trio_superadmin_session', JSON.stringify(sessionData));
        localStorage.setItem('trio_superadmin_session', JSON.stringify(sessionData));
      }

      setAdminUser(userData);
      setIsAuthenticated(true);
      showToast('Welcome back, Super Admin! Access granted.', 'success');
      return { success: true };
    } else {
      showToast('Access Denied: Invalid Super Admin credentials.', 'error');
      return {
        success: false,
        error: 'Invalid credentials. Only authorized Super Admin can access.'
      };
    }
  };

  // Super Admin Logout Handler
  const logout = () => {
    try {
      localStorage.removeItem('trio_superadmin_session');
      sessionStorage.removeItem('trio_superadmin_session');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    showToast('Logged out of Super Admin Portal.', 'info');
  };

  return (
    <AdminContext.Provider
      value={{
        // Authentication & Session
        isAuthenticated,
        adminUser,
        login,
        logout,
        // Data
        products,
        categories,
        orders,
        customers,
        coupons,
        payments,
        returns,
        inventory,
        stockLogs,
        stats,

        // CMS Data
        cmsHeroSlides,
        cmsHomeSections,
        cmsBlogs,
        cmsPages,

        // Core Actions
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateOrderStatus,
        bulkUpdateOrderStatus,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        updateReturnStatus,

        // CMS Actions
        saveHeroSlide,
        deleteHeroSlide,
        toggleHeroSlideStatus,
        reorderHeroSlides,
        updateHomeSection,
        toggleSectionVisibility,
        saveBlog,
        deleteBlog,
        toggleBlogPublish,
        updatePage,
        resetCmsToDefaults,

        // UI & Modals & Loading
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        globalSearch,
        setGlobalSearch,
        isLoading,
        setIsLoading,
        isRefreshing,
        refreshData,
        toasts,
        showToast,
        removeToast,
        printDocument,
        setPrintDocument
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
