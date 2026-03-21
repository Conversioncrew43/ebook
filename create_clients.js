const mongoose = require('mongoose');
const User = require('./model/user');
const Project = require('./model/project');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

async function updateClientsToUsers() {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');

    // Get unique client names from projects
    const projects = await Project.find({}, 'clientName');
    const clientNames = [...new Set(projects.map(p => p.clientName).filter(name => name && name.trim()))];

    console.log('Found client names:', clientNames);

    for (const name of clientNames) {
      // Check if user already exists with this name or email
      const existingUser = await User.findOne({
        $or: [
          { name: name },
          { email: `${name.toLowerCase().replace(/\s+/g, '')}@client.com` }
        ]
      });

      if (!existingUser) {
        const user = new User({
          name: name,
          email: `${name.toLowerCase().replace(/\s+/g, '')}@client.com`,
          password: 'password123', // Will be hashed
          countryCode: '+91',
          mobilenumber: 9999999999,
          role: 'client'
        });
        await user.save();
        console.log(`Created user for client: ${name} (${user.email})`);
      } else {
        // Update role if not already client
        if (existingUser.role !== 'client') {
          existingUser.role = 'client';
          await existingUser.save();
          console.log(`Updated role to client for: ${name}`);
        } else {
          console.log(`Client user already exists: ${name}`);
        }
      }
    }

    console.log('Client update completed');
  } catch (error) {
    console.error('Error updating clients:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateClientsToUsers();