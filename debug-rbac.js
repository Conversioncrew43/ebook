const mongoose = require('mongoose');
const User = require('./model/user');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

async function debugRoles() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    
    // Find all users and their roles
    const users = await User.find({}, 'email role name');
    console.log('All users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): role = "${user.role}"`);
    });
    
    // Check if any accountant users exist
    const accountants = await User.find({ role: 'accountant' }, 'email name');
    console.log(`\nFound ${accountants.length} accountant users:`);
    accountants.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    // Test RBAC permissions for accountant
    const { rolePermissions } = require('./controler/rbac');
    const accountantPerms = rolePermissions['accountant'];
    console.log('\nAccountant permissions:', JSON.stringify(accountantPerms, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugRoles();
