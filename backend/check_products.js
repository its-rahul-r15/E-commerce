
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const checkProducts = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const total = await Product.countDocuments();
        console.log(`Total Products: ${total}`);

        if (total === 0) {
            console.log('No products found in database.');
        } else {
            const products = await Product.find({}, 'name isAvailable isBanned stock price category shopId');
            console.log('\nProduct Statuses:');
            products.forEach(p => {
                console.log(`- [${p._id}] ${p.name}: Available=${p.isAvailable}, Banned=${p.isBanned}, Stock=${p.stock}, Price=${p.price}, Cat=${p.category}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkProducts();
