const mongoose = require('mongoose');
const Payment = require('./model/payment');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

mongoose.connect(dbURI)
  .then(async () => {
    console.log("Connected to database");
    
    const result = await Payment.deleteMany({ 
      title: 'dummy', 
      amount: 0 
    });
    
    console.log(`Deleted ${result.deletedCount} dummy payment entries`);
    
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
