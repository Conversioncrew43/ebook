const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed'],
      default: 'Planning',
    },
    assignedTeam: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeline: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],
    tasks: [
      {
        title: String,
        description: String,
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['Todo', 'In Progress', 'Review', 'Done'],
          default: 'Todo',
        },
        dueDate: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    expenses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    bills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bill',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
