const express = require('express');
const router = express.Router();
const settingsController = require('../controler/settingscontroller');

router.get('/', settingsController.get);
router.put('/', settingsController.update);

module.exports = router;