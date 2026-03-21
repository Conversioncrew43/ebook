const express = require('express');
const router = express.Router();
const usersController = require('../controler/userscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.post('/', authenticate, canAccess({ module: 'users', action: 'create' }), usersController.create);
router.get('/', authenticate, canAccess({ module: 'users', action: 'read' }), usersController.list);
router.get('/:id', authenticate, canAccess({ module: 'users', action: 'read', userIdField: 'id' }), usersController.get);
router.put('/:id', authenticate, canAccess({ module: 'users', action: 'update', userIdField: 'id' }), usersController.update);
router.delete('/:id', authenticate, canAccess({ module: 'users', action: 'delete', userIdField: 'id' }), usersController.delete);

module.exports = router;