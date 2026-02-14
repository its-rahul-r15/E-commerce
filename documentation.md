# ShopLocal E-Commerce Platform - Complete Documentation

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-ISC-green)

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Installation & Setup](#installation--setup)
6. [User Roles](#user-roles)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Valentine's Day Theme](#valentines-day-theme)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**ShopLocal** is a full-stack e-commerce platform with Valentine's Day theme that connects local shops with customers. The platform enables sellers to manage their shops and products, while customers can browse, compare prices, and purchase products from nearby stores.

### Key Highlights
- 🛍️ Multi-vendor marketplace
- 📍 Location-based shop discovery (within 5km radius)
- 💝 Valentine's Day themed UI
- 🎁 Real-time coupon system
- 💳 Integrated payment gateway (Razorpay)
- 🔐 Secure authentication (JWT + Google OAuth)
- ⚡ Redis caching for performance
- 📱 Responsive design

---

## ✨ Features

### For Customers
- Browse products from nearby shops
- Search and filter products by category
- Compare products from different sellers
- Add products to cart and wishlist
- Apply discount coupons
- Place orders with multiple payment options
- Track order status
- View order history
- Rate and review products

### For Sellers
- Create and manage shop profile
- Add/Edit/Delete products
- Upload multiple product images
- Manage inventory
- View and process orders
- Create shop-specific coupons
- View sales analytics
- Manage shop location

### For Admins
- Manage all users (customers, sellers)
- Approve/Reject shop registrations
- Ban/Unban products
- Block/Unblock users
- Create platform-wide coupons
- View platform statistics
- Monitor all orders

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.13.0
- **Styling**: Tailwind CSS 3.4.0
- **Icons**: Heroicons 2.2.0
- **HTTP Client**: Axios 1.13.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB (Mongoose 8.9.5)
- **Caching**: Redis 5.10.0
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Password Hashing**: bcryptjs 2.4.3
- **File Upload**: Multer 2.0.2 + Cloudinary 2.9.0
- **Payment**: Razorpay 2.9.6
- **Security**: Helmet 8.0.0, CORS
- **Compression**: compression 1.7.4
- **Validation**: express-validator 7.2.1

---

## 🏗️ Architecture

```
E-Commerce Hackthon/
├── backend/
│   ├── server.js                 # Entry point
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── cloudinary.js
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── redis.js
│   │   ├── controllers/         # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── shopController.js
│   │   │   ├── orderController.js
│   │   │   ├── couponController.js
│   │   │   └── adminController.js
│   │   ├── middlewares/         # Custom middlewares
│   │   │   ├── auth.js
│   │   │   ├── authorize.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Shop.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Cart.js
│   │   │   ├── Coupon.js
│   │   │   └── Review.js
│   │   ├── routes/              # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── shopRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── couponRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/            # Business logic
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── shopService.js
│   │   │   ├── orderService.js
│   │   │   ├── couponService.js
│   │   │   └── adminService.js
│   │   └── utils/               # Utility functions
│   │       └── cloudinaryUpload.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── ImageUpload.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── customer/        # Customer-specific
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ShopCard.jsx
│   │   │   │   └── CouponBanner.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── ProductDetails.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   └── Shops.jsx
│   │   │   ├── seller/
│   │   │   │   ├── SellerDashboard.jsx
│   │   │   │   ├── SellerProducts.jsx
│   │   │   │   └── SellerOrders.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ShopsManagement.jsx
│   │   │   │   └── UsersManagement.jsx
│   │   │   └── auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── utils/
│   │   │   └── axios.js         # Axios configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── documentation.md             # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Redis server
- Cloudinary account
- Razorpay account
- Google OAuth credentials (optional)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/shoplocal
   # or MongoDB Atlas
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shoplocal

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Run the backend**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (if needed)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```
   App will run on `http://localhost:5173`

---

## 👥 User Roles

### 1. Customer
**Capabilities:**
- Browse and search products
- View product details and reviews
- Add products to cart
- Apply coupon codes
- Place orders
- Track orders
- Manage profile

**Access:** `/`, `/products`, `/cart`, `/checkout`, `/orders`

### 2. Seller
**Capabilities:**
- All customer capabilities
- Create and manage shop
- Add/edit/delete products
- Upload product images
- View and manage orders
- Create shop-specific coupons
- View sales analytics

**Access:** `/seller/dashboard`, `/seller/products`, `/seller/orders`

### 3. Admin
**Capabilities:**
- View all platform statistics
- Manage users (block/unblock)
- Approve/reject shops
- Ban/unban products
- Create platform-wide coupons
- View all orders

**Access:** `/admin/dashboard`, `/admin/users`, `/admin/shops`

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
GET /auth/google
GET /auth/google/callback
```

### Product Endpoints

#### Get All Products
```http
GET /products?category=Electronics&minPrice=100&maxPrice=5000
```

#### Get Product Details
```http
GET /products/:id
```

#### Create Product (Seller only)
```http
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Description",
  "price": 999,
  "category": "Electronics",
  "stock": 50,
  "images": [files]
}
```

#### Get Product Comparisons
```http
GET /products/:id/comparisons
```

### Shop Endpoints

#### Get All Shops
```http
GET /shops
```

#### Get Nearby Shops
```http
GET /shops/nearby?lat=28.6139&lon=77.2090&radius=5
```

#### Create Shop (Seller only)
```http
POST /shops
Authorization: Bearer <token>

{
  "shopName": "My Shop",
  "description": "Shop description",
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  },
  "address": "123 Main St, New Delhi"
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <token>

{
  "items": [...],
  "deliveryAddress": {...},
  "paymentMethod": "razorpay",
  "couponCode": "LOVE50"
}
```

#### Get My Orders
```http
GET /orders/my-orders
Authorization: Bearer <token>
```

#### Update Order Status (Seller)
```http
PATCH /orders/:id/status
Authorization: Bearer <token>

{
  "status": "shipped"
}
```

### Coupon Endpoints

#### Get Active Coupons
```http
GET /coupons/active
```

#### Validate Coupon
```http
POST /coupons/validate

{
  "code": "LOVE50",
  "amount": 1000,
  "shopId": "shop_id_here"
}
```

#### Create Coupon (Seller/Admin)
```http
POST /coupons
Authorization: Bearer <token>

{
  "code": "LOVE50",
  "discountType": "percentage",
  "discountValue": 50,
  "minPurchase": 500,
  "expiryDate": "2026-02-28",
  "usageLimit": 100
}
```

### Cart Endpoints

#### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>

{
  "productId": "product_id",
  "quantity": 2
}
```

#### Update Cart Item
```http
PATCH /cart/update
Authorization: Bearer <token>

{
  "productId": "product_id",
  "quantity": 5
}
```

#### Remove from Cart
```http
DELETE /cart/remove/:productId
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Platform Stats
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

#### Approve Shop
```http
PATCH /admin/shops/:id/approve
Authorization: Bearer <admin_token>
```

#### Block User
```http
PATCH /admin/users/:id/block
Authorization: Bearer <admin_token>
```

#### Ban Product
```http
PATCH /admin/products/:id/ban
Authorization: Bearer <admin_token>
```

---

## 💾 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['customer', 'seller', 'admin'],
  phone: String,
  profilePicture: String,
  googleId: String,
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Shop Model
```javascript
{
  shopName: String,
  sellerId: ObjectId (ref: User),
  description: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  address: String,
  phone: String,
  logo: String,
  banner: String,
  rating: Number,
  totalReviews: Number,
  isApproved: Boolean,
  isBlocked: Boolean,
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountedPrice: Number,
  category: String,
  subcategory: String,
  brand: String,
  images: [String],
  stock: Number,
  shopId: ObjectId (ref: Shop),
  specifications: Object,
  rating: Number,
  numReviews: Number,
  isAvailable: Boolean,
  isBanned: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    shopId: ObjectId (ref: Shop),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  deliveryAddress: Object,
  paymentMethod: String,
  paymentStatus: Enum ['pending', 'completed', 'failed'],
  orderStatus: Enum ['pending', 'confirmed', 'shipped', 'delivered'],
  couponCode: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: Date
}
```

### Coupon Model
```javascript
{
  code: String (unique),
  discountType: Enum ['percentage', 'fixed'],
  discountValue: Number,
  minPurchase: Number,
  expiryDate: Date,
  usageLimit: Number,
  usedCount: Number,
  shopId: ObjectId (ref: Shop, optional),
  isActive: Boolean,
  createdAt: Date
}
```

### Cart Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    addedAt: Date
  }],
  updatedAt: Date
}
```

---

## 💝 Valentine's Day Theme

### Design Overview
The entire platform features a beautiful Valentine's Day theme with romantic colors, animations, and design elements.

### Color Palette
```css
/* Primary Colors */
--rose-50: #fff1f2
--rose-400: #fb7185
--rose-500: #f43f5e
--rose-600: #e11d48

--pink-50: #fdf2f8
--pink-400: #f472b6
--pink-500: #ec4899
--pink-600: #db2777

--red-50: #fef2f2
--red-500: #ef4444
--red-600: #dc2626
```

### Key UI Features

#### 1. Navbar
- Rose/pink gradient background
- Heart icon logo with gradient
- Valentine's themed search placeholder
- Heart decorations on hover
- Rose-colored badges and notifications
- Gradient Login button with heart icon

#### 2. Homepage
- **Hero Section**: Romantic gradient background with coupon codes
- **Floating Hearts**: 15 animated hearts across the screen
- **Gift Categories**: 6 interactive categories with gradient backgrounds
- **Valentine's Sale Banner**: Countdown timer with promotional messaging
- **Product Cards**: Rose/pink accents with heart wishlist buttons

#### 3. Real Coupon Integration
- **Dynamic fetching** from database
- **Smart emoji mapping**:
  - 💖 for 50%+ discounts
  - 💝 for percentage discounts
  - 🎁 for fixed discounts
- **Click-to-copy** functionality
- **Top 3 active coupons** displayed

#### 4. Animations
```css
/* Floating Hearts */
@keyframes float-heart {
  0% { transform: translateY(100vh) rotate(0deg); }
  100% { transform: translateY(-100vh) rotate(360deg); }
}

/* Pulse Effect */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### 5. Valentine's Emojis Used
- 💝 Hearts (various styles)
- 🎁 Gifts
- 💐 Flowers
- 🍫 Chocolates
- 💍 Jewelry
- 💌 Love letters
- 💖 Sparkling hearts

---

## 🚢 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Environment Variables**: Set all `.env` variables in your hosting platform
2. **MongoDB**: Use MongoDB Atlas for production
3. **Redis**: Use Redis Cloud or hosting with Redis support
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**: Set `VITE_API_URL` to your backend URL
4. **Routing**: Configure rewrites for SPA routing

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origins
- [ ] Enable rate limiting
- [ ] Configure Redis for caching
- [ ] Set up SSL certificates
- [ ] Configure Cloudinary for image optimization
- [ ] Set up payment webhooks (Razorpay)
- [ ] Enable compression
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB

---

## 📞 Support

For issues and queries:
- Email: support@shoplocal.com
- GitHub: [Project Repository]

---

## 📄 License

ISC License

---

**Last Updated**: February 14, 2026
**Version**: 1.0.0
**Author**: Rahul Sharma
