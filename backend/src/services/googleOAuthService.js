import { generateTokenPair } from '../utils/tokenUtils.js';
import { setCache } from './cacheService.js';


/**
 * Handle Google OAuth callback
 * @param {Object} user - User object from Passport strategy
 * @returns {Object} User and tokens
 */
export const handleGoogleCallback = async (user) => {
    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token in Redis (7 days TTL)
    await setCache(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

    return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
    };
};
