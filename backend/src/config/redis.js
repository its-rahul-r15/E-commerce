import { createClient } from 'redis';

/**
 * Redis Client Configuration
 * Used for caching, session management, and rate limiting
 */

let redisClient = null;

const connectRedis = async () => {
    try {
        // Build Redis config
        const redisConfig = {
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT) || 6379,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Redis: Max reconnection attempts reached');
                        return new Error('Redis reconnection failed');
                    }
                    console.log('⚠️  Redis reconnecting...');
                    // Exponential backoff: 100ms, 200ms, 400ms, etc.
                    return Math.min(retries * 100, 3000);
                },
            },
        };

        // Only add password if it exists and is not empty
        if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
            redisConfig.password = process.env.REDIS_PASSWORD;
        }

        // Create Redis client
        redisClient = createClient(redisConfig);

        // Event listeners
        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('🔄 Connecting to Redis...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis Connected & Ready');
        });

        redisClient.on('reconnecting', () => {
            console.log('⚠️  Redis reconnecting...');
        });

        // Connect to Redis
        await redisClient.connect();

        return redisClient;

    } catch (error) {
        console.error('❌ Redis connection error:', error.message);
        console.warn('⚠️  Application will continue without Redis caching');
        // Don't exit - app can run without Redis, just without caching
        return null;
    }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
    if (!redisClient || !redisClient.isOpen) {
        console.warn('⚠️  Redis client not available');
        return null;
    }
    return redisClient;
};

/**
 * Graceful shutdown
 */
const closeRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log('✅ Redis connection closed');
    }
};

export { connectRedis, getRedisClient, closeRedis };
