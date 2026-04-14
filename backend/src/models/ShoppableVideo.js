import mongoose from 'mongoose';

const shoppableVideoSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ShoppableVideo = mongoose.model('ShoppableVideo', shoppableVideoSchema);

export default ShoppableVideo;
