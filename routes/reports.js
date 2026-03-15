const express = require('express');
const router = express.Router();
const reportsController = require('../controler/reportscontroller');

// Dashboard summary
router.get('/dashboard', reportsController.dashboard_summary);

module.exports = router;