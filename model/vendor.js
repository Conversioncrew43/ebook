const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    vendorName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    vendorType: {
        type: String,
        enum: ['Labor Contractor', 'Electrician', 'Plumber', 'Carpenter', 'Material Supplier', 'Equipment Supplier', 'Transport Vendor', 'Other'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    assignedProjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: []
    }],
    paymentHistory: [{
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'],
            required: true
        },
        notes: {
            type: String
        },
        status: {
            type: String,
            enum: ['Paid', 'Pending', 'Cancelled'],
            default: 'Paid'
        }
    }],
    notes: {
        type: String
    }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;