/**
 * addressController.js
 * CRUD for saved user addresses
 * All routes protected (auth middleware)
 *
 * User model already has: addresses: [addressSchema]
 * addressSchema: { street, city, state, pincode, isDefault, location (optional) }
 */

import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * GET /api/auth/addresses
 * Returns all saved addresses for the logged-in user
 */
export const getAddresses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('addresses');
        if (!user) return errorResponse(res, 'User not found', 404);
        return successResponse(res, { addresses: user.addresses }, 'Addresses fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/addresses
 * Add a new address (max 5 per user)
 * Body: { street, city, state, pincode, landmark?, isDefault? }
 */
export const addAddress = async (req, res, next) => {
    try {
        const { street, city, state, pincode, landmark, isDefault } = req.body;

        if (!street || !city || !state || !pincode) {
            return errorResponse(res, 'street, city, state and pincode are required', 400);
        }
        if (!/^\d{6}$/.test(pincode)) {
            return errorResponse(res, 'Pincode must be 6 digits', 400);
        }

        const user = await User.findById(req.user.userId);
        if (!user) return errorResponse(res, 'User not found', 404);

        if (user.addresses.length >= 5) {
            return errorResponse(res, 'You can save up to 5 addresses only', 400, 'MAX_ADDRESSES');
        }

        const newAddress = {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            landmark: landmark?.trim() || '',
            isDefault: !!isDefault,
            // location is optional — skip geolocation for now
            location: { type: 'Point', coordinates: [0, 0] },
        };

        // If this is set as default, unset all others
        if (newAddress.isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        // If it's the first address, auto-set as default
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save({ validateBeforeSave: false });

        return successResponse(res, { addresses: user.addresses }, 'Address added', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/auth/addresses/:index
 * Delete address at given index (0-based)
 */
export const deleteAddress = async (req, res, next) => {
    try {
        const idx = parseInt(req.params.index);
        const user = await User.findById(req.user.userId);
        if (!user) return errorResponse(res, 'User not found', 404);

        if (idx < 0 || idx >= user.addresses.length) {
            return errorResponse(res, 'Address not found', 404);
        }

        const wasDefault = user.addresses[idx].isDefault;
        user.addresses.splice(idx, 1);

        // If deleted address was default, make first remaining one default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save({ validateBeforeSave: false });
        return successResponse(res, { addresses: user.addresses }, 'Address deleted');
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/auth/addresses/:index/default
 * Set address at given index as the default
 */
export const setDefaultAddress = async (req, res, next) => {
    try {
        const idx = parseInt(req.params.index);
        const user = await User.findById(req.user.userId);
        if (!user) return errorResponse(res, 'User not found', 404);

        if (idx < 0 || idx >= user.addresses.length) {
            return errorResponse(res, 'Address not found', 404);
        }

        user.addresses.forEach((a, i) => { a.isDefault = (i === idx); });
        await user.save({ validateBeforeSave: false });

        return successResponse(res, { addresses: user.addresses }, 'Default address updated');
    } catch (err) {
        next(err);
    }
};
