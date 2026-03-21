const express = require('express');
const router = express.Router();
const leadsController = require('../controler/leadscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'leads', action: 'create' }), leadsController.create);
router.get('/', authenticate, canAccess({ module: 'leads', action: 'read' }), leadsController.list);
router.get('/:id', authenticate, canAccess({ module: 'leads', action: 'read' }), leadsController.get);
router.put('/:id', authenticate, canAccess({ module: 'leads', action: 'update' }), leadsController.update);
router.delete('/:id', authenticate, canAccess({ module: 'leads', action: 'delete' }), leadsController.delete);

module.exports = router;