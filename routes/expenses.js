const express = require('express');
const router = express.Router();
const expensesController = require('../controler/expensescontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'expenses', action: 'create' }), expensesController.create);
router.get('/', authenticate, canAccess({ module: 'expenses', action: 'read' }), expensesController.list);
router.get('/:id', authenticate, canAccess({ module: 'expenses', action: 'read' }), expensesController.get);
router.put('/:id', authenticate, canAccess({ module: 'expenses', action: 'update' }), expensesController.update);
router.patch('/:id', authenticate, canAccess({ module: 'expenses', action: 'update' }), expensesController.update);
router.delete('/:id', authenticate, canAccess({ module: 'expenses', action: 'delete' }), expensesController.delete);

module.exports = router;