const express = require('express');
const router = express.Router();
const reportsController = require('../controler/reportscontroller');
const { authenticate, canAccess } = require('../controler/rbac');

// Dashboard summary
router.get('/dashboard', authenticate, canAccess({ module: 'reports', action: 'read' }), reportsController.dashboard_summary);
router.get('/monthly-expenses', authenticate, canAccess({ module: 'reports', action: 'read' }), reportsController.monthly_expenses);
router.get('/vendor-analytics', authenticate, canAccess({ module: 'reports', action: 'read' }), reportsController.vendor_analytics);
router.get('/client-summary', authenticate, canAccess({ module: 'reports', action: 'read' }), reportsController.client_summary);
router.get('/expense-types', authenticate, canAccess({ module: 'reports', action: 'read' }), reportsController.expense_types);

module.exports = router;