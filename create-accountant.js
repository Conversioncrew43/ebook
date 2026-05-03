const mongoose = require('mongoose');
const User = require('./model/user');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

async function createAccountantUser() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Check if accountant user already exists
    const existingAccountant = await User.findOne({ email: 'accountant@aditya.com' });
    if (existingAccountant) {
      console.log('Accountant user already exists:', existingAccountant.email, 'role:', existingAccountant.role);
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
    console.log('Accountant user created successfully!');
    console.log('Email: accountant@aditya.com');
    console.log('Password: accountant123');
    console.log('Role: accountant');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAccountantUser();
