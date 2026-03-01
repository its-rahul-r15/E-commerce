/**
 * seed_tailoring_test.js
 * Creates dummy data to test Custom Tailoring end-to-end:
 *   1. A seller user
 *   2. An approved shop for that seller
 *   3. A Kurta product linked to the shop
 *
 * Run once from the /backend folder:
 *   node seed_tailoring_test.js
 *
 * IMPORTANT: Uses your real MongoDB (reads .env). Safe to run multiple times
 * (it checks for existing data before inserting).
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
import User from './src/models/User.js';
import Shop from './src/models/Shop.js';
import Product from './src/models/Product.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seed() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // ── 1. Seller User ────────────────────────────────────────────────────────
    let seller = await User.findOne({ email: 'testseller@klyra.com' });
    if (!seller) {
        const hashed = await bcrypt.hash('Password@123', 12);
        seller = await User.create({
            name: 'Riya Sharma (Test Seller)',
            email: 'testseller@klyra.com',
            password: hashed,
            role: 'seller',
            isVerified: true,
        });
        console.log('👤 Seller created:', seller.email);
    } else {
        console.log('👤 Seller already exists:', seller.email);
    }

    // ── 2. Shop ───────────────────────────────────────────────────────────────
    // Delete old broken shop if it exists (to ensure clean re-creation)
    await Shop.deleteMany({ sellerId: seller._id });

    shop = await Shop.create({
        sellerId: seller._id,
        shopName: 'Riya Ethnic Boutique',
        description: 'Premium handcrafted ethnic wear from Jaipur.',
        category: 'Clothing',         // ✅ must be from Shop schema enum
        status: 'approved',           // ✅ correct field name (not approvalStatus)
        phone: '9876543210',          // ✅ required field
        location: {                   // ✅ required field
            type: 'Point',
            coordinates: [75.7873, 26.9124], // Jaipur [longitude, latitude]
        },
        address: {
            street: '12 Bapu Nagar',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302015',
        },
    });
    console.log('🏪 Shop created:', shop.shopName, '| Status:', shop.status);

    // ── 3. Kurta Product ──────────────────────────────────────────────────────
    let product = await Product.findOne({ shopId: shop._id, name: 'Royal Bandhani Kurta (Test)' });
    if (!product) {
        product = await Product.create({
            shopId: shop._id,
            name: 'Royal Bandhani Kurta (Test)',
            description: 'Hand-dyed bandhani kurta in pure cotton. Perfect for festivals and casual outings. Comes with matching dupatta.',
            category: 'Kurta',
            price: 2499,
            discountedPrice: 1999,
            stock: 50,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Indigo Blue', 'Saffron Orange', 'Rose Pink'],
            images: [
                'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
                'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80',
                'https://images.unsplash.com/photo-1610030468984-8a16044b02c2?w=600&q=80',
            ],
            tryOnImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
            isAvailable: true,
            isBanned: false,
            tags: ['kurta', 'ethnic', 'bandhani', 'cotton', 'festive'],
        });
        console.log('👗 Product created:', product.name, '| ID:', product._id.toString());
    } else {
        console.log('👗 Product already exists:', product.name, '| ID:', product._id.toString());
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED COMPLETE — Test Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Seller Login:');
    console.log('   Email   : testseller@klyra.com');
    console.log('   Password: Password@123');
    console.log('');
    console.log('👗 Test Product ID:', product._id.toString());
    console.log('   Product URL: http://localhost:5173/product/' + product._id.toString());
    console.log('   Tailoring URL: http://localhost:5173/tailoring?product=' + product._id.toString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB. Done!');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
