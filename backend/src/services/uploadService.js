import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Upload Service
 * Handles image uploads to Cloudinary
 */

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name (e.g., 'products', 'shops')
 * @param {String} publicId - Optional custom public_id
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadImage = (fileBuffer, folder = 'ecommerce', publicId = null) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
                { quality: 'auto' }, // Auto quality optimization
                { fetch_format: 'auto' } // Auto format (WebP when supported)
            ]
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(new AppError('Failed to upload image to Cloudinary', 500));
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format
                    });
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, folder = 'ecommerce') => {
    const uploadPromises = files.map(file => uploadImage(file.buffer, folder));
    return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new AppError('Failed to delete image from Cloudinary', 500);
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @returns {Promise<Array>} Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    return Promise.all(deletePromises);
};
