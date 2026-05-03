const mongoose = require('mongoose');

const workerRateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['mason', 'helper', 'electrician', 'plumber', 'carpenter', 'other'],
      required: true,
      unique: true
    },
    ratePerDay: { type: Number, required: true }, // daily rate
    overtimePerHour: { type: Number, required: true }, // rate for overtime hours
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkerRate', workerRateSchema);
