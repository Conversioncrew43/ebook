const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['expense', 'payment'],
        default: 'expense'
    },
    category: {
        type: String,
        enum: ['Labor', 'Material', 'Equipment', 'Transport', 'Miscellaneous'],
        default: 'Miscellaneous'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        default: 'Cash'
    },
    uploadedBill: {
        type: String
    },
    notes: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
