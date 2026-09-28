# E-Commerce Store with Admin Dashboard

A full-stack e-commerce web application with customer storefront and administrative management panel, built with React, Vite, Express, and SQLite.

---

## 🚀 Features

### Customer Storefront
- **Product Catalog**: Browse and filter products by category.
- **Product Details**: Detailed view with stock availability and high-resolution images.
- **Cart & Checkout**: Real-time cart management, dynamic quantity updates, and simulated checkout flow.
- **Authentication**: User registration and login powered by JWT and bcrypt password hashing.
- **User Profile & Orders**: View profile details and order history.

### Admin Dashboard
- **Product Management**: Create, edit, and delete products with image URLs, categories, and stock tracking.
- **Order Management**: View incoming orders, track statuses, and manage customer shipments.
- **Role-based Access Control**: Protected routes and API middleware ensuring only administrators can access management tools.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router 7, Lucide Icons, Pure CSS
- **Backend**: Node.js, Express.js, SQLite3 (`sqlite3`), JSON Web Tokens (JWT), bcryptjs, CORS
- **Database**: SQLite (auto-initialized and seeded on first run)

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server (runs on http://localhost:5000)
npm run dev
# or
npm start
```

*Note: The SQLite database (`ecommerce.db`) will automatically initialize with tables and dummy products on the first run.*

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Default Credentials

### Admin Account
- **Email**: `admin@ecom.com`
- **Password**: `adminpassword`

---

## 📂 Project Structure

```text
ecom-store-with-admin/
├── backend/
│   ├── middleware/
│   │   └── auth.js         # JWT verification & role authorization
│   ├── database.js         # SQLite connection, schema setup & seed data
│   ├── server.js           # REST API endpoints (auth, products, orders)
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Navbar, Footer, ProductCard, etc.
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── pages/          # Home, Products, Cart, Checkout, Profile, Login
│   │   │   └── admin/      # Dashboard, ManageProducts, ManageOrders
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```