import { verifyAccessToken } from '../utils/tokenUtils.js';
import { errorResponse } from '../utils/responseFormatter.js';
import User from '../models/User.js';



const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided', 401, 'NO_TOKEN');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            return errorResponse(res, error.message, 401, 'INVALID_TOKEN');
        }

        // Check if user still exists and is not blocked
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 401, 'USER_NOT_FOUND');
        }

        if (user.isBlocked) {
            return errorResponse(
                res,
                'Your account has been blocked. Please contact support.',
                403,
                'ACCOUNT_BLOCKED'
            );
        }

        // Attach user info to request
        req.user = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            name: user.name,
        };

        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return errorResponse(res, 'Authentication failed', 500);
    }
};

export default auth;
