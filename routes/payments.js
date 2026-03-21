const express = require('express');
const router = express.Router();
const paymentsController = require('../controler/paymentscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'payments', action: 'create' }), paymentsController.create);
router.get('/', authenticate, canAccess({ module: 'payments', action: 'read' }), paymentsController.list);
router.get('/:id', authenticate, canAccess({ module: 'payments', action: 'read' }), paymentsController.get);
router.put('/:id', authenticate, canAccess({ module: 'payments', action: 'update' }), paymentsController.update);
router.patch('/:id', authenticate, canAccess({ module: 'payments', action: 'update' }), paymentsController.update);
router.delete('/:id', authenticate, canAccess({ module: 'payments', action: 'delete' }), paymentsController.delete);

module.exports = router;