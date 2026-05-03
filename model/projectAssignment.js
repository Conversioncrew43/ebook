const mongoose = require('mongoose');

const projectAssignmentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['site_supervisor', 'site_engineer', 'project_manager'],
          required: true
        },
        assignedDate: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for optimized queries
projectAssignmentSchema.index({ projectId: 1 });
projectAssignmentSchema.index({ 'assignedUsers.userId': 1 });

module.exports = mongoose.model('ProjectAssignment', projectAssignmentSchema);
