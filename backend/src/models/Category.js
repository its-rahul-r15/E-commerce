import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    subCategories: [{
        type: String,
        trim: true
    }],
    filters: [{
        name: { type: String, trim: true, required: true },
        options: [{ type: String, trim: true }]
    }]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
