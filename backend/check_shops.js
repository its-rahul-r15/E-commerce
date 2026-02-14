import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from './src/models/Shop.js';

dotenv.config({ path: './.env' }); 

const checkShops = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://rahulkumarsharma776194_db_user:alex123@cluster0.fsbvndf.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=Cluster0';
        console.log('Connecting to:', uri.split('@')[1]); 
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');


        const shops = await Shop.find({});
        console.log(`Found ${shops.length} shops.`);
        shops.forEach(shop => {
            console.log(`Shop: ${shop.shopName}, Status: ${shop.status}, ID: ${shop._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkShops();
