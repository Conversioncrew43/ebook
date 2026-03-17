const express = require('express');
const router = express.Router();
const vendorController = require('../controler/vendorcontroller');

router.get('/', vendorController.getAll);
router.get('/analytics', vendorController.getAnalytics);
router.get('/:id', vendorController.getById);
router.post('/', vendorController.create);
router.put('/:id', vendorController.update);
router.delete('/:id', vendorController.delete);
router.post('/payment', vendorController.recordPayment);
router.delete('/:vendorId/payment/:paymentId', vendorController.deletePaymentHistory);

module.exports = router;