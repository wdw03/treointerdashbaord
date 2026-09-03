# Trio Ecart — Premium E-Commerce Admin Dashboard

A luxury, production-grade E-Commerce Admin Dashboard built specifically for **Trio Ecart** (Trieotech Enterprise) — an authentic Indian craft & lifestyle store selling handmade decorative patches, silk & pollen flowers, pure copper Ayurvedic bottles, cotton gamchas, rhinestone cup chains, and festive pooja decor.

---

## ✨ Features

- **Grounded in Authentic Catalog**: All 43 real products and 9 categories directly mapped with complete attributes, color variants, specs, and features.
- **164 High-Res Product Photos**: Authentic multi-angle product photography with interactive HD Lightbox (`ImageLightbox`) and color-switch photo synchronization.
- **Comprehensive Orders Management**: 12 order status tabs with count badges, visual 5-step delivery timeline, and bulk dispatch actions.
- **Invoicing & Print Suite**: One-click generation of Tax Invoices (GST-compliant), Packing Slips (with item check-off), and Courier Shipping Labels (with simulated AWB barcode).
- **Logistics & Courier Tracking**: Performance tracking for BlueDart, Delhivery, Xpressbees, and DTDC with delivery attempt logging and sorting hub checkpoints.
- **Inventory & Variant Tracking**: Total stock, available stock, committed orders stock, expandable color variant levels, and an audit adjustment log.
- **Visual Analytics**: Interactive Recharts Area & Bar charts for monthly revenue, order volume, and category sales share.
- **Promotions & Coupons**: Create percentage, flat cash, and free shipping codes with redemption analytics.
- **Pure React JSX**: Built with Vite 5, Tailwind CSS v3, Recharts, Lucide React, and GSAP. 100% frontend with in-memory React Context state.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
dahsbaord/
├── public/
│   └── products/           # 164 authentic high-res product photos
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, Layout
│   │   └── ui/             # ProductImage, ImageLightbox, ProductGalleryPreview, PrintModal, ToastContainer
│   ├── context/            # AdminContext (Centralized state & CRUD operations)
│   ├── data/               # Authentic products.js, categories.js, mock orders, customers, coupons, inventory, payments, returns
│   ├── pages/              # 12 Core Pages: Dashboard, Orders, Shipping, Products, Inventory, Categories, Customers, Payments, Returns, Coupons, Reports, Settings
│   ├── App.jsx             # React Router routing
│   ├── index.css           # Tailwind CSS design system
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🛠 Tech Stack

- **React 18** (JSX)
- **Vite 5**
- **Tailwind CSS 3**
- **Recharts**
- **Lucide Icons**
- **GSAP 3**
