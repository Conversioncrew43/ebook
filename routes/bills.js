const express = require('express');
const router = express.Router();
const billsController = require('../controler/billscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'bills', action: 'create' }), billsController.create);
router.get('/', authenticate, canAccess({ module: 'bills', action: 'read' }), billsController.list);
router.get('/:id', authenticate, canAccess({ module: 'bills', action: 'read' }), billsController.get);
router.put('/:id', authenticate, canAccess({ module: 'bills', action: 'update' }), billsController.update);
router.patch('/:id', authenticate, canAccess({ module: 'bills', action: 'update' }), billsController.update);
router.delete('/:id', authenticate, canAccess({ module: 'bills', action: 'delete' }), billsController.delete);

module.exports = router;