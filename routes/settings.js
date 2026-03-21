const express = require('express');
const router = express.Router();
const settingsController = require('../controler/settingscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.get('/', authenticate, canAccess({ module: 'settings', action: 'read' }), settingsController.get);
router.put('/', authenticate, canAccess({ module: 'settings', action: 'update' }), settingsController.update);

module.exports = router;