const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  status: { type: String, default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);