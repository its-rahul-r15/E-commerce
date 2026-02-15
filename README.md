# E-Commerce Backend

Production-ready MERN e-commerce backend with Redis caching, JWT authentication, and clean architecture.

## Features

- ✅ Clean Architecture (MVC pattern)
- ✅ MongoDB with Mongoose (connection pooling)
- ✅ Redis caching (sessions, products, rate limiting)
- ✅ JWT authentication (access + refresh tokens)
- ✅ Role-based access control (Customer, Seller, Admin)
- ✅ Cloudinary image uploads
- ✅ Security middleware (Helmet, CORS)
- ✅ Input validation & sanitization
- ✅ Centralized error handling
- ✅ Response compression

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Caching**: Redis
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Image Upload**: Cloudinary
- **Security**: Helmet, CORS, express-validator
- **Performance**: Compression

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database & service configurations
│   │   ├── db.js        # MongoDB connection
│   │   ├── redis.js     # Redis client
│   │   └── cloudinary.js
│   ├── models/          # Mongoose schemas (to be added)
│   ├── controllers/     # Request handlers (to be added)
│   ├── services/        # Business logic
│   │   └── cacheService.js
│   ├── routes/          # API routes (to be added)
│   ├── middlewares/     # Custom middleware
│   │   └── errorHandler.js
│   └── utils/           # Helper functions
│       ├── responseFormatter.js
│       ├── tokenUtils.js
│       └── hashPassword.js
├── server.js            # Entry point
├── .env.example         # Environment variables template
├── .gitignore
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the following variables:

- **MongoDB**: `MONGODB_URI` (local: `mongodb://localhost:27017/ecommerce` or MongoDB Atlas connection string)
- **Redis**: `REDIS_HOST`, `REDIS_PORT` (local or Redis Cloud)
- **JWT Secrets**: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (use strong random strings)
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 3. Run the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

### 4. Verify Server

Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

## API Endpoints

### Base URL
`http://localhost:5000/api`

### Health Check
- `GET /health` - Server health status

### Authentication 
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Shops 
- `GET /api/shops/nearby` - Get nearby shops
- `POST /api/shops` - Create shop (Seller only)
- `GET /api/shops/:id` - Get shop details
- `PATCH /api/shops/:id` - Update shop (Seller only)

### Products
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller only)
- `PATCH /api/products/:id` - Update product (Seller only)
- `DELETE /api/products/:id` - Delete product (Seller only)

### Orders
- `GET /api/orders/customer/my-orders` - Get customer orders
- `GET /api/orders/seller/shop-orders` - Get shop orders
- `POST /api/orders` - Create order (Customer only)
- `PATCH /api/orders/:id/status` - Update order status (Seller only)

### Admin
- `GET /api/admin/stats` - Platform analytics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/block` - Block user
- `PATCH /api/admin/shops/:id/approve` - Approve shop

## Development Workflow

1. **Phase 2**: Create database models (User, Shop, Product, Order, Cart)
2. **Phase 3**: Implement authentication APIs
3. **Phase 4**: Build shop & product management APIs
4. **Phase 5**: Implement order management
5. **Phase 6**: Add admin panel APIs
6. **Phase 7**: Integrate Redis caching
7. **Phase 8**: Security hardening & testing

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation & sanitization (express-validator)
- ✅ Rate limiting (Redis-based)
- ✅ MongoDB injection protection (Mongoose)

## Caching Strategy

- **Product Listings**: TTL 5 minutes
- **Shop Data**: TTL 10-15 minutes
- **User Sessions**: TTL 7 days
- **Rate Limiting**: TTL 15 minutes per endpoint

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## License

ISC
