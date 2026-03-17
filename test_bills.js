const mongoose = require('mongoose');
const Bill = require('./model/bill');

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/aditya_construction');
    console.log('Connected to MongoDB');

    const bills = await Bill.find({});
    console.log('Total bills found:', bills.length);

    if (bills.length > 0) {
      console.log('Sample bill:', {
        _id: bills[0]._id,
        billNumber: bills[0].billNumber,
        totalAmount: bills[0].totalAmount,
        project: bills[0].project
      });
    }

    const aggregation = await Bill.aggregate([
      {
        $group: {
          _id: '$project',
          billTotal: { $sum: '$totalAmount' },
        },
      },
    ]);

    console.log('Aggregation result:', aggregation);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

test();