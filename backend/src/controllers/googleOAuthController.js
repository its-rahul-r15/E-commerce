import passport from 'passport';
import { handleGoogleCallback } from '../services/googleOAuthService.js';
import { successResponse } from '../utils/responseFormatter.js';


export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});


export const googleCallback = async (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
        try {
            if (err || !user) {
                console.error('Google Auth Error:', err);
                const errorMessage = err?.message || 'Authentication failed';
                // Redirect to frontend with error
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`);
            }

            // Generate tokens
            const result = await handleGoogleCallback(user);

           
            const queryParams = new URLSearchParams({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${queryParams}`);

            

        } catch (error) {
            next(error);
        }
    })(req, res, next);
};
