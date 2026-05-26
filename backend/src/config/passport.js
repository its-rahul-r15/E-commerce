import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configureGoogleOAuth = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error(' Missing GOOGLE_CLIENT_ID or secret. Google OAuth is disabled.');
        return;
    }

    try {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
                    scope: ['profile', 'email'],
                    proxy: true, // Enable proxy for Vercel/Heroku
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
                        
                        if (!user.googleId) {
                            user.googleId = googleId;
                            await user.save();
                        }

                        return done(null, user);
                    }

                   
                    user = await User.create({
                        name,
                        email,
                        googleId,
                        phone: null, // No phone needed for OAuth
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
    } catch (err) {
        console.error('⚠️  Failed to initialize Google Strategy:', err.message);
    }

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    
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
