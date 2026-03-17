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
      {
        $match: {
          type: { $ne: 'payment' }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paymentAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const billAgg = await Bill.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalRevenue = paymentAgg[0]?.total || 0;
    const totalBills = billAgg[0]?.total || 0;
    
    // Get all projects first
    const allProjects = await Project.find({}, '_id projectName');
    const projectMap = new Map(allProjects.map(p => [p._id.toString(), p.projectName]));
    
    // Get project summaries for expenses
    const expenseSummaries = await Expense.aggregate([
        {
          $match: {
            project: { $exists: true, $ne: null },
            type: { $ne: 'payment' }
          }
        },
        {
          $group: {
            _id: { $toString: '$project' },
            expenseTotal: { $sum: '$amount' },
          },
        },
      ]);
    // Get project summaries for payments
    const paymentSummaries = await Payment.aggregate([
      {
        $match: {
          project: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: { $toString: '$project' },
          paymentTotal: { $sum: '$amount' },
        },
      },
    ]);
    // Get project summaries for bills
    const billSummaries = await Bill.aggregate([
      {
        $match: {
          project: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: { $toString: '$project' },
          billTotal: { $sum: '$totalAmount' },
        },
      },
    ]);
    
    // Combine all summaries using a Map
    const projectSummaryMap = new Map();
    
    expenseSummaries.forEach(exp => {
      if (exp._id) {
        projectSummaryMap.set(exp._id, {
          projectId: exp._id,
          expenseTotal: exp.expenseTotal,
          paymentTotal: 0,
          billTotal: 0,
        });
      }
    });
    
    paymentSummaries.forEach(pay => {
      if (pay._id) {
        if (projectSummaryMap.has(pay._id)) {
          projectSummaryMap.get(pay._id).paymentTotal = pay.paymentTotal;
        } else {
          projectSummaryMap.set(pay._id, {
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
        if (projectSummaryMap.has(bill._id)) {
          projectSummaryMap.get(bill._id).billTotal = bill.billTotal;
        } else {
          projectSummaryMap.set(bill._id, {
            projectId: bill._id,
            expenseTotal: 0,
            paymentTotal: 0,
            billTotal: bill.billTotal,
          });
        }
      }
    });
    
    // Convert to array and add project names
    const projectSummaries = Array.from(projectSummaryMap.values())
      .map(summary => ({
        projectId: summary.projectId,
        projectName: projectMap.get(summary.projectId) || 'Unknown Project',
        expenseTotal: summary.expenseTotal,
        paymentTotal: summary.paymentTotal,
        billTotal: summary.billTotal,
        netTotal: summary.paymentTotal - summary.expenseTotal,
      }))
      .sort((a, b) => b.paymentTotal - a.paymentTotal);
    res.json({
      totalLeads,
      activeProjects,
      totalExpenses,
      totalRevenue,
      totalBills,
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
