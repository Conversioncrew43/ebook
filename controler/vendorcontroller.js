// Vendor controller
const Vendor = require('../model/vendor');
const Expense = require('../model/expense');

// Get all vendors with optional filters
exports.getAll = async (req, res) => {
    try {
        const { search, type, projectId, from, to, page = 1, limit = 10 } = req.query;
        let query = {};

        const buildDateRange = (from, to) => {
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

        const createdAtRange = buildDateRange(from, to)
        if (createdAtRange) {
            query.createdAt = createdAtRange
        }

        if (search) {
            query.$or = [
                { vendorName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) {
            query.vendorType = type;
        }

        if (projectId) {
            query.assignedProjects = projectId;
        }

        const vendors = await Vendor.find(query)
            .populate('assignedProjects', 'projectName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Vendor.countDocuments(query);
        const vendorIds = vendors.map(v => v._id);

        // Fetch all expenses for these vendors to calculate totals
        const expensesAgg = await Expense.aggregate([
            { $match: { vendor: { $in: vendorIds }, type: 'expense' } },
            { $group: { _id: '$vendor', total: { $sum: '$amount' } } }
        ]);
        const totalsMap = {};
        expensesAgg.forEach(row => {
            totalsMap[row._id.toString()] = row.total;
        });

        // Calculate totals for each vendor
        const vendorsWithTotals = vendors.map(vendor => {
            const totalPaid = totalsMap[vendor._id.toString()] || 0;

            return {
                _id: vendor._id,
                name: vendor.vendorName,
                companyName: vendor.companyName,
                type: vendor.vendorType,
                contact: {
                    email: vendor.email,
                    phone: vendor.phoneNumber
                },
                address: vendor.address,
                projects: vendor.assignedProjects,
                paymentHistory: [], // Not needed for getAll list
                totalPaid,
                createdAt: vendor.createdAt
            };
        });

        res.json(vendorsWithTotals);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch vendors' });
    }
};

// Get single vendor
exports.getById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id)
            .populate('assignedProjects', 'projectName');

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Fetch all expenses associated with this vendor
        const vendorExpenses = await Expense.find({ vendor: vendor._id }).populate('project', 'projectName').sort({ date: -1 });
        const totalPaid = vendorExpenses.reduce((sum, payment) => sum + payment.amount, 0);

        const vendorResponse = {
            _id: vendor._id,
            name: vendor.vendorName,
            companyName: vendor.companyName,
            type: vendor.vendorType,
            contact: {
                email: vendor.email,
                phone: vendor.phoneNumber
            },
            address: vendor.address,
            projects: vendor.assignedProjects,
            paymentHistory: vendorExpenses.map(p => ({
                _id: p._id,
                amount: p.amount,
                date: p.date,
                method: p.paymentMethod || 'Transfer',
                projectId: p.project?._id,
                projectName: p.project?.projectName || '-',
                status: 'Paid',
                notes: p.notes || p.title
            })),
            totalPaid,
            createdAt: vendor.createdAt
        };

        res.json(vendorResponse);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch vendor' });
    }
};

// Create vendor
exports.create = async (req, res) => {
    try {
        const { name, type, email, phone, address, projects } = req.body;

        const vendor = new Vendor({
            vendorName: name,
            phoneNumber: phone,
            email: email,
            companyName: name, // Using name as company name for now
            vendorType: type,
            address: address,
            assignedProjects: projects || []
        });

        await vendor.save();

        // Return in frontend format
        const vendorResponse = {
            _id: vendor._id,
            name: vendor.vendorName,
            type: vendor.vendorType,
            contact: {
                email: vendor.email,
                phone: vendor.phoneNumber
            },
            address: vendor.address,
            projects: vendor.assignedProjects,
            paymentHistory: [],
            totalPaid: 0,
            createdAt: vendor.createdAt
        };

        res.status(201).json(vendorResponse);
    } catch (err) {
        res.status(400).json({ message: 'Failed to create vendor' });
    }
};

// Update vendor
exports.update = async (req, res) => {
    try {
        const { name, type, email, phone, address, projects } = req.body;

        const updateData = {
            vendorName: name,
            phoneNumber: phone,
            email: email,
            vendorType: type,
            address: address,
            assignedProjects: projects || []
        };

        const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('assignedProjects', 'projectName');

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const vendorExpenses = await Expense.find({ vendor: vendor._id }).populate('project', 'projectName').sort({ date: -1 });
        const totalPaid = vendorExpenses.reduce((sum, payment) => sum + payment.amount, 0);

        const vendorResponse = {
            _id: vendor._id,
            name: vendor.vendorName,
            type: vendor.vendorType,
            contact: {
                email: vendor.email,
                phone: vendor.phoneNumber
            },
            address: vendor.address,
            projects: vendor.assignedProjects,
            paymentHistory: vendorExpenses.map(p => ({
                _id: p._id,
                amount: p.amount,
                date: p.date,
                method: p.paymentMethod || 'Transfer',
                projectId: p.project?._id,
                projectName: p.project?.projectName || '-',
                status: 'Paid',
                notes: p.notes || p.title
            })),
            totalPaid,
            createdAt: vendor.createdAt
        };

        res.json(vendorResponse);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update vendor' });
    }
};

// Delete vendor
exports.delete = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete vendor' });
    }
};

// Record payment to vendor
exports.recordPayment = async (req, res) => {
    try {
        const { vendorId, projectId, amount, method, date } = req.body;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Auto-create expense record
        const expense = new Expense({
            title: `Payment to ${vendor.vendorName}`,
            category: 'Vendor Payment',
            amount: parseFloat(amount),
            project: projectId,
            vendor: vendorId, // Add vendor relation properly
            date: new Date(date),
            paymentMethod: method,
            notes: `Payment made to vendor ${vendor.vendorName}`,
            type: 'expense'
        });

        await expense.save();

        res.status(201).json({ message: 'Payment recorded and expense created' });
    } catch (err) {
        res.status(400).json({ message: 'Failed to record payment' });
    }
};

// Delete specific payment history entry
exports.deletePaymentHistory = async (req, res) => {
    try {
        const { vendorId, paymentId } = req.params;

        // Since payment history now routes directly to Expenses, we should delete the Expense record
        const expense = await Expense.findOneAndDelete({ _id: paymentId, vendor: vendorId });
        if (!expense) {
            return res.status(404).json({ message: 'Payment history entry not found' });
        }

        res.json({ message: 'Payment history entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete payment history entry' });
    }
};

// Get vendor analytics
exports.getAnalytics = async (req, res) => {
    try {
        const expensesAgg = await Expense.aggregate([
            { $match: { vendor: { $exists: true }, type: 'expense' } },
            { $group: { _id: '$vendor', totalPaid: { $sum: '$amount' }, paymentCount: { $sum: 1 } } },
            { $sort: { totalPaid: -1 } },
            { $limit: 10 }
        ]);

        const topVendorIds = expensesAgg.map(agg => agg._id);
        const vendors = await Vendor.find({ _id: { $in: topVendorIds } }, 'vendorName vendorType');
        
        const topVendors = expensesAgg.map(agg => {
            const v = vendors.find(vend => vend._id.toString() === agg._id.toString());
            return {
                name: v ? v.vendorName : 'Unknown',
                type: v ? v.vendorType : 'Other',
                totalPaid: agg.totalPaid,
                paymentCount: agg.paymentCount
            };
        });

        const vendorPayments = await Expense.aggregate([
            { $match: { vendor: { $exists: true }, type: 'expense' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
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
            topVendors,
            monthlyVendorPayments: vendorPayments
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch vendor analytics' });
    }
};