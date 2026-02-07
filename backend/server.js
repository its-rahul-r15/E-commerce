import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import passport from 'passport';
import connectDB from './src/config/db.js';
import { connectRedis, closeRedis } from './src/config/redis.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import configureGoogleOAuth from './src/config/passport.js';
import errorHandler from './src/middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(compression()); // Response compression
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Passport initialization
app.use(passport.initialize());
configureGoogleOAuth();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes (will be added as we build)
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'E-Commerce API',
        version: '1.0.0',
    });
});

// API Routes
import authRoutes from './src/routes/authRoutes.js';
import shopRoutes from './src/routes/shopRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Future route imports will go here:
// import shopRoutes from './src/routes/shopRoutes.js';
// import productRoutes from './src/routes/productRoutes.js';
// import orderRoutes from './src/routes/orderRoutes.js';
// import adminRoutes from './src/routes/adminRoutes.js';

// Mount routes:
// app.use('/api/shops', shopRoutes);
// import productRoutes from './src/routes/productRoutes.js';
// app.use('/api/orders', orderRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Server Configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis (optional - app continues without it)
        await connectRedis();

        // Configure Cloudinary
        configureCloudinary();

        // Start listening
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);

    // Close Redis connection
    await closeRedis();

    // Close MongoDB connection
    await mongoose.connection.close();

    console.log('✅ All connections closed. Exiting...');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default app;
