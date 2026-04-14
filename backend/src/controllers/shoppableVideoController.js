import mongoose from 'mongoose';
import ShoppableVideo from '../models/ShoppableVideo.js';
import { uploadVideoToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';

export const createVideo = async (req, res) => {
    try {
        const { title, products } = req.body;
        let videoUrl = req.body.videoUrl;

        // Validation for title
        if (!title) {
            return errorResponse(res, 'Title is required', 400);
        }

        // Handle video upload if file is provided
        if (req.files && req.files.video && req.files.video[0]) {
            videoUrl = await uploadVideoToCloudinary(req.files.video[0].buffer, 'shoppable_videos');
        }

        if (!videoUrl) {
            return errorResponse(res, 'Video URL or file is required', 400);
        }

        // Parse products if it's sent as a stringified array from FormData
        let parsedProducts = [];
        if (products) {
            try {
                parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
            } catch (e) {
                // If it fails to parse but is comma separated string
                if (typeof products === 'string' && products.includes(',')) {
                    parsedProducts = products.split(',');
                } else if (typeof products === 'string') {
                    parsedProducts = [products];
                }
            }
        }

        const newVideo = await ShoppableVideo.create({
            title,
            videoUrl,
            products: parsedProducts,
            isActive: true
        });

        return successResponse(res, newVideo, 'Video created successfully', 201);
    } catch (error) {
        console.error('Error creating shoppable video:', error);
        return errorResponse(res, 'Failed to create shoppable video', 500);
    }
};

export const getVideos = async (req, res) => {
    try {
        const videos = await ShoppableVideo.find({ isActive: true })
            .populate('products', 'name price discountedPrice description images')
            .sort({ createdAt: -1 });

        return successResponse(res, videos, 'Videos retrieved successfully', 200);
    } catch (error) {
        console.error('Error fetching shoppable videos:', error);
        return errorResponse(res, 'Failed to fetch shoppable videos', 500);
    }
};

export const getAdminVideos = async (req, res) => {
    try {
        const videos = await ShoppableVideo.find()
            .populate('products', 'name price discountedPrice description images')
            .sort({ createdAt: -1 });

        return successResponse(res, videos, 'Videos retrieved successfully', 200);
    } catch (error) {
        console.error('Error fetching admin shoppable videos:', error);
        return errorResponse(res, 'Failed to fetch shoppable videos', 500);
    }
};

export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, isActive, products } = req.body;
        let videoUrl = req.body.videoUrl;

        const video = await ShoppableVideo.findById(id);
        if (!video) {
            return errorResponse(res, 404, 'Video not found');
        }

        // Handle new video upload
        if (req.files && req.files.video && req.files.video[0]) {
            // Delete old video from cloudinary if it's a cloudinary URL
            if (video.videoUrl && video.videoUrl.includes('cloudinary')) {
                await deleteFromCloudinary(video.videoUrl);
            }
            videoUrl = await uploadVideoToCloudinary(req.files.video[0].buffer, 'shoppable_videos');
        }

        // Parse products if sent as string
        let parsedProducts = video.products;
        if (products !== undefined) {
             try {
                parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
            } catch (e) {
                if (typeof products === 'string' && products.includes(',')) {
                    parsedProducts = products.split(',');
                } else if (typeof products === 'string') {
                    parsedProducts = [products];
                }
            }
        }

        video.title = title || video.title;
        if (videoUrl) video.videoUrl = videoUrl;
        if (isActive !== undefined) video.isActive = isActive;
        if (products !== undefined) video.products = parsedProducts;

        await video.save();

        const updatedVideo = await ShoppableVideo.findById(id).populate('products', 'name price discountedPrice description images');
        return successResponse(res, updatedVideo, 'Video updated successfully', 200);
    } catch (error) {
        console.error('Error updating shoppable video:', error);
        return errorResponse(res, 'Failed to update shoppable video', 500);
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await ShoppableVideo.findById(id);
        if (!video) {
            return errorResponse(res, 404, 'Video not found');
        }

        if (video.videoUrl && video.videoUrl.includes('cloudinary')) {
            await deleteFromCloudinary(video.videoUrl);
        }

        await ShoppableVideo.findByIdAndDelete(id);

        return successResponse(res, null, 'Video deleted successfully', 200);
    } catch (error) {
        console.error('Error deleting shoppable video:', error);
        return errorResponse(res, 'Failed to delete shoppable video', 500);
    }
};
