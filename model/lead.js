const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const leadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  projectType: { type: String },
  budget: { type: Number },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New'
  },
  source: { type: String },
  notes: { type: String },
  followUpDate: { type: Date },
  // Optionally, you can add a reference to the assigned user/staff
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);