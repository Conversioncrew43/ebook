// Test script to check admin user role
const User = require('./model/user');
const mongoose = require('mongoose');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

async function testAdminRole() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@aditya.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser._id);
    
    // Check if role is correctly set
    if (adminUser.role === 'admin') {
      console.log('✅ Admin role is correctly set');
    } else {
      console.log('❌ Admin role is INCORRECT! Current role:', adminUser.role);
      console.log('🔧 Fixing admin role...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Admin role fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminRole();
