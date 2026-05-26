import multer from 'multer';
import { AppError } from './errorHandler.js';


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.', 400), false);
    }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});


export const uploadSingle = upload.single('image'); // For single image
export const uploadMultiple = upload.array('images', 5); // For up to 5 images
export const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);

export default upload;
