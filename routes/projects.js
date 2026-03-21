const express = require('express');
const router = express.Router();
const projectsController = require('../controler/projectscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'projects', action: 'create' }), projectsController.create);
router.get('/', authenticate, canAccess({ module: 'projects', action: 'read' }), projectsController.list);
router.get('/:id', authenticate, canAccess({ module: 'projects', action: 'read', projectIdField: 'id' }), projectsController.get);
router.put('/:id', authenticate, canAccess({ module: 'projects', action: 'update', projectIdField: 'id' }), projectsController.update);
router.delete('/:id', authenticate, canAccess({ module: 'projects', action: 'delete', projectIdField: 'id' }), projectsController.delete);

module.exports = router;