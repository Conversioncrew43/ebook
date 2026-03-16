const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
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
    notes: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;