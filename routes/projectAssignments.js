const express = require('express');
const router = express.Router();
const projectAssignmentController = require('../controler/projectAssignmentController');
const { authenticate, canAccess } = require('../controler/rbac');

// Assign project to users (admin, project manager)
router.post('/', authenticate, canAccess({ module: 'projectAssignments', action: 'create' }), projectAssignmentController.assignProjectToUsers);

// Get assignments for a project
router.get('/project/:projectId', authenticate, canAccess({ module: 'projectAssignments', action: 'read' }), projectAssignmentController.getProjectAssignments);

// Get my assigned projects
router.get('/my-projects', authenticate, projectAssignmentController.getMyAssignedProjects);

// Get projects by role
router.get('/role/:role', authenticate, projectAssignmentController.getProjectsByRole);

// Remove user from project
router.delete('/:projectId/user/:userId', authenticate, canAccess({ module: 'projectAssignments', action: 'delete' }), projectAssignmentController.removeUserFromProject);

module.exports = router;
