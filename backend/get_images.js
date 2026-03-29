import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const uri = "mongodb+srv://rahulkumarsharma776194_db_user:alex123@cluster0.fsbvndf.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        
        const categories = [
            "Saree", "Kurta", "Lehenga", "Accessories", "Salwar Suit", "Western Wear", "Sherwani", "Health & Beauty"
        ];

        const results = {};

        for (const cat of categories) {
            const product = await db.collection('products').findOne({ category: cat, images: { $ne: [] } });
            if (product && product.images && product.images.length > 0) {
                results[cat] = product.images[0];
            } else {
                results[cat] = "placeholder";
            }
        }
        
        fs.writeFileSync(path.join(process.cwd(), 'categories.json'), JSON.stringify(results, null, 2));
        console.log("DONE");
    } catch (err) {
        fs.writeFileSync(path.join(process.cwd(), 'categories.json'), JSON.stringify({error: err.message}));
    } finally {
        process.exit(0);
    }
}

run();
