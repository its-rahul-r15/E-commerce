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
import verifyIndexes from './src/utils/verifyIndexes.js';


dotenv.config();


const app = express();


app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = [
    'https://e-commerce-hack-tau.vercel.app',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(passport.initialize());
configureGoogleOAuth();


app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});


app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'E-Commerce API',
        version: '1.0.0',
    });
});


import authRoutes from './src/routes/authRoutes.js';
import shopRoutes from './src/routes/shopRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        await connectDB();

        await verifyIndexes();

        await connectRedis();


        configureCloudinary();


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


const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);

    await closeRedis();

    await mongoose.connection.close();

    console.log('✅ All connections closed. Exiting...');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export default app;
