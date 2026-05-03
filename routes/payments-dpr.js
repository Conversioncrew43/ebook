const express = require('express');
const router = express.Router();
const paymentController = require('../controler/paymentController');
const { authenticate, canAccess } = require('../controler/rbac');

// Generate weekly payment (admin, project manager)
router.post('/generate-weekly', authenticate, canAccess({ module: 'weeklyPayments', action: 'create' }), paymentController.generateWeeklyPayment);

// Get weekly payments for a project
router.get('/project/:projectId', authenticate, canAccess({ module: 'weeklyPayments', action: 'read' }), paymentController.getWeeklyPayments);

// Get weekly payments by site
router.get('/site/:siteId', authenticate, canAccess({ module: 'weeklyPayments', action: 'read' }), paymentController.getWeeklyPaymentsBySite);

// Get pending payments (accountant dashboard)
router.get('/pending/all', authenticate, canAccess({ module: 'weeklyPayments', action: 'read' }), paymentController.getPendingPayments);

// Get single payment
router.get('/:id', authenticate, canAccess({ module: 'weeklyPayments', action: 'read' }), paymentController.getWeeklyPayment);

// Approve payment (project manager, accountant)
router.patch('/:id/approve', authenticate, canAccess({ module: 'weeklyPayments', action: 'update' }), paymentController.approveWeeklyPayment);

// Mark as paid (accountant)
router.patch('/:id/mark-paid', authenticate, canAccess({ module: 'weeklyPayments', action: 'update' }), paymentController.markPaymentAsPaid);

module.exports = router;
