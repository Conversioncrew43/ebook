const WeeklyPayment = require('../model/weeklyPayment');
const DPR = require('../model/dpr');
const WorkerRate = require('../model/workerRate');

// Helper to get week start and end dates
const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
};

// Generate weekly payment for a project/site
exports.generateWeeklyPayment = async (req, res) => {
  try {
    const { projectId, siteId, weekDate } = req.body;
    
    if (!projectId || !siteId || !weekDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const { weekStart, weekEnd } = getWeekDates(weekDate);
    
    // Check if payment already exists for this week
    const existingPayment = await WeeklyPayment.findOne({
      projectId,
      siteId,
      weekStartDate: weekStart
    });
    
    if (existingPayment) {
      return res.status(409).json({ message: 'Weekly payment already generated for this period' });
    }
    
    // Get all DPRs for this week, project, and site
    const dprRecords = await DPR.find({
      projectId,
      siteId,
      date: { $gte: weekStart, $lte: weekEnd },
      status: { $in: ['submitted', 'locked'] }
    });
    
    if (dprRecords.length === 0) {
      return res.status(400).json({ message: 'No DPR records found for this period' });
    }
    
    // Aggregate attendance data
    const aggregatedAttendance = {};
    
    dprRecords.forEach(dpr => {
      dpr.processedAttendance.forEach(att => {
        if (!aggregatedAttendance[att.type]) {
          aggregatedAttendance[att.type] = {
            totalDays: 0,
            overtimeHours: 0
          };
        }
        aggregatedAttendance[att.type].totalDays += att.totalDays;
        aggregatedAttendance[att.type].overtimeHours += att.overtimeHours;
      });
    });
    
    // Get worker rates
    const workerRates = await WorkerRate.find({ isActive: true });
    const rateMap = {};
    workerRates.forEach(rate => {
      rateMap[rate.type] = {
        ratePerDay: rate.ratePerDay,
        overtimePerHour: rate.overtimePerHour
      };
    });
    
    // Calculate breakdown and total amount
    const breakdown = [];
    let totalAmount = 0;
    
    Object.keys(aggregatedAttendance).forEach(workerType => {
      const rates = rateMap[workerType];
      
      if (!rates) {
        console.warn(`No rate found for worker type: ${workerType}`);
        return;
      }
      
      const dailyAmount = aggregatedAttendance[workerType].totalDays * rates.ratePerDay;
      const overtimeAmount = aggregatedAttendance[workerType].overtimeHours * rates.overtimePerHour;
      const itemTotalAmount = dailyAmount + overtimeAmount;
      
      breakdown.push({
        type: workerType,
        totalDays: aggregatedAttendance[workerType].totalDays,
        overtimeHours: aggregatedAttendance[workerType].overtimeHours,
        ratePerDay: rates.ratePerDay,
        overtimePerHour: rates.overtimePerHour,
        totalAmount: itemTotalAmount
      });
      
      totalAmount += itemTotalAmount;
    });
    
    // Create weekly payment record
    const weeklyPayment = new WeeklyPayment({
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      projectId,
      siteId,
      breakdown,
      totalAmount,
      status: 'pending',
      locked: true,
      generatedAt: new Date()
    });
    
    await weeklyPayment.save();
    
    // Lock all DPRs for this week
    await DPR.updateMany(
      {
        projectId,
        siteId,
        date: { $gte: weekStart, $lte: weekEnd }
      },
      { locked: true, status: 'locked' }
    );
    
    res.status(201).json({
      message: 'Weekly payment generated successfully',
      payment: await weeklyPayment.populate('projectId', 'projectName')
    });
  } catch (error) {
    console.error('Generate Payment Error:', error);
    res.status(500).json({ message: 'Error generating payment', error: error.message });
  }
};

// Get weekly payments for a project
exports.getWeeklyPayments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    const query = { projectId };
    
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.weekStartDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const payments = await WeeklyPayment.find(query)
      .populate('projectId', 'projectName')
      .populate('approvedBy', 'name email')
      .populate('paidBy', 'name email')
      .sort({ weekStartDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get weekly payment by site
exports.getWeeklyPaymentsBySite = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const payments = await WeeklyPayment.find({ siteId })
      .populate('projectId', 'projectName')
      .populate('approvedBy', 'name email')
      .populate('paidBy', 'name email')
      .sort({ weekStartDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get Payments by Site Error:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get single weekly payment
exports.getWeeklyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await WeeklyPayment.findById(id)
      .populate('projectId', 'projectName')
      .populate('approvedBy', 'name email')
      .populate('paidBy', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Get Single Payment Error:', error);
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Approve weekly payment
exports.approveWeeklyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const approverId = req.user._id;
    
    const payment = await WeeklyPayment.findById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending payments can be approved' });
    }
    
    payment.status = 'approved';
    payment.approvedBy = approverId;
    payment.approvedAt = new Date();
    if (notes) payment.notes = notes;
    
    await payment.save();
    
    res.json({
      message: 'Payment approved successfully',
      payment: await payment.populate(['approvedBy', 'projectId'], ['name email', 'projectName'])
    });
  } catch (error) {
    console.error('Approve Payment Error:', error);
    res.status(500).json({ message: 'Error approving payment', error: error.message });
  }
};

// Mark payment as paid
exports.markPaymentAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const paidById = req.user._id;
    
    const payment = await WeeklyPayment.findById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved payments can be marked as paid' });
    }
    
    payment.status = 'paid';
    payment.paidBy = paidById;
    payment.paidAt = new Date();
    if (notes) payment.notes = notes;
    
    await payment.save();
    
    res.json({
      message: 'Payment marked as paid successfully',
      payment: await payment.populate(['paidBy', 'projectId'], ['name email', 'projectName'])
    });
  } catch (error) {
    console.error('Mark Paid Error:', error);
    res.status(500).json({ message: 'Error marking payment as paid', error: error.message });
  }
};

// Get all pending payments (for accountant dashboard)
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await WeeklyPayment.find({ status: 'pending' })
      .populate('projectId', 'projectName')
      .populate('approvedBy', 'name email')
      .sort({ weekStartDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get Pending Payments Error:', error);
    res.status(500).json({ message: 'Error fetching pending payments', error: error.message });
  }
};
