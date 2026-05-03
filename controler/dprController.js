const DPR = require('../model/dpr');
const WorkerRate = require('../model/workerRate');
const WeeklyPayment = require('../model/weeklyPayment');
const ProjectAssignment = require('../model/projectAssignment');

// Helper function to process attendance and calculate worker-days
const processAttendance = (attendance) => {
  const processed = {};
  
  attendance.forEach(att => {
    const workerType = att.type;
    const days = (att.count * att.hours) / 8;
    const overtimeHours = att.hours > 8 ? (att.hours - 8) * att.count : 0;
    
    if (!processed[workerType]) {
      processed[workerType] = {
        type: workerType,
        totalDays: 0,
        overtimeHours: 0,
        totalHours: 0
      };
    }
    
    processed[workerType].totalDays += days;
    processed[workerType].overtimeHours += overtimeHours;
    processed[workerType].totalHours += att.count * att.hours;
  });
  
  return Object.values(processed);
};

// Create DPR
exports.createDPR = async (req, res) => {
  try {
    const { date, projectId, siteId, weather, attendance, workProgress, issues, materials, notes } = req.body;
    const supervisorId = req.user._id;
    
    // Validation
    if (!date || !projectId || !siteId || !attendance || attendance.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if DPR already exists for this date and site
    const existingDPR = await DPR.findOne({
      date: new Date(date).toDateString(),
      projectId,
      siteId,
      supervisorId
    });
    
    if (existingDPR) {
      return res.status(409).json({ message: 'DPR already exists for this date and site' });
    }
    
    // Validate at least one attendance image
    const hasImage = attendance.some(att => att.image);
    if (!hasImage) {
      return res.status(400).json({ message: 'At least one attendance image is required' });
    }
    
    // Process attendance
    const processedAttendance = processAttendance(attendance);
    
    // Create edit deadline (12 hours from submission)
    const editableUntil = new Date(Date.now() + 12 * 60 * 60 * 1000);
    
    const dpr = new DPR({
      date: new Date(date),
      projectId,
      siteId,
      supervisorId,
      weather,
      attendance,
      workProgress: workProgress || [],
      issues: issues || [],
      materials: materials || {},
      notes,
      processedAttendance,
      status: 'submitted',
      submittedAt: new Date(),
      editableUntil
    });
    
    await dpr.save();
    
    res.status(201).json({
      message: 'DPR created successfully',
      dpr: dpr.populate('supervisorId', 'name email')
    });
  } catch (error) {
    console.error('DPR Create Error:', error);
    res.status(500).json({ message: 'Error creating DPR', error: error.message });
  }
};

// Get DPR for a project
exports.getDPRByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { projectId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const dprList = await DPR.find(query)
      .populate('supervisorId', 'name email')
      .sort({ date: -1 });
    
    res.json(dprList);
  } catch (error) {
    console.error('Get DPR Error:', error);
    res.status(500).json({ message: 'Error fetching DPR', error: error.message });
  }
};

// Get DPR by Site
exports.getDPRBySite = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const dprList = await DPR.find({ siteId })
      .populate('supervisorId', 'name email')
      .sort({ date: -1 });
    
    res.json(dprList);
  } catch (error) {
    console.error('Get DPR by Site Error:', error);
    res.status(500).json({ message: 'Error fetching DPR', error: error.message });
  }
};

// Update DPR (only within 12 hours)
exports.updateDPR = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance, workProgress, issues, materials, notes, weather } = req.body;
    
    const dpr = await DPR.findById(id);
    
    if (!dpr) {
      return res.status(404).json({ message: 'DPR not found' });
    }
    
    // Check if DPR is locked
    if (dpr.locked) {
      return res.status(403).json({ message: 'DPR is locked and cannot be edited' });
    }
    
    // Check if still within 12 hours window
    if (new Date() > dpr.editableUntil) {
      return res.status(403).json({ message: 'DPR can only be edited within 12 hours of submission' });
    }
    
    // Update fields
    if (attendance) {
      dpr.attendance = attendance;
      dpr.processedAttendance = processAttendance(attendance);
    }
    if (workProgress) dpr.workProgress = workProgress;
    if (issues) dpr.issues = issues;
    if (materials) dpr.materials = materials;
    if (notes) dpr.notes = notes;
    if (weather) dpr.weather = weather;
    
    await dpr.save();
    
    res.json({
      message: 'DPR updated successfully',
      dpr: await dpr.populate('supervisorId', 'name email')
    });
  } catch (error) {
    console.error('DPR Update Error:', error);
    res.status(500).json({ message: 'Error updating DPR', error: error.message });
  }
};

// Get single DPR
exports.getDPR = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dpr = await DPR.findById(id)
      .populate('supervisorId', 'name email')
      .populate('projectId', 'projectName');
    
    if (!dpr) {
      return res.status(404).json({ message: 'DPR not found' });
    }
    
    res.json(dpr);
  } catch (error) {
    console.error('Get Single DPR Error:', error);
    res.status(500).json({ message: 'Error fetching DPR', error: error.message });
  }
};

// Delete DPR (only if not locked)
exports.deleteDPR = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dpr = await DPR.findById(id);
    
    if (!dpr) {
      return res.status(404).json({ message: 'DPR not found' });
    }
    
    if (dpr.locked) {
      return res.status(403).json({ message: 'Cannot delete locked DPR' });
    }
    
    await DPR.findByIdAndDelete(id);
    
    res.json({ message: 'DPR deleted successfully' });
  } catch (error) {
    console.error('DPR Delete Error:', error);
    res.status(500).json({ message: 'Error deleting DPR', error: error.message });
  }
};

// Get DPR for supervisor's assigned projects
exports.getMyDPR = async (req, res) => {
  try {
    const supervisorId = req.user._id;
    
    // Get all projects assigned to this supervisor
    const assignments = await ProjectAssignment.find({
      'assignedUsers.userId': supervisorId,
      'assignedUsers.isActive': true
    });
    
    const projectIds = assignments.map(a => a.projectId);
    
    const dprList = await DPR.find({ 
      supervisorId,
      projectId: { $in: projectIds }
    })
      .populate('supervisorId', 'name email')
      .populate('projectId', 'projectName')
      .sort({ date: -1 });
    
    res.json(dprList);
  } catch (error) {
    console.error('Get My DPR Error:', error);
    res.status(500).json({ message: 'Error fetching DPR', error: error.message });
  }
};
