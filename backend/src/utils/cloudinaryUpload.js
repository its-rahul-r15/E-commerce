import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Cloudinary Upload Utilities
 * Helper functions for uploading images to Cloudinary
 */

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    },
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadToCloudinary = (buffer, folder = 'shops') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, crop: 'limit' }, // Max width 1000px
                    { quality: 'auto' }, // Auto quality optimization
                    { fetch_format: 'auto' }, // Auto format (WebP if supported)
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
    });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Object>} files - Multer files array
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array<string>>} Array of Cloudinary URLs
 */
export const uploadMultipleImages = async (files, folder = 'shops') => {
    const uploadPromises = files.map((file) =>
        uploadToCloudinary(file.buffer, folder)
    );

    return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (imageUrl) => {
    try {
        // Extract public ID from URL
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts[parts.length - 2];

        await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Don't throw - deletion failure shouldn't break the app
    }
};
