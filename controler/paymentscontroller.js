const Payment = require('../model/payment');
const Project = require('../model/project');

exports.create = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    if (payment.project) {
      await Project.findByIdAndUpdate(payment.project, { $addToSet: { payments: payment._id } });
    }

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create payment' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    const payments = await Payment.find(filter)
      .populate('project', 'projectName')
      .populate('user', 'name email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

exports.get = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

exports.update = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update payment' });
  }
};

exports.delete = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete payment' });
  }
};