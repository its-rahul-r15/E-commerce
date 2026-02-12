import mongoose from 'mongoose';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

/**
 * Verify Database Indexes
 * Ensures all required indexes exist for optimal performance
 */

export const verifyIndexes = async () => {
    try {
        console.log('🔍 Verifying database indexes...');

        // Verify Shop indexes
        const shopIndexes = await Shop.collection.getIndexes();
        console.log('\n📦 Shop Indexes:');
        Object.keys(shopIndexes).forEach(index => {
            console.log(`  ✅ ${index}`);
        });

        // Check for critical 2dsphere index
        const hasGeoIndex = Object.values(shopIndexes).some(
            index => index.some(field => field[0] === 'location' && field[1] === '2dsphere')
        );

        if (!hasGeoIndex) {
            console.warn('  ⚠️  Missing 2dsphere index on location field!');
            console.log('  Creating index...');
            await Shop.collection.createIndex({ location: '2dsphere' });
            console.log('  ✅ 2dsphere index created successfully');
        }

        // Verify Product indexes
        const productIndexes = await Product.collection.getIndexes();
        console.log('\n📦 Product Indexes:');
        Object.keys(productIndexes).forEach(index => {
            console.log(`  ✅ ${index}`);
        });

        console.log('\n✅ Index verification complete\n');
        return true;
    } catch (error) {
        console.error('❌ Error verifying indexes:', error.message);
        return false;
    }
};

export default verifyIndexes;
