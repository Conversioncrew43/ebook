// Dashboard summary controller
const Purchase = require('../model/purchase');
const Project = require('../model/products');
const Lead = require('../model/lead'); // You may need to create this model

exports.dashboard_summary = async (req, res) => {
  try {
    // Dummy data, replace with real aggregation logic
    const totalLeads = await Lead.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const totalExpenses = await Purchase.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const revenue = 0; // Add your revenue logic
    res.json({
      totalLeads,
      activeProjects,
      totalExpenses: totalExpenses[0]?.total || 0,
      revenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};