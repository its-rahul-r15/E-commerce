import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';


export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);

        return successResponse(
            res,
            result,
            'User registered successfully',
            201
        );
    } catch (error) {
        if (error.message.includes('already registered')) {
            return errorResponse(res, error.message, 409, 'USER_EXISTS');
        }
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);

        return successResponse(
            res,
            result,
            'Login successful'
        );
    } catch (error) {
        if (error.message.includes('Invalid email or password')) {
            return errorResponse(res, error.message, 401, 'INVALID_CREDENTIALS');
        }
        if (error.message.includes('blocked')) {
            return errorResponse(res, error.message, 403, 'ACCOUNT_BLOCKED');
        }
        next(error);
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return errorResponse(res, 'Refresh token is required', 400, 'NO_REFRESH_TOKEN');
        }

        const result = await authService.refreshAccessToken(refreshToken);

        return successResponse(
            res,
            result,
            'Token refreshed successfully'
        );
    } catch (error) {
        if (error.message.includes('Invalid or expired')) {
            return errorResponse(res, error.message, 401, 'INVALID_REFRESH_TOKEN');
        }
        next(error);
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
    try {
        await authService.logoutUser(req.user.userId);

        return successResponse(
            res,
            null,
            'Logout successful'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getUserProfile(req.user.userId);

        return successResponse(
            res,
            { user },
            'Profile retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update current user profile
 * PATCH /api/auth/me
 */
export const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateUserProfile(req.user.userId, req.body);

        return successResponse(
            res,
            { user },
            'Profile updated successfully'
        );
    } catch (error) {
        next(error);
    }
};
