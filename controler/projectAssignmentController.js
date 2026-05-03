const ProjectAssignment = require('../model/projectAssignment');
const Project = require('../model/project');
const User = require('../model/user');

// Create or update project assignment
exports.assignProjectToUsers = async (req, res) => {
  try {
    const { projectId, assignedUsers } = req.body;
    const createdBy = req.user._id;
    
    if (!projectId || !assignedUsers || assignedUsers.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check or create assignment record
    let assignment = await ProjectAssignment.findOne({ projectId });
    
    if (!assignment) {
      assignment = new ProjectAssignment({
        projectId,
        assignedUsers,
        createdBy
      });
    } else {
      // Update existing assignments
      assignment.assignedUsers = assignedUsers;
    }
    
    await assignment.save();
    
    res.status(201).json({
      message: 'Project assignment created/updated successfully',
      assignment: await assignment.populate(['assignedUsers.userId', 'createdBy'], ['name email', 'name'])
    });
  } catch (error) {
    console.error('Assign Project Error:', error);
    res.status(500).json({ message: 'Error assigning project', error: error.message });
  }
};

// Get assignments for a project
exports.getProjectAssignments = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const assignment = await ProjectAssignment.findOne({ projectId })
      .populate('assignedUsers.userId', 'name email role')
      .populate('createdBy', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'No assignments found for this project' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Get Assignments Error:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get all projects assigned to a user
exports.getMyAssignedProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const assignments = await ProjectAssignment.find({
      'assignedUsers.userId': userId,
      'assignedUsers.isActive': true
    })
      .populate('projectId')
      .populate('assignedUsers.userId', 'name email role');
    
    const projects = assignments.map(assignment => ({
      ...assignment.projectId.toObject(),
      assignedRole: assignment.assignedUsers.find(u => u.userId._id.toString() === userId.toString())?.role
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Get My Projects Error:', error);
    res.status(500).json({ message: 'Error fetching assigned projects', error: error.message });
  }
};

// Remove user from project
exports.removeUserFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    const assignment = await ProjectAssignment.findOne({ projectId });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Mark as inactive instead of deleting
    const userAssignment = assignment.assignedUsers.find(u => u.userId.toString() === userId);
    
    if (!userAssignment) {
      return res.status(404).json({ message: 'User not assigned to this project' });
    }
    
    userAssignment.isActive = false;
    await assignment.save();
    
    res.json({ message: 'User removed from project successfully' });
  } catch (error) {
    console.error('Remove User Error:', error);
    res.status(500).json({ message: 'Error removing user from project', error: error.message });
  }
};

// Get projects by role
exports.getProjectsByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user._id;
    
    const query = {
      'assignedUsers.userId': userId,
      'assignedUsers.isActive': true
    };
    
    if (role) {
      query['assignedUsers.role'] = role;
    }
    
    const assignments = await ProjectAssignment.find(query)
      .populate('projectId')
      .populate('assignedUsers.userId', 'name email');
    
    res.json(assignments);
  } catch (error) {
    console.error('Get Projects by Role Error:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};
