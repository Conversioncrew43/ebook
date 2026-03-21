const jwt = require('jsonwebtoken');
const User = require('../model/user');

const SECRET = 'Adisecret';

const rolePermissions = {
  admin: {
    name: 'Admin',
    permissions: {
      users: ['read', 'create', 'update', 'delete'],
      projects: ['read', 'create', 'update', 'delete'],
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      vendors: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'create', 'update', 'delete'],
      leads: ['read', 'create', 'update', 'delete'],
      financial: ['read', 'create', 'update', 'delete']
    },
    dataAccess: 'all',
    description: 'Full Control - Access to all modules and financial metrics'
  },
  project_manager: {
    name: 'Project Manager',
    permissions: {
      projects: ['read', 'create', 'update'], // Can create and update assigned projects
      expenses: ['read'], // Can view expenses
      payments: ['read'], // Can view vendor payments
      vendors: ['read', 'update'], // Can view and assign vendors
      reports: ['read'], // Can view reports
      financial: ['read'] // Can view budget and financial metrics
    },
    dataAccess: 'assigned_projects',
    description: 'Full access to assigned projects, can view budget/expenses/payments, update progress'
  },
  accountant: {
    name: 'Accountant',
    permissions: {
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      financial: ['read', 'create', 'update', 'delete'],
      projects: ['read'] // Can view project details for financial context
    },
    dataAccess: 'all',
    description: 'Full access to financial data across all projects'
  },
  site_supervisor: {
    name: 'Site Supervisor',
    permissions: {
      projects: ['read', 'update'] // Can view and update progress/notes
    },
    dataAccess: 'assigned_projects',
    description: 'Access to assigned projects only - can view/update progress and notes'
  },
  sales_crm: {
    name: 'Sales / CRM',
    permissions: {
      leads: ['read', 'create', 'update', 'delete'],
      projects: ['read'] // Basic project summary only
    },
    dataAccess: 'own_data',
    description: 'Lead-related data only, basic project summary access'
  },
  client: {
    name: 'Client',
    permissions: {
      projects: ['read'], // Can view assigned projects
      payments: ['read'], // Can view payments for their projects
      bills: ['read'], // Can view bills for their projects
    },
    dataAccess: 'own_data',
    description: 'Access to own project data and financial summaries'
  }
};

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token or user not found.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: ' + err.message });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ message: 'Forbidden: insufficient role' });
};

const canAccess = ({ module, action, projectIdField, userIdField }) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const roleConfig = rolePermissions[req.user.role];
  if (!roleConfig) return res.status(403).json({ message: 'Forbidden: invalid role' });

  // Admin has full access
  if (req.user.role === 'admin') return next();

  // Check if the role has permissions for this module
  const modulePermissions = roleConfig.permissions[module];
  if (!modulePermissions) {
    return res.status(403).json({ message: 'Forbidden: insufficient permission for module' });
  }

  // Check if the specific action is allowed
  if (!modulePermissions.includes(action)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permission for action' });
  }

  // Check data-level access
  if (roleConfig.dataAccess === 'all') {
    return next();
  }

  if (roleConfig.dataAccess === 'assigned_projects' && projectIdField) {
    const projectId = req.params[projectIdField] || req.query[projectIdField] || req.body[projectIdField];
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });
    if (req.user.assignedProjects && req.user.assignedProjects.map(String).includes(String(projectId))) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: project not assigned' });
  }

  if (roleConfig.dataAccess === 'own_data' && userIdField) {
    const userId = req.params[userIdField] || req.body[userIdField];
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    if (String(req.user._id) === String(userId)) return next();
    return res.status(403).json({ message: 'Forbidden: own data only' });
  }

  if (roleConfig.dataAccess === 'own_data') {
    // For roles with 'own_data' data access, they can only access their own data implicitly
    // This is handled by the permission checks above
    return next();
  }

  return next();
};

module.exports = {
  authenticate,
  requireRole,
  canAccess,
  rolePermissions,
};
