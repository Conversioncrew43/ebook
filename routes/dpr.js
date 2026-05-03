const express = require('express');
const router = express.Router();
const dprController = require('../controler/dprController');
const { authenticate, canAccess } = require('../controler/rbac');

// Create DPR (site supervisor, project manager)
router.post('/', authenticate, canAccess({ module: 'dpr', action: 'create' }), dprController.createDPR);

// Get DPR for supervisor's assigned projects
router.get('/my-dpr', authenticate, canAccess({ module: 'dpr', action: 'read' }), dprController.getMyDPR);

// Get DPR by project
router.get('/project/:projectId', authenticate, canAccess({ module: 'dpr', action: 'read' }), dprController.getDPRByProject);

// Get DPR by site
router.get('/site/:siteId', authenticate, canAccess({ module: 'dpr', action: 'read' }), dprController.getDPRBySite);

// Get single DPR
router.get('/:id', authenticate, canAccess({ module: 'dpr', action: 'read' }), dprController.getDPR);

// Update DPR
router.put('/:id', authenticate, canAccess({ module: 'dpr', action: 'update' }), dprController.updateDPR);

// Delete DPR
router.delete('/:id', authenticate, canAccess({ module: 'dpr', action: 'delete' }), dprController.deleteDPR);

module.exports = router;
