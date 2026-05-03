const express = require('express');
const router = express.Router();
const workerRateController = require('../controler/workerRateController');
const { authenticate, canAccess } = require('../controler/rbac');

// Create worker rate (admin, accountant)
router.post('/', authenticate, canAccess({ module: 'workerRates', action: 'create' }), workerRateController.createWorkerRate);

// Get all worker rates
router.get('/', authenticate, canAccess({ module: 'workerRates', action: 'read' }), workerRateController.getWorkerRates);

// Get single worker rate
router.get('/:id', authenticate, canAccess({ module: 'workerRates', action: 'read' }), workerRateController.getWorkerRate);

// Update worker rate (admin, accountant)
router.put('/:id', authenticate, canAccess({ module: 'workerRates', action: 'update' }), workerRateController.updateWorkerRate);

// Delete worker rate (admin)
router.delete('/:id', authenticate, canAccess({ module: 'workerRates', action: 'delete' }), workerRateController.deleteWorkerRate);

module.exports = router;
