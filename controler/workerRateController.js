const WorkerRate = require('../model/workerRate');
const { getExportFormat, exportToCSV, exportToJSON } = require('../utils/exportData');

// Create worker rate
exports.createWorkerRate = async (req, res) => {
  try {
    const { type, ratePerDay, overtimePerHour, description } = req.body;
    
    if (!type || !ratePerDay || !overtimePerHour) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if rate already exists
    const existingRate = await WorkerRate.findOne({ type });
    if (existingRate) {
      return res.status(409).json({ message: 'Worker rate already exists for this type' });
    }
    
    const workerRate = new WorkerRate({
      type,
      ratePerDay,
      overtimePerHour,
      description,
      isActive: true
    });
    
    await workerRate.save();
    
    res.status(201).json({
      message: 'Worker rate created successfully',
      workerRate
    });
  } catch (error) {
    console.error('Create Worker Rate Error:', error);
    res.status(500).json({ message: 'Error creating worker rate', error: error.message });
  }
};

// Get all worker rates
exports.getWorkerRates = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const rates = await WorkerRate.find(query).sort({ type: 1 });
    
    // Handle export if requested
    const exportFormat = getExportFormat(req.query);
    if (exportFormat === 'csv') {
      return exportToCSV(res, rates, 'workerRates');
    }
    if (exportFormat === 'json') {
      return exportToJSON(res, rates, 'workerRates');
    }
    
    res.json(rates);
  } catch (error) {
    console.error('Get Worker Rates Error:', error);
    res.status(500).json({ message: 'Error fetching worker rates', error: error.message });
  }
};

// Get single worker rate
exports.getWorkerRate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rate = await WorkerRate.findById(id);
    if (!rate) {
      return res.status(404).json({ message: 'Worker rate not found' });
    }
    
    res.json(rate);
  } catch (error) {
    console.error('Get Worker Rate Error:', error);
    res.status(500).json({ message: 'Error fetching worker rate', error: error.message });
  }
};

// Update worker rate
exports.updateWorkerRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratePerDay, overtimePerHour, description, isActive } = req.body;
    
    const rate = await WorkerRate.findById(id);
    if (!rate) {
      return res.status(404).json({ message: 'Worker rate not found' });
    }
    
    if (ratePerDay !== undefined) rate.ratePerDay = ratePerDay;
    if (overtimePerHour !== undefined) rate.overtimePerHour = overtimePerHour;
    if (description !== undefined) rate.description = description;
    if (isActive !== undefined) rate.isActive = isActive;
    
    await rate.save();
    
    res.json({
      message: 'Worker rate updated successfully',
      workerRate: rate
    });
  } catch (error) {
    console.error('Update Worker Rate Error:', error);
    res.status(500).json({ message: 'Error updating worker rate', error: error.message });
  }
};

// Delete worker rate (soft delete)
exports.deleteWorkerRate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rate = await WorkerRate.findById(id);
    if (!rate) {
      return res.status(404).json({ message: 'Worker rate not found' });
    }
    
    rate.isActive = false;
    await rate.save();
    
    res.json({ message: 'Worker rate deleted successfully' });
  } catch (error) {
    console.error('Delete Worker Rate Error:', error);
    res.status(500).json({ message: 'Error deleting worker rate', error: error.message });
  }
};
