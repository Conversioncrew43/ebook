const mongoose = require('mongoose');

const weeklyPaymentSchema = new mongoose.Schema(
  {
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    siteId: { type: String, required: true },
    
    breakdown: [
      {
        type: String, // worker type (mason, helper, etc)
        totalDays: { type: Number, required: true }, // sum of worker-days
        overtimeHours: { type: Number, default: 0 }, // sum of overtime hours
        ratePerDay: { type: Number, required: true },
        overtimePerHour: { type: Number, required: true },
        totalAmount: { type: Number, required: true } // (totalDays * ratePerDay) + (overtimeHours * overtimePerHour)
      }
    ],
    
    totalAmount: { type: Number, required: true }, // sum of all breakdown amounts
    status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
    locked: { type: Boolean, default: true }, // locked after generation
    generatedAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Index for optimized queries
weeklyPaymentSchema.index({ projectId: 1, weekStartDate: 1 });
weeklyPaymentSchema.index({ siteId: 1, weekStartDate: 1 });
weeklyPaymentSchema.index({ status: 1, weekStartDate: 1 });

module.exports = mongoose.model('WeeklyPayment', weeklyPaymentSchema);
