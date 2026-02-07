import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/tokenUtils.js';
import { setCache, getCache, deleteCache } from './cacheService.js';

/**
 * Authentication Service
 * Business logic for user authentication
 */

/**
 * Register a new user
 * @param {Object} userData - User data (name, email, password, phone, role)
 * @returns {Promise<Object>} User object and tokens
 */
export const registerUser = async (userData) => {
    const { name, email, password, phone, role = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Check phone uniqueness
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
        throw new Error('Phone number already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: role === 'admin' ? 'customer' : role, // Prevent admin registration via API
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token in Redis (7 days TTL)
    await setCache(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

    // Return user without password
    const userResponse = user.toJSON();

    return {
        user: userResponse,
        accessToken,
        refreshToken,
    };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object and tokens
 */
export const loginUser = async (email, password) => {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Check if user is blocked
    if (user.isBlocked) {
        throw new Error('Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token in Redis
    await setCache(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

    // Return user without password
    const userResponse = user.toJSON();

    return {
        user: userResponse,
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = async (refreshToken) => {
    // Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in Redis (hasn't been invalidated)
    const storedToken = await getCache(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
        throw new Error('Refresh token has been invalidated');
    }

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.isBlocked) {
        throw new Error('Account has been blocked');
    }

    // Generate new access token only
    const { accessToken } = generateTokenPair(user);

    return { accessToken };
};

/**
 * Logout user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const logoutUser = async (userId) => {
    // Delete refresh token from Redis
    await deleteCache(`refresh_token:${userId}`);
    return true;
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return user.toJSON();
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserProfile = async (userId, updates) => {
    // Prevent updating sensitive fields
    const allowedUpdates = ['name', 'phone'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new Error('User not found');
    }

    return user.toJSON();
};
