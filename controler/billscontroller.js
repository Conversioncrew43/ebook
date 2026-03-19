const Bill = require('../model/bill');
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
    // Generate bill number if not provided
    if (!req.body.billNumber) {
      const count = await Bill.countDocuments();
      req.body.billNumber = `BILL-${(count + 1).toString().padStart(4, '0')}`;
    }

    // Calculate total amount if not provided
    if (!req.body.totalAmount) {
      const subtotal = req.body.items?.reduce((sum, item) => sum + item.amount, 0) || req.body.amount || 0;
      const taxAmount = req.body.taxAmount || (subtotal * ((req.body.tax || 0) / 100)) || 0;
      const discountAmount = req.body.discountAmount || req.body.discount || 0;
      req.body.totalAmount = subtotal + taxAmount - discountAmount;
    }

    const bill = await Bill.create(req.body);

    // Add bill to project
    if (bill.project) {
      await Project.findByIdAndUpdate(bill.project, { $addToSet: { bills: bill._id } });
    }

    res.status(201).json(bill);
  } catch (err) {
    console.error('Bill creation error:', err);
    res.status(400).json({ message: 'Failed to create bill', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const dateRange = buildDateRange(req.query.from, req.query.to)
    if (dateRange) {
      filter.billDate = dateRange
    }

    const bills = await Bill.find(filter)
      .populate('project', 'projectName clientName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error('Bill list error:', err);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
};

exports.get = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('project', 'projectName clientName location')
      .populate('createdBy', 'name email');

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error('Bill get error:', err);
    res.status(500).json({ message: 'Failed to fetch bill' });
  }
};

exports.update = async (req, res) => {
  try {
    // Recalculate total amount if items changed
    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = req.body.taxAmount || 0;
      const discountAmount = req.body.discountAmount || 0;
      req.body.totalAmount = subtotal + taxAmount - discountAmount;
    }

    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('project', 'projectName clientName')
      .populate('createdBy', 'name email');

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error('Bill update error:', err);
    res.status(400).json({ message: 'Failed to update bill' });
  }
};

exports.delete = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Remove bill from project
    if (bill.project) {
      await Project.findByIdAndUpdate(bill.project, { $pull: { bills: bill._id } });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    console.error('Bill delete error:', err);
    res.status(500).json({ message: 'Failed to delete bill' });
  }
};