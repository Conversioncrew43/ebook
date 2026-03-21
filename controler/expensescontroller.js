const Expense = require('../model/expense');
const Project = require('../model/project');

function buildDateRange(from, to) {
  const range = {}
  if (from) {
    const fromDate = new Date(from)
    if (!isNaN(fromDate.getTime())) {
      range.$gte = fromDate
    }
  }
  if (to) {
    const toDate = new Date(to)
    if (!isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999)
      range.$lte = toDate
    }
  }
  return Object.keys(range).length ? range : null
}

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
    const dateRange = buildDateRange(req.query.from, req.query.to)
    if (dateRange) {
      filter.date = dateRange
    }

    const expenses = await Expense.find(filter).populate('project', 'projectName').populate('vendor', 'vendorName');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.get = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('project').populate('vendor');
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

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    // Only fetch expenses, not payments
    filter.type = 'expense';

    const dateRange = buildDateRange(req.query.from, req.query.to)
    if (dateRange) {
      filter.date = dateRange
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, _id: -1 })
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
    const oldExpense = await Expense.findById(req.params.id);
    if (!oldExpense) return res.status(404).json({ message: 'Expense not found' });

    // Update the expense record
    await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Handle vendor update in payment history
    if (req.body.vendor) {
      const Vendor = require('../model/vendor');
      // If vendor changed, remove old entry and add new one
      if (oldExpense.vendor && oldExpense.vendor.toString() !== req.body.vendor.toString()) {
        await Vendor.findByIdAndUpdate(oldExpense.vendor, {
          $pull: {
            paymentHistory: { _id: { $exists: true } }
          }
        });
      }
      
      await Vendor.findByIdAndUpdate(req.body.vendor, {
        $push: {
          paymentHistory: {
            project: req.body.project,
            amount: req.body.amount,
            paymentDate: req.body.date,
            paymentMethod: req.body.paymentMethod || 'Cash',
            notes: req.body.notes,
          }
        }
      });
    }

    // Fetch and return the updated expense with populated relationships
    const updatedExpense = await Expense.findById(req.params.id)
      .populate('project', 'projectName')
      .populate('vendor', 'vendorName companyName')
      .populate('user', 'name email');

    res.json(updatedExpense);
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