const Lead = require('../model/lead');

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
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create lead' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {}
    const dateRange = buildDateRange(req.query.from, req.query.to)
    if (dateRange) {
      filter.createdAt = dateRange
    }

    const leads = await Lead.find(filter);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

exports.get = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update lead' });
  }
};

exports.delete = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};