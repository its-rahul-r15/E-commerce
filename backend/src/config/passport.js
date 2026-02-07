import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Google OAuth Strategy Configuration
 * Handles Google Sign-In for the e-commerce platform
 */

const configureGoogleOAuth = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Extract user info from Google profile
                    const { id: googleId, emails, displayName, photos } = profile;
                    const email = emails[0].value;
                    const name = displayName;
                    const avatar = photos[0]?.value;

                    // Check if user exists
                    let user = await User.findOne({ email });

                    if (user) {
                        // User exists with this email
                        // Update Google ID if not set
                        if (!user.googleId) {
                            user.googleId = googleId;
                            await user.save();
                        }

                        return done(null, user);
                    }

                    // Create new user with Google data
                    // Generate a random phone number placeholder (they can update later)
                    const randomPhone = `9${Math.floor(Math.random() * 1000000000)}`.padEnd(10, '0');

                    user = await User.create({
                        name,
                        email,
                        googleId,
                        phone: randomPhone, // Placeholder - user should update
                        role: 'customer', // Default role for OAuth users
                        isEmailVerified: true, // Google emails are verified
                        avatar,
                        // No password - OAuth users can't use email/password login
                    });

                    return done(null, user);

                } catch (error) {
                    console.error('Google OAuth error:', error);
                    return done(error, null);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configureGoogleOAuth;
