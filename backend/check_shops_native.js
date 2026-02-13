import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://rahulkumarsharma776194_db_user:alex123@cluster0.fsbvndf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
    try {
        console.log('Connecting...');
        await client.connect().catch(err => {
            console.error('Connection failed:', err);
            process.exit(1);
        });
        console.log('Connected.');

        const database = client.db('ecommerce_db');
        const shops = database.collection('shops');

        const count = await shops.countDocuments();
        console.log(`Total shops: ${count}`);

        const cursor = shops.find();
        for await (const shop of cursor) {
            console.log(`Shop: ${shop.shopName}, Status: ${shop.status}, ID: ${shop._id}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
