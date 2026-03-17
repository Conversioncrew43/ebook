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

exports.client_summary = async (req, res) => {
  try {
    // Get all projects grouped by client
    const projects = await Project.find({}, 'projectName clientName _id')
      .lean();

    if (!projects.length) {
      return res.json({ clientSummaries: [] });
    }

    // Get unique clients
    const clientNames = [...new Set(projects.map(p => p.clientName).filter(c => c))];
    
    // Build client summary
    const clientSummaries = await Promise.all(
      clientNames.map(async (clientName) => {
        const clientProjects = projects.filter(p => p.clientName === clientName);
        const projectIds = clientProjects.map(p => p._id);

        // Get bills for this client
        const billAgg = await Bill.aggregate([
          {
            $match: {
              project: { $in: projectIds }
            }
          },
          {
            $group: {
              _id: null,
              totalBills: { $sum: '$totalAmount' }
            }
          }
        ]);

        // Get payments for this client
        const paymentAgg = await Payment.aggregate([
          {
            $match: {
              project: { $in: projectIds }
            }
          },
          {
            $group: {
              _id: null,
              totalPayments: { $sum: '$amount' }
            }
          }
        ]);

        const totalBills = billAgg[0]?.totalBills || 0;
        const totalPayments = paymentAgg[0]?.totalPayments || 0;

        // Get project-wise details
        const projectDetails = await Promise.all(
          clientProjects.map(async (project) => {
            const projBills = await Bill.aggregate([
              {
                $match: { project: project._id }
              },
              {
                $group: {
                  _id: null,
                  billTotal: { $sum: '$totalAmount' }
                }
              }
            ]);

            const projPayments = await Payment.aggregate([
              {
                $match: { project: project._id }
              },
              {
                $group: {
                  _id: null,
                  paymentTotal: { $sum: '$amount' }
                }
              }
            ]);

            const projExpenses = await Expense.aggregate([
              {
                $match: {
                  project: project._id,
                  type: { $ne: 'payment' }
                }
              },
              {
                $group: {
                  _id: null,
                  expenseTotal: { $sum: '$amount' }
                }
              }
            ]);

            return {
              projectId: project._id.toString(),
              projectName: project.projectName,
              bills: projBills[0]?.billTotal || 0,
              payments: projPayments[0]?.paymentTotal || 0,
              expenses: projExpenses[0]?.expenseTotal || 0,
              pending: (projBills[0]?.billTotal || 0) - (projPayments[0]?.paymentTotal || 0)
            };
          })
        );

        return {
          clientName,
          totalBills,
          totalPayments,
          pendingAmount: totalBills - totalPayments,
          projectCount: clientProjects.length,
          projects: projectDetails
        };
      })
    );

    // Sort by pending amount (descending)
    clientSummaries.sort((a, b) => b.pendingAmount - a.pendingAmount);

    res.json({ clientSummaries });
  } catch (err) {
    console.error('Client summary error:', err);
    res.status(500).json({ message: 'Failed to fetch client summary' });
  }
};
