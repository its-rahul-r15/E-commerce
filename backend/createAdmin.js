require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createAdminUser = async () => {
    try {
      
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        
        const adminData = {
            name: 'Admin',
            email: 'admin@gallikart.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            isBlocked: false,
        };

        
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', adminData.email);
            process.exit(0);
        }

      
        const admin = await User.create(adminData);
        console.log('✅ Admin user created successfully!');
        console.log('Email:', adminData.email);
        console.log('Password: admin123');
        console.log('\nYou can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdminUser();
