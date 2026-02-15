
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.join(__dirname, '.env') });

const debug = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        products.forEach(p => {
            console.log(`ID: ${p._id}, Name: ${p.name}, Available: ${p.isAvailable}, Banned: ${p.isBanned}, Stock: ${p.stock}, Price: ${p.price}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

debug();
