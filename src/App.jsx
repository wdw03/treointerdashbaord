import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

// Auth Page
import { Login } from './pages/Login.jsx';

// Core Operations Pages
import { Dashboard } from './pages/Dashboard.jsx';
import { Orders } from './pages/Orders.jsx';
import { Shipping } from './pages/Shipping.jsx';
import { Products } from './pages/Products.jsx';
import { Inventory } from './pages/Inventory.jsx';
import { Categories } from './pages/Categories.jsx';
import { Customers } from './pages/Customers.jsx';
import { Payments } from './pages/Payments.jsx';
import { Returns } from './pages/Returns.jsx';
import { Coupons } from './pages/Coupons.jsx';
import { Reports } from './pages/Reports.jsx';
import { Settings } from './pages/Settings.jsx';

// CMS Pages
import { HomePageCms } from './pages/cms/HomePageCms.jsx';
import { BlogManagementCms } from './pages/cms/BlogManagementCms.jsx';
import { StaticPagesCms } from './pages/cms/StaticPagesCms.jsx';

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Super Admin Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Management Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Core Operations */}
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="categories" element={<Categories />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="returns" element={<Returns />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            {/* Storefront CMS */}
            <Route path="cms" element={<Navigate to="/cms/home" replace />} />
            <Route path="cms/home" element={<HomePageCms />} />
            <Route path="cms/blogs" element={<BlogManagementCms />} />
            <Route path="cms/pages" element={<StaticPagesCms />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
