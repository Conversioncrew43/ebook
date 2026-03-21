const Project = require('../model/project');
const User = require('../model/user');
const { emailTemplates, sendEmail } = require('../utils/email');

function buildDateRange(from, to) {
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

exports.create = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create project' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {}
    const dateRange = buildDateRange(req.query.from, req.query.to)
    if (dateRange) {
      filter.startDate = dateRange
    }

    const projects = await Project.find(filter);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.get = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

exports.update = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Send emails to newly assigned team members
    if (req.body.assignedTeam && oldProject) {
      const oldTeam = oldProject.assignedTeam || [];
      const newTeam = req.body.assignedTeam;
      const addedUsers = newTeam.filter(id => !oldTeam.includes(id));

      if (addedUsers.length > 0) {
        const users = await User.find({ _id: { $in: addedUsers } });
        for (const user of users) {
          try {
            const template = emailTemplates.projectAssigned(user, project);
            await sendEmail(user.email, template.subject, template.html, template.text);
            console.log(`Project assignment email sent to ${user.email}`);
          } catch (emailError) {
            console.error('Failed to send project assignment email:', emailError);
          }
        }
      }
    }

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update project' });
  }
};

exports.delete = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

exports.update = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update project' });
  }
};

exports.delete = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};