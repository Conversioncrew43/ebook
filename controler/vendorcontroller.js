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

        // Calculate totals for each vendor
        const vendorsWithTotals = vendors.map(vendor => {
            // Filter payment history by project if projectId is specified
            const filteredPaymentHistory = projectId 
                ? vendor.paymentHistory.filter(p => p.project?.toString() === projectId)
                : vendor.paymentHistory;
            
            const totalPaid = filteredPaymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

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
                paymentHistory: filteredPaymentHistory.map(p => ({
                    _id: p._id,
                    amount: p.amount,
                    date: p.paymentDate,
                    method: p.paymentMethod,
                    projectId: p.project,
                    status: p.status,
                    notes: p.notes
                })),
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
            .populate('assignedProjects', 'projectName')
            .populate('paymentHistory.project', 'projectName');

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const totalPaid = vendor.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

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
            paymentHistory: vendor.paymentHistory.map(p => ({
                _id: p._id,
                amount: p.amount,
                date: p.paymentDate,
                method: p.paymentMethod,
                projectId: p.project,
                projectName: p.project?.projectName || 'Unknown Project',
                status: p.status,
                notes: p.notes
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
            .populate('assignedProjects', 'projectName')
            .populate('paymentHistory.project', 'projectName');

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const totalPaid = vendor.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

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
            paymentHistory: vendor.paymentHistory.map(p => ({
                _id: p._id,
                amount: p.amount,
                date: p.paymentDate,
                method: p.paymentMethod,
                projectId: p.project,
                projectName: p.project?.projectName || 'Unknown Project',
                status: p.status,
                notes: p.notes
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

        // Add payment to vendor's history
        vendor.paymentHistory.push({
            project: projectId,
            amount: parseFloat(amount),
            paymentDate: new Date(date),
            paymentMethod: method,
            status: 'Paid'
        });

        await vendor.save();

        // Auto-create expense record
        const expense = new Expense({
            title: `Payment to ${vendor.vendorName}`,
            category: 'Vendor Payment',
            amount: parseFloat(amount),
            project: projectId,
            date: new Date(date),
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

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Find and remove the specific payment history entry
        const paymentIndex = vendor.paymentHistory.findIndex(p => p._id.toString() === paymentId);
        if (paymentIndex === -1) {
            return res.status(404).json({ message: 'Payment history entry not found' });
        }

        vendor.paymentHistory.splice(paymentIndex, 1);
        await vendor.save();

        res.json({ message: 'Payment history entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete payment history entry' });
    }
};

// Get vendor analytics
exports.getAnalytics = async (req, res) => {
    try {
        const vendors = await Vendor.find({}, 'vendorName vendorType paymentHistory')
            .sort({ 'paymentHistory.amount': -1 })
            .limit(10);

        const vendorPayments = await Vendor.aggregate([
            { $unwind: '$paymentHistory' },
            {
                $group: {
                    _id: {
                        year: { $year: '$paymentHistory.paymentDate' },
                        month: { $month: '$paymentHistory.paymentDate' }
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

        const topVendors = vendors.map(v => ({
            name: v.vendorName,
            type: v.vendorType,
            totalPaid: v.paymentHistory.reduce((sum, p) => sum + p.amount, 0),
            paymentCount: v.paymentHistory.length
        })).sort((a, b) => b.totalPaid - a.totalPaid);

        res.json({
            topVendors,
            monthlyVendorPayments: vendorPayments
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch vendor analytics' });
    }
};