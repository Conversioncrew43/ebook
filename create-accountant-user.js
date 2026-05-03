// This script creates an accountant user for testing
// Run it with: node create-accountant-user.js

const User = require('./model/user');

async function createAccountant() {
  try {
    // Connect to the database (assuming server is running)
    const mongoose = require('mongoose');
    const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";
    
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Check if accountant user already exists
    const existingAccountant = await User.findOne({ email: 'accountant@aditya.com' });
    if (existingAccountant) {
      console.log('Accountant user already exists:');
      console.log('Email:', existingAccountant.email);
      console.log('Name:', existingAccountant.name);
      console.log('Role:', existingAccountant.role);
      await mongoose.disconnect();
      return;
    }
    
    // Create accountant user
    const accountantUser = new User({
      name: 'Test Accountant',
      email: 'accountant@aditya.com',
      password: 'accountant123',
      countryCode: '+91',
      mobilenumber: 8888888888,
      role: 'accountant'
    });
    
    await accountantUser.save();
    console.log('✅ Accountant user created successfully!');
    console.log('📧 Email: accountant@aditya.com');
    console.log('🔑 Password: accountant123');
    console.log('👤 Role: accountant');
    console.log('\nYou can now login with these credentials to test expense permissions.');
    
  } catch (error) {
    console.error('❌ Error creating accountant user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAccountant();
