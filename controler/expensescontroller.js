const Expense = require('../model/expense');
const Project = require('../model/project');

exports.create = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    if (expense.project) {
      await Project.findByIdAndUpdate(expense.project, { $addToSet: { expenses: expense._id } });
    }

    if (expense.vendor) {
      const Vendor = require('../model/vendor');
      await Vendor.findByIdAndUpdate(expense.vendor, {
        $push: {
          paymentHistory: {
            project: expense.project,
            amount: expense.amount,
            paymentDate: expense.date,
            paymentMethod: expense.paymentMethod || 'Cash',
            notes: expense.notes,
          }
        }
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create expense' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    // Only fetch expenses, not payments
    filter.type = 'expense';
    const expenses = await Expense.find(filter)
      .populate('project', 'projectName')
      .populate('vendor', 'vendorName companyName')
      .populate('user', 'name email');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.get = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update expense' });
  }
};

exports.delete = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};