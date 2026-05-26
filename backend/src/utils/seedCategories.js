import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
    {
        name: 'Kurta',
        subCategories: ['Anarkali Kurti', 'Straight Kurti', 'A-Line Kurti', 'Short Kurti', 'Cotton Kurti', 'Georgette Kurti']
    },
    {
        name: 'Saree',
        subCategories: ['Banarasi Silk', 'Kanjeevaram Silk', 'Chiffon Saree', 'Georgette Saree', 'Cotton Saree', 'Organza Saree', 'Linen Saree']
    },
    {
        name: 'Lehenga',
        subCategories: ['Bridal Lehenga', 'Party Wear Lehenga', 'Floral Lehenga', 'Jacket Lehenga', 'Crop Top Lehenga']
    },
    {
        name: 'Salwar Suit',
        subCategories: ['Anarkali Suit', 'Punjabi Patiala Suit', 'Palazzo Suit', 'Sharara Suit', 'Straight Suit']
    },
    {
        name: 'Dupatta',
        subCategories: ['Banarasi Dupatta', 'Phulkari Dupatta', 'Bandhani Dupatta', 'Net Dupatta', 'Chiffon Dupatta']
    },
    {
        name: 'Sherwani',
        subCategories: ['Classic Sherwani', 'Indo-Western Sherwani', 'Jodhpuri Sherwani', 'Achkan Sherwani']
    },
    {
        name: 'Ethnic Wear',
        subCategories: ['Dhoti Pants', 'Palazzo', 'Churidar', 'Nehru Jacket', 'Kurta Pajama Set']
    },
    {
        name: 'Western Wear',
        subCategories: ['Dress', 'Top', 'Shirt', 'Trouser', 'Jacket', 'Skirt', 'Jeans']
    },
    {
        name: 'Accessories',
        subCategories: ['Juttis', 'Jewellery', 'Bags & Clutches', 'Stoles', 'Belts']
    }
];

export const seedCategories = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            console.log('🌱 Database has no categories. Seeding default categories...');
            await Category.insertMany(DEFAULT_CATEGORIES);
            console.log('✅ Default categories seeded successfully!');
        }
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
    }
};
