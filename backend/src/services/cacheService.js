import { getRedisClient } from '../config/redis.js';

/**
 * Cache Service
 * Abstraction layer for Redis caching operations
 */

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<*>} Cached value or null
 */
export const getCache = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const data = await client.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (parseError) {
            console.warn(`Failed to parse cached data for key ${key}`);
            return null;
        }
    } catch (error) {
        console.error(`Cache get error for key ${key}:`, error.message);
        return null;
    }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Promise<boolean>} Success status
 */
export const setCache = async (key, value, ttl = 300) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.setEx(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Cache set error for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export const deleteCache = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        await client.del(key);
        return true;
    } catch (error) {
        console.error(`Cache delete error for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Pattern to match (e.g., "products:*")
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const client = getRedisClient();
        if (!client) return 0;

        const keys = await client.keys(pattern);
        if (keys.length === 0) return 0;

        await client.del(keys);
        return keys.length;
    } catch (error) {
        console.error(`Cache pattern delete error for pattern ${pattern}:`, error.message);
        return 0;
    }
};

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Existence status
 */
export const cacheExists = async (key) => {
    try {
        const client = getRedisClient();
        if (!client) return false;

        const exists = await client.exists(key);
        return exists === 1;
    } catch (error) {
        console.error(`Cache exists error for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Increment counter in cache (for rate limiting)
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live if key doesn't exist
 * @returns {Promise<number>} New count value
 */
export const incrementCache = async (key, ttl = 900) => {
    try {
        const client = getRedisClient();
        if (!client) return 0;

        const count = await client.incr(key);

        // Set expiry only if this is the first increment
        if (count === 1) {
            await client.expire(key, ttl);
        }

        return count;
    } catch (error) {
        console.error(`Cache increment error for key ${key}:`, error.message);
        return 0;
    }
};
