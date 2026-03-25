const mongoose = require('mongoose');

// Connect to local mongo instance used by the dev env
mongoose.connect('mongodb://localhost:27017/adityaconstruction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB for Migration");
    const Expense = require('./model/expense');
    const Vendor = require('./model/vendor');

    const vendors = await Vendor.find();
    console.log(`Checking match expenses for ${vendors.length} vendors...`);
    let count = 0;
    for (const v of vendors) {
        if (!v.vendorName) continue;
        const result = await Expense.updateMany(
            { title: new RegExp(v.vendorName, 'i'), vendor: { $exists: false } },
            { $set: { vendor: v._id } }
        );
        count += result.modifiedCount || result.nModified || 0;
    }
    console.log(`Migrated ${count} legacy expenses to link to their vendors.`);
    process.exit(0);
}).catch(err => {
    console.error("Failed to connect", err);
    process.exit(1);
});
