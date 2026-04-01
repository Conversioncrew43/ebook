const mongoose = require('mongoose');
const Payment = require('./model/payment');

const dbURI = "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

mongoose.connect(dbURI)
  .then(async () => {
    console.log("Connected to database");
    
    const allPayments = await Payment.find({});
    console.log(`\nTotal payments in database: ${allPayments.length}`);
    console.log('\nAll payments:');
    allPayments.forEach((p, i) => {
      console.log(`\n${i + 1}. ID: ${p._id}`);
      console.log(`   Title: ${p.title}`);
      console.log(`   Amount: ${p.amount}`);
      console.log(`   Date: ${p.date}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Project: ${p.project}`);
    });
    
    await mongoose.connection.close();
    console.log("\n\nDatabase connection closed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
