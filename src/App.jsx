import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext.jsx';
import { Layout } from './components/layout/Layout.jsx';

// Core Pages
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

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
