const express = require('express');
const router = express.Router();
const vendorController = require('../controler/vendorcontroller');
const { authenticate, canAccess } = require('../controler/rbac');

router.get('/', authenticate, canAccess({ module: 'vendors', action: 'read' }), vendorController.getAll);
router.get('/analytics', authenticate, canAccess({ module: 'reports', action: 'read' }), vendorController.getAnalytics);
router.get('/:id', authenticate, canAccess({ module: 'vendors', action: 'read' }), vendorController.getById);
router.post('/', authenticate, canAccess({ module: 'vendors', action: 'create' }), vendorController.create);
router.put('/:id', authenticate, canAccess({ module: 'vendors', action: 'update' }), vendorController.update);
router.delete('/:id', authenticate, canAccess({ module: 'vendors', action: 'delete' }), vendorController.delete);
router.post('/payment', authenticate, canAccess({ module: 'payments', action: 'create' }), vendorController.recordPayment);
router.delete('/:vendorId/payment/:paymentId', authenticate, canAccess({ module: 'payments', action: 'delete' }), vendorController.deletePaymentHistory);

module.exports = router;