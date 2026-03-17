// Dashboard summary controller
const Expense = require('../model/expense');
const Payment = require('../model/payment');
const Project = require('../model/project');
const Lead = require('../model/lead'); // You may need to create this model
const Vendor = require('../model/vendor');
const Bill = require('../model/bill');
exports.dashboard_summary = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const activeProjects = await Project.countDocuments({ status: { $ne: 'Completed' } });
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paymentAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalRevenue = paymentAgg[0]?.total || 0;
    // Get project summaries for expenses
    const expenseSummaries = await Expense.aggregate([
        {
          $match: {
            $or: [
              { type: { $exists: false } },
              { type: 'expense' },
              { type: { $ne: 'payment' } }
            ]
          }
        },
        {
          $group: {
            _id: '$project',
            expenseTotal: { $sum: '$amount' },
          },
        },
      ]);
    // Get project summaries for payments
    const paymentSummaries = await Payment.aggregate([
      {
        $group: {
          _id: '$project',
          paymentTotal: { $sum: '$amount' },
        },
      },
    ]);
    // Get project summaries for bills
    const billSummaries = await Bill.aggregate([
      {
        $group: {
          _id: '$project',
          billTotal: { $sum: '$totalAmount' },
        },
      },
    ]);
    // Combine expense and payment summaries
    const projectMap = new Map();
    expenseSummaries.forEach(exp => {
      if (exp._id) {
        projectMap.set(exp._id.toString(), {
          projectId: exp._id,
          expenseTotal: exp.expenseTotal,
          paymentTotal: 0,
          billTotal: 0,
        });
      }
    });
    paymentSummaries.forEach(pay => {
      if (pay._id) {
        const key = pay._id.toString();
        if (projectMap.has(key)) {
          projectMap.get(key).paymentTotal = pay.paymentTotal;
        } else {
          projectMap.set(key, {
            projectId: pay._id,
            expenseTotal: 0,
            paymentTotal: pay.paymentTotal,
            billTotal: 0,
          });
        }
      }
    });
    billSummaries.forEach(bill => {
      if (bill._id) {
        const key = bill._id.toString();
        if (projectMap.has(key)) {
          projectMap.get(key).billTotal = bill.billTotal;
        } else {
          projectMap.set(key, {
            projectId: bill._id,
            expenseTotal: 0,
            paymentTotal: 0,
            billTotal: bill.billTotal,
          });
        }
      }
    });    console.log('Summaries combined, projectMap size:', projectMap.size);    // Get project details
    const projectIds = Array.from(projectMap.keys()).filter(id => id);
    const projects = await Project.find({ _id: { $in: projectIds } }, 'projectName');
    const projectSummaries = Array.from(projectMap.values())
      .filter(summary => summary.projectId) // Remove entries with null projectId
      .map(summary => {
        const project = projects.find(p => p._id.toString() === summary.projectId?.toString());
        return {
          projectId: summary.projectId?.toString(),
          projectName: project?.projectName || 'Unknown Project',
          expenseTotal: summary.expenseTotal,
          paymentTotal: summary.paymentTotal,
          billTotal: summary.billTotal,
          netTotal: summary.paymentTotal - summary.expenseTotal,
        };
      })
      .filter((summary, index, self) => 
        index === self.findIndex(s => s.projectId?.toString() === summary.projectId?.toString())
      ); // Ensure uniqueness
    res.json({
      totalLeads,
      activeProjects,
      totalExpenses,
      totalRevenue,
      projectSummaries,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
exports.monthly_expenses = async (req, res) => {
  try {
    const monthlyExpenses = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.month' },
              '-',
              { $toString: '$_id.year' },
            ],
          },
          total: 1,
        },
      },
    ]);
    res.json(monthlyExpenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch monthly expenses' });
  }
};

exports.vendor_analytics = async (req, res) => {
  try {
    const vendors = await Vendor.find({}, 'name type totalPaid paymentHistory')
      .sort({ totalPaid: -1 })
      .limit(10);

    const vendorPayments = await Vendor.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $group: {
          _id: {
            year: { $year: '$paymentHistory.date' },
            month: { $month: '$paymentHistory.date' }
          },
          total: { $sum: '$paymentHistory.amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.month' },
              '-',
              { $toString: '$_id.year' }
            ]
          },
          total: 1
        }
      }
    ]);

    res.json({
      topVendors: vendors.map(v => ({
        name: v.name,
        type: v.type,
        totalPaid: v.totalPaid,
        paymentCount: v.paymentHistory.length
      })),
      monthlyVendorPayments: vendorPayments
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendor analytics' });
  }
};
