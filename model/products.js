const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema= new Schema({
    productName: {
        type: String,
        required: true
    },
    productDesc: {
        type: String,
        required: true
    },
    productImages: [{
        type: String,
        required: true
    }],
    Indprice: {
        type: Number,
        required: true
    },
    USAprice: {
        type: Number,
        required: true
    },
    UKprice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    // You can add more options as needed, for example:
    // manufacturer: {
    //     type: String
    // },
    // dimensions: {
    //     type: String
    // },
    // weight: {
    //     type: Number
    // },
    // etc.
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;