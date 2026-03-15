const Purchase = require('../model/purchase');

exports.create = async (req, res) => {
  try {
    const expense = await Purchase.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create expense' });
  }
};

exports.list = async (req, res) => {
  try {
    const expenses = await Purchase.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.get = async (req, res) => {
  try {
    const expense = await Purchase.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update expense' });
  }
};

exports.delete = async (req, res) => {
  try {
    const expense = await Purchase.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};