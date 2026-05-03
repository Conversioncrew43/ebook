const mongoose = require('mongoose');

const dprSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    siteId: { type: String, required: true },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weather: { type: String, enum: ['sunny', 'rainy', 'cloudy', 'windy'], default: 'sunny' },
    
    // Attendance array
    attendance: [
      {
        type: { type: String, enum: ['mason', 'helper', 'electrician', 'plumber', 'carpenter', 'other'], required: true },
        count: { type: Number, required: true },
        hours: { type: Number, required: true }, // hours worked
        image: { type: String, required: true }, // mandatory group photo URL
      }
    ],
    
    // Work progress array
    workProgress: [
      {
        category: { type: String, enum: ['RCC', 'Brickwork', 'Flooring', 'Plastering', 'Painting', 'Electrical', 'Plumbing', 'Other'], required: true },
        description: { type: String, required: true },
        quantity: { type: String, required: true },
        unit: { type: String, default: 'sqft' },
        status: { type: String, enum: ['completed', 'ongoing', 'delayed'], default: 'ongoing' },
        images: [{ type: String }] // multiple image URLs
      }
    ],
    
    // Issues array
    issues: [
      {
        type: { type: String, enum: ['material', 'labour', 'weather', 'equipment', 'safety', 'other'], required: true },
        description: { type: String, required: true },
        impact: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
      }
    ],
    
    // Optional materials
    materials: {
      cement: { type: Number },
      steel: { type: Number },
      sand: { type: Number },
      gravel: { type: Number }
    },
    
    notes: { type: String },
    
    // Processed attendance data (for payment calculation)
    processedAttendance: [
      {
        type: String,
        totalDays: { type: Number, default: 0 }, // (count * hours) / 8
        overtimeHours: { type: Number, default: 0 }, // hours beyond 8
        totalHours: { type: Number, default: 0 }
      }
    ],
    
    status: { type: String, enum: ['draft', 'submitted', 'locked'], default: 'draft' },
    locked: { type: Boolean, default: false }, // locked after payment generation
    submittedAt: { type: Date },
    editableUntil: { type: Date }, // 12 hours from submission
  },
  { timestamps: true }
);

// Index for optimized queries
dprSchema.index({ projectId: 1, date: 1 });
dprSchema.index({ siteId: 1, date: 1 });
dprSchema.index({ supervisorId: 1, date: 1 });
dprSchema.index({ projectId: 1, siteId: 1, date: 1 });

module.exports = mongoose.model('DPR', dprSchema);
