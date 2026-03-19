const express = require('express');
const router = express.Router();
const reportsController = require('../controler/reportscontroller');

// Dashboard summary
router.get('/dashboard', reportsController.dashboard_summary);
router.get('/monthly-expenses', reportsController.monthly_expenses);
router.get('/vendor-analytics', reportsController.vendor_analytics);
router.get('/client-summary', reportsController.client_summary);
router.get('/expense-types', reportsController.expense_types);

module.exports = router;