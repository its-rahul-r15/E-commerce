import passport from 'passport';
import { handleGoogleCallback } from '../services/googleOAuthService.js';
import { successResponse } from '../utils/responseFormatter.js';

/**
 * Google OAuth Controller
 * Handles Google Sign-In endpoints
 */

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
export const googleCallback = async (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
        try {
            if (err || !user) {
                // Redirect to frontend with error
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
            }

            // Generate tokens
            const result = await handleGoogleCallback(user);

            // Redirect to frontend with tokens in query params (or use different method)
            // Option 1: Redirect with tokens in URL (less secure but simple)
            const queryParams = new URLSearchParams({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${queryParams}`);

            // Option 2: Set tokens in httpOnly cookies (more secure)
            // res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true });
            // res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true });
            // return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

        } catch (error) {
            next(error);
        }
    })(req, res, next);
};
