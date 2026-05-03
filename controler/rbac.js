const jwt = require('jsonwebtoken');
const User = require('../model/user');

const SECRET = 'Adisecret';

const rolePermissions = {
  admin: {
    name: 'Admin',
    permissions: {
      dashboard: ['read'],
      users: ['read', 'create', 'update', 'delete'],
      projects: ['read', 'create', 'update', 'delete'],
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      bills: ['read', 'create', 'update', 'delete'],
      vendors: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'create', 'update', 'delete'],
      leads: ['read', 'create', 'update', 'delete'],
      clients: ['read', 'create', 'update', 'delete'],
      dpr: ['read', 'create', 'update', 'delete'],
      weeklyPayments: ['read', 'create', 'update', 'delete'],
      workerRates: ['read', 'create', 'update', 'delete'],
      projectAssignments: ['read', 'create', 'update', 'delete'],
    },
    dataAccess: 'all',
    description: 'Full Control - Access to all modules and actions'
  },
  project_manager: {
    name: 'Project Manager',
    permissions: {
      dashboard: ['read'],
      projects: ['read', 'create', 'update'],
      clients: ['read'],
      vendors: ['read', 'update'],
      expenses: ['read'],
      payments: ['read'],
      bills: ['read'],
      reports: ['read'],
      leads: ['read', 'create', 'update'],
      dpr: ['read', 'update'],
      weeklyPayments: ['read'],
      workerRates: ['read'],
      projectAssignments: ['read', 'create', 'update'],
    },
    dataAccess: 'assigned_projects',
    description: 'Manage projects, assign supervisors, view expenses, monitor progress'
  },
  site_supervisor: {
    name: 'Site Supervisor',
    permissions: {
      dashboard: ['read'],
      projects: ['read'],
      expenses: ['read', 'create'],
      dpr: ['read', 'create', 'update'],
      weeklyPayments: ['read'],
    },
    dataAccess: 'assigned_projects',
    description: 'Manage sites, submit DPR, view project progress'
  },
  accountant: {
    name: 'Accountant',
    permissions: {
      dashboard: ['read'],
      projects: ['read', 'create', 'update', 'delete'],
      expenses: ['read', 'create', 'update', 'delete'],
      payments: ['read', 'create', 'update', 'delete'],
      bills: ['read', 'create', 'update', 'delete'],
      vendors: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'create', 'update', 'delete'],
      leads: ['read', 'create', 'update', 'delete'],
      clients: ['read', 'create', 'update', 'delete'],
      dpr: ['read'],
      weeklyPayments: ['read', 'update'],
      workerRates: ['read', 'create', 'update', 'delete'],
    },
    dataAccess: 'all',
    description: 'Manage payroll, track expenses, generate financial reports'
  },
  staff: {
    name: 'Staff',
    permissions: {
      dashboard: ['read'],
      projects: ['read'],
    },
    dataAccess: 'own_data',
    description: 'Mark attendance, view own tasks, upload work proof'
  },
  client: {
    name: 'Client',
    permissions: {
      dashboard: ['read'],
      projects: ['read'],
      clients: ['read'],
      payments: ['read'],
      bills: ['read'],
    },
    dataAccess: 'assigned_projects',
    description: 'View project status, download reports, view images/videos'
  }
};

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log(`Auth Debug: Decoded token ID: ${decoded.id}`);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token or user not found.' });

    console.log(`Auth Debug: Found user - Email: ${user.email}, Role: "${user.role}"`);
    req.user = user;
    next();
  } catch (err) {
    console.log(`Auth Error: ${err.message}`);
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

  console.log(`RBAC Check: User role="${req.user.role}", module="${module}", action="${action}"`);

  const roleConfig = rolePermissions[req.user.role];
  if (!roleConfig) {
    console.log(`RBAC Error: No role config found for role="${req.user.role}"`);
    return res.status(403).json({ message: 'Forbidden: invalid role' });
  }

  // Admin has full access
  if (req.user.role === 'admin') {
    console.log(`RBAC: Admin bypass - User "${req.user.email}" has full access`);
    return next();
  }

  // Check if the role has permissions for this module
  const modulePermissions = roleConfig.permissions[module];
  console.log(`RBAC: Available modules for role="${req.user.role}":`, Object.keys(roleConfig.permissions));
  console.log(`RBAC: Permissions for module="${module}":`, modulePermissions);
  
  if (!modulePermissions) {
    console.log(`RBAC Error: Module "${module}" not found in role permissions`);
    return res.status(403).json({ message: 'Forbidden: insufficient permission for module' });
  }

  // Check if the specific action is allowed
  if (!modulePermissions.includes(action)) {
    console.log(`RBAC Error: Action "${action}" not allowed for module "${module}"`);
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
